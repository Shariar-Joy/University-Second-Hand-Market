from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, field_validator

# Mirrors frontend/uni_marketplace/src/data/products.ts's PRODUCT_CATEGORIES/PRODUCT_CONDITIONS --
# keep both in sync.
ALLOWED_CATEGORIES = {
    "Books",
    "Electronics",
    "Furniture",
    "Clothing",
    "Bicycles",
    "Sports",
    "Stationery",
    "Instruments",
    "Other",
}
ALLOWED_CONDITIONS = {"New", "Like New", "Good", "Fair"}


class ProductImageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    url: str
    position: int
    is_primary: bool


class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    name: str
    category: str
    condition: str
    price: int
    seller: str
    seller_id: int | None = None
    university: str
    description: str | None = None
    images: list[str] = []
    image_details: list[ProductImageOut] = []
    negotiable: bool
    location: str | None = None
    department: str | None = None
    status: str
    buyer_name: str | None = None
    created_at: datetime
    updated_at: datetime

    @field_validator("images", "image_details", mode="before")
    @classmethod
    def default_empty_list(cls, value: list | None) -> list:
        return value or []


class ProductCreateRequest(BaseModel):
    name: str
    description: str | None = None
    price: int
    negotiable: bool = False
    category: str
    condition: str
    location: str | None = None
    department: str | None = None

    @field_validator("name")
    @classmethod
    def name_required(cls, value: str) -> str:
        if len(value.strip()) < 2:
            raise ValueError("Enter a title for your listing.")
        return value.strip()

    @field_validator("price")
    @classmethod
    def price_positive(cls, value: int) -> int:
        if value <= 0:
            raise ValueError("Price must be greater than 0.")
        return value

    @field_validator("category")
    @classmethod
    def category_allowed(cls, value: str) -> str:
        if value not in ALLOWED_CATEGORIES:
            raise ValueError("Select a valid category.")
        return value

    @field_validator("condition")
    @classmethod
    def condition_allowed(cls, value: str) -> str:
        if value not in ALLOWED_CONDITIONS:
            raise ValueError("Select a valid condition.")
        return value


class ProductUpdateRequest(BaseModel):
    name: str | None = None
    description: str | None = None
    price: int | None = None
    negotiable: bool | None = None
    category: str | None = None
    condition: str | None = None
    location: str | None = None
    department: str | None = None

    @field_validator("name")
    @classmethod
    def name_not_blank(cls, value: str | None) -> str | None:
        if value is not None and len(value.strip()) < 2:
            raise ValueError("Enter a title for your listing.")
        return value.strip() if value is not None else value

    @field_validator("price")
    @classmethod
    def price_positive(cls, value: int | None) -> int | None:
        if value is not None and value <= 0:
            raise ValueError("Price must be greater than 0.")
        return value

    @field_validator("category")
    @classmethod
    def category_allowed(cls, value: str | None) -> str | None:
        if value is not None and value not in ALLOWED_CATEGORIES:
            raise ValueError("Select a valid category.")
        return value

    @field_validator("condition")
    @classmethod
    def condition_allowed(cls, value: str | None) -> str | None:
        if value is not None and value not in ALLOWED_CONDITIONS:
            raise ValueError("Select a valid condition.")
        return value


class ProductStatusRequest(BaseModel):
    status: Literal["available", "reserved", "archived"]


class ReorderImagesRequest(BaseModel):
    image_ids: list[int]

    @field_validator("image_ids")
    @classmethod
    def image_ids_not_empty(cls, value: list[int]) -> list[int]:
        if not value:
            raise ValueError("Provide the images' new order.")
        return value


class MarkSoldRequest(BaseModel):
    buyer_identifier: str | None = None
