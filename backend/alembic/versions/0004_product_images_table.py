"""replace products.images JSON column with a proper product_images table

Revision ID: 0004
Revises: 0003
Create Date: 2026-08-12
"""

import re

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "0004"
down_revision = "0003"
branch_labels = None
depends_on = None

_VERSION_SEGMENT = re.compile(r"^v\d+$")


def _guess_public_id(url: str) -> str:
    # Best-effort reconstruction of the Cloudinary public_id from a stored secure_url, for
    # existing rows that predate this migration. New rows always get their public_id straight
    # from the Cloudinary upload response instead of relying on this.
    marker = "/upload/"
    if marker not in url:
        return ""
    after_upload = url.split(marker, 1)[1]
    segments = after_upload.split("/")
    if segments and _VERSION_SEGMENT.match(segments[0]):
        segments = segments[1:]
    public_id_with_ext = "/".join(segments)
    return public_id_with_ext.rsplit(".", 1)[0] if "." in public_id_with_ext else public_id_with_ext


def upgrade() -> None:
    op.create_table(
        "product_images",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("product_id", sa.Integer(), sa.ForeignKey("products.id", ondelete="CASCADE"), nullable=False),
        sa.Column("url", sa.String(length=500), nullable=False),
        sa.Column("public_id", sa.String(length=300), nullable=False),
        sa.Column("position", sa.Integer(), server_default="0", nullable=False),
        sa.Column("is_primary", sa.Boolean(), server_default=sa.false(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_product_images_product_id", "product_images", ["product_id"])

    bind = op.get_bind()
    products = sa.table(
        "products",
        sa.column("id", sa.Integer()),
        sa.column("images", sa.JSON()),
    )
    product_images = sa.table(
        "product_images",
        sa.column("product_id", sa.Integer()),
        sa.column("url", sa.String()),
        sa.column("public_id", sa.String()),
        sa.column("position", sa.Integer()),
        sa.column("is_primary", sa.Boolean()),
    )

    rows = bind.execute(sa.select(products.c.id, products.c.images)).fetchall()
    for product_id, images in rows:
        for position, url in enumerate(images or []):
            bind.execute(
                product_images.insert().values(
                    product_id=product_id,
                    url=url,
                    public_id=_guess_public_id(url),
                    position=position,
                    is_primary=(position == 0),
                )
            )

    op.drop_column("products", "images")


def downgrade() -> None:
    op.add_column("products", sa.Column("images", sa.JSON(), nullable=True))

    bind = op.get_bind()
    products = sa.table("products", sa.column("id", sa.Integer()), sa.column("images", sa.JSON()))
    product_images = sa.table(
        "product_images",
        sa.column("id", sa.Integer()),
        sa.column("product_id", sa.Integer()),
        sa.column("url", sa.String()),
        sa.column("position", sa.Integer()),
        sa.column("is_primary", sa.Boolean()),
    )

    product_ids = [row[0] for row in bind.execute(sa.select(products.c.id)).fetchall()]
    for product_id in product_ids:
        urls = [
            row[0]
            for row in bind.execute(
                sa.select(product_images.c.url)
                .where(product_images.c.product_id == product_id)
                .order_by(product_images.c.is_primary.desc(), product_images.c.position)
            ).fetchall()
        ]
        bind.execute(products.update().where(products.c.id == product_id).values(images=urls))

    op.drop_index("ix_product_images_product_id", table_name="product_images")
    op.drop_table("product_images")
