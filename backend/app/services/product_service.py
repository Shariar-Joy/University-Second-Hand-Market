from datetime import datetime, timezone

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.crud import product as product_crud
from app.crud import user as user_crud
from app.models.product import Product
from app.models.user import User
from app.schemas.products import MarkSoldRequest, ProductCreateRequest, ProductUpdateRequest
from app.services import image_service
from app.utils.slugify import unique_slug

_ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
_MAX_IMAGE_BYTES = 5 * 1024 * 1024
_MAX_IMAGES_PER_PRODUCT = 5
_PUBLICLY_VISIBLE_STATUSES = ["available", "reserved"]


def list_all(db: Session) -> list[Product]:
    return product_crud.list_all(db, statuses=_PUBLICLY_VISIBLE_STATUSES)


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
    data["images"] = []
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
    current_images = product.images or []
    if len(current_images) + len(files) > _MAX_IMAGES_PER_PRODUCT:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"A listing can have at most {_MAX_IMAGES_PER_PRODUCT} images.",
        )

    uploaded_urls = []
    for file in files:
        if file.content_type not in _ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Please upload JPEG, PNG, WEBP, or GIF images.",
            )
        file_bytes = file.file.read()
        if len(file_bytes) > _MAX_IMAGE_BYTES:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Each image must be 5MB or smaller.")
        uploaded_urls.append(image_service.upload_product_image(file_bytes, product.id))

    product.images = [*current_images, *uploaded_urls]
    db.commit()
    db.refresh(product)
    return product


def remove_image(db: Session, product_id: int, current_user: User, image_url: str) -> Product:
    product = _get_owned_product(db, product_id, current_user)
    current_images = product.images or []
    if image_url not in current_images:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="That image isn't part of this listing.")
    product.images = [url for url in current_images if url != image_url]
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
