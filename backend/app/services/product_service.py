from datetime import datetime, timezone

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.crud import product as product_crud
from app.crud import product_image as product_image_crud
from app.crud import user as user_crud
from app.models.product import Product
from app.models.user import User
from app.schemas.products import (
    ALLOWED_CATEGORIES,
    ALLOWED_CONDITIONS,
    MarkSoldRequest,
    ProductCreateRequest,
    ProductUpdateRequest,
)
from app.services import image_service
from app.utils.slugify import unique_slug

_ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
_MAX_IMAGE_BYTES = 5 * 1024 * 1024
_MAX_IMAGES_PER_PRODUCT = 5
_PUBLICLY_VISIBLE_STATUSES = ["available", "reserved"]
_ALLOWED_SORTS = {"newest", "oldest", "price_asc", "price_desc"}


def _normalize_search(search: str | None) -> str | None:
    if not search:
        return None
    # Collapses runs of internal whitespace and strips the ends, so "  data   structures "
    # matches the same rows as "data structures".
    normalized = " ".join(search.split())
    return normalized or None


def list_all(
    db: Session,
    search: str | None = None,
    category: str | None = None,
    condition: str | None = None,
    min_price: int | None = None,
    max_price: int | None = None,
    availability: str | None = None,
    sort: str | None = None,
) -> list[Product]:
    if category is not None and category not in ALLOWED_CATEGORIES:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Select a valid category.")
    if condition is not None and condition not in ALLOWED_CONDITIONS:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Select a valid condition.")
    if availability is not None and availability not in _PUBLICLY_VISIBLE_STATUSES:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Select a valid availability status.")
    if sort is not None and sort not in _ALLOWED_SORTS:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Select a valid sort option.")
    if min_price is not None and min_price < 0:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Minimum price can't be negative.")
    if max_price is not None and max_price < 0:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Maximum price can't be negative.")
    if min_price is not None and max_price is not None and min_price > max_price:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Minimum price can't be greater than maximum price.",
        )

    statuses = [availability] if availability is not None else _PUBLICLY_VISIBLE_STATUSES
    return product_crud.list_all(
        db,
        statuses=statuses,
        search=_normalize_search(search),
        category=category,
        condition=condition,
        min_price=min_price,
        max_price=max_price,
        sort=sort,
    )


def get_by_slug(db: Session, slug: str) -> Product:
    product = product_crud.get_by_slug(db, slug)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found.")
    return product


def list_mine(db: Session, current_user: User) -> list[Product]:
    return product_crud.list_by_seller_id(db, current_user.id)


def list_sold(db: Session, current_user: User) -> list[Product]:
    return product_crud.list_sold_by_seller_id(db, current_user.id)


def list_purchased(db: Session, current_user: User) -> list[Product]:
    return product_crud.list_purchased_by_buyer_id(db, current_user.id)


def _get_owned_product(db: Session, product_id: int, current_user: User) -> Product:
    product = product_crud.get_by_id(db, product_id)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found.")
    if product.seller_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only manage your own listings.")
    return product


def create_product(db: Session, current_user: User, payload: ProductCreateRequest) -> Product:
    data = payload.model_dump()
    data["slug"] = unique_slug(payload.name, lambda candidate: product_crud.slug_exists(db, candidate))
    data["seller"] = current_user.full_name
    data["seller_id"] = current_user.id
    data["university"] = current_user.university
    data["status"] = "available"
    return product_crud.create(db, data)


def update_product(db: Session, product_id: int, current_user: User, payload: ProductUpdateRequest) -> Product:
    product = _get_owned_product(db, product_id, current_user)
    data = payload.model_dump(exclude_unset=True, exclude_none=True)
    if not data:
        return product
    return product_crud.update(db, product, data)


def delete_product(db: Session, product_id: int, current_user: User) -> None:
    product = _get_owned_product(db, product_id, current_user)
    if product.status == "sold":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Sold listings can't be deleted — archive it instead."
        )
    # The product_images rows cascade-delete with the product, but that's just our database --
    # the actual files on Cloudinary need an explicit destroy or they're orphaned forever.
    for image in product_image_crud.list_by_product(db, product.id):
        image_service.delete_product_image(image.public_id)
    product_crud.delete(db, product)


