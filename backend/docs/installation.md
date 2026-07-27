# Installation

## Prerequisites

- Python 3.12+
- A PostgreSQL database (a free [Neon](https://neon.tech) project is the fastest way to get one —
  see [neon-setup.md](neon-setup.md) — or any local/Docker Postgres instance)

## Steps

1. Clone the repo and move into the backend directory:
   ```bash
   git clone <repo-url>
   cd University-Second-Hand-Market/backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   # Windows
   .venv\Scripts\activate
   # macOS/Linux
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy the environment template and fill in real values:
   ```bash
   cp .env.example .env
   ```
   At minimum, set `DATABASE_URL` (see [environment-variables.md](environment-variables.md) for
   the full list).
5. Apply database migrations:
   ```bash
   alembic upgrade head
   ```
6. (Optional) load demo data — 10 sample products, 8 sample tutors, and the demo accounts behind
   them:
   ```bash
   python -m scripts.seed_data
   ```
7. Start the server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

Verify it's running: `curl http://localhost:8000/health` should return `{"status":"ok"}`.

## Frontend

```bash
cd frontend/uni_marketplace
npm install
npm run dev
```

Make sure `frontend/uni_marketplace/.env.local` has `VITE_API_BASE_URL=http://localhost:8000/api/v1`
(or whatever port you ran uvicorn on).
