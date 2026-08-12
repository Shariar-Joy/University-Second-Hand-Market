from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Conversation(Base):
    __tablename__ = "conversations"
    __table_args__ = (
        UniqueConstraint("buyer_id", "seller_id", "product_id", name="uq_conversations_buyer_seller_product"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    buyer_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    seller_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)

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
    product: Mapped["Product"] = relationship(back_populates="conversations")  # noqa: F821
    messages: Mapped[list["Message"]] = relationship(  # noqa: F821
        back_populates="conversation", cascade="all, delete-orphan", order_by="Message.created_at"
    )

    @property
    def last_message(self) -> "Message | None":  # noqa: F821
        return self.messages[-1] if self.messages else None
