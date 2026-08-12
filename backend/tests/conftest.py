import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.main import app


@pytest.fixture()
def db_session():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(engine)


@pytest.fixture()
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    # raise_server_exceptions=False so an unhandled exception (e.g. a Cloudinary outage) goes
    # through app.main's real exception handlers and returns its actual JSON 500 response,
    # matching what a deployed server would send instead of surfacing a raw traceback in tests.
    with TestClient(app, raise_server_exceptions=False) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture(autouse=True)
def fake_cloudinary(monkeypatch):
    """Every test runs against a fake Cloudinary so no real network calls are made."""
    counter = {"n": 0}

    def fake_upload(file_bytes, product_id):
        counter["n"] += 1
        return {
            "url": f"https://res.cloudinary.com/demo/image/upload/v1/campus-exchange/products/{product_id}/img{counter['n']}.jpg",
            "public_id": f"campus-exchange/products/{product_id}/img{counter['n']}",
        }

    def fake_destroy(public_id):
        return None

    monkeypatch.setattr("app.services.image_service.upload_product_image", fake_upload)
    monkeypatch.setattr("app.services.image_service.delete_product_image", fake_destroy)


def register_user(client: TestClient, username: str = "alice", email: str | None = None) -> dict:
    response = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Alice Example",
            "username": username,
            "email": email or f"{username}@example.edu",
            "password": "StrongPass1!",
            "confirm_password": "StrongPass1!",
            "department": "CSE",
            "university": "Test University",
            "student_id": "12345",
        },
    )
    assert response.status_code == 201, response.text
    return response.json()["user"]


def create_product(client: TestClient) -> dict:
    response = client.post(
        "/api/v1/products",
        json={
            "name": "Calculus Textbook",
            "description": "Barely used",
            "price": 500,
            "category": "Books",
            "condition": "Good",
        },
    )
    assert response.status_code == 201, response.text
    return response.json()


def tiny_png_bytes() -> bytes:
    # Smallest possible valid PNG (1x1 transparent pixel).
    return bytes.fromhex(
        "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c489"
        "0000000d4944415478da6360000002000155bffb6c0000000049454e44ae426082"
    )
