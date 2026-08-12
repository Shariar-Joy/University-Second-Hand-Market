from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.crud import conversation as conversation_crud
from app.crud import message as message_crud
from app.crud import product as product_crud
from app.crud import tutor as tutor_crud
from app.models.conversation import Conversation
from app.models.message import Message
from app.models.user import User


def _as_naive_utc(value: datetime) -> datetime:
    # SQLite (used in tests) doesn't reliably round-trip tzinfo the way Postgres does, so a
    # freshly-assigned aware datetime and one just loaded back from the DB can end up with
    # mismatched awareness. Comparing on naive wall-clock values sidesteps that entirely --
    # every timestamp in this table is written as UTC either way.
    return value.replace(tzinfo=None) if value.tzinfo is not None else value


def _authorize_participant(current_user: User, conversation: Conversation) -> None:
    if current_user.id not in (conversation.buyer_id, conversation.seller_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="You don't have access to this conversation."
        )


def _get_owned_conversation(db: Session, current_user: User, conversation_id: int) -> Conversation:
    conversation = conversation_crud.get_by_id(db, conversation_id)
    if conversation is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found.")
    _authorize_participant(current_user, conversation)
    return conversation


def list_conversations(db: Session, current_user: User) -> list[Conversation]:
    return conversation_crud.list_for_user(db, current_user.id)


def get_or_create_conversation(db: Session, current_user: User, product_id: int) -> Conversation:
    product = product_crud.get_by_id(db, product_id)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found.")
    if product.seller_id is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="This listing no longer has an active seller."
        )
    if product.seller_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot start a conversation about your own listing."
        )

    existing = conversation_crud.get_by_participants_and_product(db, current_user.id, product.seller_id, product_id)
    if existing is not None:
        return existing

    return conversation_crud.create(db, buyer_id=current_user.id, seller_id=product.seller_id, product_id=product_id)


def get_or_create_tutor_conversation(db: Session, current_user: User, tutor_id: int) -> Conversation:
    tutor = tutor_crud.get_by_id(db, tutor_id)
    if tutor is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tutor profile not found.")
    if tutor.user_id is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="This tutor no longer has an active account."
        )
    if tutor.user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot start a conversation with yourself."
        )

    existing = conversation_crud.get_by_participants_and_tutor(db, current_user.id, tutor.user_id, tutor_id)
    if existing is not None:
        return existing

    return conversation_crud.create(db, buyer_id=current_user.id, seller_id=tutor.user_id, tutor_id=tutor_id)


def is_unread(conversation: Conversation, viewer_id: int) -> bool:
    last_message = conversation.last_message
    if last_message is None or last_message.sender_id == viewer_id:
        return False
    viewer_is_buyer = viewer_id == conversation.buyer_id
    last_read_at = conversation.buyer_last_read_at if viewer_is_buyer else conversation.seller_last_read_at
    if last_read_at is None:
        return True
    return _as_naive_utc(last_message.created_at) > _as_naive_utc(last_read_at)


def get_conversation_with_messages(
    db: Session, current_user: User, conversation_id: int
) -> tuple[Conversation, list[Message]]:
    conversation = _get_owned_conversation(db, current_user, conversation_id)
    messages = message_crud.list_by_conversation(db, conversation.id)
    conversation_crud.mark_read(db, conversation, viewer_is_buyer=current_user.id == conversation.buyer_id)
    return conversation, messages


def send_message(db: Session, current_user: User, conversation_id: int, content: str) -> Message:
    conversation = _get_owned_conversation(db, current_user, conversation_id)
    message = message_crud.create(db, conversation.id, current_user.id, content)
    conversation_crud.touch(db, conversation)
    return message
