from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.crud import product as product_crud
from app.crud import user as user_crud
from app.models.product import Product
from app.models.user import User
from app.schemas.products import MarkSoldRequest


def list_all(db: Session) -> list[Product]:
    return product_crud.list_all(db)


def list_mine(db: Session, current_user: User) -> list[Product]:
    return product_crud.list_by_seller_id(db, current_user.id)


def list_sold(db: Session, current_user: User) -> list[Product]:
    return product_crud.list_sold_by_seller_id(db, current_user.id)


def list_purchased(db: Session, current_user: User) -> list[Product]:
    return product_crud.list_purchased_by_buyer_id(db, current_user.id)


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
