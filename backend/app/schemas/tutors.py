from datetime import datetime

from pydantic import BaseModel, ConfigDict, field_validator

_MAX_SUBJECTS = 8
_MAX_SUBJECT_LENGTH = 60
_MAX_PRICE_PER_CLASS = 100_000
_MAX_EXPERIENCE_YEARS = 60
_MAX_AVAILABILITY_LENGTH = 255
_MAX_BIO_LENGTH = 1000


def _validate_subjects(value: list[str]) -> list[str]:
    cleaned: list[str] = []
    seen: set[str] = set()
    for subject in value:
        stripped = subject.strip()
        if len(stripped) < 2 or len(stripped) > _MAX_SUBJECT_LENGTH:
            raise ValueError(f"Each subject must be 2-{_MAX_SUBJECT_LENGTH} characters.")
        key = stripped.lower()
        if key in seen:
            continue
        seen.add(key)
        cleaned.append(stripped)
    if not cleaned:
        raise ValueError("Add at least one subject you can tutor.")
    if len(cleaned) > _MAX_SUBJECTS:
        raise ValueError(f"List at most {_MAX_SUBJECTS} subjects.")
    return cleaned


def _validate_price_per_class(value: int) -> int:
    if value <= 0:
        raise ValueError("Price per class must be greater than 0.")
    if value > _MAX_PRICE_PER_CLASS:
        raise ValueError(f"Price per class must be {_MAX_PRICE_PER_CLASS} BDT or less.")
    return value


def _validate_availability(value: str) -> str:
    stripped = value.strip()
    if len(stripped) < 3:
        raise ValueError("Describe your availability (e.g. \"Weekday evenings, Saturday mornings\").")
    if len(stripped) > _MAX_AVAILABILITY_LENGTH:
        raise ValueError(f"Availability must be {_MAX_AVAILABILITY_LENGTH} characters or fewer.")
    return stripped


def _validate_department(value: str) -> str:
    stripped = value.strip()
    if len(stripped) < 2 or len(stripped) > 120:
        raise ValueError("Department must be 2-120 characters.")
    return stripped


def _validate_experience(value: int) -> int:
    if value < 0 or value > _MAX_EXPERIENCE_YEARS:
        raise ValueError(f"Years of experience must be between 0 and {_MAX_EXPERIENCE_YEARS}.")
    return value


def _validate_bio(value: str) -> str:
    stripped = value.strip()
    if len(stripped) > _MAX_BIO_LENGTH:
        raise ValueError(f"Bio must be {_MAX_BIO_LENGTH} characters or fewer.")
    return stripped


class TutorOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    name: str
    university: str
    subjects: list[str]
    price_per_class: int
    rating: float
    review_count: int
    user_id: int | None = None
    department: str | None = None
    experience: int | None = None
    availability: str | None = None
    bio: str | None = None
    created_at: datetime


class TutorCreateRequest(BaseModel):
    subjects: list[str]
    price_per_class: int
    availability: str
    department: str | None = None
    experience: int | None = None
    bio: str | None = None

    @field_validator("subjects")
    @classmethod
    def subjects_valid(cls, value: list[str]) -> list[str]:
        return _validate_subjects(value)

    @field_validator("price_per_class")
    @classmethod
    def price_per_class_valid(cls, value: int) -> int:
        return _validate_price_per_class(value)

    @field_validator("availability")
    @classmethod
    def availability_valid(cls, value: str) -> str:
        return _validate_availability(value)

    @field_validator("department")
    @classmethod
    def department_valid(cls, value: str | None) -> str | None:
        return _validate_department(value) if value is not None and value.strip() else None

    @field_validator("experience")
    @classmethod
    def experience_valid(cls, value: int | None) -> int | None:
        return _validate_experience(value) if value is not None else None

    @field_validator("bio")
    @classmethod
    def bio_valid(cls, value: str | None) -> str | None:
        return _validate_bio(value) if value is not None and value.strip() else None


class TutorUpdateRequest(BaseModel):
    subjects: list[str] | None = None
    price_per_class: int | None = None
    availability: str | None = None
    department: str | None = None
    experience: int | None = None
    bio: str | None = None

    @field_validator("subjects")
    @classmethod
    def subjects_valid(cls, value: list[str] | None) -> list[str] | None:
        return _validate_subjects(value) if value is not None else None

    @field_validator("price_per_class")
    @classmethod
    def price_per_class_valid(cls, value: int | None) -> int | None:
        return _validate_price_per_class(value) if value is not None else None

    @field_validator("availability")
    @classmethod
    def availability_valid(cls, value: str | None) -> str | None:
        return _validate_availability(value) if value is not None else None

    @field_validator("department")
    @classmethod
    def department_valid(cls, value: str | None) -> str | None:
        return _validate_department(value) if value is not None and value.strip() else None

    @field_validator("experience")
    @classmethod
    def experience_valid(cls, value: int | None) -> int | None:
        return _validate_experience(value) if value is not None else None

    @field_validator("bio")
    @classmethod
    def bio_valid(cls, value: str | None) -> str | None:
        return _validate_bio(value) if value is not None and value.strip() else None
