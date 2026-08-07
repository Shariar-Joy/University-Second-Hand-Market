from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.products import MarkSoldRequest, ProductOut
from app.services import product_service

router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=list[ProductOut])
def get_products(db: Session = Depends(get_db)):
    return product_service.list_all(db)


@router.get("/mine", response_model=list[ProductOut])
def get_my_products(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return product_service.list_mine(db, current_user)


@router.get("/sold", response_model=list[ProductOut])
def get_sold_products(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return product_service.list_sold(db, current_user)


@router.get("/purchased", response_model=list[ProductOut])
def get_purchased_products(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return product_service.list_purchased(db, current_user)


@router.post("/{product_id}/sold", response_model=ProductOut)
def mark_product_sold(
    product_id: int,
    payload: MarkSoldRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return product_service.mark_as_sold(db, product_id, current_user, payload)
