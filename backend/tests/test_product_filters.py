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


def list_products(client: TestClient, **params):
    return client.get("/api/v1/products", params=params)


def test_filter_by_category(client: TestClient):
    register_user(client)
    create_product_with(client, name="Algorithms Textbook", category="Books")
    create_product_with(client, name="Mountain Bike", category="Bicycles")

    response = list_products(client, category="Bicycles")
    assert response.status_code == 200, response.text
    names = [p["name"] for p in response.json()]
    assert names == ["Mountain Bike"]


def test_filter_by_min_price(client: TestClient):
    register_user(client)
    create_product_with(client, name="Cheap Pen", price=50)
    create_product_with(client, name="Expensive Laptop", price=50000)

    response = list_products(client, min_price=1000)
    assert response.status_code == 200, response.text
    names = [p["name"] for p in response.json()]
    assert names == ["Expensive Laptop"]


def test_filter_by_max_price(client: TestClient):
    register_user(client)
    create_product_with(client, name="Cheap Pen", price=50)
    create_product_with(client, name="Expensive Laptop", price=50000)

    response = list_products(client, max_price=1000)
    assert response.status_code == 200, response.text
    names = [p["name"] for p in response.json()]
    assert names == ["Cheap Pen"]


def test_filter_by_price_range(client: TestClient):
    register_user(client)
    create_product_with(client, name="Cheap Pen", price=50)
    create_product_with(client, name="Mid Calculator", price=1200)
    create_product_with(client, name="Expensive Laptop", price=50000)

    response = list_products(client, min_price=500, max_price=5000)
    assert response.status_code == 200, response.text
    names = [p["name"] for p in response.json()]
    assert names == ["Mid Calculator"]


def test_filter_by_condition(client: TestClient):
    register_user(client)
    create_product_with(client, name="Brand New Bag", condition="New")
    create_product_with(client, name="Worn Bag", condition="Fair")

    response = list_products(client, condition="New")
    assert response.status_code == 200, response.text
    names = [p["name"] for p in response.json()]
    assert names == ["Brand New Bag"]


def test_filter_by_availability_status(client: TestClient):
    register_user(client)
    available = create_product_with(client, name="Available Item")
    reserved = create_product_with(client, name="Reserved Item")

    status_response = client.patch(f"/api/v1/products/{reserved['id']}/status", json={"status": "reserved"})
    assert status_response.status_code == 200

    response = list_products(client, availability="reserved")
    assert response.status_code == 200, response.text
    names = [p["name"] for p in response.json()]
    assert names == [reserved["name"]]

    response = list_products(client, availability="available")
    names = [p["name"] for p in response.json()]
    assert names == [available["name"]]


def test_availability_filter_rejects_sold_and_archived(client: TestClient):
    register_user(client)
    create_product_with(client, name="Item")

    for blocked_status in ["sold", "archived"]:
        response = list_products(client, availability=blocked_status)
        assert response.status_code == 422, response.text


def test_sort_newest(client: TestClient):
    register_user(client)
    first = create_product_with(client, name="First Listed")
    second = create_product_with(client, name="Second Listed")

    response = list_products(client, sort="newest")
    assert response.status_code == 200, response.text
    names = [p["name"] for p in response.json()]
    assert names == [second["name"], first["name"]]


def test_sort_oldest(client: TestClient):
    register_user(client)
    first = create_product_with(client, name="First Listed")
    second = create_product_with(client, name="Second Listed")

    response = list_products(client, sort="oldest")
    assert response.status_code == 200, response.text
    names = [p["name"] for p in response.json()]
    assert names == [first["name"], second["name"]]


def test_sort_price_asc(client: TestClient):
    register_user(client)
    create_product_with(client, name="Mid", price=500)
    create_product_with(client, name="Cheap", price=50)
    create_product_with(client, name="Expensive", price=5000)

    response = list_products(client, sort="price_asc")
    assert response.status_code == 200, response.text
    names = [p["name"] for p in response.json()]
    assert names == ["Cheap", "Mid", "Expensive"]


