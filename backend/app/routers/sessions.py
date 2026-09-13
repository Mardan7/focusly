from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.auth.deps import CurrentUser, DbSession
from app.models import FocusSession, Task
from app.schemas.session import SessionCreate, SessionResponse

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.get("", response_model=list[SessionResponse])
def list_sessions(user: CurrentUser, db: DbSession) -> list[FocusSession]:
    return list(db.scalars(select(FocusSession).where(FocusSession.user_id == user.id).order_by(FocusSession.completed_at.desc())))


@router.post("", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
def create_session(payload: SessionCreate, user: CurrentUser, db: DbSession) -> FocusSession:
    if payload.task_id is not None and db.scalar(select(Task).where(Task.id == payload.task_id, Task.user_id == user.id)) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    session = FocusSession(user_id=user.id, **payload.model_dump())
    db.add(session)
    db.commit()
    db.refresh(session)
    return session
