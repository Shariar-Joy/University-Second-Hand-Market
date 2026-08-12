from datetime import datetime

from pydantic import BaseModel, ConfigDict, field_validator

from app.schemas.products import ProductOut

_MAX_MESSAGE_LENGTH = 2000


class ConversationParticipantOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    profile_image: str | None = None


class MessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    conversation_id: int
    sender_id: int
    content: str
    created_at: datetime


class ConversationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    buyer: ConversationParticipantOut
    seller: ConversationParticipantOut
    product: ProductOut
    created_at: datetime
    updated_at: datetime
    last_message: MessageOut | None = None
    unread: bool = False


class ConversationMessagesOut(BaseModel):
    conversation: ConversationOut
    messages: list[MessageOut]


class ConversationCreateRequest(BaseModel):
    product_id: int


class MessageCreateRequest(BaseModel):
    content: str

    @field_validator("content")
    @classmethod
    def content_required(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("Message cannot be empty.")
        if len(stripped) > _MAX_MESSAGE_LENGTH:
            raise ValueError(f"Message must be {_MAX_MESSAGE_LENGTH} characters or fewer.")
        return stripped
