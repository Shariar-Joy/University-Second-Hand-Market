from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.api.dependencies import get_current_user
from app.core.config import settings
from app.core.security import create_access_token, hash_password, validate_password_strength, verify_password
from app.db.users import create_user, get_user_by_email, get_user_by_username
from app.schemas.auth import AuthResponse, LoginRequest, RegisterRequest, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])

# Computed once at import so a login attempt against a nonexistent email still pays the same
# password-hashing cost as one against a real account. Without this, `verify_password` would
# only ever run for existing emails (Python's `or` short-circuits it away otherwise), making the
# response time itself leak whether a given email is registered -- even though the error message
# is identical either way.
_DUMMY_PASSWORD_HASH = hash_password("not-a-real-password-used-only-for-timing-safety")


def _row_to_user_out(row: dict[str, Any]) -> UserOut:
    return UserOut(
        id=int(row["id"]),
        full_name=row["full_name"],
        username=row["username"],
        email=row["email"],
        university=row["university"],
        department=row["department"],
        student_id=row["student_id"],
        phone=row["phone"],
        created_at=row["created_at"],
    )


def _set_auth_cookie(response: Response, user_id: int, remember_me: bool) -> None:
    expires_minutes = settings.REMEMBER_ME_EXPIRE_MINUTES if remember_me else settings.ACCESS_TOKEN_EXPIRE_MINUTES
    token = create_access_token(user_id, expires_minutes)
    response.set_cookie(
        key=settings.COOKIE_NAME,
        value=token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite="lax",
        max_age=expires_minutes * 60,
        path="/",
    )


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, response: Response):
    password_error = validate_password_strength(payload.password)
    if password_error:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=password_error)

    if get_user_by_email(payload.email):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with this email already exists.")
    if get_user_by_username(payload.username):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This username is already taken.")

    user_row = create_user(
        {
            "full_name": payload.full_name,
            "username": payload.username,
            "email": payload.email,
            "university": payload.university,
            "department": payload.department,
            "student_id": payload.student_id,
            "phone": payload.phone,
            "password_hash": hash_password(payload.password),
        }
    )

    _set_auth_cookie(response, int(user_row["id"]), remember_me=False)
    return AuthResponse(user=_row_to_user_out(user_row))


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, response: Response):
    user_row = get_user_by_email(payload.email)
    password_hash = user_row["password_hash"] if user_row is not None else _DUMMY_PASSWORD_HASH
    password_is_valid = verify_password(payload.password, password_hash)
    if user_row is None or not password_is_valid:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")

    _set_auth_cookie(response, int(user_row["id"]), remember_me=payload.remember_me)
    return AuthResponse(user=_row_to_user_out(user_row))


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(response: Response):
    response.delete_cookie(key=settings.COOKIE_NAME, path="/")


@router.get("/me", response_model=AuthResponse)
def me(current_user: dict[str, Any] = Depends(get_current_user)):
    return AuthResponse(user=_row_to_user_out(current_user))
