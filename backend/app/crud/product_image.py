from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.product_image import ProductImage


def list_by_product(db: Session, product_id: int) -> list[ProductImage]:
    return list(
        db.execute(
            select(ProductImage)
            .where(ProductImage.product_id == product_id)
            .order_by(ProductImage.is_primary.desc(), ProductImage.position)
        ).scalars()
    )


def get_by_id(db: Session, image_id: int) -> ProductImage | None:
    return db.get(ProductImage, image_id)


def create(db: Session, product_id: int, url: str, public_id: str, position: int, is_primary: bool) -> ProductImage:
    image = ProductImage(
        product_id=product_id,
        url=url,
        public_id=public_id,
        position=position,
        is_primary=is_primary,
    )
    db.add(image)
    return image


def delete(db: Session, image: ProductImage) -> None:
    db.delete(image)
