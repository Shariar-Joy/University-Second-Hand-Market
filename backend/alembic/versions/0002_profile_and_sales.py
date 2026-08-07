"""add user bio and product buyer/sold-at columns

Revision ID: 0002
Revises: 0001
Create Date: 2026-08-07
"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("bio", sa.Text(), nullable=True))

    op.add_column("products", sa.Column("buyer_id", sa.Integer(), nullable=True))
    op.add_column("products", sa.Column("sold_at", sa.DateTime(timezone=True), nullable=True))
    op.create_foreign_key(
        "fk_products_buyer_id_users", "products", "users", ["buyer_id"], ["id"], ondelete="SET NULL"
    )
    op.create_index("ix_products_buyer_id", "products", ["buyer_id"])


def downgrade() -> None:
    op.drop_index("ix_products_buyer_id", table_name="products")
    op.drop_constraint("fk_products_buyer_id_users", "products", type_="foreignkey")
    op.drop_column("products", "sold_at")
    op.drop_column("products", "buyer_id")

    op.drop_column("users", "bio")
