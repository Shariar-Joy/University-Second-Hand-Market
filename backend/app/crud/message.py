from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.message import Message


def list_by_conversation(db: Session, conversation_id: int) -> list[Message]:
    return list(
        db.execute(
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at, Message.id)
        ).scalars()
    )


def create(db: Session, conversation_id: int, sender_id: int, content: str) -> Message:
    message = Message(conversation_id=conversation_id, sender_id=sender_id, content=content)
    db.add(message)
    db.commit()
    db.refresh(message)
    return message
