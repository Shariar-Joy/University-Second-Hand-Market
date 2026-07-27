from sqlalchemy.orm import Session

from app.crud import product as product_crud
from app.models.product import Product


def list_all(db: Session) -> list[Product]:
    return product_crud.list_all(db)
