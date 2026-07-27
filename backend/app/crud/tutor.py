from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.tutor import Tutor


def list_all(db: Session) -> list[Tutor]:
    return list(db.execute(select(Tutor).order_by(Tutor.id)).scalars())
