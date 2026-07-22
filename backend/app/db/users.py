import logging
from typing import Any

from botocore.exceptions import BotoCoreError, ClientError

from app.db.dynamodb import DynamoDBError, now_iso, users_table

logger = logging.getLogger(__name__)

_COUNTER_KEY = {"id": "__COUNTER__"}


def _next_user_id() -> int:
    table = users_table()
    try:
        response = table.update_item(
            Key=_COUNTER_KEY,
            UpdateExpression="ADD #v :incr",
            ExpressionAttributeNames={"#v": "value"},
            ExpressionAttributeValues={":incr": 1},
            ReturnValues="UPDATED_NEW",
        )
        return int(response["Attributes"]["value"])
    except (ClientError, BotoCoreError) as exc:
        logger.exception("Failed to generate the next user id")
        raise DynamoDBError("Could not create your account. Please try again.") from exc


def get_user_by_email(email: str) -> dict[str, Any] | None:
    table = users_table()
    try:
        response = table.query(
            IndexName="EmailIndex",
            KeyConditionExpression="email = :email",
            ExpressionAttributeValues={":email": email},
            Limit=1,
        )
    except (ClientError, BotoCoreError) as exc:
        logger.exception("Failed to look up user by email")
        raise DynamoDBError("Something went wrong. Please try again.") from exc
    items = response.get("Items", [])
    return items[0] if items else None


def get_user_by_username(username: str) -> dict[str, Any] | None:
    table = users_table()
    try:
        response = table.query(
            IndexName="UsernameIndex",
            KeyConditionExpression="username = :username",
            ExpressionAttributeValues={":username": username},
            Limit=1,
        )
    except (ClientError, BotoCoreError) as exc:
        logger.exception("Failed to look up user by username")
        raise DynamoDBError("Something went wrong. Please try again.") from exc
    items = response.get("Items", [])
    return items[0] if items else None


def get_user_by_id(user_id: int) -> dict[str, Any] | None:
    table = users_table()
    try:
        response = table.get_item(Key={"id": str(user_id)})
    except (ClientError, BotoCoreError) as exc:
        logger.exception("Failed to look up user by id")
        raise DynamoDBError("Something went wrong. Please try again.") from exc
    return response.get("Item")


def create_user(data: dict[str, Any]) -> dict[str, Any]:
    table = users_table()
    user_id = _next_user_id()

    item = {
        "id": str(user_id),
        "full_name": data["full_name"],
        "username": data["username"],
        "email": data["email"],
        "university": data["university"],
        "department": data["department"],
        "student_id": data["student_id"],
        "phone": data.get("phone"),
        "password_hash": data["password_hash"],
        "created_at": now_iso(),
    }

    try:
        table.put_item(Item=item)
    except (ClientError, BotoCoreError) as exc:
        logger.exception("Failed to create user")
        raise DynamoDBError("Could not create your account. Please try again.") from exc

    return item
