# Database migrations (Alembic)

Migrations live in `backend/alembic/versions/`. `alembic/env.py` reads `DATABASE_URL` from
`app.core.config.settings` at runtime — never hardcode a connection string in `alembic.ini`.

## Common commands

Run all of these from `backend/`, with your virtualenv activated and `.env` pointing at the
database you want to migrate.

| Command | Purpose |
|---|---|
| `alembic upgrade head` | Apply all pending migrations. |
| `alembic downgrade -1` | Roll back the most recent migration. |
| `alembic current` | Show the currently applied revision. |
| `alembic history` | List all migrations in order. |
| `alembic revision --autogenerate -m "message"` | Generate a new migration from model changes. |

## Workflow for a schema change

1. Edit the SQLAlchemy model(s) in `app/models/`.
2. `alembic revision --autogenerate -m "add wishlist table"` (for example).
3. Open the generated file in `alembic/versions/` and read it top to bottom — confirm it does
   exactly what you intended (autogenerate can miss renames, detecting them as a drop+add instead,
   and doesn't generate data migrations).
4. `alembic upgrade head` against your local/dev database to test it.
5. Commit the migration file alongside the model change in the same PR.

## Initial schema

`alembic/versions/0001_initial_schema.py` creates the three core tables (`users`, `products`,
`tutors`) with their indexes and foreign keys, hand-written to match `app/models/` exactly. It's a
single migration rather than one per table since this is a fresh schema with no data to migrate
incrementally — every future schema change gets its own migration from this point on.

## Production (Render)

`render.yaml`'s start command runs `alembic upgrade head` before starting `uvicorn`, so every
deploy automatically brings the database schema in sync with the deployed code. No manual migration
step is needed when deploying.
