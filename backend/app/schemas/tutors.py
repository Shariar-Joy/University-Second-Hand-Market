from pydantic import BaseModel


class TutorOut(BaseModel):
    id: int
    slug: str
    name: str
    university: str
    subjects: list[str]
    price_per_class: int
    rating: float
    review_count: int
    created_at: str
