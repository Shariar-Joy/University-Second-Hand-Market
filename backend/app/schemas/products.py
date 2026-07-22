from pydantic import BaseModel


class ProductOut(BaseModel):
    id: int
    slug: str
    name: str
    category: str
    condition: str
    price: int
    seller: str
    university: str
    created_at: str
