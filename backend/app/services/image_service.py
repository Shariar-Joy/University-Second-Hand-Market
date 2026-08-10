import cloudinary
import cloudinary.uploader

from app.core.config import settings

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True,
)


def upload_avatar(file_bytes: bytes, user_id: int) -> str:
    result = cloudinary.uploader.upload(
        file_bytes,
        folder="campus-exchange/avatars",
        public_id=f"user-{user_id}",
        overwrite=True,
        transformation=[{"width": 512, "height": 512, "crop": "fill", "gravity": "face"}],
    )
    return result["secure_url"]


def upload_product_image(file_bytes: bytes, product_id: int) -> str:
    result = cloudinary.uploader.upload(
        file_bytes,
        folder=f"campus-exchange/products/{product_id}",
        transformation=[{"width": 1200, "height": 1200, "crop": "limit"}],
    )
    return result["secure_url"]
