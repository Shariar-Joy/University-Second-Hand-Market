from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    APP_NAME: str = "Campus Exchange API"
    API_V1_PREFIX: str = "/api/v1"

    AWS_REGION: str = "us-east-1"
    USERS_TABLE: str = "campus_exchange_users"
    PRODUCTS_TABLE: str = "campus_exchange_products"
    TUTORS_TABLE: str = "campus_exchange_tutors"
    # Point this at a DynamoDB Local endpoint (e.g. http://localhost:8000) for offline
    # development/testing. Leave unset to talk to real AWS DynamoDB.
    DYNAMODB_ENDPOINT_URL: str | None = None

    # openssl rand -hex 32
    SECRET_KEY: str = "dev-secret-key-change-me"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    REMEMBER_ME_EXPIRE_MINUTES: int = 60 * 24 * 30  # 30 days

    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    COOKIE_NAME: str = "access_token"
    # Cookies over plain http only work with secure=False; flip this on once served over https.
    COOKIE_SECURE: bool = False


settings = Settings()
