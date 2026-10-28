import base64
import binascii

from app.schemas.dates import UtcDateTime
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

    @field_validator("name", mode="before")
    @classmethod
    def name_must_have_text(cls, value: str) -> str:
        if not isinstance(value, str):
            raise ValueError("Name must be text")
        value = value.strip()
        if not value:
            raise ValueError("Name is required")
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class ProfileUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str = Field(min_length=2, max_length=120)


class AvatarUpdate(BaseModel):
    avatar: str | None = Field(max_length=180000)

    @field_validator("avatar")
    @classmethod
    def valid_avatar(cls, value: str | None) -> str | None:
        if value is None:
            return value
        prefix = "data:image/jpeg;base64,"
        if not value.startswith(prefix):
            raise ValueError("Avatar must be a JPEG image")
        try:
            data = base64.b64decode(value[len(prefix):], validate=True)
        except (ValueError, binascii.Error) as error:
            raise ValueError("Invalid image encoding") from error
        if not data.startswith(b"\xff\xd8\xff") or not data.endswith(b"\xff\xd9"):
            raise ValueError("Invalid JPEG image")
        return value


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=1, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    created_at: UtcDateTime
    avatar: str | None = None


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
