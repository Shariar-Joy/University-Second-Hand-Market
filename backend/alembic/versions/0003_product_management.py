"""add product department, location, negotiable columns

Revision ID: 0003
Revises: 0002
Create Date: 2026-08-08
"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("products", sa.Column("department", sa.String(length=120), nullable=True))
    op.add_column("products", sa.Column("location", sa.String(length=200), nullable=True))
    op.add_column(
        "products", sa.Column("negotiable", sa.Boolean(), server_default=sa.false(), nullable=False)
    )


def downgrade() -> None:
    op.drop_column("products", "negotiable")
    op.drop_column("products", "location")
    op.drop_column("products", "department")
