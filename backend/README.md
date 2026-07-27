# Campus Exchange API

FastAPI backend for the Campus Exchange (University Second-Hand Marketplace) project.

## Tech stack

- **Python 3.12+**, **FastAPI**, **Uvicorn**
- **SQLAlchemy 2.0** (declarative ORM) + **Alembic** (migrations)
- **PostgreSQL** ([Neon](https://neon.tech), serverless Postgres)
- **Pydantic v2** for request/response validation
- **Passlib + bcrypt** for password hashing, **PyJWT** for cookie-based auth
- Deployed on **Render**

## Project structure

```
app/
  main.py              FastAPI app: middleware, exception handlers, router wiring
  core/                config.py (env settings), database.py (engine/session), security.py (hashing/JWT)
  models/              SQLAlchemy ORM models (User, Product, Tutor)
  schemas/             Pydantic request/response models
  crud/                Plain DB query functions, one module per model
  services/            Business logic layer (register/authenticate, list operations) used by routes
  api/routes/          FastAPI routers (auth, products, tutors, health)
  api/dependencies.py  Shared FastAPI dependencies (get_current_user)
  dependencies/        Ergonomic re-exports of get_db / get_current_user
  middlewares/         Request logging, security headers
  utils/               Small shared helpers
alembic/               Migration environment + versions/
scripts/seed_data.py   Idempotent demo-data seed script (run manually, not on app startup)
```

## Quick start (local development)

1. **Create a virtual environment and install dependencies**
   ```bash
   cd backend
   python -m venv .venv
   .venv\Scripts\activate       # Windows
   pip install -r requirements.txt
   ```
2. **Configure environment variables** — copy `.env.example` to `.env` and fill in `DATABASE_URL`
   (see [docs/neon-setup.md](docs/neon-setup.md) for a free Postgres database, or point at any
   local Postgres instance). Full variable reference: [docs/environment-variables.md](docs/environment-variables.md).
3. **Run migrations**
   ```bash
   alembic upgrade head
   ```
4. **(Optional) seed demo data** — 10 demo products, 8 demo tutors, and the accounts behind them:
   ```bash
   python -m scripts.seed_data
   ```
5. **Run the server**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   Interactive API docs: http://localhost:8000/docs. Health check: http://localhost:8000/health.

More detail: [docs/installation.md](docs/installation.md) and [docs/development.md](docs/development.md).

## API endpoints

All routes except `/health` are prefixed with `/api/v1`.

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | — | Liveness check (unprefixed, used by Render) |
| GET | `/api/v1/health` | — | Same check, versioned path |
| POST | `/auth/register` | — | Create an account, sets auth cookie |
| POST | `/auth/login` | — | Log in, sets auth cookie |
| POST | `/auth/logout` | — | Clear auth cookie |
| GET | `/auth/me` | cookie | Current authenticated user |
| GET | `/products` | — | List all products |
| GET | `/tutors` | — | List all tutors |

Auth uses an `HttpOnly` JWT cookie (not a bearer token) — the frontend must send requests with
`credentials: 'include'`.

## Deployment

- [docs/render-deployment.md](docs/render-deployment.md) — deploying this backend to Render
- [docs/neon-setup.md](docs/neon-setup.md) — provisioning the Postgres database
- [docs/database-migrations.md](docs/database-migrations.md) — Alembic workflow
- [docs/vercel-deployment.md](docs/vercel-deployment.md) — deploying the frontend and wiring it to this API
