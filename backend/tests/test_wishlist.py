from fastapi.testclient import TestClient

from tests.conftest import create_product, register_user


def test_add_product_to_wishlist(client: TestClient):
    register_user(client)
    product = create_product(client)

    response = client.post("/api/v1/wishlist", json={"product_id": product["id"]})
    assert response.status_code == 201, response.text
    body = response.json()
    assert body["product"]["id"] == product["id"]
    assert "created_at" in body


def test_adding_same_product_twice_returns_409(client: TestClient):
    register_user(client)
    product = create_product(client)

    first = client.post("/api/v1/wishlist", json={"product_id": product["id"]})
    assert first.status_code == 201, first.text

    second = client.post("/api/v1/wishlist", json={"product_id": product["id"]})
    assert second.status_code == 409
    assert second.json()["detail"]


def test_remove_product_from_wishlist(client: TestClient):
    register_user(client)
    product = create_product(client)
    client.post("/api/v1/wishlist", json={"product_id": product["id"]})

    response = client.delete(f"/api/v1/wishlist/{product['id']}")
    assert response.status_code == 204

    wishlist = client.get("/api/v1/wishlist").json()
    assert wishlist == []


def test_removing_item_not_in_wishlist_returns_404(client: TestClient):
    register_user(client)
    product = create_product(client)

    response = client.delete(f"/api/v1/wishlist/{product['id']}")
    assert response.status_code == 404


def test_get_wishlist_returns_current_users_items(client: TestClient):
    register_user(client)
    product = create_product(client)
    client.post("/api/v1/wishlist", json={"product_id": product["id"]})

    response = client.get("/api/v1/wishlist")
    assert response.status_code == 200, response.text
    body = response.json()
    assert len(body) == 1
    assert body[0]["product"]["id"] == product["id"]


def test_get_wishlist_is_empty_for_new_user(client: TestClient):
    register_user(client)
    response = client.get("/api/v1/wishlist")
    assert response.status_code == 200
    assert response.json() == []


def test_wishlist_supports_multiple_products(client: TestClient):
    register_user(client)
    first = create_product(client)
    second_response = client.post(
        "/api/v1/products",
        json={"name": "Guitar", "price": 3000, "category": "Instruments", "condition": "Good"},
    )
    assert second_response.status_code == 201
    second = second_response.json()

    client.post("/api/v1/wishlist", json={"product_id": first["id"]})
    client.post("/api/v1/wishlist", json={"product_id": second["id"]})

    response = client.get("/api/v1/wishlist")
    assert response.status_code == 200
    body = response.json()
    assert len(body) == 2
    returned_ids = {item["product"]["id"] for item in body}
    assert returned_ids == {first["id"], second["id"]}


def test_check_wishlist_status(client: TestClient):
    register_user(client)
    product = create_product(client)

    not_yet = client.get(f"/api/v1/wishlist/{product['id']}/check")
    assert not_yet.status_code == 200
    assert not_yet.json() == {"wishlisted": False}

    client.post("/api/v1/wishlist", json={"product_id": product["id"]})

    now_wishlisted = client.get(f"/api/v1/wishlist/{product['id']}/check")
    assert now_wishlisted.status_code == 200
    assert now_wishlisted.json() == {"wishlisted": True}


def test_wishlisting_missing_product_returns_404(client: TestClient):
    register_user(client)
    response = client.post("/api/v1/wishlist", json={"product_id": 999999})
    assert response.status_code == 404


def test_wishlist_requires_authentication(client: TestClient):
    register_user(client)
    product = create_product(client)
    client.post("/api/v1/auth/logout")

    assert client.get("/api/v1/wishlist").status_code == 401
    assert client.post("/api/v1/wishlist", json={"product_id": product["id"]}).status_code == 401
    assert client.delete(f"/api/v1/wishlist/{product['id']}").status_code == 401
    assert client.get(f"/api/v1/wishlist/{product['id']}/check").status_code == 401


def test_wishlist_is_scoped_to_each_user(client: TestClient):
    register_user(client, username="alice", email="alice@example.edu")
    product = create_product(client)
    client.post("/api/v1/wishlist", json={"product_id": product["id"]})

    client.post("/api/v1/auth/logout")
    register_user(client, username="bob", email="bob@example.edu")

    # Bob's wishlist is independent of Alice's.
    bob_wishlist = client.get("/api/v1/wishlist")
    assert bob_wishlist.status_code == 200
    assert bob_wishlist.json() == []

    bob_check = client.get(f"/api/v1/wishlist/{product['id']}/check")
    assert bob_check.json() == {"wishlisted": False}

    # Bob can wishlist the same product Alice already wishlisted without conflict.
    bob_add = client.post("/api/v1/wishlist", json={"product_id": product["id"]})
    assert bob_add.status_code == 201

    # Bob removing his own entry doesn't affect Alice's.
    bob_remove = client.delete(f"/api/v1/wishlist/{product['id']}")
    assert bob_remove.status_code == 204

    client.post("/api/v1/auth/logout")
    client.post("/api/v1/auth/login", json={"email": "alice@example.edu", "password": "StrongPass1!", "remember_me": False})
    alice_wishlist = client.get("/api/v1/wishlist").json()
    assert len(alice_wishlist) == 1
    assert alice_wishlist[0]["product"]["id"] == product["id"]


def test_deleting_wishlisted_product_removes_it_from_wishlist(client: TestClient):
    register_user(client)
    product = create_product(client)
    client.post("/api/v1/wishlist", json={"product_id": product["id"]})

    delete_response = client.delete(f"/api/v1/products/{product['id']}")
    assert delete_response.status_code == 204

    wishlist = client.get("/api/v1/wishlist").json()
    assert wishlist == []


def test_existing_product_crud_unaffected_by_wishlist(client: TestClient):
    register_user(client)
    product = create_product(client)
    client.post("/api/v1/wishlist", json={"product_id": product["id"]})

    update_response = client.patch(f"/api/v1/products/{product['id']}", json={"price": 999})
    assert update_response.status_code == 200
    assert update_response.json()["price"] == 999
