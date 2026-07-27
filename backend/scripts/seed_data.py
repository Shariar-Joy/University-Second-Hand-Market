"""Idempotent demo data seed for local/dev use.

Run explicitly with `python -m scripts.seed_data` after `alembic upgrade head`.
Not run automatically on app startup -- unlike the old DynamoDB-era init_db(), writing to the
database as a side effect of every cold start is not a pattern this project carries forward.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy.orm import Session  # noqa: E402

from app.core.database import SessionLocal  # noqa: E402
from app.core.security import hash_password  # noqa: E402
from app.models.product import Product  # noqa: E402
from app.models.tutor import Tutor  # noqa: E402
from app.models.user import User  # noqa: E402

# Demo-only credential. Never used for a real account -- clearly not a secret worth protecting.
_DEMO_PASSWORD_HASH = hash_password("Demo@12345")

_DEMO_SELLERS = [
    {"full_name": "Rafiul Islam", "username": "rafiul.islam", "email": "rafiul.islam@nsu.edu.bd", "university": "North South University", "department": "CSE", "student_id": "NSU-001"},
    {"full_name": "Nusrat Jahan", "username": "nusrat.jahan", "email": "nusrat.jahan@bracu.ac.bd", "university": "BRAC University", "department": "EEE", "student_id": "BRACU-002"},
    {"full_name": "Tanvir Ahmed", "username": "tanvir.ahmed", "email": "tanvir.ahmed@du.ac.bd", "university": "University of Dhaka", "department": "Business", "student_id": "DU-003"},
    {"full_name": "Farhana Akter", "username": "farhana.akter", "email": "farhana.akter@buet.ac.bd", "university": "BUET", "department": "ME", "student_id": "BUET-004"},
    {"full_name": "Shafiul Karim", "username": "shafiul.karim", "email": "shafiul.karim@aust.edu", "university": "Ahsanullah University of Science and Technology", "department": "CE", "student_id": "AUST-005"},
    {"full_name": "Mahin Chowdhury", "username": "mahin.chowdhury", "email": "mahin.chowdhury@iub.edu.bd", "university": "Independent University, Bangladesh", "department": "BBA", "student_id": "IUB-006"},
    {"full_name": "Adiba Rahman", "username": "adiba.rahman", "email": "adiba.rahman@juniv.edu", "university": "Jahangirnagar University", "department": "English", "student_id": "JU-007"},
    {"full_name": "Imran Hossain", "username": "imran.hossain", "email": "imran.hossain@cu.ac.bd", "university": "University of Chittagong", "department": "Law", "student_id": "CU-008"},
    {"full_name": "Sadia Islam", "username": "sadia.islam", "email": "sadia.islam@nsu.edu.bd", "university": "North South University", "department": "Pharmacy", "student_id": "NSU-009"},
    {"full_name": "Rakibul Hasan", "username": "rakibul.hasan", "email": "rakibul.hasan@bracu.ac.bd", "university": "BRAC University", "department": "CSE", "student_id": "BRACU-010"},
]

_TUTOR_ACCOUNTS = [
    {"full_name": "Ashraful Kabir", "username": "ashraful.kabir", "email": "ashraful.kabir@buet.ac.bd", "university": "BUET", "department": "Mathematics", "student_id": "BUET-T01"},
    {"full_name": "Mehnaz Tabassum", "username": "mehnaz.tabassum", "email": "mehnaz.tabassum@nsu.edu.bd", "university": "North South University", "department": "CSE", "student_id": "NSU-T02"},
    {"full_name": "Fahim Rahman", "username": "fahim.rahman", "email": "fahim.rahman@du.ac.bd", "university": "University of Dhaka", "department": "Physics", "student_id": "DU-T03"},
    {"full_name": "Sabrina Yasmin", "username": "sabrina.yasmin", "email": "sabrina.yasmin@bracu.ac.bd", "university": "BRAC University", "department": "Economics", "student_id": "BRACU-T04"},
    {"full_name": "Tousif Anam", "username": "tousif.anam", "email": "tousif.anam@aust.edu", "university": "Ahsanullah University of Science and Technology", "department": "EEE", "student_id": "AUST-T05"},
    {"full_name": "Nabila Ferdous", "username": "nabila.ferdous", "email": "nabila.ferdous@iub.edu.bd", "university": "Independent University, Bangladesh", "department": "English", "student_id": "IUB-T06"},
    {"full_name": "Ovi Talukder", "username": "ovi.talukder", "email": "ovi.talukder@juniv.edu", "university": "Jahangirnagar University", "department": "Chemistry", "student_id": "JU-T07"},
    {"full_name": "Rezwana Haque", "username": "rezwana.haque", "email": "rezwana.haque@cu.ac.bd", "university": "University of Chittagong", "department": "CSE", "student_id": "CU-T08"},
]

_PRODUCT_SEED = [
    {"slug": "p1", "name": "Calculus: Early Transcendentals (10th Ed)", "category": "Books", "condition": "Good", "price": 650, "seller": "Rafiul Islam", "university": "North South University"},
    {"slug": "p2", "name": "HP Pavilion Laptop (i5, 8GB RAM)", "category": "Electronics", "condition": "Like New", "price": 42000, "seller": "Nusrat Jahan", "university": "BRAC University"},
    {"slug": "p3", "name": "Study Table with Chair", "category": "Furniture", "condition": "Good", "price": 3200, "seller": "Tanvir Ahmed", "university": "University of Dhaka"},
    {"slug": "p4", "name": "Casio fx-991EX Scientific Calculator", "category": "Stationery", "condition": "New", "price": 1450, "seller": "Farhana Akter", "university": "BUET"},
    {"slug": "p5", "name": "Duranta Frontier Bicycle", "category": "Bicycles", "condition": "Fair", "price": 8500, "seller": "Shafiul Karim", "university": "Ahsanullah University of Science and Technology"},
    {"slug": "p6", "name": "Badminton Racket Set (2 rackets + shuttles)", "category": "Sports", "condition": "Good", "price": 900, "seller": "Mahin Chowdhury", "university": "Independent University, Bangladesh"},
    {"slug": "p7", "name": "Yamaha F310 Acoustic Guitar", "category": "Instruments", "condition": "Like New", "price": 9500, "seller": "Adiba Rahman", "university": "Jahangirnagar University"},
    {"slug": "p8", "name": "Bean bag sofa", "category": "Furniture", "condition": "Fair", "price": 2200, "seller": "Imran Hossain", "university": "University of Chittagong"},
    {"slug": "p9", "name": "Winter Hoodie — Varsity Fest Edition", "category": "Clothing", "condition": "New", "price": 850, "seller": "Sadia Islam", "university": "North South University"},
    {"slug": "p10", "name": "Data Structures & Algorithms in C++ (Textbook)", "category": "Books", "condition": "Good", "price": 550, "seller": "Rakibul Hasan", "university": "BRAC University"},
]

_TUTOR_SEED = [
    {"slug": "t1", "name": "Ashraful Kabir", "university": "BUET", "subjects": ["Calculus I & II", "Linear Algebra"], "price_per_class": 500, "rating": 4.8, "review_count": 32},
    {"slug": "t2", "name": "Mehnaz Tabassum", "university": "North South University", "subjects": ["Data Structures & Algorithms", "Database Systems"], "price_per_class": 700, "rating": 4.9, "review_count": 47},
    {"slug": "t3", "name": "Fahim Rahman", "university": "University of Dhaka", "subjects": ["Physics I (Mechanics)", "Physics II (Electromagnetism)"], "price_per_class": 450, "rating": 4.6, "review_count": 21},
    {"slug": "t4", "name": "Sabrina Yasmin", "university": "BRAC University", "subjects": ["Microeconomics", "Macroeconomics"], "price_per_class": 550, "rating": 4.7, "review_count": 18},
    {"slug": "t5", "name": "Tousif Anam", "university": "Ahsanullah University of Science and Technology", "subjects": ["Digital Logic Design", "Electrical Circuits"], "price_per_class": 600, "rating": 4.5, "review_count": 14},
    {"slug": "t6", "name": "Nabila Ferdous", "university": "Independent University, Bangladesh", "subjects": ["English Composition", "Bangla Literature"], "price_per_class": 400, "rating": 4.9, "review_count": 39},
    {"slug": "t7", "name": "Ovi Talukder", "university": "Jahangirnagar University", "subjects": ["Organic Chemistry", "Inorganic Chemistry"], "price_per_class": 500, "rating": 4.4, "review_count": 12},
    {"slug": "t8", "name": "Rezwana Haque", "university": "University of Chittagong", "subjects": ["Object-Oriented Programming", "Software Engineering"], "price_per_class": 650, "rating": 4.8, "review_count": 26},
]


def _seed_users(db: Session, accounts: list[dict]) -> dict[str, User]:
    by_name: dict[str, User] = {}
    for account in accounts:
        user = db.query(User).filter(User.email == account["email"]).one_or_none()
        if user is None:
            user = User(**account, hashed_password=_DEMO_PASSWORD_HASH)
            db.add(user)
            db.flush()
        by_name[account["full_name"]] = user
    return by_name


def seed() -> None:
    db = SessionLocal()
    try:
        sellers_by_name = _seed_users(db, _DEMO_SELLERS)
        tutors_by_name = _seed_users(db, _TUTOR_ACCOUNTS)

        if db.query(Product).count() == 0:
            for item in _PRODUCT_SEED:
                seller = sellers_by_name.get(item["seller"])
                db.add(Product(**item, seller_id=seller.id if seller else None))
            print(f"Seeded {len(_PRODUCT_SEED)} products.")
        else:
            print("Products already seeded, skipping.")

        if db.query(Tutor).count() == 0:
            for item in _TUTOR_SEED:
                account = tutors_by_name.get(item["name"])
                db.add(Tutor(**item, user_id=account.id if account else None))
            print(f"Seeded {len(_TUTOR_SEED)} tutors.")
        else:
            print("Tutors already seeded, skipping.")

        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    seed()
