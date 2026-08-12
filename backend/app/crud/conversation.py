from datetime import datetime, timezone

from sqlalchemy import or_, select
from sqlalchemy.orm import Session, joinedload

from app.models.conversation import Conversation


def get_by_id(db: Session, conversation_id: int) -> Conversation | None:
    return db.execute(
        select(Conversation)
        .where(Conversation.id == conversation_id)
        .options(joinedload(Conversation.buyer), joinedload(Conversation.seller), joinedload(Conversation.product))
    ).scalar_one_or_none()


def get_by_participants_and_product(
    db: Session, buyer_id: int, seller_id: int, product_id: int
) -> Conversation | None:
    return db.execute(
        select(Conversation).where(
            Conversation.buyer_id == buyer_id,
            Conversation.seller_id == seller_id,
            Conversation.product_id == product_id,
        )
    ).scalar_one_or_none()


def list_for_user(db: Session, user_id: int) -> list[Conversation]:
    return list(
        db.execute(
            select(Conversation)
            .where(or_(Conversation.buyer_id == user_id, Conversation.seller_id == user_id))
            .options(joinedload(Conversation.buyer), joinedload(Conversation.seller), joinedload(Conversation.product))
            .order_by(Conversation.updated_at.desc())
        ).scalars()
    )


def create(db: Session, buyer_id: int, seller_id: int, product_id: int) -> Conversation:
    conversation = Conversation(buyer_id=buyer_id, seller_id=seller_id, product_id=product_id)
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return conversation


def touch(db: Session, conversation: Conversation) -> None:
    conversation.updated_at = datetime.now(timezone.utc)
    db.commit()


def mark_read(db: Session, conversation: Conversation, *, viewer_is_buyer: bool) -> None:
    now = datetime.now(timezone.utc)
    if viewer_is_buyer:
        conversation.buyer_last_read_at = now
    else:
        conversation.seller_last_read_at = now
    db.commit()
