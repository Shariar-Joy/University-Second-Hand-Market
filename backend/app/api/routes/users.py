from fastapi import APIRouter, Depends, File, Response, UploadFile, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.config import settings
from app.core.database import get_db
from app.models.user import User
from app.schemas.auth import DeleteAccountRequest, UpdateProfileRequest, UserOut
from app.services import user_service

router = APIRouter(prefix="/users", tags=["users"])


@router.patch("/me", response_model=UserOut)
def update_me(
    payload: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    updated = user_service.update_profile(db, current_user, payload)
    return UserOut.model_validate(updated)


@router.post("/me/avatar", response_model=UserOut)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    file_bytes = await file.read()
    updated = user_service.set_avatar(db, current_user, file, file_bytes)
    return UserOut.model_validate(updated)


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_me(
    payload: DeleteAccountRequest,
    response: Response,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user_service.delete_account(db, current_user, payload)
    response.delete_cookie(
        key=settings.COOKIE_NAME, path="/", secure=settings.COOKIE_SECURE, samesite=settings.COOKIE_SAMESITE
    )
