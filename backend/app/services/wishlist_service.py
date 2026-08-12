from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.crud import product as product_crud
from app.crud import wishlist as wishlist_crud
from app.models.user import User
from app.models.wishlist import Wishlist


def list_wishlist(db: Session, current_user: User) -> list[Wishlist]:
    return wishlist_crud.list_by_user(db, current_user.id)


def add_to_wishlist(db: Session, current_user: User, product_id: int) -> Wishlist:
    product = product_crud.get_by_id(db, product_id)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found.")

    existing = wishlist_crud.get_by_user_and_product(db, current_user.id, product_id)
    if existing is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This listing is already in your wishlist.")

    return wishlist_crud.create(db, current_user.id, product_id)


def remove_from_wishlist(db: Session, current_user: User, product_id: int) -> None:
    existing = wishlist_crud.get_by_user_and_product(db, current_user.id, product_id)
    if existing is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="This listing isn't in your wishlist.")
    wishlist_crud.delete(db, existing)


def is_wishlisted(db: Session, current_user: User, product_id: int) -> bool:
    return wishlist_crud.get_by_user_and_product(db, current_user.id, product_id) is not None
