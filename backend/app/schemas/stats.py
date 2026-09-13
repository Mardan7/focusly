from typing import Any
from pydantic import BaseModel


class StatsResponse(BaseModel):
    total_focus_seconds: int
    sessions: int
    completed_tasks: int
    current_streak: int
    best_streak: int
    daily_focus: list[dict[str, Any]]
    weekly_focus: list[dict[str, Any]]
    monthly_focus: list[dict[str, Any]]
