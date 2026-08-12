from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.tutors import TutorCreateRequest, TutorOut, TutorUpdateRequest
from app.services import tutor_service

router = APIRouter(prefix="/tutors", tags=["tutors"])


@router.get("", response_model=list[TutorOut])
def get_tutors(db: Session = Depends(get_db)):
    return tutor_service.list_all(db)


@router.get("/me", response_model=TutorOut)
def get_my_tutor_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return tutor_service.get_mine(db, current_user)


@router.post("", response_model=TutorOut, status_code=status.HTTP_201_CREATED)
def create_tutor_profile(
    payload: TutorCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return tutor_service.create_profile(db, current_user, payload)


@router.patch("/me", response_model=TutorOut)
def update_my_tutor_profile(
    payload: TutorUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return tutor_service.update_profile(db, current_user, payload)


@router.get("/{slug}", response_model=TutorOut)
def get_tutor_by_slug(slug: str, db: Session = Depends(get_db)):
    return tutor_service.get_by_slug(db, slug)
