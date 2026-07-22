import logging
from typing import Any

from botocore.exceptions import BotoCoreError, ClientError

from app.db.dynamodb import DynamoDBError, products_table, scan_all, seed_if_empty

logger = logging.getLogger(__name__)

_PRODUCT_SEED = [
    {
        "id": "1",
        "slug": "p1",
        "name": "Calculus: Early Transcendentals (10th Ed)",
        "category": "Books",
        "condition": "Good",
        "price": 650,
        "seller": "Rafiul Islam",
        "university": "North South University",
    },
    {
        "id": "2",
        "slug": "p2",
        "name": "HP Pavilion Laptop (i5, 8GB RAM)",
        "category": "Electronics",
        "condition": "Like New",
        "price": 42000,
        "seller": "Nusrat Jahan",
        "university": "BRAC University",
    },
    {
        "id": "3",
        "slug": "p3",
        "name": "Study Table with Chair",
        "category": "Furniture",
        "condition": "Good",
        "price": 3200,
        "seller": "Tanvir Ahmed",
        "university": "University of Dhaka",
    },
    {
        "id": "4",
        "slug": "p4",
        "name": "Casio fx-991EX Scientific Calculator",
        "category": "Stationery",
        "condition": "New",
        "price": 1450,
        "seller": "Farhana Akter",
        "university": "BUET",
    },
    {
        "id": "5",
        "slug": "p5",
        "name": "Duranta Frontier Bicycle",
        "category": "Bicycles",
        "condition": "Fair",
        "price": 8500,
        "seller": "Shafiul Karim",
        "university": "Ahsanullah University of Science and Technology",
    },
    {
        "id": "6",
        "slug": "p6",
        "name": "Badminton Racket Set (2 rackets + shuttles)",
        "category": "Sports",
        "condition": "Good",
        "price": 900,
        "seller": "Mahin Chowdhury",
        "university": "Independent University, Bangladesh",
    },
    {
        "id": "7",
        "slug": "p7",
        "name": "Yamaha F310 Acoustic Guitar",
        "category": "Instruments",
        "condition": "Like New",
        "price": 9500,
        "seller": "Adiba Rahman",
        "university": "Jahangirnagar University",
    },
    {
        "id": "8",
        "slug": "p8",
        "name": "Bean bag sofa",
        "category": "Furniture",
        "condition": "Fair",
        "price": 2200,
        "seller": "Imran Hossain",
        "university": "University of Chittagong",
    },
    {
        "id": "9",
        "slug": "p9",
        "name": "Winter Hoodie — Varsity Fest Edition",
        "category": "Clothing",
        "condition": "New",
        "price": 850,
        "seller": "Sadia Islam",
        "university": "North South University",
    },
    {
        "id": "10",
        "slug": "p10",
        "name": "Data Structures & Algorithms in C++ (Textbook)",
        "category": "Books",
        "condition": "Good",
        "price": 550,
        "seller": "Rakibul Hasan",
        "university": "BRAC University",
    },
]


def list_products() -> list[dict[str, Any]]:
    try:
        items = scan_all(products_table())
    except (ClientError, BotoCoreError) as exc:
        logger.exception("Failed to list products")
        raise DynamoDBError("Could not load products right now. Please try again.") from exc
    return sorted(items, key=lambda item: int(item["id"]))


def seed_products() -> None:
    try:
        seed_if_empty(products_table(), _PRODUCT_SEED, "products")
    except (ClientError, BotoCoreError) as exc:
        logger.exception("Failed to seed products")
        raise DynamoDBError("Could not initialize product data.") from exc
