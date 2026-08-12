from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.wishlist import WishlistCreateRequest, WishlistItemOut, WishlistStatusOut
from app.services import wishlist_service

router = APIRouter(prefix="/wishlist", tags=["wishlist"])


@router.get("", response_model=list[WishlistItemOut])
def get_wishlist(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return wishlist_service.list_wishlist(db, current_user)


@router.post("", response_model=WishlistItemOut, status_code=status.HTTP_201_CREATED)
def add_wishlist_item(
    payload: WishlistCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return wishlist_service.add_to_wishlist(db, current_user, payload.product_id)


@router.get("/{product_id}/check", response_model=WishlistStatusOut)
def check_wishlist_item(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return WishlistStatusOut(wishlisted=wishlist_service.is_wishlisted(db, current_user, product_id))


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_wishlist_item(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    wishlist_service.remove_from_wishlist(db, current_user, product_id)
