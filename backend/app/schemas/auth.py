import re

from pydantic import BaseModel, EmailStr, field_validator, model_validator

# Mirrors frontend/uni_marketplace/src/utils/emailValidation.ts — keep both in sync.
PERSONAL_EMAIL_DOMAINS = {
    "gmail.com",
    "yahoo.com",
    "hotmail.com",
    "outlook.com",
    "icloud.com",
    "aol.com",
    "protonmail.com",
    "live.com",
    "mail.com",
}

USERNAME_PATTERN = re.compile(r"^[a-zA-Z0-9_.]{3,30}$")


def check_university_email(email: str) -> str:
    domain = email.split("@")[-1].lower()
    if domain in PERSONAL_EMAIL_DOMAINS:
        raise ValueError("Please use your university email, not a personal email provider.")
    return email


class RegisterRequest(BaseModel):
    full_name: str
    username: str
    email: EmailStr
    university: str
    department: str
    student_id: str
    phone: str | None = None
    password: str
    confirm_password: str

    @field_validator("full_name")
    @classmethod
    def full_name_must_be_present(cls, value: str) -> str:
        if len(value.strip()) < 2:
            raise ValueError("Enter your full name.")
        return value.strip()

    @field_validator("username")
    @classmethod
    def username_format(cls, value: str) -> str:
        if not USERNAME_PATTERN.match(value):
            raise ValueError("Username must be 3-30 characters: letters, numbers, dots, or underscores.")
        return value

    @field_validator("email")
    @classmethod
    def email_must_be_university(cls, value: EmailStr) -> EmailStr:
        check_university_email(value)
        return value

    @field_validator("university")
    @classmethod
    def university_required(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Select your university.")
        return value

    @field_validator("department")
    @classmethod
    def department_required(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Enter your department.")
        return value

    @field_validator("student_id")
    @classmethod
    def student_id_required(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Enter your student ID.")
        return value

    @model_validator(mode="after")
    def passwords_match(self) -> "RegisterRequest":
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match.")
        return self


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    remember_me: bool = False


class UserOut(BaseModel):
    id: int
    full_name: str
    username: str
    email: str
    university: str
    department: str
    student_id: str
    phone: str | None = None
    created_at: str


class AuthResponse(BaseModel):
    user: UserOut
