import sqlite3
from contextlib import contextmanager
from pathlib import Path

from app.core.config import settings

DB_PATH = Path(settings.DATABASE_PATH)


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


@contextmanager
def db_session():
    conn = get_connection()
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db() -> None:
    with db_session() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                full_name TEXT NOT NULL,
                username TEXT NOT NULL UNIQUE,
                email TEXT NOT NULL UNIQUE,
                university TEXT NOT NULL,
                department TEXT NOT NULL,
                student_id TEXT NOT NULL,
                phone TEXT,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT (datetime('now'))
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                slug TEXT NOT NULL UNIQUE,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                condition TEXT NOT NULL,
                price INTEGER NOT NULL,
                seller TEXT NOT NULL,
                university TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT (datetime('now'))
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS tutors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                slug TEXT NOT NULL UNIQUE,
                name TEXT NOT NULL,
                university TEXT NOT NULL,
                subjects TEXT NOT NULL,
                price_per_class INTEGER NOT NULL,
                rating REAL NOT NULL,
                review_count INTEGER NOT NULL,
                created_at TEXT NOT NULL DEFAULT (datetime('now'))
            )
            """
        )
        _seed_products(conn)
        _seed_tutors(conn)


_PRODUCT_SEED = [
    {
        "slug": "p1",
        "name": "Calculus: Early Transcendentals (10th Ed)",
        "category": "Books",
        "condition": "Good",
        "price": 650,
        "seller": "Rafiul Islam",
        "university": "North South University",
    },
    {
        "slug": "p2",
        "name": "HP Pavilion Laptop (i5, 8GB RAM)",
        "category": "Electronics",
        "condition": "Like New",
        "price": 42000,
        "seller": "Nusrat Jahan",
        "university": "BRAC University",
    },
    {
        "slug": "p3",
        "name": "Study Table with Chair",
        "category": "Furniture",
        "condition": "Good",
        "price": 3200,
        "seller": "Tanvir Ahmed",
        "university": "University of Dhaka",
    },
    {
        "slug": "p4",
        "name": "Casio fx-991EX Scientific Calculator",
        "category": "Stationery",
        "condition": "New",
        "price": 1450,
        "seller": "Farhana Akter",
        "university": "BUET",
    },
    {
        "slug": "p5",
        "name": "Duranta Frontier Bicycle",
        "category": "Bicycles",
        "condition": "Fair",
        "price": 8500,
        "seller": "Shafiul Karim",
        "university": "Ahsanullah University of Science and Technology",
    },
    {
        "slug": "p6",
        "name": "Badminton Racket Set (2 rackets + shuttles)",
        "category": "Sports",
        "condition": "Good",
        "price": 900,
        "seller": "Mahin Chowdhury",
        "university": "Independent University, Bangladesh",
    },
    {
        "slug": "p7",
        "name": "Yamaha F310 Acoustic Guitar",
        "category": "Instruments",
        "condition": "Like New",
        "price": 9500,
        "seller": "Adiba Rahman",
        "university": "Jahangirnagar University",
    },
    {
        "slug": "p8",
        "name": "Bean bag sofa",
        "category": "Furniture",
        "condition": "Fair",
        "price": 2200,
        "seller": "Imran Hossain",
        "university": "University of Chittagong",
    },
    {
        "slug": "p9",
        "name": "Winter Hoodie — Varsity Fest Edition",
        "category": "Clothing",
        "condition": "New",
        "price": 850,
        "seller": "Sadia Islam",
        "university": "North South University",
    },
    {
        "slug": "p10",
        "name": "Data Structures & Algorithms in C++ (Textbook)",
        "category": "Books",
        "condition": "Good",
        "price": 550,
        "seller": "Rakibul Hasan",
        "university": "BRAC University",
    },
]

_TUTOR_SEED = [
    {
        "slug": "t1",
        "name": "Ashraful Kabir",
        "university": "BUET",
        "subjects": "Calculus I & II,Linear Algebra",
        "price_per_class": 500,
        "rating": 4.8,
        "review_count": 32,
    },
    {
        "slug": "t2",
        "name": "Mehnaz Tabassum",
        "university": "North South University",
        "subjects": "Data Structures & Algorithms,Database Systems",
        "price_per_class": 700,
        "rating": 4.9,
        "review_count": 47,
    },
    {
        "slug": "t3",
        "name": "Fahim Rahman",
        "university": "University of Dhaka",
        "subjects": "Physics I (Mechanics),Physics II (Electromagnetism)",
        "price_per_class": 450,
        "rating": 4.6,
        "review_count": 21,
    },
    {
        "slug": "t4",
        "name": "Sabrina Yasmin",
        "university": "BRAC University",
        "subjects": "Microeconomics,Macroeconomics",
        "price_per_class": 550,
        "rating": 4.7,
        "review_count": 18,
    },
    {
        "slug": "t5",
        "name": "Tousif Anam",
        "university": "Ahsanullah University of Science and Technology",
        "subjects": "Digital Logic Design,Electrical Circuits",
        "price_per_class": 600,
        "rating": 4.5,
        "review_count": 14,
    },
    {
        "slug": "t6",
        "name": "Nabila Ferdous",
        "university": "Independent University, Bangladesh",
        "subjects": "English Composition,Bangla Literature",
        "price_per_class": 400,
        "rating": 4.9,
        "review_count": 39,
    },
    {
        "slug": "t7",
        "name": "Ovi Talukder",
        "university": "Jahangirnagar University",
        "subjects": "Organic Chemistry,Inorganic Chemistry",
        "price_per_class": 500,
        "rating": 4.4,
        "review_count": 12,
    },
    {
        "slug": "t8",
        "name": "Rezwana Haque",
        "university": "University of Chittagong",
        "subjects": "Object-Oriented Programming,Software Engineering",
        "price_per_class": 650,
        "rating": 4.8,
        "review_count": 26,
    },
]


def _seed_products(conn: sqlite3.Connection) -> None:
    count = conn.execute("SELECT COUNT(*) FROM products").fetchone()[0]
    if count > 0:
        return
    conn.executemany(
        """
        INSERT INTO products (slug, name, category, condition, price, seller, university)
        VALUES (:slug, :name, :category, :condition, :price, :seller, :university)
        """,
        _PRODUCT_SEED,
    )


def _seed_tutors(conn: sqlite3.Connection) -> None:
    count = conn.execute("SELECT COUNT(*) FROM tutors").fetchone()[0]
    if count > 0:
        return
    conn.executemany(
        """
        INSERT INTO tutors (slug, name, university, subjects, price_per_class, rating, review_count)
        VALUES (:slug, :name, :university, :subjects, :price_per_class, :rating, :review_count)
        """,
        _TUTOR_SEED,
    )