def set_status(db: Session, product_id: int, current_user: User, new_status: str) -> Product:
    product = _get_owned_product(db, product_id, current_user)
    if product.status == "sold" and new_status == "available":
        product.buyer_id = None
        product.sold_at = None
    product.status = new_status
    db.commit()
    db.refresh(product)
    return product


def add_images(db: Session, product_id: int, current_user: User, files: list[UploadFile]) -> Product:
    product = _get_owned_product(db, product_id, current_user)
    existing_images = product_image_crud.list_by_product(db, product.id)
    if not files:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Choose at least one image to upload.")
    if len(existing_images) + len(files) > _MAX_IMAGES_PER_PRODUCT:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"A listing can have at most {_MAX_IMAGES_PER_PRODUCT} images.",
        )

    file_payloads: list[bytes] = []
    for file in files:
        if file.content_type not in _ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Please upload JPEG, PNG, WEBP, or GIF images.",
            )
        file_bytes = file.file.read()
        if len(file_bytes) > _MAX_IMAGE_BYTES:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Each image must be 5MB or smaller.")
        file_payloads.append(file_bytes)

    next_position = max((image.position for image in existing_images), default=-1) + 1
    has_primary = any(image.is_primary for image in existing_images)
    for offset, file_bytes in enumerate(file_payloads):
        uploaded = image_service.upload_product_image(file_bytes, product.id)
        product_image_crud.create(
            db,
            product_id=product.id,
            url=uploaded["url"],
            public_id=uploaded["public_id"],
            position=next_position + offset,
            is_primary=not has_primary and offset == 0,
        )

    db.commit()
    db.refresh(product)
    return product


def remove_image(db: Session, product_id: int, current_user: User, image_id: int) -> Product:
    product = _get_owned_product(db, product_id, current_user)
    image = product_image_crud.get_by_id(db, image_id)
    if image is None or image.product_id != product.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="That image isn't part of this listing.")

    was_primary = image.is_primary
    image_service.delete_product_image(image.public_id)
    product_image_crud.delete(db, image)
    db.flush()

    if was_primary:
        remaining = product_image_crud.list_by_product(db, product.id)
        if remaining:
            remaining[0].is_primary = True

    db.commit()
    db.refresh(product)
    return product


def set_primary_image(db: Session, product_id: int, current_user: User, image_id: int) -> Product:
    product = _get_owned_product(db, product_id, current_user)
    image = product_image_crud.get_by_id(db, image_id)
    if image is None or image.product_id != product.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="That image isn't part of this listing.")

    for other in product_image_crud.list_by_product(db, product.id):
        other.is_primary = other.id == image.id

    db.commit()
    db.refresh(product)
    return product


def reorder_images(db: Session, product_id: int, current_user: User, image_ids: list[int]) -> Product:
    product = _get_owned_product(db, product_id, current_user)
    current_images = product_image_crud.list_by_product(db, product.id)
    if sorted(image_ids) != sorted(image.id for image in current_images):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="The image order must include every image on this listing exactly once.",
        )

    images_by_id = {image.id: image for image in current_images}
    for position, image_id in enumerate(image_ids):
        images_by_id[image_id].position = position

    db.commit()
    db.refresh(product)
    return product


def mark_as_sold(db: Session, product_id: int, current_user: User, payload: MarkSoldRequest) -> Product:
    product = product_crud.get_by_id(db, product_id)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found.")
    if product.seller_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only mark your own listings as sold.")
    if product.status == "sold":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This listing is already marked as sold.")

    buyer_id = None
    if payload.buyer_identifier:
        identifier = payload.buyer_identifier.strip()
        buyer = user_crud.get_by_username(db, identifier) or user_crud.get_by_email(db, identifier)
        if buyer is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No user found with that username or email.")
        buyer_id = buyer.id

    product.status = "sold"
    product.buyer_id = buyer_id
    product.sold_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(product)
    return product
