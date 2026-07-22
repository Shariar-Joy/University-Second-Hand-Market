# Deploying to AWS Lambda

This documents how to package and deploy the backend to AWS Lambda behind API
Gateway. **Nothing has been deployed** — this is a guide for when you're ready
to do it yourself (via the AWS Console, CLI, SAM, CDK, or Terraform).

## What changed for Lambda compatibility

- **`lambda_handler.py`** (new, at `backend/lambda_handler.py`) — wraps the
  existing FastAPI `app` from `app/main.py` with [Mangum](https://github.com/Kludex/mangum),
  which translates API Gateway events into ASGI requests and back. The FastAPI
  app itself, its routes, and all business logic are untouched.
- **`app/db/dynamodb.py`** — added a module-level guard around `init_db()`.
  Mangum re-runs the ASGI lifespan (startup *and* shutdown) on **every single
  invocation**, not just cold starts — there's no reliable "container
  shutting down" signal in Lambda's execution model, so Mangum conservatively
  repeats the cycle each time. Without the guard, every request would re-check
  whether all 3 DynamoDB tables exist (and re-scan for seed data) before doing
  any real work. The guard makes that happen once per warm container instead
  of once per request; behavior for local `uvicorn` runs is unchanged (it only
  ever called this once anyway).
- **`app/db/dynamodb.py`** — table creation now tolerates
  `ResourceInUseException`. On a brand-new deployment, API Gateway can send
  several concurrent requests to freshly-started (cold) Lambda containers at
  once; more than one might race to create the same table. DynamoDB rejects
  the losers of that race with `ResourceInUseException` — this is now caught
  and treated as "someone else is creating it, just wait for it to become
  active" instead of crashing that request.
- **`app/main.py`** — `logging.basicConfig(..., force=True)`. AWS Lambda's
  Python runtime pre-attaches a handler to the root logger before your code
  runs, so a plain `basicConfig()` call is silently a no-op there; `force=True`
  makes our log format actually apply. No behavior change for local runs.
- **`requirements-lambda.txt`** (new) — a trimmed dependency list for the
  Lambda deployment package (see below). The existing `requirements.txt` is
  unchanged in purpose (local dev) and just gained `mangum` so you can also
  run/test `lambda_handler.py` locally.

Nothing about the API's endpoints, request/response shapes, authentication
flow, or cookie behavior changed. Verified locally (see "Testing without
deploying" below): registration, login, logout, `/auth/me`, duplicate email
detection, `/products`, `/tutors`, and cookie set/clear all work identically
when invoked through `lambda_handler.handler(event, context)` with synthetic
API Gateway events, exactly as they do through `uvicorn`.

## 1. Install Mangum

Already done in this repo — `mangum==0.21.0` is in both `requirements.txt`
(for local use) and `requirements-lambda.txt` (for deployment).

## 2. The Lambda handler

```python
# backend/lambda_handler.py
handler = Mangum(app, lifespan="auto", api_gateway_base_path=_base_path or None)
```

When you configure the Lambda function, set the **handler** to:

```
lambda_handler.handler
```

## 3. Packaging (zip-based deployment)

From `backend/`:

```bash
mkdir -p build/package
pip install -r requirements-lambda.txt -t build/package
cp -r app build/package/app
cp lambda_handler.py build/package/lambda_handler.py
cd build/package
zip -r ../function.zip .
cd ../..
```

This produces `backend/build/function.zip` containing:

```
function.zip
├── app/                  (your FastAPI application, unchanged)
├── lambda_handler.py
├── fastapi/, pydantic/, boto3/, mangum/, ...   (from requirements-lambda.txt)
```

Do **not** include `requirements.txt`'s full dependency set (uvicorn and its
extras) — `requirements-lambda.txt` deliberately excludes them since they're
never imported by the app itself, only used to run the local dev server.
Also do not include `.env`, `app.db`, or anything under `build/` itself in
future zips (keep the package minimal).

**Alternative: container image.** If you'd rather deploy as a container
(useful if the zip approach ever exceeds Lambda's 250MB unzipped limit), use
the `public.ecr.aws/lambda/python:3.13` base image, `COPY` in `app/`,
`lambda_handler.py`, and `requirements-lambda.txt`, `RUN pip install -r
requirements-lambda.txt`, and set `CMD ["lambda_handler.handler"]`. Not set up
in this repo since zip packaging is simpler for this project's size.

## 4. IAM role and permissions

The Lambda execution role needs:

- `AWSLambdaBasicExecutionRole` (managed policy) — CloudWatch Logs.
- DynamoDB access, scoped to the three tables and their indexes:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:Query",
        "dynamodb:Scan",
        "dynamodb:DescribeTable",
        "dynamodb:CreateTable"
      ],
      "Resource": [
        "arn:aws:dynamodb:*:*:table/campus_exchange_users",
        "arn:aws:dynamodb:*:*:table/campus_exchange_users/index/*",
        "arn:aws:dynamodb:*:*:table/campus_exchange_products",
        "arn:aws:dynamodb:*:*:table/campus_exchange_tutors"
      ]
    }
  ]
}
```

**Recommended for production:** provision the three DynamoDB tables yourself
ahead of time (Terraform/CloudFormation/CDK — see table schemas in
`app/db/dynamodb.py`'s `_ensure_users_table`/`_ensure_simple_table`), then
drop `dynamodb:CreateTable` from the policy above. The app's own
auto-create-on-first-use logic is a convenience fallback (mirroring how the
original SQLite version auto-created its schema); it works fine either way,
but least-privilege IAM is better handled by not granting `CreateTable` to a
request-serving role once your tables are provisioned by infrastructure code.

## 5. Environment variables (secrets, not hardcoded)

Set these on the Lambda function (console → Configuration → Environment
variables, or your IaC tool):

| Variable | Value | Notes |
|---|---|---|
| `SECRET_KEY` | a real random secret | **Must override** — the code default (`dev-secret-key-change-me`) is dev-only. Generate with `openssl rand -hex 32`. |
| `USERS_TABLE` | `campus_exchange_users` | or your chosen name |
| `PRODUCTS_TABLE` | `campus_exchange_products` | |
| `TUTORS_TABLE` | `campus_exchange_tutors` | |
| `COOKIE_SECURE` | `true` | API Gateway is always HTTPS, so cookies should require it in production |
| `CORS_ORIGINS` | `["https://your-frontend-domain"]` | JSON array as a string, matching `.env` syntax |
| `API_GATEWAY_BASE_PATH` | only if needed | see step 6 |

**Do not set `AWS_REGION` yourself.** It's one of a handful of environment
variable names [reserved by the Lambda runtime](https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html#configuration-envvars-runtime)
— Lambda injects it automatically to match the function's deployed region,
and attempting to set it yourself will make the *entire* environment variable
update request fail with a "reserved keys" error. The app already reads
whatever `AWS_REGION` is present in the environment, so this works
automatically with no configuration.

**Do not set `DYNAMODB_ENDPOINT_URL`** — leave it unset in Lambda so the app
talks to real AWS DynamoDB via the Lambda execution role's credentials
(automatically provided by the runtime — no access keys to manage). It's only
meant for local development against DynamoDB Local.

## 6. API Gateway

**Recommended: HTTP API (API Gateway v2) with the `$default` stage.**

1. Create an HTTP API.
2. Add an integration pointing at this Lambda function.
3. Add a route: `ANY /{proxy+}` → that integration (a catch-all, so every
   path/method reaches FastAPI, which does its own routing).
4. Deploy to the `$default` stage (auto-deployed, no stage name in the URL).
   With `$default`, the path Lambda receives is exactly the path the client
   requested — `/api/v1/products` stays `/api/v1/products` — so leave
   `API_GATEWAY_BASE_PATH` unset.

**If you use a REST API (v1), or an HTTP API with a named (non-`$default`)
stage instead:** the stage name gets prepended to the path (e.g.
`/prod/api/v1/products`). Set `API_GATEWAY_BASE_PATH=/prod` (or whatever your
stage is called) so Mangum strips it before FastAPI sees the path — otherwise
every route will 404.

**CORS:** handled entirely by the existing `CORSMiddleware` in `app/main.py`
(unchanged). Don't also enable API Gateway's own CORS configuration — the two
would either double up or conflict on the `Access-Control-*` headers.

**Cookies:** work natively — HTTP API's payload format 2.0 (the default)
represents `Set-Cookie` via a dedicated `cookies` array in both the request
and response, which Mangum populates/reads automatically. This was verified
locally (see below): register/login return the `access_token` cookie via
this mechanism, and logout correctly returns the cookie-clearing header the
same way. If you use a REST API (payload format 1.0) instead, standard
`Set-Cookie` response headers are used instead — also handled by Mangum
automatically, no code changes needed either way.

## 7. Testing without deploying

You can exercise the exact Lambda code path — `lambda_handler.handler(event,
context)` — entirely offline, with no AWS involved, by constructing a
synthetic API Gateway event and calling the handler directly in a Python
shell or script:

```python
import lambda_handler

event = {
    "version": "2.0",
    "routeKey": "$default",
    "rawPath": "/api/v1/health",
    "rawQueryString": "",
    "headers": {},
    "requestContext": {"http": {"method": "GET", "path": "/api/v1/health"}},
    "isBase64Encoded": False,
}
print(lambda_handler.handler(event, None))
```

This is exactly how this migration was verified before writing this doc —
including registration, login, logout, `/auth/me`, duplicate-email detection,
and cookie set/clear — all against a local DynamoDB Local instance, with zero
real AWS calls.

## 8. Local development is unaffected

`requirements.txt` (not `requirements-lambda.txt`) still includes `uvicorn`
for local development. Nothing about running the app locally changes:

```
cd backend
.venv/Scripts/python.exe -m uvicorn app.main:app --reload --port 8000
```

`lambda_handler.py` is simply never imported or used in that path.
