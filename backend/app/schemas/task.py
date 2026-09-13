from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class TaskBase(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    description: str = ""
    priority: str = "Medium"
    category: str = "Other"
    completed: bool = False
    estimated_pomodoros: int = Field(default=1, ge=1, le=20)
    completed_pomodoros: int = Field(default=0, ge=0)
    due_date: Optional[datetime] = None


class TaskCreate(TaskBase):
    id: Optional[str] = Field(default=None, max_length=64)


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=120)
    description: Optional[str] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    completed: Optional[bool] = None
    estimated_pomodoros: Optional[int] = Field(default=None, ge=1, le=20)
    completed_pomodoros: Optional[int] = Field(default=None, ge=0)
    due_date: Optional[datetime] = None


class TaskResponse(TaskBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: int
    created_at: datetime
    updated_at: datetime
