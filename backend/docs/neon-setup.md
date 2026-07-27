# Neon Postgres setup

[Neon](https://neon.tech) is a serverless PostgreSQL provider with a generous free tier — used here
for both local development and the Render deployment.

## 1. Create a project

1. Sign up at [neon.tech](https://neon.tech) and create a new project.
2. Note the default database name and branch (`main`) it creates for you.

## 2. Get a connection string

From the Neon dashboard, open **Connection Details** and copy the connection string. Neon shows a
standard `postgresql://` URL — rewrite the scheme to `postgresql+psycopg://` so SQLAlchemy uses the
psycopg3 driver this project depends on:

```
postgresql+psycopg://<user>:<password>@<endpoint>.neon.tech/<database>?sslmode=require
```

`sslmode=require` is mandatory — Neon rejects unencrypted connections.

Neon gives you two variants of the connection string:
- **Pooled** (via PgBouncer, hostname contains `-pooler`) — use this for the Render web service,
  since serverless/managed platforms open many short-lived connections and Neon's own connection
  limit is otherwise easy to exhaust.
- **Direct** — use this for running Alembic migrations locally, or anywhere you need session-level
  features the pooler doesn't support (not needed by this app's migrations, but useful to know).

## 3. Branching for development

Neon supports instant database branches (copy-on-write, not full data copies) — useful for testing
a migration or seed script without touching your main data:

```bash
# via the Neon CLI, or the dashboard's "Create branch" button
neonctl branches create --project-id <id> --name dev-test
```

Point `DATABASE_URL` at the branch's connection string, run `alembic upgrade head`, test, then
delete the branch when done.

## 4. Set `DATABASE_URL`

- Locally: put the connection string in `backend/.env`.
- On Render: set it as an environment variable in the service's dashboard (never commit it) — see
  [render-deployment.md](render-deployment.md).
