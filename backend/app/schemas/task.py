from app.schemas.dates import UtcDateTime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class TaskBase(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    title: str = Field(min_length=1, max_length=120)
    description: str = ""
    priority: Literal["Low", "Medium", "High"] = "Medium"
    category: Literal["Study", "Work", "Personal", "Coding", "Other"] = "Other"
    completed: bool = False
    estimated_pomodoros: int = Field(default=1, ge=1, le=20)
    completed_pomodoros: int = Field(default=0, ge=0)
    due_date: Optional[UtcDateTime] = None


class TaskCreate(TaskBase):
    id: Optional[str] = Field(default=None, max_length=64)


class TaskUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    title: Optional[str] = Field(default=None, min_length=1, max_length=120)
    description: Optional[str] = None
    priority: Optional[Literal["Low", "Medium", "High"]] = None
    category: Optional[Literal["Study", "Work", "Personal", "Coding", "Other"]] = None
    completed: Optional[bool] = None
    estimated_pomodoros: Optional[int] = Field(default=None, ge=1, le=20)
    completed_pomodoros: Optional[int] = Field(default=None, ge=0)
    due_date: Optional[UtcDateTime] = None

    @field_validator("title", "description", "priority", "category", "completed", "estimated_pomodoros", "completed_pomodoros")
    @classmethod
    def reject_null(cls, value):
        if value is None:
            raise ValueError("This field cannot be null")
        return value


class TaskResponse(TaskBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: int
    created_at: UtcDateTime
    updated_at: UtcDateTime
