from sqlalchemy.orm import Session

from app.crud import tutor as tutor_crud
from app.models.tutor import Tutor


def list_all(db: Session) -> list[Tutor]:
    return tutor_crud.list_all(db)
