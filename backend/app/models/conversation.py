from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Conversation(Base):
    __tablename__ = "conversations"
    __table_args__ = (
        # A conversation is about exactly one thing -- a product listing or a tutor profile --
        # never both, never neither. product_id/tutor_id being nullable lets one table serve
        # both without a second messaging system.
        UniqueConstraint("buyer_id", "seller_id", "product_id", name="uq_conversations_buyer_seller_product"),
        UniqueConstraint("buyer_id", "seller_id", "tutor_id", name="uq_conversations_buyer_seller_tutor"),
        CheckConstraint(
            "(product_id IS NOT NULL AND tutor_id IS NULL) OR (product_id IS NULL AND tutor_id IS NOT NULL)",
            name="ck_conversations_exactly_one_subject",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    buyer_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    seller_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id: Mapped[int | None] = mapped_column(
        ForeignKey("products.id", ondelete="CASCADE"), nullable=True, index=True
    )
    tutor_id: Mapped[int | None] = mapped_column(
        ForeignKey("tutors.id", ondelete="CASCADE"), nullable=True, index=True
    )

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
    # NULL means "never opened this conversation" -- distinct from any real timestamp.
    buyer_last_read_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    seller_last_read_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    buyer: Mapped["User"] = relationship(  # noqa: F821
        foreign_keys=[buyer_id], back_populates="buyer_conversations"
    )
    seller: Mapped["User"] = relationship(  # noqa: F821
        foreign_keys=[seller_id], back_populates="seller_conversations"
    )
    product: Mapped["Product | None"] = relationship(back_populates="conversations")  # noqa: F821
    tutor: Mapped["Tutor | None"] = relationship(back_populates="conversations")  # noqa: F821
    messages: Mapped[list["Message"]] = relationship(  # noqa: F821
        back_populates="conversation", cascade="all, delete-orphan", order_by="Message.created_at"
    )

    @property
    def last_message(self) -> "Message | None":  # noqa: F821
        return self.messages[-1] if self.messages else None
