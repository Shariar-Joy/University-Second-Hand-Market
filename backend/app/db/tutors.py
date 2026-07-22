import sqlite3

from app.db.database import db_session


def list_tutors() -> list[sqlite3.Row]:
    with db_session() as conn:
        return conn.execute("SELECT * FROM tutors ORDER BY id").fetchall()
