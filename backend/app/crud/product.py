from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.product import Product


def list_all(db: Session) -> list[Product]:
    return list(db.execute(select(Product).order_by(Product.id)).scalars())
