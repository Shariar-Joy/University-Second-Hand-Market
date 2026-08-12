"""tutor marketplace: user-created tutor profiles + tutor-based conversations

Revision ID: 0008
Revises: 0007
Create Date: 2026-08-12
"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "0008"
down_revision = "0007"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("tutors", sa.Column("bio", sa.Text(), nullable=True))
    op.create_unique_constraint("uq_tutors_user_id", "tutors", ["user_id"])

    # A conversation is about exactly one thing -- a product listing or a tutor profile.
    op.alter_column("conversations", "product_id", existing_type=sa.Integer(), nullable=True)
    op.add_column("conversations", sa.Column("tutor_id", sa.Integer(), nullable=True))
    op.create_foreign_key(
        "fk_conversations_tutor_id_tutors", "conversations", "tutors", ["tutor_id"], ["id"], ondelete="CASCADE"
    )
    op.create_index("ix_conversations_tutor_id", "conversations", ["tutor_id"])
    op.create_unique_constraint(
        "uq_conversations_buyer_seller_tutor", "conversations", ["buyer_id", "seller_id", "tutor_id"]
    )
    op.create_check_constraint(
        "ck_conversations_exactly_one_subject",
        "conversations",
        "(product_id IS NOT NULL AND tutor_id IS NULL) OR (product_id IS NULL AND tutor_id IS NOT NULL)",
    )


def downgrade() -> None:
    op.drop_constraint("ck_conversations_exactly_one_subject", "conversations", type_="check")
    op.drop_constraint("uq_conversations_buyer_seller_tutor", "conversations", type_="unique")
    op.drop_index("ix_conversations_tutor_id", table_name="conversations")
    op.drop_constraint("fk_conversations_tutor_id_tutors", "conversations", type_="foreignkey")
    op.drop_column("conversations", "tutor_id")
    op.alter_column("conversations", "product_id", existing_type=sa.Integer(), nullable=False)

    op.drop_constraint("uq_tutors_user_id", "tutors", type_="unique")
    op.drop_column("tutors", "bio")
