from fastapi.testclient import TestClient

from tests.conftest import create_product, register_user, tiny_png_bytes


def upload_images(client: TestClient, product_id: int, count: int = 1, content_type: str = "image/png"):
    files = [("files", (f"photo{i}.png", tiny_png_bytes(), content_type)) for i in range(count)]
    return client.post(f"/api/v1/products/{product_id}/images", files=files)


def test_create_product_without_images(client: TestClient):
    register_user(client)
    product = create_product(client)
    assert product["images"] == []
    assert product["image_details"] == []


def test_create_product_then_upload_single_image(client: TestClient):
    register_user(client)
    product = create_product(client)

    response = upload_images(client, product["id"], count=1)
    assert response.status_code == 200, response.text
    body = response.json()
    assert len(body["images"]) == 1
    assert len(body["image_details"]) == 1
    assert body["image_details"][0]["is_primary"] is True
    assert body["image_details"][0]["position"] == 0


def test_upload_multiple_images_at_once(client: TestClient):
    register_user(client)
    product = create_product(client)

    response = upload_images(client, product["id"], count=3)
    assert response.status_code == 200, response.text
    body = response.json()
    assert len(body["images"]) == 3
    assert len(body["image_details"]) == 3
    # Exactly one primary image, and it's the first uploaded.
    primaries = [image for image in body["image_details"] if image["is_primary"]]
    assert len(primaries) == 1
    assert [image["position"] for image in body["image_details"]] == [0, 1, 2]


def test_upload_rejects_invalid_file_type(client: TestClient):
    register_user(client)
    product = create_product(client)

    response = upload_images(client, product["id"], count=1, content_type="text/plain")
    assert response.status_code == 422
    assert "JPEG" in response.json()["detail"] or "PNG" in response.json()["detail"]


def test_upload_rejects_oversized_image(client: TestClient, monkeypatch):
    register_user(client)
    product = create_product(client)

    oversized = b"0" * (5 * 1024 * 1024 + 1)
    response = client.post(
        f"/api/v1/products/{product['id']}/images",
        files=[("files", ("big.png", oversized, "image/png"))],
    )
    assert response.status_code == 422
    assert "5MB" in response.json()["detail"]


def test_upload_rejects_more_than_max_images(client: TestClient):
    register_user(client)
    product = create_product(client)

    first = upload_images(client, product["id"], count=5)
    assert first.status_code == 200, first.text

    second = upload_images(client, product["id"], count=1)
    assert second.status_code == 422
    assert "at most" in second.json()["detail"]


def test_delete_image_promotes_new_primary(client: TestClient):
    register_user(client)
    product = create_product(client)
    body = upload_images(client, product["id"], count=2).json()
    images = body["image_details"]
    primary_id = next(image["id"] for image in images if image["is_primary"])
    other_id = next(image["id"] for image in images if not image["is_primary"])

    response = client.delete(f"/api/v1/products/{product['id']}/images/{primary_id}")
    assert response.status_code == 200, response.text
    remaining = response.json()["image_details"]
    assert len(remaining) == 1
    assert remaining[0]["id"] == other_id
    assert remaining[0]["is_primary"] is True


def test_delete_nonexistent_image_returns_404(client: TestClient):
    register_user(client)
    product = create_product(client)
    response = client.delete(f"/api/v1/products/{product['id']}/images/999999")
    assert response.status_code == 404


def test_set_primary_image(client: TestClient):
    register_user(client)
    product = create_product(client)
    images = upload_images(client, product["id"], count=2).json()["image_details"]
    non_primary_id = next(image["id"] for image in images if not image["is_primary"])

    response = client.patch(f"/api/v1/products/{product['id']}/images/{non_primary_id}/primary")
    assert response.status_code == 200, response.text
    updated = response.json()["image_details"]
    primaries = [image for image in updated if image["is_primary"]]
    assert len(primaries) == 1
    assert primaries[0]["id"] == non_primary_id


