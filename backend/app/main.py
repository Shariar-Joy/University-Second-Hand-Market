import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app.api.routes.auth import router as auth_router
from app.api.routes.health import router as health_router
from app.api.routes.products import router as products_router
from app.api.routes.tutors import router as tutors_router
from app.api.routes.users import router as users_router
from app.api.routes.wishlist import router as wishlist_router
from app.core.config import INSECURE_DEFAULT_SECRET_KEY, settings
from app.middlewares.logging import log_requests
from app.middlewares.security_headers import add_security_headers

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.SECRET_KEY == INSECURE_DEFAULT_SECRET_KEY:
        logger.warning(
            "SECRET_KEY is still set to the insecure development default. "
            "Auth tokens can be forged by anyone who reads this codebase. "
            "Set a real SECRET_KEY before deploying (e.g. `openssl rand -hex 32`)."
        )
    yield


app = FastAPI(title=settings.APP_NAME, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.middleware("http")(log_requests)
app.middleware("http")(add_security_headers)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    first_error = exc.errors()[0]
    message = str(first_error["msg"]).removeprefix("Value error, ")
    return JSONResponse(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, content={"detail": message})


@app.exception_handler(IntegrityError)
async def integrity_error_handler(request: Request, exc: IntegrityError):
    logger.warning("Integrity error on %s %s: %s", request.method, request.url.path, exc)
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={"detail": "This record already exists or violates a constraint."},
    )


@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_error_handler(request: Request, exc: SQLAlchemyError):
    logger.exception("Database error on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Something went wrong. Please try again."},
    )


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


app.include_router(health_router)
app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(products_router, prefix=settings.API_V1_PREFIX)
app.include_router(tutors_router, prefix=settings.API_V1_PREFIX)
app.include_router(users_router, prefix=settings.API_V1_PREFIX)
app.include_router(wishlist_router, prefix=settings.API_V1_PREFIX)


@app.get("/api/v1/health")
def health_v1():
    return {"status": "ok"}
