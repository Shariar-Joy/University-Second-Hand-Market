from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.crud import product as product_crud
from app.crud import product_image as product_image_crud
from app.crud import tutor as tutor_crud
from app.crud import user as user_crud
from app.models.product import Product
from app.models.user import User
from app.services import image_service

_ACTIVE_STATUSES = {"available", "reserved"}


def get_stats(db: Session) -> dict:
    products = product_crud.list_all(db)
    return {
        "total_users": len(user_crud.list_all(db)),
        "total_products": len(products),
        "active_listings": sum(1 for product in products if product.status in _ACTIVE_STATUSES),
        "sold_listings": sum(1 for product in products if product.status == "sold"),
        "total_tutors": len(tutor_crud.list_all(db)),
    }


def list_users(db: Session) -> list[User]:
    return user_crud.list_all(db)


def list_products(db: Session) -> list[Product]:
    return product_crud.list_all(db)


def delete_product(db: Session, product_id: int) -> None:
    product = product_crud.get_by_id(db, product_id)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found.")
    # Same image-cleanup + delete primitives product_service.delete_product uses for an
    # owner-initiated delete -- admin moderation just skips the ownership/sold-status checks,
    # since a moderator needs to be able to remove any listing regardless of who owns it.
    for image in product_image_crud.list_by_product(db, product.id):
        image_service.delete_product_image(image.public_id)
    product_crud.delete(db, product)
