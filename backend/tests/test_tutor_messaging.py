from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.tutor import Tutor
from tests.conftest import register_user

_TUTOR_PAYLOAD = {
    "subjects": ["Data Structures & Algorithms"],
    "price_per_class": 700,
    "availability": "Weekday evenings",
}


def become_tutor(client: TestClient, payload: dict | None = None):
    return client.post("/api/v1/tutors", json=payload or _TUTOR_PAYLOAD)


def contact_tutor(client: TestClient, tutor_id: int):
    return client.post("/api/v1/conversations", json={"tutor_id": tutor_id})


def test_student_can_contact_tutor(client: TestClient):
    tutor_user = register_user(client, username="alice", email="alice@example.edu")
    tutor = become_tutor(client).json()
    client.post("/api/v1/auth/logout")
    student = register_user(client, username="bob", email="bob@example.edu")

    response = contact_tutor(client, tutor["id"])
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["buyer"]["id"] == student["id"]
    assert body["seller"]["id"] == tutor_user["id"]
    assert body["tutor"]["id"] == tutor["id"]
    assert body["product"] is None


def test_tutor_conversation_reuses_existing_conversation(client: TestClient):
    register_user(client, username="alice", email="alice@example.edu")
    tutor = become_tutor(client).json()
    client.post("/api/v1/auth/logout")
    register_user(client, username="bob", email="bob@example.edu")

    first = contact_tutor(client, tutor["id"]).json()
    second = contact_tutor(client, tutor["id"]).json()
    assert first["id"] == second["id"]

    conversations = client.get("/api/v1/conversations").json()
    assert len(conversations) == 1


def test_tutor_contact_uses_existing_messaging_system(client: TestClient):
    register_user(client, username="alice", email="alice@example.edu")
    tutor = become_tutor(client).json()
    client.post("/api/v1/auth/logout")
    register_user(client, username="bob", email="bob@example.edu")
    conversation = contact_tutor(client, tutor["id"]).json()

    send_response = client.post(
        f"/api/v1/conversations/{conversation['id']}/messages",
        json={"content": "Hi! Are you free to tutor DSA this week?"},
    )
    assert send_response.status_code == 201, send_response.text

    thread = client.get(f"/api/v1/conversations/{conversation['id']}/messages")
    assert thread.status_code == 200
    body = thread.json()
    assert body["conversation"]["tutor"]["id"] == tutor["id"]
    assert len(body["messages"]) == 1
    assert body["messages"][0]["content"] == "Hi! Are you free to tutor DSA this week?"


def test_tutor_cannot_contact_themselves(client: TestClient):
    register_user(client)
    tutor = become_tutor(client).json()

    response = contact_tutor(client, tutor["id"])
    assert response.status_code == 400


def test_contacting_missing_tutor_returns_404(client: TestClient):
    register_user(client)
    response = contact_tutor(client, 999999)
    assert response.status_code == 404


def test_contacting_tutor_without_active_account_returns_404(client: TestClient, db_session: Session):
    register_user(client)
    orphan_tutor = Tutor(
        slug="orphan-tutor",
        name="No Account Tutor",
        university="Test University",
        subjects=["Physics"],
        price_per_class=400,
        rating=0.0,
        review_count=0,
        user_id=None,
    )
    db_session.add(orphan_tutor)
    db_session.commit()

    response = contact_tutor(client, orphan_tutor.id)
    assert response.status_code == 404


def test_tutor_conversation_access_control_blocks_third_party(client: TestClient):
    register_user(client, username="alice", email="alice@example.edu")
    tutor = become_tutor(client).json()
    client.post("/api/v1/auth/logout")
    register_user(client, username="bob", email="bob@example.edu")
    conversation = contact_tutor(client, tutor["id"]).json()

    client.post("/api/v1/auth/logout")
    register_user(client, username="carol", email="carol@example.edu")

    response = client.get(f"/api/v1/conversations/{conversation['id']}/messages")
    assert response.status_code == 403


def test_tutor_can_view_and_reply_to_student(client: TestClient):
    register_user(client, username="alice", email="alice@example.edu")
    tutor = become_tutor(client).json()
    client.post("/api/v1/auth/logout")
    register_user(client, username="bob", email="bob@example.edu")
    conversation = contact_tutor(client, tutor["id"]).json()
    client.post(
        f"/api/v1/conversations/{conversation['id']}/messages", json={"content": "Can you help with DSA?"}
    )

    client.post("/api/v1/auth/logout")
    client.post(
        "/api/v1/auth/login", json={"email": "alice@example.edu", "password": "StrongPass1!", "remember_me": False}
    )

    tutor_conversations = client.get("/api/v1/conversations").json()
    assert len(tutor_conversations) == 1
    assert tutor_conversations[0]["id"] == conversation["id"]

    reply = client.post(
        f"/api/v1/conversations/{conversation['id']}/messages", json={"content": "Sure, when works for you?"}
    )
    assert reply.status_code == 201


def test_conversation_requires_exactly_one_subject(client: TestClient):
    register_user(client)
    both = client.post("/api/v1/conversations", json={"product_id": 1, "tutor_id": 1})
    assert both.status_code == 422

    neither = client.post("/api/v1/conversations", json={})
    assert neither.status_code == 422