def test_sort_price_desc(client: TestClient):
    register_user(client)
    create_product_with(client, name="Mid", price=500)
    create_product_with(client, name="Cheap", price=50)
    create_product_with(client, name="Expensive", price=5000)

    response = list_products(client, sort="price_desc")
    assert response.status_code == 200, response.text
    names = [p["name"] for p in response.json()]
    assert names == ["Expensive", "Mid", "Cheap"]


def test_search_combined_with_filters(client: TestClient):
    register_user(client)
    create_product_with(client, name="Gaming Laptop", category="Electronics", price=80000)
    create_product_with(client, name="Office Laptop", category="Electronics", price=30000)
    create_product_with(client, name="Laptop Bag", category="Other", price=1000)

    response = list_products(client, search="laptop", category="Electronics", min_price=50000, max_price=100000)
    assert response.status_code == 200, response.text
    names = [p["name"] for p in response.json()]
    assert names == ["Gaming Laptop"]


def test_multiple_filters_together(client: TestClient):
    register_user(client)
    create_product_with(client, name="Match", category="Books", condition="New", price=800)
    create_product_with(client, name="Wrong Condition", category="Books", condition="Fair", price=800)
    create_product_with(client, name="Wrong Category", category="Electronics", condition="New", price=800)
    create_product_with(client, name="Wrong Price", category="Books", condition="New", price=50)

    response = list_products(client, category="Books", condition="New", min_price=500, max_price=1000)
    assert response.status_code == 200, response.text
    names = [p["name"] for p in response.json()]
    assert names == ["Match"]


def test_invalid_category_returns_422(client: TestClient):
    register_user(client)
    create_product_with(client, name="Item")

    response = list_products(client, category="NotACategory")
    assert response.status_code == 422, response.text


def test_invalid_condition_returns_422(client: TestClient):
    register_user(client)
    create_product_with(client, name="Item")

    response = list_products(client, condition="Terrible")
    assert response.status_code == 422, response.text


def test_invalid_sort_returns_422(client: TestClient):
    register_user(client)
    create_product_with(client, name="Item")

    response = list_products(client, sort="random_order")
    assert response.status_code == 422, response.text


def test_negative_min_price_returns_422(client: TestClient):
    register_user(client)
    create_product_with(client, name="Item")

    response = list_products(client, min_price=-10)
    assert response.status_code == 422, response.text


def test_negative_max_price_returns_422(client: TestClient):
    register_user(client)
    create_product_with(client, name="Item")

    response = list_products(client, max_price=-10)
    assert response.status_code == 422, response.text


def test_min_price_greater_than_max_price_returns_422(client: TestClient):
    register_user(client)
    create_product_with(client, name="Item")

    response = list_products(client, min_price=5000, max_price=1000)
    assert response.status_code == 422, response.text


def test_filters_with_no_matching_results(client: TestClient):
    register_user(client)
    create_product_with(client, name="Item", category="Books", price=500)

    response = list_products(client, category="Books", min_price=10000)
    assert response.status_code == 200, response.text
    assert response.json() == []


def test_filters_exclude_archived_and_sold_products(client: TestClient):
    register_user(client)
    visible = create_product_with(client, name="Visible Book", category="Books")
    archived = create_product_with(client, name="Archived Book", category="Books")

    status_response = client.patch(f"/api/v1/products/{archived['id']}/status", json={"status": "archived"})
    assert status_response.status_code == 200

    response = list_products(client, category="Books")
    names = [p["name"] for p in response.json()]
    assert names == [visible["name"]]


def test_plain_listing_without_filters_still_works(client: TestClient):
    register_user(client)
    create_product_with(client, name="Item One")
    create_product_with(client, name="Item Two")

    response = list_products(client)
    assert response.status_code == 200, response.text
    assert len(response.json()) == 2
