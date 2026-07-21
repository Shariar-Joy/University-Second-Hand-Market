import sqlite3
from typing import Any

from app.db.database import db_session


def get_user_by_email(email: str) -> sqlite3.Row | None:
    with db_session() as conn:
        return conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()


def get_user_by_username(username: str) -> sqlite3.Row | None:
    with db_session() as conn:
        return conn.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()


def get_user_by_id(user_id: int) -> sqlite3.Row | None:
    with db_session() as conn:
        return conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()


def create_user(data: dict[str, Any]) -> sqlite3.Row:
    with db_session() as conn:
        cursor = conn.execute(
            """
            INSERT INTO users (full_name, username, email, university, department, student_id, phone, password_hash)
            VALUES (:full_name, :username, :email, :university, :department, :student_id, :phone, :password_hash)
            """,
            data,
        )
        user_id = cursor.lastrowid
        return conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
