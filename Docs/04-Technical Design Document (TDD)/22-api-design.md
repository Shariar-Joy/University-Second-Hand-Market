# Second-Hand Marketplace — API Design

## API Standards

| Item | Standard |
|---|---|
| Base URL | `/api/v1` |
| Format | JSON |
| Auth | Bearer JWT (Authorization header) |
| Error Model | `detail` field (FastAPI default) or custom `error_code` + `message` |
| Time Format | ISO-8601 UTC |
| Image Upload | `multipart/form-data` |

> **Path Convention:** All endpoints below are relative to `/api/v1`.
> Example: `POST /auth/register` means `POST /api/v1/auth/register`.

---

## Authentication APIs

| Endpoint | Method | Description | Auth |
|---|---|---|---|
| `/auth/register` | POST | Register a new user | Public |
| `/auth/login` | POST | Login and receive JWT | Public |
| `/auth/refresh` | POST | Refresh access token | Public (refresh token) |

### Example: POST `/auth/register`

**Request**
```json
{
  "full_name": "Rahim Uddin",
  "email": "rahim@example.com",
  "password": "SecurePass!99"
}
```

**Response 201**
```json
{
  "user_id": 1,
  "email": "rahim@example.com",
  "message": "Registration successful"
}
```

### Example: POST `/auth/login`

**Request**
```json
{
  "email": "rahim@example.com",
  "password": "SecurePass!99"
}
```

**Response 200**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

---

## User APIs

| Endpoint | Method | Description | Auth |
|---|---|---|---|
| `/users/me` | GET | Get current user profile | Bearer |
| `/users/me` | PATCH | Update name, phone, or avatar | Bearer |
| `/users/{user_id}` | GET | Get public seller profile + active listings | Public |

### Example: GET `/users/{user_id}`

**Response 200**
```json
{
  "id": 1,
  "full_name": "Rahim Uddin",
  "avatar_url": "https://res.cloudinary.com/.../avatar.jpg",
  "listings": [
    { "id": 5, "title": "Used Laptop", "price": 15000, "status": "active" }
  ]
}
```

---

## Listing APIs

| Endpoint | Method | Description | Auth |
|---|---|---|---|
| `/listings` | POST | Create a new listing (multipart with images) | Bearer |
| `/listings` | GET | Browse / search / filter listings | Public |
| `/listings/{listing_id}` | GET | Get listing detail | Public |
| `/listings/{listing_id}` | PATCH | Edit listing (owner only) | Bearer |
| `/listings/{listing_id}` | DELETE | Delete listing (owner only) | Bearer |
| `/listings/{listing_id}/sold` | PATCH | Mark listing as sold (owner only) | Bearer |

### Browse Listings — Query Parameters

| Parameter | Type | Description |
|---|---|---|
| `q` | string | Keyword search (title & description) |
| `category_id` | int | Filter by category |
| `condition` | string | `new`, `like_new`, `good`, `fair` |
| `sort_by` | string | `price_asc`, `price_desc`, `newest`, `oldest` |
| `page` | int | Page number (default: 1) |
| `page_size` | int | Results per page (default: 20, max: 100) |

### Example: POST `/listings`

**Request** (`multipart/form-data`)
```
title        = "Samsung Galaxy S21"
description  = "Used for 1 year, good condition, no scratches"
price        = 25000
category_id  = 1
condition    = "good"
images       = [file1.jpg, file2.jpg]
```

**Response 201**
```json
{
  "id": 42,
  "title": "Samsung Galaxy S21",
  "price": 25000.00,
  "status": "active",
  "created_at": "2026-06-14T10:30:00Z",
  "image_urls": [
    "https://res.cloudinary.com/.../img1.jpg",
    "https://res.cloudinary.com/.../img2.jpg"
  ]
}
```

### Example: GET `/listings`

