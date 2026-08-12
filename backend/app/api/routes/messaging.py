from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.conversation import Conversation
from app.models.user import User
from app.schemas.messaging import (
    ConversationCreateRequest,
    ConversationMessagesOut,
    ConversationOut,
    ConversationParticipantOut,
    MessageCreateRequest,
    MessageOut,
)
from app.schemas.products import ProductOut
from app.services import messaging_service

router = APIRouter(prefix="/conversations", tags=["messaging"])


def _to_conversation_out(conversation: Conversation, viewer_id: int) -> ConversationOut:
    return ConversationOut(
        id=conversation.id,
        buyer=ConversationParticipantOut.model_validate(conversation.buyer),
        seller=ConversationParticipantOut.model_validate(conversation.seller),
        product=ProductOut.model_validate(conversation.product),
        created_at=conversation.created_at,
        updated_at=conversation.updated_at,
        last_message=MessageOut.model_validate(conversation.last_message) if conversation.last_message else None,
        unread=messaging_service.is_unread(conversation, viewer_id),
    )


@router.get("", response_model=list[ConversationOut])
def get_conversations(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    conversations = messaging_service.list_conversations(db, current_user)
    return [_to_conversation_out(conversation, current_user.id) for conversation in conversations]


@router.post("", response_model=ConversationOut)
def create_conversation(
    payload: ConversationCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conversation = messaging_service.get_or_create_conversation(db, current_user, payload.product_id)
    return _to_conversation_out(conversation, current_user.id)


@router.get("/{conversation_id}/messages", response_model=ConversationMessagesOut)
def get_messages(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conversation, messages = messaging_service.get_conversation_with_messages(db, current_user, conversation_id)
    return ConversationMessagesOut(
        conversation=_to_conversation_out(conversation, current_user.id),
        messages=[MessageOut.model_validate(message) for message in messages],
    )


@router.post("/{conversation_id}/messages", response_model=MessageOut, status_code=status.HTTP_201_CREATED)
def post_message(
    conversation_id: int,
    payload: MessageCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return messaging_service.send_message(db, current_user, conversation_id, payload.content)
