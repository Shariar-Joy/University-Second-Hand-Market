from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.tutor import Tutor


def list_all(db: Session) -> list[Tutor]:
    return list(db.execute(select(Tutor).order_by(Tutor.id)).scalars())


def get_by_id(db: Session, tutor_id: int) -> Tutor | None:
    return db.get(Tutor, tutor_id)


def get_by_slug(db: Session, slug: str) -> Tutor | None:
    return db.execute(select(Tutor).where(Tutor.slug == slug)).scalar_one_or_none()


def get_by_user_id(db: Session, user_id: int) -> Tutor | None:
    return db.execute(select(Tutor).where(Tutor.user_id == user_id)).scalar_one_or_none()


def slug_exists(db: Session, slug: str) -> bool:
    return get_by_slug(db, slug) is not None


def create(db: Session, data: dict[str, Any]) -> Tutor:
    tutor = Tutor(**data)
    db.add(tutor)
    db.commit()
    db.refresh(tutor)
    return tutor


def update(db: Session, tutor: Tutor, data: dict[str, Any]) -> Tutor:
    for key, value in data.items():
        setattr(tutor, key, value)
    db.commit()
    db.refresh(tutor)
    return tutor
