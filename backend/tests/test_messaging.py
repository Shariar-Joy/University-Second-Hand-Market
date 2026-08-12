from fastapi.testclient import TestClient

from tests.conftest import create_product, register_user


def start_conversation(client: TestClient, product_id: int):
    return client.post("/api/v1/conversations", json={"product_id": product_id})


def login(client: TestClient, email: str, password: str = "StrongPass1!"):
    return client.post("/api/v1/auth/login", json={"email": email, "password": password, "remember_me": False})


def test_create_conversation(client: TestClient):
    seller = register_user(client, username="alice", email="alice@example.edu")
    product = create_product(client)
    client.post("/api/v1/auth/logout")
    buyer = register_user(client, username="bob", email="bob@example.edu")

    response = start_conversation(client, product["id"])
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["buyer"]["id"] == buyer["id"]
    assert body["seller"]["id"] == seller["id"]
    assert body["product"]["id"] == product["id"]
    assert body["last_message"] is None


def test_reusing_existing_conversation_returns_same_conversation(client: TestClient):
    register_user(client, username="alice", email="alice@example.edu")
    product = create_product(client)
    client.post("/api/v1/auth/logout")
    register_user(client, username="bob", email="bob@example.edu")

    first = start_conversation(client, product["id"]).json()
    second = start_conversation(client, product["id"]).json()
    assert first["id"] == second["id"]

    conversations = client.get("/api/v1/conversations").json()
    assert len(conversations) == 1


def test_send_message(client: TestClient):
    register_user(client, username="alice", email="alice@example.edu")
    product = create_product(client)
    client.post("/api/v1/auth/logout")
    register_user(client, username="bob", email="bob@example.edu")
    conversation = start_conversation(client, product["id"]).json()

    response = client.post(
        f"/api/v1/conversations/{conversation['id']}/messages",
        json={"content": "Hi, is this still available?"},
    )
    assert response.status_code == 201, response.text
    body = response.json()
    assert body["content"] == "Hi, is this still available?"
    assert body["conversation_id"] == conversation["id"]


def test_empty_message_is_rejected(client: TestClient):
    register_user(client, username="alice", email="alice@example.edu")
    product = create_product(client)
    client.post("/api/v1/auth/logout")
    register_user(client, username="bob", email="bob@example.edu")
    conversation = start_conversation(client, product["id"]).json()

    response = client.post(f"/api/v1/conversations/{conversation['id']}/messages", json={"content": "   "})
    assert response.status_code == 422


def test_seller_can_view_and_reply(client: TestClient):
    register_user(client, username="alice", email="alice@example.edu")
    product = create_product(client)
    client.post("/api/v1/auth/logout")
    register_user(client, username="bob", email="bob@example.edu")
    conversation = start_conversation(client, product["id"]).json()
    client.post(f"/api/v1/conversations/{conversation['id']}/messages", json={"content": "Is this available?"})

    client.post("/api/v1/auth/logout")
    login(client, "alice@example.edu")

    seller_conversations = client.get("/api/v1/conversations").json()
    assert len(seller_conversations) == 1
    assert seller_conversations[0]["id"] == conversation["id"]

    thread = client.get(f"/api/v1/conversations/{conversation['id']}/messages")
    assert thread.status_code == 200
    assert len(thread.json()["messages"]) == 1

    reply = client.post(
        f"/api/v1/conversations/{conversation['id']}/messages", json={"content": "Yes, still available!"}
    )
    assert reply.status_code == 201


def test_buyer_can_view_conversation_and_messages(client: TestClient):
    register_user(client, username="alice", email="alice@example.edu")
    product = create_product(client)
    client.post("/api/v1/auth/logout")
    register_user(client, username="bob", email="bob@example.edu")
    conversation = start_conversation(client, product["id"]).json()
    client.post(f"/api/v1/conversations/{conversation['id']}/messages", json={"content": "Hello!"})

    response = client.get(f"/api/v1/conversations/{conversation['id']}/messages")
    assert response.status_code == 200
    body = response.json()
    assert body["conversation"]["id"] == conversation["id"]
    assert len(body["messages"]) == 1
    assert body["messages"][0]["content"] == "Hello!"


def test_conversation_access_control_blocks_third_party(client: TestClient):
    register_user(client, username="alice", email="alice@example.edu")
    product = create_product(client)
    client.post("/api/v1/auth/logout")
    register_user(client, username="bob", email="bob@example.edu")
    conversation = start_conversation(client, product["id"]).json()

    client.post("/api/v1/auth/logout")
    register_user(client, username="carol", email="carol@example.edu")

    get_response = client.get(f"/api/v1/conversations/{conversation['id']}/messages")
    assert get_response.status_code == 403

    send_response = client.post(f"/api/v1/conversations/{conversation['id']}/messages", json={"content": "Hi"})
    assert send_response.status_code == 403

    carol_conversations = client.get("/api/v1/conversations").json()
    assert carol_conversations == []


def test_messaging_requires_authentication(client: TestClient):
    register_user(client, username="alice", email="alice@example.edu")
    product = create_product(client)
    client.post("/api/v1/auth/logout")
    register_user(client, username="bob", email="bob@example.edu")
    conversation = start_conversation(client, product["id"]).json()
    client.post("/api/v1/auth/logout")

    assert client.get("/api/v1/conversations").status_code == 401
    assert start_conversation(client, product["id"]).status_code == 401
    assert client.get(f"/api/v1/conversations/{conversation['id']}/messages").status_code == 401
    assert (
        client.post(f"/api/v1/conversations/{conversation['id']}/messages", json={"content": "hi"}).status_code
        == 401
    )


