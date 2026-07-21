from fastapi import Cookie, HTTPException, status

from app.core.config import settings
from app.core.security import decode_access_token
from app.db.users import get_user_by_id


def get_current_user(access_token: str | None = Cookie(default=None, alias=settings.COOKIE_NAME)):
    if access_token is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    user_id = decode_access_token(access_token)
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired. Please log in again.")

    user = get_user_by_id(user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    return user
