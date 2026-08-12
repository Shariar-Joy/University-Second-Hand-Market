from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.crud import tutor as tutor_crud
from app.models.tutor import Tutor
from app.models.user import User
from app.schemas.tutors import TutorCreateRequest, TutorUpdateRequest
from app.utils.slugify import unique_slug


def list_all(db: Session) -> list[Tutor]:
    return tutor_crud.list_all(db)


def get_by_slug(db: Session, slug: str) -> Tutor:
    tutor = tutor_crud.get_by_slug(db, slug)
    if tutor is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tutor profile not found.")
    return tutor


def get_mine(db: Session, current_user: User) -> Tutor:
    tutor = tutor_crud.get_by_user_id(db, current_user.id)
    if tutor is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="You don't have a tutor profile yet.")
    return tutor


def create_profile(db: Session, current_user: User, payload: TutorCreateRequest) -> Tutor:
    if tutor_crud.get_by_user_id(db, current_user.id) is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="You already have a tutor profile.")

    data = payload.model_dump()
    data["slug"] = unique_slug(current_user.full_name, lambda candidate: tutor_crud.slug_exists(db, candidate))
    data["name"] = current_user.full_name
    data["university"] = current_user.university
    data["user_id"] = current_user.id
    data["rating"] = 0.0
    data["review_count"] = 0
    return tutor_crud.create(db, data)


def update_profile(db: Session, current_user: User, payload: TutorUpdateRequest) -> Tutor:
    tutor = get_mine(db, current_user)
    data = payload.model_dump(exclude_unset=True, exclude_none=True)
    if not data:
        return tutor
    return tutor_crud.update(db, tutor, data)
