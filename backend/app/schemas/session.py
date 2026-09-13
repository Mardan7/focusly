from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class SessionCreate(BaseModel):
    task_id: Optional[str] = None
    session_type: str = Field(pattern="^(focus|shortBreak|longBreak)$")
    duration: int = Field(gt=0, le=86400)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    completed: bool = True


class SessionResponse(SessionCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
