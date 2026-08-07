from typing import Annotated

from pydantic import field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict

# Exposed so callers (e.g. the startup warning in app/main.py) can detect this exact default
# without duplicating the literal string.
INSECURE_DEFAULT_SECRET_KEY = "dev-secret-key-change-me"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    APP_NAME: str = "Campus Exchange API"
    API_V1_PREFIX: str = "/api/v1"

    # PostgreSQL DSN, e.g. postgresql+psycopg://user:password@host.neon.tech/db?sslmode=require
    DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@localhost:5432/campus_exchange"

    # openssl rand -hex 32
    SECRET_KEY: str = INSECURE_DEFAULT_SECRET_KEY
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    REMEMBER_ME_EXPIRE_MINUTES: int = 60 * 24 * 30  # 30 days

    # NoDecode: pydantic-settings would otherwise try to JSON-parse this from the environment
    # before our validator runs. Render's env var UI is a flat text box, so this accepts a plain
    # comma-separated string (CORS_ORIGINS=https://a.com,https://b.com) instead.
    CORS_ORIGINS: Annotated[list[str], NoDecode] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    COOKIE_NAME: str = "access_token"
    # Cookies over plain http only work with secure=False; flip this on once served over https.
    COOKIE_SECURE: bool = False

    # Avatar image storage (Cloudinary). Empty by default so importing config without these set
    # doesn't crash local dev -- the upload call itself fails loudly if left unconfigured.
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def _split_csv_origins(cls, value: object) -> object:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value


settings = Settings()
