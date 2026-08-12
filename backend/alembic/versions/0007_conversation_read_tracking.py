"""add per-participant read tracking to conversations

Revision ID: 0007
Revises: 0006
Create Date: 2026-08-12
"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "0007"
down_revision = "0006"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("conversations", sa.Column("buyer_last_read_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("conversations", sa.Column("seller_last_read_at", sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column("conversations", "seller_last_read_at")
    op.drop_column("conversations", "buyer_last_read_at")
