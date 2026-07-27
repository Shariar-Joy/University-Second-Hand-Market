# Vercel deployment (frontend)

The frontend (`frontend/uni_marketplace/`) needs no code changes to deploy — only environment
variables.

## 1. Import the project

In the Vercel dashboard, **Add New > Project**, import this repo, and set:
- **Root directory**: `frontend/uni_marketplace`
- **Framework preset**: Vite (auto-detected)
- **Build command**: `npm run build` (default)
- **Output directory**: `dist` (default)

## 2. Set environment variables

| Variable | Value |
|---|---|
| `VITE_API_BASE_URL` | `https://<your-render-service>.onrender.com/api/v1` |

Set this under the Vercel project's **Settings > Environment Variables** for the Production (and
Preview, if you want preview deploys to hit the same backend) environment. Never leave it pointing
at `localhost` in a deployed environment.

## 3. Update backend CORS

Once Vercel assigns your production domain (e.g. `https://campus-exchange.vercel.app`), add it to
the backend's `CORS_ORIGINS` env var on Render (comma-separated, see
[environment-variables.md](environment-variables.md)) and redeploy the backend. Without this, the
browser blocks every request from the deployed frontend with a CORS error — cookies won't be sent
cross-origin (`credentials: 'include'`) unless the exact origin is allow-listed.

## 4. Verify

Open the deployed frontend, register an account, and confirm the request succeeds and the auth
cookie is set (check the browser's Application/Storage panel — it should be `HttpOnly`, `Secure`,
`SameSite=Lax`). If registration fails with a CORS error, double check step 3.
