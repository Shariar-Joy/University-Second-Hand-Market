from typing import Any

from fastapi import APIRouter

from app.db.tutors import list_tutors
from app.schemas.tutors import TutorOut

router = APIRouter(prefix="/tutors", tags=["tutors"])


def _row_to_tutor_out(row: dict[str, Any]) -> TutorOut:
    return TutorOut(
        id=int(row["id"]),
        slug=row["slug"],
        name=row["name"],
        university=row["university"],
        subjects=list(row["subjects"]),
        price_per_class=int(row["price_per_class"]),
        rating=float(row["rating"]),
        review_count=int(row["review_count"]),
        created_at=row["created_at"],
    )


@router.get("", response_model=list[TutorOut])
def get_tutors():
    return [_row_to_tutor_out(row) for row in list_tutors()]
