import { apiRequest } from '@/api/client'
import type { ApiSession, ApiSettings, ApiTask } from '@/api/types'
import { useLanguageStore } from '@/store/useLanguageStore'
import { useSessionStore } from '@/store/useSessionStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useTaskStore } from '@/store/useTaskStore'
import { DEFAULT_SETTINGS } from '@/types/settings'
import type { Task } from '@/types/task'
import type { Session } from '@/types/session'

const backupKey = 'focusly-anonymous-backup'
const dataKeys = ['focusly-tasks', 'focusly-sessions', 'focusly-settings', 'focusly-language']

export function backupAnonymousData(): void {
  if (localStorage.getItem(backupKey)) return
  const values = Object.fromEntries(dataKeys.map((key) => [key, localStorage.getItem(key)]))
  localStorage.setItem(backupKey, JSON.stringify(values))
}

export function restoreAnonymousData(): void {
  const backup = JSON.parse(localStorage.getItem(backupKey) ?? 'null') as Record<string, string | null> | null
  if (!backup) {
    useTaskStore.setState({ tasks: [] })
    useSessionStore.setState({ sessions: [] })
    useSettingsStore.setState({ ...DEFAULT_SETTINGS })
    useLanguageStore.setState({ language: 'en' })
    return
  }
  for (const key of dataKeys) {
    const value = backup[key]
    if (value == null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  }
  const tasks = JSON.parse(backup['focusly-tasks'] ?? '{"state":{"tasks":[]}}') as { state?: { tasks?: Task[] } }
  const sessions = JSON.parse(backup['focusly-sessions'] ?? '{"state":{"sessions":[]}}') as { state?: { sessions?: Session[] } }
  const settings = JSON.parse(backup['focusly-settings'] ?? '{"state":{}}') as { state?: Partial<typeof DEFAULT_SETTINGS> }
  const language = JSON.parse(backup['focusly-language'] ?? '{"state":{"language":"en"}}') as { state?: { language?: 'en' | 'ru' | 'kk' } }
  useTaskStore.setState({ tasks: tasks.state?.tasks ?? [] })
  useSessionStore.setState({ sessions: sessions.state?.sessions ?? [] })
  useSettingsStore.setState({ ...DEFAULT_SETTINGS, ...settings.state })
  useLanguageStore.setState({ language: language.state?.language ?? 'en' })
}

function mapTask(task: ApiTask): Task {
  return { id: task.id, title: task.title, description: task.description, category: task.category, priority: task.priority, estimatedPomodoros: task.estimated_pomodoros, completedPomodoros: task.completed_pomodoros, completed: task.completed, completedAt: task.completed ? task.updated_at : null, createdAt: task.created_at, dueDate: task.due_date }
}

function mapSession(session: ApiSession): Session {
  return { id: String(session.id), taskId: session.task_id, type: session.session_type, duration: session.duration, completedAt: session.completed_at ?? session.started_at ?? new Date().toISOString() }
}

export async function hydrateRemoteData(token: string): Promise<void> {
  const [tasks, sessions, settings] = await Promise.all([
    apiRequest<ApiTask[]>('/tasks', {}, token),
    apiRequest<ApiSession[]>('/sessions', {}, token),
    apiRequest<ApiSettings>('/settings', {}, token),
  ])
  useTaskStore.setState({ tasks: tasks.map(mapTask) })
  useSessionStore.setState({ sessions: sessions.map(mapSession) })
  useSettingsStore.setState({ focusDuration: DEFAULT_SETTINGS.focusDuration, shortBreak: DEFAULT_SETTINGS.shortBreak, longBreak: DEFAULT_SETTINGS.longBreak, longBreakInterval: DEFAULT_SETTINGS.longBreakInterval, autoStartFocus: DEFAULT_SETTINGS.autoStartFocus, autoStartBreak: DEFAULT_SETTINGS.autoStartBreak, soundEnabled: settings.sound_enabled, desktopNotifications: DEFAULT_SETTINGS.desktopNotifications, focusModeAutoEnter: settings.auto_focus_mode, focusModeShowDndReminder: settings.show_dnd_reminder, focusModeAutoFullscreen: settings.auto_fullscreen, theme: settings.theme })
  useLanguageStore.setState({ language: settings.language })
}

