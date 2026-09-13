from fastapi import APIRouter
from sqlalchemy import select

from app.auth.deps import CurrentUser, DbSession
from app.models import UserSettings
from app.schemas.settings import SettingsResponse, SettingsUpdate

router = APIRouter(prefix="/settings", tags=["settings"])


def get_or_create(user_id: int, db: DbSession) -> UserSettings:
    settings = db.scalar(select(UserSettings).where(UserSettings.user_id == user_id))
    if settings is None:
        settings = UserSettings(user_id=user_id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@router.get("", response_model=SettingsResponse)
def get_settings(user: CurrentUser, db: DbSession) -> UserSettings:
    return get_or_create(user.id, db)


@router.put("", response_model=SettingsResponse)
def update_settings(payload: SettingsUpdate, user: CurrentUser, db: DbSession) -> UserSettings:
    settings = get_or_create(user.id, db)
    for key, value in payload.model_dump().items():
        setattr(settings, key, value)
    db.commit()
    db.refresh(settings)
    return settings
