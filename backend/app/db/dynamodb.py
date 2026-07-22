import logging
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any

import boto3
from botocore.exceptions import BotoCoreError, ClientError

from app.core.config import settings

logger = logging.getLogger(__name__)


class DynamoDBError(Exception):
    """Raised when a DynamoDB operation fails unexpectedly."""


def now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")


def _resource_kwargs() -> dict[str, Any]:
    kwargs: dict[str, Any] = {"region_name": settings.AWS_REGION}
    if settings.DYNAMODB_ENDPOINT_URL:
        kwargs["endpoint_url"] = settings.DYNAMODB_ENDPOINT_URL
        # DynamoDB Local doesn't validate credentials but boto3 still requires *some* to be
        # present. Only used when talking to a local endpoint; real AWS still uses the normal
        # credential chain (env vars, ~/.aws/credentials, IAM role, etc).
        kwargs.setdefault("aws_access_key_id", "local")
        kwargs.setdefault("aws_secret_access_key", "local")
    return kwargs


_resource = boto3.resource("dynamodb", **_resource_kwargs())
_client = _resource.meta.client


def users_table():
    return _resource.Table(settings.USERS_TABLE)


def products_table():
    return _resource.Table(settings.PRODUCTS_TABLE)


def tutors_table():
    return _resource.Table(settings.TUTORS_TABLE)


def to_decimal(value: float) -> Decimal:
    """DynamoDB's Number type must be written as Decimal, not float, via boto3's resource API."""
    return Decimal(str(value))


def _table_exists(table_name: str) -> bool:
    try:
        _client.describe_table(TableName=table_name)
        return True
    except _client.exceptions.ResourceNotFoundException:
        return False


def _create_table_idempotent(table_name: str, **create_table_kwargs: Any) -> None:
    if _table_exists(table_name):
        return
    logger.info("Creating DynamoDB table %s", table_name)
    try:
        _client.create_table(TableName=table_name, **create_table_kwargs)
    except _client.exceptions.ResourceInUseException:
        # Lambda can spin up several concurrent cold starts on first deploy; another one
        # already won the race to create this table. Just wait for it to become active.
        logger.info("Table %s is already being created by another invocation", table_name)
    _client.get_waiter("table_exists").wait(TableName=table_name)


def _ensure_users_table() -> None:
    _create_table_idempotent(
        settings.USERS_TABLE,
        KeySchema=[{"AttributeName": "id", "KeyType": "HASH"}],
        AttributeDefinitions=[
            {"AttributeName": "id", "AttributeType": "S"},
            {"AttributeName": "email", "AttributeType": "S"},
            {"AttributeName": "username", "AttributeType": "S"},
        ],
        GlobalSecondaryIndexes=[
            {
                "IndexName": "EmailIndex",
                "KeySchema": [{"AttributeName": "email", "KeyType": "HASH"}],
                "Projection": {"ProjectionType": "ALL"},
            },
            {
                "IndexName": "UsernameIndex",
                "KeySchema": [{"AttributeName": "username", "KeyType": "HASH"}],
                "Projection": {"ProjectionType": "ALL"},
            },
        ],
        BillingMode="PAY_PER_REQUEST",
    )


def _ensure_simple_table(table_name: str) -> None:
    _create_table_idempotent(
        table_name,
        KeySchema=[{"AttributeName": "id", "KeyType": "HASH"}],
        AttributeDefinitions=[{"AttributeName": "id", "AttributeType": "S"}],
        BillingMode="PAY_PER_REQUEST",
    )


def scan_all(table: Any) -> list[dict[str, Any]]:
    """Scan an entire table, following pagination until every item has been read."""
    items: list[dict[str, Any]] = []
    response = table.scan()
    items.extend(response.get("Items", []))
    while "LastEvaluatedKey" in response:
        response = table.scan(ExclusiveStartKey=response["LastEvaluatedKey"])
        items.extend(response.get("Items", []))
    return items


def seed_if_empty(table: Any, seed_data: list[dict[str, Any]], label: str) -> None:
    """Populate a table with fixed seed data, but only the first time it's ever empty."""
    existing = table.scan(Limit=1)
    if existing.get("Count", 0) > 0:
        return
    logger.info("Seeding %d %s", len(seed_data), label)
    seeded_at = now_iso()
    with table.batch_writer() as batch:
        for item in seed_data:
            batch.put_item(Item={**item, "created_at": seeded_at})


_initialized = False


def init_db() -> None:
    # Under Mangum, the ASGI lifespan (and therefore this function, via FastAPI's lifespan
    # handler) runs on *every* Lambda invocation, not just cold starts -- there's no reliable
    # shutdown signal in Lambda's execution model, so Mangum conservatively repeats the full
    # lifespan cycle each time. Module-level state survives across warm invocations of the same
    # container, so this guard keeps the actual table-creation/seed-check calls to once per
    # container instead of once per request. Local `uvicorn` runs (and each fresh Lambda
    # container) still get exactly one real initialization, same as before.
    global _initialized
    if _initialized:
        return

    # Local imports to avoid a circular import (products/tutors seed helpers import this module).
    from app.db.products import seed_products
    from app.db.tutors import seed_tutors

    try:
        _ensure_users_table()
        _ensure_simple_table(settings.PRODUCTS_TABLE)
        _ensure_simple_table(settings.TUTORS_TABLE)
    except (ClientError, BotoCoreError) as exc:
        logger.exception("Failed to initialize DynamoDB tables")
        raise DynamoDBError("Could not initialize the database.") from exc

    seed_products()
    seed_tutors()
    _initialized = True
