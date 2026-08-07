from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.security import verify_password
from app.crud import user as user_crud
from app.models.user import User
from app.schemas.auth import DeleteAccountRequest, UpdateProfileRequest
from app.services import image_service

_ALLOWED_AVATAR_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
_MAX_AVATAR_BYTES = 5 * 1024 * 1024


def update_profile(db: Session, user: User, payload: UpdateProfileRequest) -> User:
    data = payload.model_dump(exclude_unset=True, exclude_none=True)
    if not data:
        return user
    return user_crud.update(db, user, data)


def set_avatar(db: Session, user: User, file: UploadFile, file_bytes: bytes) -> User:
    if file.content_type not in _ALLOWED_AVATAR_TYPES:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Please upload a JPEG, PNG, WEBP, or GIF image.")
    if len(file_bytes) > _MAX_AVATAR_BYTES:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Image must be 5MB or smaller.")

    secure_url = image_service.upload_avatar(file_bytes, user.id)
    return user_crud.update(db, user, {"profile_image": secure_url})


def delete_account(db: Session, user: User, payload: DeleteAccountRequest) -> None:
    if not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect password.")
    user_crud.delete(db, user)
