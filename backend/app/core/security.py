import hashlib
import hmac
import os
from datetime import datetime, timedelta, timezone

import jwt

from app.core.config import settings

# OWASP's current minimum recommendation for PBKDF2-HMAC-SHA256 (2023 revision of the Password
# Storage Cheat Sheet). The count is embedded in every new hash (see hash_password) so it can be
# raised again later without invalidating existing password hashes.
PBKDF2_ITERATIONS = 600_000
# Hashes created before the iteration count was embedded in the stored string (2-part
# "salt$digest" format) used this fixed count. Kept only so verify_password can still check
# passwords set before this change; never used for newly created hashes.
_LEGACY_PBKDF2_ITERATIONS = 260_000


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PBKDF2_ITERATIONS)
    return f"{PBKDF2_ITERATIONS}${salt.hex()}${digest.hex()}"


def verify_password(password: str, stored_hash: str) -> bool:
    parts = stored_hash.split("$")
    if len(parts) == 3:
        iterations_str, salt_hex, digest_hex = parts
        try:
            iterations = int(iterations_str)
        except ValueError:
            return False
    elif len(parts) == 2:
        iterations = _LEGACY_PBKDF2_ITERATIONS
        salt_hex, digest_hex = parts
    else:
        return False

    try:
        salt = bytes.fromhex(salt_hex)
        expected = bytes.fromhex(digest_hex)
    except ValueError:
        return False

    candidate = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)
    return hmac.compare_digest(candidate, expected)


def create_access_token(user_id: int, expires_minutes: int) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "iat": now,
        "exp": now + timedelta(minutes=expires_minutes),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> int | None:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return int(payload["sub"])
    except (jwt.PyJWTError, KeyError, ValueError):
        return None


# Mirrors frontend/uni_marketplace/src/utils/passwordValidation.ts — keep both in sync.
def validate_password_strength(password: str) -> str | None:
    if len(password) < 8:
        return "Password must be at least 8 characters long."
    if not any(c.isupper() for c in password):
        return "Password must contain at least one uppercase letter."
    if not any(c.islower() for c in password):
        return "Password must contain at least one lowercase letter."
    if not any(c.isdigit() for c in password):
        return "Password must contain at least one number."
    if not any(not c.isalnum() for c in password):
        return "Password must contain at least one special character."
    return None
