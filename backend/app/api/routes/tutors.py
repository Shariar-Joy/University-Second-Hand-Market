import sqlite3

from fastapi import APIRouter

from app.db.tutors import list_tutors
from app.schemas.tutors import TutorOut

router = APIRouter(prefix="/tutors", tags=["tutors"])


def _row_to_tutor_out(row: sqlite3.Row) -> TutorOut:
    return TutorOut(
        id=row["id"],
        slug=row["slug"],
        name=row["name"],
        university=row["university"],
        subjects=row["subjects"].split(","),
        price_per_class=row["price_per_class"],
        rating=row["rating"],
        review_count=row["review_count"],
        created_at=row["created_at"],
    )


@router.get("", response_model=list[TutorOut])
def get_tutors():
    return [_row_to_tutor_out(row) for row in list_tutors()]
