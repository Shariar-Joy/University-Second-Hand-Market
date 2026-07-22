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


def _ensure_users_table() -> None:
    if _table_exists(settings.USERS_TABLE):
        return
    logger.info("Creating DynamoDB table %s", settings.USERS_TABLE)
    _client.create_table(
        TableName=settings.USERS_TABLE,
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
    _client.get_waiter("table_exists").wait(TableName=settings.USERS_TABLE)


def _ensure_simple_table(table_name: str) -> None:
    if _table_exists(table_name):
        return
    logger.info("Creating DynamoDB table %s", table_name)
    _client.create_table(
        TableName=table_name,
        KeySchema=[{"AttributeName": "id", "KeyType": "HASH"}],
        AttributeDefinitions=[{"AttributeName": "id", "AttributeType": "S"}],
        BillingMode="PAY_PER_REQUEST",
    )
    _client.get_waiter("table_exists").wait(TableName=table_name)


def init_db() -> None:
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
