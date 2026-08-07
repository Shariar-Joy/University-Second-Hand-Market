from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    name: str
    category: str
    condition: str
    price: int
    seller: str
    university: str
    status: str
    buyer_name: str | None = None
    created_at: datetime


class MarkSoldRequest(BaseModel):
    buyer_identifier: str | None = None
