from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.product import Product


def list_all(db: Session) -> list[Product]:
    return list(db.execute(select(Product).order_by(Product.id)).scalars())


def get_by_id(db: Session, product_id: int) -> Product | None:
    return db.get(Product, product_id)


def list_by_seller_id(db: Session, seller_id: int) -> list[Product]:
    return list(
        db.execute(select(Product).where(Product.seller_id == seller_id).order_by(Product.id)).scalars()
    )


def list_sold_by_seller_id(db: Session, seller_id: int) -> list[Product]:
    return list(
        db.execute(
            select(Product)
            .where(Product.seller_id == seller_id, Product.status == "sold")
            .order_by(Product.id)
        ).scalars()
    )


def list_purchased_by_buyer_id(db: Session, buyer_id: int) -> list[Product]:
    return list(
        db.execute(select(Product).where(Product.buyer_id == buyer_id).order_by(Product.id)).scalars()
    )
