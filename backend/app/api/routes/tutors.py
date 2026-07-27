from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.tutors import TutorOut
from app.services import tutor_service

router = APIRouter(prefix="/tutors", tags=["tutors"])


@router.get("", response_model=list[TutorOut])
def get_tutors(db: Session = Depends(get_db)):
    return tutor_service.list_all(db)
