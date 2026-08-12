from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_admin_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.admin import AdminStatsOut, AdminUserOut
from app.schemas.products import ProductOut
from app.services import admin_service

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/stats", response_model=AdminStatsOut)
def get_admin_stats(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    return admin_service.get_stats(db)


@router.get("/users", response_model=list[AdminUserOut])
def get_admin_users(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    return admin_service.list_users(db)


@router.get("/products", response_model=list[ProductOut])
def get_admin_products(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    return admin_service.list_products(db)


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_admin_product(
    product_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    admin_service.delete_product(db, product_id)
