from pydantic import BaseModel, ConfigDict, Field


class SettingsUpdate(BaseModel):
    language: str = Field(default="en", pattern="^(en|ru|kk)$")
    theme: str = Field(default="dark", pattern="^(dark|light|system)$")
    sound_enabled: bool = True
    auto_focus_mode: bool = False
    show_dnd_reminder: bool = True
    auto_fullscreen: bool = False


class SettingsResponse(SettingsUpdate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
