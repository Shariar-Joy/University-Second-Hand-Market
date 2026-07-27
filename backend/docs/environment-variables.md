# Environment variables

All variables are read via `app/core/config.py` (`pydantic-settings`), which loads `backend/.env`
locally and the real process environment in production (Render). Copy `backend/.env.example` to
`backend/.env` to get started.

| Variable | Required | Example | Description |
|---|---|---|---|
| `DATABASE_URL` | Yes | `postgresql+psycopg://user:pass@ep-xxx.neon.tech/db?sslmode=require` | PostgreSQL connection string. Must use the `postgresql+psycopg://` scheme (psycopg3). `sslmode=require` is mandatory for Neon. |
| `SECRET_KEY` | Yes (in production) | output of `openssl rand -hex 32` | Signs JWT auth tokens. If left at the insecure default, the app logs a startup warning — anyone who reads this repo could forge tokens. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No (default `1440`) | `1440` | Auth cookie lifetime in minutes for a normal login (1 day default). |
| `REMEMBER_ME_EXPIRE_MINUTES` | No (default `43200`) | `43200` | Auth cookie lifetime when `remember_me: true` is passed at login (30 days default). |
| `CORS_ORIGINS` | Yes | `http://localhost:5173,https://campus-exchange.vercel.app` | Comma-separated list of frontend origins allowed to call this API with credentials. |
| `COOKIE_SECURE` | No (default `false`) | `true` | Set to `true` in production (HTTPS) so the auth cookie only travels over TLS. Must be `false` for plain-`http://localhost` development. |

Not configurable via env (fixed in code, `app/core/config.py`): `APP_NAME`, `API_V1_PREFIX`
(`/api/v1`), `JWT_ALGORITHM` (`HS256`), `COOKIE_NAME` (`access_token`).

## Frontend (`frontend/uni_marketplace/.env.local`)

| Variable | Example | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8000/api/v1` (dev) / `https://campus-exchange-api.onrender.com/api/v1` (prod) | Base URL the frontend calls. Must point at the versioned `/api/v1` path, not the bare API root. |
