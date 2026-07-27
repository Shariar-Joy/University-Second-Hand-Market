from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.crud import user as user_crud
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest

# Computed once at import so a login attempt against a nonexistent email still pays the same
# password-hashing cost as one against a real account. Without this, `verify_password` would
# only ever run for existing emails (Python's `or` short-circuits it away otherwise), making the
# response time itself leak whether a given email is registered -- even though the error message
# is identical either way.
_DUMMY_PASSWORD_HASH = hash_password("not-a-real-password-used-only-for-timing-safety")


def register_user(db: Session, payload: RegisterRequest) -> User:
    if user_crud.get_by_email(db, payload.email):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with this email already exists.")
    if user_crud.get_by_username(db, payload.username):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This username is already taken.")

    return user_crud.create(
        db,
        {
            "full_name": payload.full_name,
            "username": payload.username,
            "email": payload.email,
            "university": payload.university,
            "department": payload.department,
            "student_id": payload.student_id,
            "phone": payload.phone,
            "hashed_password": hash_password(payload.password),
        },
    )


def authenticate_user(db: Session, payload: LoginRequest) -> User:
    user = user_crud.get_by_email(db, payload.email)
    password_hash = user.hashed_password if user is not None else _DUMMY_PASSWORD_HASH
    password_is_valid = verify_password(payload.password, password_hash)
    if user is None or not password_is_valid:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")
    return user
