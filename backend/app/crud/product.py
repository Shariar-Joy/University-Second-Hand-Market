from typing import Any

from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.models.product import Product


_SORT_CLAUSES = {
    # created_at alone can tie when rows are inserted within the same second (SQLite's
    # CURRENT_TIMESTAMP only has second resolution), so id breaks the tie deterministically.
    "newest": (Product.created_at.desc(), Product.id.desc()),
    "oldest": (Product.created_at.asc(), Product.id.asc()),
    "price_asc": (Product.price.asc(), Product.id.asc()),
    "price_desc": (Product.price.desc(), Product.id.asc()),
}


def list_all(
    db: Session,
    statuses: list[str] | None = None,
    search: str | None = None,
    category: str | None = None,
    condition: str | None = None,
    min_price: int | None = None,
    max_price: int | None = None,
    sort: str | None = None,
) -> list[Product]:
    query = select(Product)
    if statuses is not None:
        query = query.where(Product.status.in_(statuses))
    if search:
        term = f"%{search}%"
        # .ilike() compiles to a native ILIKE on Postgres and to a lower()-wrapped LIKE on
        # dialects without one (e.g. SQLite in tests), so this stays case-insensitive everywhere.
        query = query.where(
            or_(
                Product.name.ilike(term),
                Product.description.ilike(term),
                Product.category.ilike(term),
            )
        )
    if category is not None:
        query = query.where(Product.category == category)
    if condition is not None:
        query = query.where(Product.condition == condition)
    if min_price is not None:
        query = query.where(Product.price >= min_price)
    if max_price is not None:
        query = query.where(Product.price <= max_price)

    # `sort` is only ever a key from _SORT_CLAUSES (the caller validates it against that same
    # allowlist) -- never raw client input -- so this can't become an order-by injection vector.
    query = query.order_by(*_SORT_CLAUSES.get(sort, (Product.id.asc(),)))
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
