import { apiRequest } from '@/api/client'
import type { ApiSession, ApiSettings, ApiTask } from '@/api/types'
import { useLanguageStore } from '@/store/useLanguageStore'
import { useSessionStore } from '@/store/useSessionStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useTaskStore } from '@/store/useTaskStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useTimerStore } from '@/store/useTimerStore'
import { useUIStore } from '@/store/useUIStore'
import { parseJson, safeStorage } from '@/utils/storage'
import { sanitizeTasks, sanitizeSessions, sanitizeSettings } from '@/utils/guards'
import { loadLocalPreferences } from './localPreferences'
import { DEFAULT_SETTINGS } from '@/types/settings'
import type { Task } from '@/types/task'
import type { Session } from '@/types/session'

const backupKey = 'focusly-anonymous-backup'
const dataKeys = ['focusly-tasks', 'focusly-sessions', 'focusly-settings', 'focusly-language']

export function backupAnonymousData(): void {
  if (safeStorage.getItem(backupKey)) return
  const values = Object.fromEntries(dataKeys.map((key) => [key, safeStorage.getItem(key)]))
  safeStorage.setItem(backupKey, JSON.stringify(values))
}

export function restoreAnonymousData(): void {
  resetAccountData()
  const backup = parseJson<Record<string, string | null>>(safeStorage.getItem(backupKey))
  if (!backup) {
    safeStorage.removeItem(backupKey)
    useTaskStore.setState({ tasks: [] })
    useSessionStore.setState({ sessions: [] })
    useSettingsStore.setState({ ...DEFAULT_SETTINGS })
    useLanguageStore.setState({ language: 'en' })
    return
  }
  for (const key of dataKeys) {
    const value = backup[key]
    if (value == null) safeStorage.removeItem(key)
    else safeStorage.setItem(key, value)
  }
  const tasks = parseJson<{ state?: { tasks?: Task[] } }>(backup['focusly-tasks'])
  const sessions = parseJson<{ state?: { sessions?: Session[] } }>(backup['focusly-sessions'])
  const settings = parseJson<{ state?: Partial<typeof DEFAULT_SETTINGS> }>(backup['focusly-settings'])
  const language = parseJson<{ state?: { language?: string } }>(backup['focusly-language'])?.state?.language
  useTaskStore.setState({ tasks: sanitizeTasks(tasks?.state?.tasks) })
  useSessionStore.setState({ sessions: sanitizeSessions(sessions?.state?.sessions) })
  useSettingsStore.setState(sanitizeSettings(settings?.state))
  useLanguageStore.setState({ language: language === 'ru' || language === 'kk' ? language : 'en' })
  safeStorage.removeItem(backupKey)
  useTimerStore.getState().applyDurations()
}

export function resetAccountData(): void {
  useTaskStore.setState({ tasks: [] })
  useSessionStore.setState({ sessions: [] })
  useSettingsStore.setState({ ...DEFAULT_SETTINGS })
  useTimerStore.getState().setMode('focus')
  useTimerStore.setState({ activeTaskId: null, completedFocusInCycle: 0 })
  useUIStore.getState().exitFocusMode()
  useUIStore.getState().closeTaskModal()
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
  if (useAuthStore.getState().token !== token) return
  useTaskStore.setState({ tasks: tasks.map(mapTask) })
  useSessionStore.setState({ sessions: sessions.filter((session) => session.completed).map(mapSession) })
  useSettingsStore.setState({ ...loadLocalPreferences(settings.user_id), soundEnabled: settings.sound_enabled, focusModeAutoEnter: settings.auto_focus_mode, focusModeShowDndReminder: settings.show_dnd_reminder, focusModeAutoFullscreen: settings.auto_fullscreen, theme: settings.theme })
  useLanguageStore.setState({ language: settings.language })
  useTimerStore.getState().applyDurations()
}