def test_seller_cannot_start_conversation_with_self(client: TestClient):
    register_user(client, username="alice", email="alice@example.edu")
    product = create_product(client)

    response = start_conversation(client, product["id"])
    assert response.status_code == 400


def test_conversation_for_missing_product_returns_404(client: TestClient):
    register_user(client)
    response = start_conversation(client, 999999)
    assert response.status_code == 404


def test_messages_on_missing_conversation_return_404(client: TestClient):
    register_user(client)
    assert client.get("/api/v1/conversations/999999/messages").status_code == 404
    assert client.post("/api/v1/conversations/999999/messages", json={"content": "hi"}).status_code == 404


def test_multiple_messages_are_returned_in_order(client: TestClient):
    register_user(client, username="alice", email="alice@example.edu")
    product = create_product(client)
    client.post("/api/v1/auth/logout")
    register_user(client, username="bob", email="bob@example.edu")
    conversation = start_conversation(client, product["id"]).json()

    client.post(f"/api/v1/conversations/{conversation['id']}/messages", json={"content": "First message"})
    client.post(f"/api/v1/conversations/{conversation['id']}/messages", json={"content": "Second message"})

    client.post("/api/v1/auth/logout")
    login(client, "alice@example.edu")
    client.post(
        f"/api/v1/conversations/{conversation['id']}/messages",
        json={"content": "Third message (seller reply)"},
    )

    thread = client.get(f"/api/v1/conversations/{conversation['id']}/messages").json()
    contents = [message["content"] for message in thread["messages"]]
    assert contents == ["First message", "Second message", "Third message (seller reply)"]


def _conversation_from_list(client: TestClient, conversation_id: int) -> dict:
    conversations = client.get("/api/v1/conversations").json()
    return next(item for item in conversations if item["id"] == conversation_id)


def test_new_conversation_has_no_unread_for_either_party(client: TestClient):
    register_user(client, username="alice", email="alice@example.edu")
    product = create_product(client)
    client.post("/api/v1/auth/logout")
    register_user(client, username="bob", email="bob@example.edu")
    conversation = start_conversation(client, product["id"]).json()
    assert conversation["unread"] is False

    client.post("/api/v1/auth/logout")
    login(client, "alice@example.edu")
    seller_view = _conversation_from_list(client, conversation["id"])
    assert seller_view["unread"] is False


def test_recipient_sees_unread_after_message_but_sender_does_not(client: TestClient):
    register_user(client, username="alice", email="alice@example.edu")
    product = create_product(client)
    client.post("/api/v1/auth/logout")
    register_user(client, username="bob", email="bob@example.edu")
    conversation = start_conversation(client, product["id"]).json()
    client.post(f"/api/v1/conversations/{conversation['id']}/messages", json={"content": "Is this available?"})

    buyer_view = _conversation_from_list(client, conversation["id"])
    assert buyer_view["unread"] is False

    client.post("/api/v1/auth/logout")
    login(client, "alice@example.edu")
    seller_view = _conversation_from_list(client, conversation["id"])
    assert seller_view["unread"] is True


def test_opening_conversation_marks_it_read(client: TestClient):
    register_user(client, username="alice", email="alice@example.edu")
    product = create_product(client)
    client.post("/api/v1/auth/logout")
    register_user(client, username="bob", email="bob@example.edu")
    conversation = start_conversation(client, product["id"]).json()
    client.post(f"/api/v1/conversations/{conversation['id']}/messages", json={"content": "Is this available?"})

    client.post("/api/v1/auth/logout")
    login(client, "alice@example.edu")

    thread = client.get(f"/api/v1/conversations/{conversation['id']}/messages").json()
    assert thread["conversation"]["unread"] is False

    seller_view = _conversation_from_list(client, conversation["id"])
    assert seller_view["unread"] is False


def test_unread_flips_back_to_buyer_after_seller_reply(client: TestClient):
    register_user(client, username="alice", email="alice@example.edu")
    product = create_product(client)
    client.post("/api/v1/auth/logout")
    register_user(client, username="bob", email="bob@example.edu")
    conversation = start_conversation(client, product["id"]).json()
    client.post(f"/api/v1/conversations/{conversation['id']}/messages", json={"content": "Is this available?"})

    client.post("/api/v1/auth/logout")
    login(client, "alice@example.edu")
    client.get(f"/api/v1/conversations/{conversation['id']}/messages")
    client.post(f"/api/v1/conversations/{conversation['id']}/messages", json={"content": "Yes it is!"})

    client.post("/api/v1/auth/logout")
    login(client, "bob@example.edu")
    buyer_view = _conversation_from_list(client, conversation["id"])
    assert buyer_view["unread"] is True

    client.get(f"/api/v1/conversations/{conversation['id']}/messages")
    buyer_view_after_reading = _conversation_from_list(client, conversation["id"])
    assert buyer_view_after_reading["unread"] is False


def test_existing_product_crud_unaffected_by_conversations(client: TestClient):
    register_user(client, username="alice", email="alice@example.edu")
    product = create_product(client)
    client.post("/api/v1/auth/logout")
    register_user(client, username="bob", email="bob@example.edu")
    start_conversation(client, product["id"])

    client.post("/api/v1/auth/logout")
    login(client, "alice@example.edu")

    update_response = client.patch(f"/api/v1/products/{product['id']}", json={"price": 850})
    assert update_response.status_code == 200
    assert update_response.json()["price"] == 850

    delete_response = client.delete(f"/api/v1/products/{product['id']}")
    assert delete_response.status_code == 204
