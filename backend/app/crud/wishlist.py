from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.wishlist import Wishlist


def get_by_user_and_product(db: Session, user_id: int, product_id: int) -> Wishlist | None:
    return db.execute(
        select(Wishlist).where(Wishlist.user_id == user_id, Wishlist.product_id == product_id)
    ).scalar_one_or_none()


def list_by_user(db: Session, user_id: int) -> list[Wishlist]:
    return list(
        db.execute(
            select(Wishlist)
            .where(Wishlist.user_id == user_id)
            .options(joinedload(Wishlist.product))
            .order_by(Wishlist.created_at.desc(), Wishlist.id.desc())
        ).scalars()
    )


def create(db: Session, user_id: int, product_id: int) -> Wishlist:
    item = Wishlist(user_id=user_id, product_id=product_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def delete(db: Session, item: Wishlist) -> None:
    db.delete(item)
    db.commit()
