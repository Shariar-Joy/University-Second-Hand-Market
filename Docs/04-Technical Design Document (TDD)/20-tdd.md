# Second-Hand Marketplace — Technical Design Document (TDD)

## Technical Stack

| Layer | Technology |
|---|---|
| Frontend | React (JavaScript or TypeScript) |
| Backend | Python FastAPI |
| Database | PostgreSQL |
| ORM | SQLAlchemy (with Alembic for migrations) |
| Auth | JWT (python-jose / PyJWT + bcrypt) |
| Image Storage | Cloudinary (or local filesystem for development) |
| Deployment | Railway / Render (backend + DB), Vercel / Netlify (frontend) |

---

## Backend Design by Layer

### 1. Router Layer (Controllers)
FastAPI routers, one per domain:

| Router | Prefix | Responsibilities |
|---|---|---|
| Auth | `/auth` | Register, login, token refresh |
| Users | `/users` | Profile read and update |
| Listings | `/listings` | Create, read, update, delete, mark sold |
| Categories | `/categories` | List all categories |
| Messages | `/messages` | Send message, inbox, conversation thread |
| Favorites | `/favorites` | Save, unsave, list favorites |

Each router handles: request parsing, input validation (via Pydantic schemas), calling the service layer, and returning an HTTP response with the correct status code.

### 2. Service Layer
Business logic is encapsulated in service functions or classes, keeping routers thin.

| Service | Key Responsibilities |
|---|---|
| AuthService | Password hashing, JWT creation and validation, token refresh |
| ListingService | Ownership checks before edit/delete, image upload orchestration, status transitions |
| MessageService | Conversation grouping (by listing + pair of users) |
| UserService | Profile update, avatar upload |

### 3. Model Layer (SQLAlchemy ORM)
Declarative SQLAlchemy models map to PostgreSQL tables:

```
User, Category, Listing, ListingImage, Message, Favorite
```

Relationships are defined with `relationship()` and `ForeignKey` constraints. Alembic is used for all schema migrations.

### 4. Schema Layer (Pydantic)
Pydantic models are used for:
- **Request bodies** — validate and parse incoming JSON.
- **Response schemas** — shape outgoing data, avoid leaking internal fields (e.g., `password_hash`).

Example separation:
```
ListingCreate   →  input schema (title, description, price, condition, category_id)
ListingResponse →  output schema (id, title, price, seller_id, status, image_urls, ...)
```

### 5. Authentication Layer
- JWT access tokens issued on login.
- `get_current_user` FastAPI dependency injected on all protected routes.
- Password hashed with `bcrypt` via `passlib`.
- Token expiry configurable via environment variable.

### 6. Image Handling
- Multipart form upload endpoint accepts image files.
- Files uploaded to Cloudinary using the Python SDK; public URLs stored in `listing_images` table.
- Local fallback: save to `/static/uploads/` in development.

### 7. Error Handling
Standard error response shape used across all endpoints:

```json
{
  "detail": "Listing not found"
}
```

For validation errors, FastAPI automatically returns:

```json
{
  "detail": [
    { "loc": ["body", "price"], "msg": "value is not a valid float", "type": "type_error.float" }
  ]
}
```

Custom HTTP exceptions raised for:
- `403 Forbidden` — user is not the owner of the resource.
- `404 Not Found` — listing, user, or message thread does not exist.
- `409 Conflict` — email already registered.

### 8. Database Migrations
Alembic is used for versioned schema migrations:

```bash
alembic revision --autogenerate -m "create listings table"
alembic upgrade head
```

Migration files are committed to the repository.

### 9. Configuration
Environment variables managed via `.env` file and `python-dotenv`:

```
DATABASE_URL=postgresql://user:pass@host/dbname
SECRET_KEY=...
ACCESS_TOKEN_EXPIRE_MINUTES=60
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

---

## Frontend Design Highlights

| Area | Approach |
|---|---|
| API communication | Axios (or Fetch API) with a centralized API client; JWT stored in memory or `localStorage` |
| State management | React Context or useState/useEffect for auth state and listing data |
| Routing | React Router v6 for page navigation |
| Forms | Controlled components with client-side validation before API calls |
| Image preview | Show selected image previews before upload submission |
| Listing grid | Responsive CSS Grid or Flexbox card layout |
| Loading / error states | Spinner components and error banners throughout the app |
| Empty states | Friendly messages when no listings / no messages / no favorites found |

---

## Design-to-Requirement Mapping

| Design Area | Requirement IDs |
|---|---|
| Auth module | FR-001 – FR-006 |
| Listing module | FR-007 – FR-012 |
| Browse & Search module | FR-013 – FR-019 |
| Messaging module | FR-020 – FR-023 |
| Seller Dashboard | FR-024 – FR-026 |
| Favorites module | FR-027 – FR-029 |
| Public Profile | FR-030 – FR-031 |