def test_reorder_images(client: TestClient):
    register_user(client)
    product = create_product(client)
    images = upload_images(client, product["id"], count=3).json()["image_details"]
    ids = [image["id"] for image in images]
    new_order = [ids[2], ids[0], ids[1]]

    response = client.patch(f"/api/v1/products/{product['id']}/images/reorder", json={"image_ids": new_order})
    assert response.status_code == 200, response.text
    reordered = sorted(response.json()["image_details"], key=lambda image: image["position"])
    assert [image["id"] for image in reordered] == new_order


def test_reorder_rejects_mismatched_ids(client: TestClient):
    register_user(client)
    product = create_product(client)
    images = upload_images(client, product["id"], count=2).json()["image_details"]
    ids = [image["id"] for image in images]

    response = client.patch(f"/api/v1/products/{product['id']}/images/reorder", json={"image_ids": [ids[0], 999999]})
    assert response.status_code == 422


def test_edit_product_replace_and_remove_images(client: TestClient):
    register_user(client)
    product = create_product(client)
    images = upload_images(client, product["id"], count=2).json()["image_details"]

    remove_response = client.delete(f"/api/v1/products/{product['id']}/images/{images[0]['id']}")
    assert remove_response.status_code == 200

    add_response = upload_images(client, product["id"], count=1)
    assert add_response.status_code == 200
    final_images = add_response.json()["image_details"]
    assert len(final_images) == 2


def test_unauthorized_user_cannot_modify_another_users_images(client: TestClient):
    register_user(client, username="alice", email="alice@example.edu")
    product = create_product(client)
    images = upload_images(client, product["id"], count=1).json()["image_details"]
    image_id = images[0]["id"]

    client.post("/api/v1/auth/logout")
    register_user(client, username="bob", email="bob@example.edu")

    upload_as_bob = upload_images(client, product["id"], count=1)
    assert upload_as_bob.status_code == 403

    delete_as_bob = client.delete(f"/api/v1/products/{product['id']}/images/{image_id}")
    assert delete_as_bob.status_code == 403

    primary_as_bob = client.patch(f"/api/v1/products/{product['id']}/images/{image_id}/primary")
    assert primary_as_bob.status_code == 403

    reorder_as_bob = client.patch(
        f"/api/v1/products/{product['id']}/images/reorder", json={"image_ids": [image_id]}
    )
    assert reorder_as_bob.status_code == 403


def test_upload_requires_authentication(client: TestClient):
    register_user(client)
    product = create_product(client)
    client.post("/api/v1/auth/logout")

    response = upload_images(client, product["id"], count=1)
    assert response.status_code == 401


def test_cloudinary_upload_failure_returns_error(client: TestClient, monkeypatch):
    register_user(client)
    product = create_product(client)

    def failing_upload(file_bytes, product_id):
        raise RuntimeError("Cloudinary is unreachable")

    monkeypatch.setattr("app.services.image_service.upload_product_image", failing_upload)

    response = upload_images(client, product["id"], count=1)
    assert response.status_code == 500
    assert response.json()["detail"]


def test_empty_image_state_on_product_detail(client: TestClient):
    register_user(client)
    product = create_product(client)

    response = client.get(f"/api/v1/products/{product['slug']}")
    assert response.status_code == 200
    body = response.json()
    assert body["images"] == []
    assert body["image_details"] == []


def test_existing_product_crud_still_works(client: TestClient):
    register_user(client)
    product = create_product(client)

    update_response = client.patch(f"/api/v1/products/{product['id']}", json={"price": 750})
    assert update_response.status_code == 200
    assert update_response.json()["price"] == 750

    status_response = client.patch(f"/api/v1/products/{product['id']}/status", json={"status": "reserved"})
    assert status_response.status_code == 200
    assert status_response.json()["status"] == "reserved"

    delete_response = client.delete(f"/api/v1/products/{product['id']}")
    assert delete_response.status_code == 204

    get_response = client.get(f"/api/v1/products/{product['slug']}")
    assert get_response.status_code == 404
