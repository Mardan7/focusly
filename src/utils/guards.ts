import type { Session } from '@/types/session'
import type { Settings } from '@/types/settings'
import { DEFAULT_SETTINGS } from '@/types/settings'
import type { Task, TaskCategory, TaskPriority } from '@/types/task'
import { TASK_CATEGORIES, TASK_PRIORITIES } from '@/types/task'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function isTask(value: unknown): value is Task {
  if (!isRecord(value)) return false
  return (
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.description === 'string' &&
    TASK_CATEGORIES.includes(value.category as TaskCategory) &&
    TASK_PRIORITIES.includes(value.priority as TaskPriority) &&
    typeof value.estimatedPomodoros === 'number' &&
    typeof value.completedPomodoros === 'number' &&
    typeof value.completed === 'boolean' &&
    (value.completedAt === null || typeof value.completedAt === 'string') &&
    typeof value.createdAt === 'string' &&
    (value.dueDate === null || typeof value.dueDate === 'string')
  )
}

export function isSession(value: unknown): value is Session {
  if (!isRecord(value)) return false
  return (
    typeof value.id === 'string' &&
    (value.taskId === null || typeof value.taskId === 'string') &&
    (value.type === 'focus' || value.type === 'shortBreak' || value.type === 'longBreak') &&
    typeof value.duration === 'number' &&
    typeof value.completedAt === 'string'
  )
}

export function sanitizeSettings(value: unknown): Settings {
  if (!isRecord(value)) return { ...DEFAULT_SETTINGS }
  const num = (key: keyof Settings, min: number, max: number, fallback: number) => {
    const raw = value[key]
    if (typeof raw !== 'number' || !Number.isFinite(raw)) return fallback
    return Math.min(max, Math.max(min, Math.round(raw)))
  }
  const bool = (key: keyof Settings, fallback: boolean) =>
    typeof value[key] === 'boolean' ? value[key] : fallback
  const theme = value.theme === 'light' || value.theme === 'system' || value.theme === 'dark' ? value.theme : 'dark'
  return {
    focusDuration: num('focusDuration', 1, 90, DEFAULT_SETTINGS.focusDuration),
    shortBreak: num('shortBreak', 1, 30, DEFAULT_SETTINGS.shortBreak),
    longBreak: num('longBreak', 1, 60, DEFAULT_SETTINGS.longBreak),
    longBreakInterval: num('longBreakInterval', 2, 12, DEFAULT_SETTINGS.longBreakInterval),
    autoStartFocus: bool('autoStartFocus', DEFAULT_SETTINGS.autoStartFocus),
    autoStartBreak: bool('autoStartBreak', DEFAULT_SETTINGS.autoStartBreak),
    soundEnabled: bool('soundEnabled', DEFAULT_SETTINGS.soundEnabled),
    desktopNotifications: bool('desktopNotifications', DEFAULT_SETTINGS.desktopNotifications),
    focusModeAutoEnter: bool('focusModeAutoEnter', DEFAULT_SETTINGS.focusModeAutoEnter),
    focusModeShowDndReminder: bool('focusModeShowDndReminder', DEFAULT_SETTINGS.focusModeShowDndReminder),
    focusModeAutoFullscreen: bool('focusModeAutoFullscreen', DEFAULT_SETTINGS.focusModeAutoFullscreen),
    theme,
  }
}

export function sanitizeTasks(value: unknown): Task[] {
  if (!Array.isArray(value)) return []
  return value.filter(isTask).map((task) => ({
    ...task,
    estimatedPomodoros: Math.max(1, Math.min(20, task.estimatedPomodoros)),
    completedPomodoros: Math.max(0, task.completedPomodoros),
    title: task.title.trim().slice(0, 120) || 'Untitled task',
  }))
}

export function sanitizeSessions(value: unknown): Session[] {
  if (!Array.isArray(value)) return []
  return value.filter(isSession).filter((session) => session.duration >= 0)
}
