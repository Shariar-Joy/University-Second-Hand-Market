from fastapi import APIRouter, Depends, File, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.products import (
    MarkSoldRequest,
    ProductCreateRequest,
    ProductOut,
    ProductStatusRequest,
    ProductUpdateRequest,
    ReorderImagesRequest,
)
from app.services import product_service

router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=list[ProductOut])
def get_products(
    search: str | None = Query(default=None),
    category: str | None = Query(default=None),
    condition: str | None = Query(default=None),
    min_price: int | None = Query(default=None, ge=0),
    max_price: int | None = Query(default=None, ge=0),
    availability: str | None = Query(default=None),
    sort: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    return product_service.list_all(
        db,
        search=search,
        category=category,
        condition=condition,
        min_price=min_price,
        max_price=max_price,
        availability=availability,
        sort=sort,
    )


@router.get("/mine", response_model=list[ProductOut])
def get_my_products(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return product_service.list_mine(db, current_user)


@router.get("/sold", response_model=list[ProductOut])
def get_sold_products(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return product_service.list_sold(db, current_user)


@router.get("/purchased", response_model=list[ProductOut])
def get_purchased_products(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return product_service.list_purchased(db, current_user)


@router.post("", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(
    payload: ProductCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return product_service.create_product(db, current_user, payload)


@router.patch("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int,
    payload: ProductUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return product_service.update_product(db, product_id, current_user, payload)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    product_service.delete_product(db, product_id, current_user)


@router.patch("/{product_id}/status", response_model=ProductOut)
def set_product_status(
    product_id: int,
    payload: ProductStatusRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return product_service.set_status(db, product_id, current_user, payload.status)


@router.post("/{product_id}/images", response_model=ProductOut)
def upload_product_images(
    product_id: int,
    files: list[UploadFile] = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return product_service.add_images(db, product_id, current_user, files)


@router.delete("/{product_id}/images/{image_id}", response_model=ProductOut)
def delete_product_image(
    product_id: int,
    image_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return product_service.remove_image(db, product_id, current_user, image_id)


@router.patch("/{product_id}/images/reorder", response_model=ProductOut)
def reorder_product_images(
    product_id: int,
    payload: ReorderImagesRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return product_service.reorder_images(db, product_id, current_user, payload.image_ids)


@router.patch("/{product_id}/images/{image_id}/primary", response_model=ProductOut)
def set_primary_product_image(
    product_id: int,
    image_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return product_service.set_primary_image(db, product_id, current_user, image_id)


@router.post("/{product_id}/sold", response_model=ProductOut)
def mark_product_sold(
    product_id: int,
    payload: MarkSoldRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return product_service.mark_as_sold(db, product_id, current_user, payload)


@router.get("/{slug}", response_model=ProductOut)
def get_product_by_slug(slug: str, db: Session = Depends(get_db)):
    return product_service.get_by_slug(db, slug)
