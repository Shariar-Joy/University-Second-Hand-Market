from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.schemas.products import ProductOut


class WishlistCreateRequest(BaseModel):
    product_id: int


class WishlistItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product: ProductOut
    created_at: datetime


class WishlistStatusOut(BaseModel):
    wishlisted: bool
