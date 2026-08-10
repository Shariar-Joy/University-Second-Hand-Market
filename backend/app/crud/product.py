from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.product import Product


def list_all(db: Session, statuses: list[str] | None = None) -> list[Product]:
    query = select(Product).order_by(Product.id)
    if statuses is not None:
        query = query.where(Product.status.in_(statuses))
    return list(db.execute(query).scalars())


def get_by_id(db: Session, product_id: int) -> Product | None:
    return db.get(Product, product_id)


def get_by_slug(db: Session, slug: str) -> Product | None:
    return db.execute(select(Product).where(Product.slug == slug)).scalar_one_or_none()


def slug_exists(db: Session, slug: str) -> bool:
    return get_by_slug(db, slug) is not None


def create(db: Session, data: dict[str, Any]) -> Product:
    product = Product(**data)
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def update(db: Session, product: Product, data: dict[str, Any]) -> Product:
    for key, value in data.items():
        setattr(product, key, value)
    db.commit()
    db.refresh(product)
    return product


def delete(db: Session, product: Product) -> None:
    db.delete(product)
    db.commit()


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
