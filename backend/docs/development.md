# Development guide

## Running locally

```bash
uvicorn app.main:app --reload --port 8000
```

`--reload` restarts the server on file changes. Interactive API docs are available at
`http://localhost:8000/docs` (Swagger UI) and `http://localhost:8000/redoc`.

## Layering

Routes never talk to the database directly. The call chain for a request is:

```
api/routes/*.py  ->  services/*.py  ->  crud/*.py  ->  models/*.py (SQLAlchemy)
```

- **`crud/`** — plain functions that take a `Session` and return ORM objects or `None`. No
  business rules, no HTTP concerns.
- **`services/`** — business logic that may call multiple `crud` functions, raise `HTTPException`
  for domain errors (e.g. duplicate email → 409), or apply rules (e.g. the timing-safe login check
  in `services/auth_service.py`).
- **`api/routes/`** — thin: parse the request via a Pydantic schema, call a service, shape the
  response via a Pydantic schema, set/clear cookies.

When adding a new feature, follow this same chain rather than querying the database from a route.

## Database sessions

Every route that touches the database takes `db: Session = Depends(get_db)` (from
`app.core.database`). `get_db()` yields one `Session` per request and always closes it, even on
error — never construct a `Session` manually inside a route or service.

## Adding a model / migration

1. Add or edit a model in `app/models/`.
2. Make sure it's imported in `app/models/__init__.py` (Alembic's autogenerate only sees models
   that have actually been imported).
3. Generate a migration:
   ```bash
   alembic revision --autogenerate -m "describe the change"
   ```
4. **Always read the generated migration** before applying it — autogenerate is a good first draft,
   not a guarantee (it can miss things like server-side check constraints).
5. Apply it: `alembic upgrade head`. See [database-migrations.md](database-migrations.md) for the
   full workflow.

## Code style

- Type hints on every function signature.
- No comments explaining *what* code does — only *why*, when the reason isn't obvious from reading
  it (a workaround, an invariant, a non-obvious constraint).
- Keep `ProductOut`/`TutorOut`/`UserOut` response shapes backward compatible — the frontend reads
  fields by exact name with no tolerance for renames.
