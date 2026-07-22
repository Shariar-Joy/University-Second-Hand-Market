import logging
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes.auth import router as auth_router
from app.api.routes.products import router as products_router
from app.api.routes.tutors import router as tutors_router
from app.core.config import INSECURE_DEFAULT_SECRET_KEY, settings
from app.db.dynamodb import DynamoDBError, init_db

# force=True: AWS Lambda's Python runtime pre-attaches a handler to the root logger before
# user code runs, so a plain basicConfig() call would otherwise be a silent no-op there.
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s", force=True)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.SECRET_KEY == INSECURE_DEFAULT_SECRET_KEY:
        logger.warning(
            "SECRET_KEY is still set to the insecure development default. "
            "Auth tokens can be forged by anyone who reads this codebase. "
            "Set a real SECRET_KEY before deploying (e.g. `openssl rand -hex 32`)."
        )
    init_db()
    yield


app = FastAPI(title=settings.APP_NAME, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    # uvicorn logs every request like this automatically when running locally, but Mangum (the
    # AWS Lambda adapter) has no equivalent access-log layer -- this middleware gives Lambda's
    # CloudWatch logs the same per-request visibility local dev already gets for free. Only
    # method/path/status/duration are logged; no headers, bodies, or cookies.
    start = time.perf_counter()
    response = await call_next(request)
    duration_ms = (time.perf_counter() - start) * 1000
    logger.info("%s %s -> %d (%.1fms)", request.method, request.url.path, response.status_code, duration_ms)
    return response


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "same-origin"
    return response


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    first_error = exc.errors()[0]
    message = str(first_error["msg"]).removeprefix("Value error, ")
    return JSONResponse(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, content={"detail": message})


@app.exception_handler(DynamoDBError)
async def dynamodb_exception_handler(request: Request, exc: DynamoDBError):
    return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content={"detail": str(exc)})


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    # Without this, an unexpected bug (anything not already caught above) would fall through to
    # Starlette's default 500 handler, which returns a plain-text body -- inconsistent with every
    # other error response in this API, which is always JSON `{"detail": ...}`.
    logger.exception("Unhandled exception on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Something went wrong. Please try again."},
    )


app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(products_router, prefix=settings.API_V1_PREFIX)
app.include_router(tutors_router, prefix=settings.API_V1_PREFIX)


@app.get("/api/v1/health")
def health():
    return {"status": "ok"}
