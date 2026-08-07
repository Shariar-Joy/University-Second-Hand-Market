from datetime import datetime

from sqlalchemy import JSON, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    slug: Mapped[str] = mapped_column(String(160), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    category: Mapped[str] = mapped_column(String(80), nullable=False)
    condition: Mapped[str] = mapped_column(String(40), nullable=False)
    price: Mapped[int] = mapped_column(Integer, nullable=False)
    seller: Mapped[str] = mapped_column(String(120), nullable=False)
    university: Mapped[str] = mapped_column(String(150), nullable=False)

    seller_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    buyer_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    images: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, server_default="available")
    sold_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    seller_account: Mapped["User | None"] = relationship(  # noqa: F821
        foreign_keys=[seller_id], back_populates="products"
    )
    buyer_account: Mapped["User | None"] = relationship(  # noqa: F821
        foreign_keys=[buyer_id], back_populates="purchases"
    )

    @property
    def buyer_name(self) -> str | None:
        return self.buyer_account.full_name if self.buyer_account else None
