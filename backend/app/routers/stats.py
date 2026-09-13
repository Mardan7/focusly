from collections import defaultdict
from datetime import date, datetime, timedelta, timezone

from fastapi import APIRouter
from sqlalchemy import func, select

from app.auth.deps import CurrentUser, DbSession
from app.models import FocusSession, Task
from app.schemas.stats import StatsResponse

router = APIRouter(prefix="/stats", tags=["stats"])


def session_day(value: datetime) -> date:
    if value.tzinfo is None:
        return value.date()
    return value.astimezone(timezone.utc).date()


def streaks(sessions: list[FocusSession]) -> tuple[int, int]:
    days = sorted({session_day(item.completed_at) for item in sessions if item.session_type == "focus" and item.completed})
    if not days:
        return 0, 0
    day_set = set(days)
    today = datetime.now(timezone.utc).date()
    current = 0
    cursor = today
    if cursor not in day_set:
        cursor -= timedelta(days=1)
    while cursor in day_set:
        current += 1
        cursor -= timedelta(days=1)
    best = run = 1
    for previous, current_day in zip(days, days[1:]):
        if current_day == previous + timedelta(days=1):
            run += 1
            best = max(best, run)
        else:
            run = 1
    return current, max(best, current)


@router.get("", response_model=StatsResponse)
def stats(user: CurrentUser, db: DbSession) -> StatsResponse:
    sessions = list(db.scalars(select(FocusSession).where(FocusSession.user_id == user.id, FocusSession.completed.is_(True))))
    tasks_count = db.scalar(select(func.count()).select_from(Task).where(Task.user_id == user.id, Task.completed.is_(True))) or 0
    daily: defaultdict[str, int] = defaultdict(int)
    weekly: defaultdict[str, int] = defaultdict(int)
    monthly: defaultdict[str, int] = defaultdict(int)
    today = datetime.now(timezone.utc).date()
    for item in sessions:
        if item.session_type != "focus":
            continue
        day = session_day(item.completed_at)
        daily[day.isoformat()] += item.duration
        if day >= today - timedelta(days=6):
            weekly[day.isoformat()] += item.duration
        if day >= today - timedelta(days=29):
            monthly[day.isoformat()] += item.duration
    current, best = streaks(sessions)
    return StatsResponse(
        total_focus_seconds=sum(item.duration for item in sessions if item.session_type == "focus"),
        sessions=sum(1 for item in sessions if item.session_type == "focus"),
        completed_tasks=tasks_count,
        current_streak=current,
        best_streak=best,
        daily_focus=[{"date": key, "seconds": value} for key, value in sorted(daily.items())],
        weekly_focus=[{"date": key, "seconds": value} for key, value in sorted(weekly.items())],
        monthly_focus=[{"date": key, "seconds": value} for key, value in sorted(monthly.items())],
    )