**Response 200**
```json
{
  "total": 150,
  "page": 1,
  "page_size": 20,
  "results": [
    {
      "id": 42,
      "title": "Samsung Galaxy S21",
      "price": 25000.00,
      "condition": "good",
      "status": "active",
      "category": "Electronics",
      "seller": { "id": 1, "full_name": "Rahim Uddin" },
      "thumbnail_url": "https://res.cloudinary.com/.../img1.jpg",
      "created_at": "2026-06-14T10:30:00Z"
    }
  ]
}
```

---

## Category APIs

| Endpoint | Method | Description | Auth |
|---|---|---|---|
| `/categories` | GET | List all categories | Public |

**Response 200**
```json
[
  { "id": 1, "name": "Electronics" },
  { "id": 2, "name": "Clothing & Accessories" }
]
```

---

## Message APIs

| Endpoint | Method | Description | Auth |
|---|---|---|---|
| `/messages` | POST | Send a message about a listing | Bearer |
| `/messages/inbox` | GET | Get all conversations (grouped) | Bearer |
| `/messages/thread` | GET | Get message thread for a listing + other user | Bearer |

### Query Parameters for `/messages/thread`
`listing_id` (required), `other_user_id` (required)

### Example: POST `/messages`

**Request**
```json
{
  "listing_id": 42,
  "receiver_id": 1,
  "body": "Hi, is this still available?"
}
```

**Response 201**
```json
{
  "id": 101,
  "created_at": "2026-06-14T11:00:00Z"
}
```

### Example: GET `/messages/inbox`

**Response 200**
```json
[
  {
    "listing_id": 42,
    "listing_title": "Samsung Galaxy S21",
    "other_user": { "id": 1, "full_name": "Rahim Uddin" },
    "last_message": "Is this still available?",
    "last_message_at": "2026-06-14T11:00:00Z"
  }
]
```

---

## Favorites APIs

| Endpoint | Method | Description | Auth |
|---|---|---|---|
| `/favorites` | POST | Save a listing to favorites | Bearer |
| `/favorites/{listing_id}` | DELETE | Remove a listing from favorites | Bearer |
| `/favorites` | GET | Get current user's saved favorites | Bearer |

### Example: POST `/favorites`

**Request**
```json
{ "listing_id": 42 }
```

**Response 201**
```json
{ "message": "Listing saved to favorites" }
```

---

## Validation Rules

| Area | Rule |
|---|---|
| Auth | Email format required; password minimum 8 characters |
| Listing title | Required; max 200 characters |
| Listing price | Required; must be a positive number |
| Listing condition | Must be one of: `new`, `like_new`, `good`, `fair` |
| Images | Maximum 5 images per listing; accepted formats: JPG, PNG, WEBP |
| Pagination | `page >= 1`; `1 <= page_size <= 100` |
| Message body | Required; max 2000 characters |

---

## HTTP Status Codes

| Code | Meaning | Typical Usage |
|---|---|---|
| 200 | OK | Successful reads and updates |
| 201 | Created | New resource created |
| 204 | No Content | Deletion successful |
| 400 | Bad Request | Input validation failure |
| 401 | Unauthorized | Missing or invalid/expired JWT |
| 403 | Forbidden | Not the resource owner |
| 404 | Not Found | Listing, user, or message not found |
| 409 | Conflict | Email already registered; listing already favorited |
| 422 | Unprocessable Entity | Pydantic schema validation error |
| 500 | Internal Server Error | Unhandled server exception |

---

## Error Response Contract

FastAPI default:
```json
{
  "detail": "Listing not found"
}
```

Pydantic validation error (FastAPI default):
```json
{
  "detail": [
    {
      "loc": ["body", "price"],
      "msg": "value is not a valid number",
      "type": "type_error.float"
    }
  ]
}
```

---

## API-to-Requirement Mapping

| API Domain | Requirement IDs |
|---|---|
| Auth | FR-001 – FR-006 |
| Users | FR-005, FR-030 – FR-031 |
| Listings | FR-007 – FR-012, FR-013 – FR-019 |
| Messages | FR-020 – FR-023 |
| Favorites | FR-027 – FR-029 |
