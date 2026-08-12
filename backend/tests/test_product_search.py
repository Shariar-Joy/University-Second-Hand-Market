from fastapi.testclient import TestClient

from tests.conftest import register_user


def create_product_with(client: TestClient, **overrides) -> dict:
    payload = {
        "name": "Calculus Textbook",
        "description": "Barely used",
        "price": 500,
        "category": "Books",
        "condition": "Good",
    }
    payload.update(overrides)
    response = client.post("/api/v1/products", json=payload)
    assert response.status_code == 201, response.text
    return response.json()


def search(client: TestClient, term: str | None = None):
    if term is None:
        return client.get("/api/v1/products")
    return client.get("/api/v1/products", params={"search": term})


def test_search_by_full_title(client: TestClient):
    register_user(client)
    create_product_with(client, name="Introduction to Algorithms", category="Books")
    create_product_with(client, name="Mountain Bike", category="Bicycles")

    response = search(client, "Introduction to Algorithms")
    assert response.status_code == 200
    names = [p["name"] for p in response.json()]
    assert names == ["Introduction to Algorithms"]


def test_search_by_partial_title(client: TestClient):
    register_user(client)
    create_product_with(client, name="Introduction to Algorithms", category="Books")
    create_product_with(client, name="Mountain Bike", category="Bicycles")

    response = search(client, "Algorithm")
    assert response.status_code == 200
    names = [p["name"] for p in response.json()]
    assert names == ["Introduction to Algorithms"]


def test_search_by_description(client: TestClient):
    register_user(client)
    create_product_with(client, name="Old Desk Lamp", description="Great for late-night study sessions", category="Other")
    create_product_with(client, name="Mountain Bike", description="Barely ridden", category="Bicycles")

    response = search(client, "study sessions")
    assert response.status_code == 200
    names = [p["name"] for p in response.json()]
    assert names == ["Old Desk Lamp"]


def test_search_by_category(client: TestClient):
    register_user(client)
    create_product_with(client, name="Introduction to Algorithms", category="Books")
    create_product_with(client, name="Mountain Bike", category="Bicycles")

    response = search(client, "Bicycles")
    assert response.status_code == 200
    names = [p["name"] for p in response.json()]
    assert names == ["Mountain Bike"]


def test_search_is_case_insensitive(client: TestClient):
    register_user(client)
    create_product_with(client, name="Introduction to Algorithms", category="Books")

    for term in ["algorithms", "ALGORITHMS", "AlGoRiThMs"]:
        response = search(client, term)
        assert response.status_code == 200, response.text
        names = [p["name"] for p in response.json()]
        assert names == ["Introduction to Algorithms"], f"failed for term={term!r}"


def test_search_ignores_leading_trailing_and_extra_whitespace(client: TestClient):
    register_user(client)
    create_product_with(client, name="Introduction to Algorithms", category="Books")

    response = search(client, "   Introduction   to Algorithms   ")
    assert response.status_code == 200, response.text
    names = [p["name"] for p in response.json()]
    assert names == ["Introduction to Algorithms"]


def test_search_with_no_results(client: TestClient):
    register_user(client)
    create_product_with(client, name="Introduction to Algorithms", category="Books")

    response = search(client, "nonexistent keyword xyz")
    assert response.status_code == 200
    assert response.json() == []


def test_empty_search_returns_all_visible_products(client: TestClient):
    register_user(client)
    create_product_with(client, name="Introduction to Algorithms", category="Books")
    create_product_with(client, name="Mountain Bike", category="Bicycles")

    response = search(client, "")
    assert response.status_code == 200
    names = {p["name"] for p in response.json()}
    assert names == {"Introduction to Algorithms", "Mountain Bike"}


def test_whitespace_only_search_returns_all_visible_products(client: TestClient):
    register_user(client)
    create_product_with(client, name="Introduction to Algorithms", category="Books")
    create_product_with(client, name="Mountain Bike", category="Bicycles")

    response = search(client, "   ")
    assert response.status_code == 200
    names = {p["name"] for p in response.json()}
    assert names == {"Introduction to Algorithms", "Mountain Bike"}


def test_listing_without_search_still_works(client: TestClient):
    register_user(client)
    create_product_with(client, name="Introduction to Algorithms", category="Books")

    response = search(client)
    assert response.status_code == 200
    names = [p["name"] for p in response.json()]
    assert names == ["Introduction to Algorithms"]


def test_search_excludes_archived_and_sold_products(client: TestClient):
    register_user(client)
    visible = create_product_with(client, name="Algorithms Textbook", category="Books")
    archived = create_product_with(client, name="Algorithms Notes", category="Books")

    status_response = client.patch(f"/api/v1/products/{archived['id']}/status", json={"status": "archived"})
    assert status_response.status_code == 200

    response = search(client, "Algorithms")
    names = [p["name"] for p in response.json()]
    assert names == [visible["name"]]


def test_search_failure_returns_meaningful_error(client: TestClient, monkeypatch):
    register_user(client)
    create_product_with(client, name="Introduction to Algorithms", category="Books")

    def failing_list_all(db, statuses=None, search=None):
        raise RuntimeError("Database is unreachable")

    monkeypatch.setattr("app.crud.product.list_all", failing_list_all)

    response = search(client, "Algorithms")
    assert response.status_code == 500
    assert response.json()["detail"]
