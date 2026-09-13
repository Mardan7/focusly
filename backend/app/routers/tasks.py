from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.auth.deps import CurrentUser, DbSession
from app.models import Task
from app.schemas.task import TaskCreate, TaskResponse, TaskUpdate

router = APIRouter(prefix="/tasks", tags=["tasks"])


def owned_task(db: DbSession, user_id: int, task_id: str) -> Task:
    task = db.scalar(select(Task).where(Task.id == task_id, Task.user_id == user_id))
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task


@router.get("", response_model=list[TaskResponse])
def list_tasks(user: CurrentUser, db: DbSession) -> list[Task]:
    return list(db.scalars(select(Task).where(Task.user_id == user.id).order_by(Task.created_at.desc())))


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(payload: TaskCreate, user: CurrentUser, db: DbSession) -> Task:
    task = Task(user_id=user.id, **payload.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(task_id: str, user: CurrentUser, db: DbSession) -> Task:
    return owned_task(db, user.id, task_id)


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(task_id: str, payload: TaskUpdate, user: CurrentUser, db: DbSession) -> Task:
    task = owned_task(db, user.id, task_id)
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(task, key, value)
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: str, user: CurrentUser, db: DbSession) -> None:
    task = owned_task(db, user.id, task_id)
    db.delete(task)
    db.commit()
