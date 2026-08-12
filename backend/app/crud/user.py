from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User


def get_by_email(db: Session, email: str) -> User | None:
    return db.execute(select(User).where(User.email == email)).scalar_one_or_none()


def get_by_username(db: Session, username: str) -> User | None:
    return db.execute(select(User).where(User.username == username)).scalar_one_or_none()


def get_by_id(db: Session, user_id: int) -> User | None:
    return db.get(User, user_id)


def list_all(db: Session) -> list[User]:
    return list(db.execute(select(User).order_by(User.id)).scalars())


def create(db: Session, data: dict[str, Any]) -> User:
    user = User(
        full_name=data["full_name"],
        username=data["username"],
        email=data["email"],
        university=data["university"],
        department=data["department"],
        student_id=data["student_id"],
        phone=data.get("phone"),
        hashed_password=data["hashed_password"],
        is_admin=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update(db: Session, user: User, data: dict[str, Any]) -> User:
    for key, value in data.items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user


def delete(db: Session, user: User) -> None:
    db.delete(user)
    db.commit()
