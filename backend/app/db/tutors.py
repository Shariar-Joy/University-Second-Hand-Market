import logging
from typing import Any

from botocore.exceptions import BotoCoreError, ClientError

from app.db.dynamodb import DynamoDBError, now_iso, to_decimal, tutors_table

logger = logging.getLogger(__name__)

_TUTOR_SEED = [
    {
        "id": "1",
        "slug": "t1",
        "name": "Ashraful Kabir",
        "university": "BUET",
        "subjects": ["Calculus I & II", "Linear Algebra"],
        "price_per_class": 500,
        "rating": to_decimal(4.8),
        "review_count": 32,
    },
    {
        "id": "2",
        "slug": "t2",
        "name": "Mehnaz Tabassum",
        "university": "North South University",
        "subjects": ["Data Structures & Algorithms", "Database Systems"],
        "price_per_class": 700,
        "rating": to_decimal(4.9),
        "review_count": 47,
    },
    {
        "id": "3",
        "slug": "t3",
        "name": "Fahim Rahman",
        "university": "University of Dhaka",
        "subjects": ["Physics I (Mechanics)", "Physics II (Electromagnetism)"],
        "price_per_class": 450,
        "rating": to_decimal(4.6),
        "review_count": 21,
    },
    {
        "id": "4",
        "slug": "t4",
        "name": "Sabrina Yasmin",
        "university": "BRAC University",
        "subjects": ["Microeconomics", "Macroeconomics"],
        "price_per_class": 550,
        "rating": to_decimal(4.7),
        "review_count": 18,
    },
    {
        "id": "5",
        "slug": "t5",
        "name": "Tousif Anam",
        "university": "Ahsanullah University of Science and Technology",
        "subjects": ["Digital Logic Design", "Electrical Circuits"],
        "price_per_class": 600,
        "rating": to_decimal(4.5),
        "review_count": 14,
    },
    {
        "id": "6",
        "slug": "t6",
        "name": "Nabila Ferdous",
        "university": "Independent University, Bangladesh",
        "subjects": ["English Composition", "Bangla Literature"],
        "price_per_class": 400,
        "rating": to_decimal(4.9),
        "review_count": 39,
    },
    {
        "id": "7",
        "slug": "t7",
        "name": "Ovi Talukder",
        "university": "Jahangirnagar University",
        "subjects": ["Organic Chemistry", "Inorganic Chemistry"],
        "price_per_class": 500,
        "rating": to_decimal(4.4),
        "review_count": 12,
    },
    {
        "id": "8",
        "slug": "t8",
        "name": "Rezwana Haque",
        "university": "University of Chittagong",
        "subjects": ["Object-Oriented Programming", "Software Engineering"],
        "price_per_class": 650,
        "rating": to_decimal(4.8),
        "review_count": 26,
    },
]


def list_tutors() -> list[dict[str, Any]]:
    table = tutors_table()
    items: list[dict[str, Any]] = []
    try:
        response = table.scan()
        items.extend(response.get("Items", []))
        while "LastEvaluatedKey" in response:
            response = table.scan(ExclusiveStartKey=response["LastEvaluatedKey"])
            items.extend(response.get("Items", []))
    except (ClientError, BotoCoreError) as exc:
        logger.exception("Failed to list tutors")
        raise DynamoDBError("Could not load tutors right now. Please try again.") from exc
    return sorted(items, key=lambda item: int(item["id"]))


def seed_tutors() -> None:
    table = tutors_table()
    try:
        existing = table.scan(Limit=1)
        if existing.get("Count", 0) > 0:
            return
        logger.info("Seeding %d tutors", len(_TUTOR_SEED))
        seeded_at = now_iso()
        with table.batch_writer() as batch:
            for item in _TUTOR_SEED:
                batch.put_item(Item={**item, "created_at": seeded_at})
    except (ClientError, BotoCoreError) as exc:
        logger.exception("Failed to seed tutors")
        raise DynamoDBError("Could not initialize tutor data.") from exc
