import re
from collections.abc import Callable

_SLUG_INVALID_CHARS = re.compile(r"[^a-z0-9]+")


def slugify(value: str) -> str:
    slug = _SLUG_INVALID_CHARS.sub("-", value.lower()).strip("-")
    return slug or "listing"


def unique_slug(value: str, exists: Callable[[str], bool]) -> str:
    base = slugify(value)
    candidate = base
    suffix = 2
    while exists(candidate):
        candidate = f"{base}-{suffix}"
        suffix += 1
    return candidate
