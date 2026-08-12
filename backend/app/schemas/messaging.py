from datetime import datetime

from pydantic import BaseModel, ConfigDict, field_validator, model_validator

from app.schemas.products import ProductOut
from app.schemas.tutors import TutorOut

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
    product: ProductOut | None = None
    tutor: TutorOut | None = None
    created_at: datetime
    updated_at: datetime
    last_message: MessageOut | None = None
    unread: bool = False


class ConversationMessagesOut(BaseModel):
    conversation: ConversationOut
    messages: list[MessageOut]


class ConversationCreateRequest(BaseModel):
    product_id: int | None = None
    tutor_id: int | None = None

    @model_validator(mode="after")
    def exactly_one_subject(self) -> "ConversationCreateRequest":
        if (self.product_id is None) == (self.tutor_id is None):
            raise ValueError("Provide exactly one of product_id or tutor_id.")
        return self


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
