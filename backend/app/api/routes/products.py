import sqlite3

from fastapi import APIRouter

from app.db.products import list_products
from app.schemas.products import ProductOut

router = APIRouter(prefix="/products", tags=["products"])


def _row_to_product_out(row: sqlite3.Row) -> ProductOut:
    return ProductOut(
        id=row["id"],
        slug=row["slug"],
        name=row["name"],
        category=row["category"],
        condition=row["condition"],
        price=row["price"],
        seller=row["seller"],
        university=row["university"],
        created_at=row["created_at"],
    )


@router.get("", response_model=list[ProductOut])
def get_products():
    return [_row_to_product_out(row) for row in list_products()]
