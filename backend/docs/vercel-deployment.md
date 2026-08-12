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

## 3. Update backend CORS and cookie settings

Once Vercel assigns your production domain (e.g. `https://campus-exchange.vercel.app`), add it to
the backend's `CORS_ORIGINS` env var on Render (comma-separated, see
[environment-variables.md](environment-variables.md)) and redeploy the backend. Without this, the
browser blocks every request from the deployed frontend with a CORS error — cookies won't be sent
cross-origin (`credentials: 'include'`) unless the exact origin is allow-listed.

The Vercel frontend and Render backend are on different domains, which makes every request
cross-site. Make sure Render has `COOKIE_SAMESITE=none` (in addition to `COOKIE_SECURE=true`) —
`render.yaml` already sets both. With `SameSite=Lax` (the local-dev default), the browser accepts
the cookie at login but then refuses to attach it to any later fetch/XHR call, so login looks like
it worked and then every authenticated action (creating a listing, etc.) fails with "Not
authenticated".

## 4. Verify

Open the deployed frontend, register an account, and confirm the request succeeds and the auth
cookie is set (check the browser's Application/Storage panel — it should be `HttpOnly`, `Secure`,
`SameSite=None`). Then try an authenticated action (e.g. publish a listing) — if it fails with
"Not authenticated" while login/registration succeeded, re-check `COOKIE_SAMESITE` and
`COOKIE_SECURE` on Render. If registration itself fails with a CORS error, double check step 3.
