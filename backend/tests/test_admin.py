from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.crud import user as user_crud
from tests.conftest import create_product, register_user


def make_admin(db_session: Session, username: str = "alice") -> None:
    user = user_crud.get_by_username(db_session, username)
    assert user is not None
    user.is_admin = True
    db_session.commit()


def login(client: TestClient, email: str, password: str = "StrongPass1!"):
    return client.post("/api/v1/auth/login", json={"email": email, "password": password})


# --- authorization ---------------------------------------------------------


def test_unauthenticated_user_cannot_access_admin_stats(client: TestClient):
    response = client.get("/api/v1/admin/stats")
    assert response.status_code == 401


def test_normal_user_cannot_access_admin_stats(client: TestClient):
    register_user(client)
    response = client.get("/api/v1/admin/stats")
    assert response.status_code == 403


def test_unauthenticated_user_cannot_list_admin_users(client: TestClient):
    response = client.get("/api/v1/admin/users")
    assert response.status_code == 401


def test_normal_user_cannot_list_admin_users(client: TestClient):
    register_user(client)
    response = client.get("/api/v1/admin/users")
    assert response.status_code == 403


def test_unauthenticated_user_cannot_list_admin_products(client: TestClient):
    response = client.get("/api/v1/admin/products")
    assert response.status_code == 401


def test_normal_user_cannot_list_admin_products(client: TestClient):
    register_user(client)
    response = client.get("/api/v1/admin/products")
    assert response.status_code == 403


def test_unauthenticated_user_cannot_delete_product_via_admin_endpoint(client: TestClient):
    response = client.delete("/api/v1/admin/products/1")
    assert response.status_code == 401


def test_normal_user_cannot_delete_product_via_admin_endpoint(client: TestClient):
    register_user(client)
    product = create_product(client)
    response = client.delete(f"/api/v1/admin/products/{product['id']}")
    assert response.status_code == 403


def test_admin_can_access_admin_endpoints(client: TestClient, db_session: Session):
    register_user(client)
    make_admin(db_session)

    assert client.get("/api/v1/admin/stats").status_code == 200
    assert client.get("/api/v1/admin/users").status_code == 200
    assert client.get("/api/v1/admin/products").status_code == 200


# --- dashboard statistics ---------------------------------------------------


def test_dashboard_statistics(client: TestClient, db_session: Session):
    register_user(client)
    make_admin(db_session)

    available = create_product(client)
    sold = create_product(client)
    client.post(f"/api/v1/products/{sold['id']}/sold", json={})

    response = client.get("/api/v1/admin/stats")
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["total_users"] == 1
    assert body["total_products"] == 2
    assert body["active_listings"] == 1
    assert body["sold_listings"] == 1
    assert body["total_tutors"] == 0
    assert available["status"] == "available"


# --- user listing ------------------------------------------------------------


def test_admin_can_list_users_with_basic_info(client: TestClient, db_session: Session):
    register_user(client, username="alice", email="alice@example.edu")
    make_admin(db_session, "alice")
    client.post("/api/v1/auth/logout")
    register_user(client, username="bob", email="bob@example.edu")
    login(client, "alice@example.edu")

    response = client.get("/api/v1/admin/users")
    assert response.status_code == 200, response.text
    by_username = {item["username"]: item for item in response.json()}
    assert set(by_username) == {"alice", "bob"}
    assert by_username["alice"]["is_admin"] is True
    assert by_username["bob"]["is_admin"] is False
    assert "hashed_password" not in by_username["bob"]


# --- product listing + deletion ---------------------------------------------


def test_admin_can_list_all_products_regardless_of_status(client: TestClient, db_session: Session):
    register_user(client)
    make_admin(db_session)
    product = create_product(client)
    client.patch(f"/api/v1/products/{product['id']}/status", json={"status": "archived"})

    response = client.get("/api/v1/admin/products")
    assert response.status_code == 200, response.text
    statuses = {item["id"]: item["status"] for item in response.json()}
    assert statuses[product["id"]] == "archived"


def test_admin_can_delete_another_users_product(client: TestClient, db_session: Session):
    register_user(client, username="alice", email="alice@example.edu")
    product = create_product(client)
    client.post("/api/v1/auth/logout")
    register_user(client, username="bob", email="bob@example.edu")
    make_admin(db_session, "bob")

    response = client.delete(f"/api/v1/admin/products/{product['id']}")
    assert response.status_code == 204

    listing_response = client.get(f"/api/v1/products/{product['slug']}")
    assert listing_response.status_code == 404


def test_admin_can_delete_a_sold_product(client: TestClient, db_session: Session):
    register_user(client)
    make_admin(db_session)
    product = create_product(client)
    client.post(f"/api/v1/products/{product['id']}/sold", json={})

    response = client.delete(f"/api/v1/admin/products/{product['id']}")
    assert response.status_code == 204


def test_admin_deleting_missing_product_returns_404(client: TestClient, db_session: Session):
    register_user(client)
    make_admin(db_session)

    response = client.delete("/api/v1/admin/products/999999")
    assert response.status_code == 404
