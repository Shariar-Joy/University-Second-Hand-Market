from fastapi.testclient import TestClient

from tests.conftest import register_user

_VALID_PAYLOAD = {
    "subjects": ["Calculus I", "Linear Algebra"],
    "price_per_class": 500,
    "availability": "Weekday evenings, Saturday mornings",
    "department": "Mathematics",
    "experience": 3,
    "bio": "I help first-years get comfortable with proofs and problem sets.",
}


def become_tutor(client: TestClient, payload: dict | None = None):
    return client.post("/api/v1/tutors", json=payload or _VALID_PAYLOAD)


def test_user_can_become_a_tutor(client: TestClient):
    user = register_user(client)
    response = become_tutor(client)
    assert response.status_code == 201, response.text
    body = response.json()
    assert body["name"] == user["full_name"]
    assert body["university"] == user["university"]
    assert body["user_id"] == user["id"]
    assert body["subjects"] == _VALID_PAYLOAD["subjects"]
    assert body["price_per_class"] == 500
    assert body["rating"] == 0
    assert body["review_count"] == 0
    assert body["slug"]


def test_tutor_profile_appears_in_marketplace_listing(client: TestClient):
    become_tutor_response = None
    register_user(client)
    become_tutor_response = become_tutor(client)
    tutor = become_tutor_response.json()

    listing = client.get("/api/v1/tutors")
    assert listing.status_code == 200
    slugs = [item["slug"] for item in listing.json()]
    assert tutor["slug"] in slugs


def test_existing_tutor_can_be_viewed_by_slug(client: TestClient):
    register_user(client)
    tutor = become_tutor(client).json()

    response = client.get(f"/api/v1/tutors/{tutor['slug']}")
    assert response.status_code == 200
    assert response.json()["id"] == tutor["id"]


def test_viewing_missing_tutor_returns_404(client: TestClient):
    response = client.get("/api/v1/tutors/no-such-tutor")
    assert response.status_code == 404


def test_becoming_tutor_twice_returns_409(client: TestClient):
    register_user(client)
    first = become_tutor(client)
    assert first.status_code == 201

    second = become_tutor(client)
    assert second.status_code == 409


def test_tutor_can_edit_their_own_profile(client: TestClient):
    register_user(client)
    become_tutor(client)

    response = client.patch(
        "/api/v1/tutors/me",
        json={"price_per_class": 750, "availability": "Weekend afternoons only"},
    )
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["price_per_class"] == 750
    assert body["availability"] == "Weekend afternoons only"
    assert body["subjects"] == _VALID_PAYLOAD["subjects"]  # untouched field is preserved


def test_get_my_tutor_profile(client: TestClient):
    register_user(client)
    created = become_tutor(client).json()

    response = client.get("/api/v1/tutors/me")
    assert response.status_code == 200
    assert response.json()["id"] == created["id"]


def test_get_my_tutor_profile_returns_404_when_not_a_tutor(client: TestClient):
    register_user(client)
    response = client.get("/api/v1/tutors/me")
    assert response.status_code == 404


def test_updating_profile_without_one_returns_404(client: TestClient):
    register_user(client)
    response = client.patch("/api/v1/tutors/me", json={"price_per_class": 600})
    assert response.status_code == 404


def test_tutor_endpoints_require_authentication(client: TestClient):
    register_user(client)
    become_tutor(client)
    client.post("/api/v1/auth/logout")

    assert client.get("/api/v1/tutors/me").status_code == 401
    assert become_tutor(client).status_code == 401
    assert client.patch("/api/v1/tutors/me", json={"price_per_class": 600}).status_code == 401


def test_rejects_empty_subjects(client: TestClient):
    register_user(client)
    response = become_tutor(client, {**_VALID_PAYLOAD, "subjects": []})
    assert response.status_code == 422


def test_rejects_too_many_subjects(client: TestClient):
    register_user(client)
    response = become_tutor(client, {**_VALID_PAYLOAD, "subjects": [f"Subject {i}" for i in range(9)]})
    assert response.status_code == 422


def test_rejects_non_positive_price(client: TestClient):
    register_user(client)
    response = become_tutor(client, {**_VALID_PAYLOAD, "price_per_class": 0})
    assert response.status_code == 422


def test_rejects_unreasonably_high_price(client: TestClient):
    register_user(client)
    response = become_tutor(client, {**_VALID_PAYLOAD, "price_per_class": 1_000_000})
    assert response.status_code == 422


def test_rejects_blank_availability(client: TestClient):
    register_user(client)
    response = become_tutor(client, {**_VALID_PAYLOAD, "availability": "  "})
    assert response.status_code == 422


def test_rejects_out_of_range_experience(client: TestClient):
    register_user(client)
    response = become_tutor(client, {**_VALID_PAYLOAD, "experience": 999})
    assert response.status_code == 422


def test_rejects_missing_required_fields(client: TestClient):
    register_user(client)
    response = client.post("/api/v1/tutors", json={"price_per_class": 500})
    assert response.status_code == 422
