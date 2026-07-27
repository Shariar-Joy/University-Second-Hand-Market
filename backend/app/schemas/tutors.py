from datetime import datetime

from pydantic import BaseModel, ConfigDict


class TutorOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    name: str
    university: str
    subjects: list[str]
    price_per_class: int
    rating: float
    review_count: int
    created_at: datetime
