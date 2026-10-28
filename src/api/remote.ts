import { apiRequest } from './client'
import { useToastStore } from '@/store/useToastStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useLanguageStore } from '@/store/useLanguageStore'
import { translate } from '@/i18n/core'
import type { ApiSession, ApiSettings, ApiTask } from './types'
import type { Task } from '@/types/task'

// Preserve write order when a task is created, edited and completed quickly.
let writes: Promise<unknown> = Promise.resolve()

async function send<T>(path: string, options: RequestInit, token: string): Promise<boolean> {
  const request = writes.then(() => apiRequest<T>(path, options, token))
  writes = request.catch(() => undefined)
  try {
    await request
    return useAuthStore.getState().token === token
  } catch {
    if (useAuthStore.getState().token === token) {
      useToastStore.getState().push({ kind: 'error', title: translate(useLanguageStore.getState().language, 'sync.failed') })
    }
    return false
  }
}

export async function pushTask(token: string, task: Task): Promise<boolean> {
  return send<ApiTask>('/tasks', { method: 'POST', body: JSON.stringify({ id: task.id, title: task.title, description: task.description, category: task.category, priority: task.priority, estimated_pomodoros: task.estimatedPomodoros, completed_pomodoros: task.completedPomodoros, completed: task.completed, due_date: task.dueDate }) }, token)
}

export async function updateRemoteTask(token: string, task: Task): Promise<boolean> {
  return send<ApiTask>(`/tasks/${encodeURIComponent(task.id)}`, { method: 'PUT', body: JSON.stringify({ title: task.title, description: task.description, category: task.category, priority: task.priority, estimated_pomodoros: task.estimatedPomodoros, completed_pomodoros: task.completedPomodoros, completed: task.completed, due_date: task.dueDate }) }, token)
}

export async function deleteRemoteTask(token: string, id: string): Promise<boolean> {
  return send<void>(`/tasks/${encodeURIComponent(id)}`, { method: 'DELETE' }, token)
}

export async function pushSession(token: string, session: { taskId: string | null; type: string; duration: number; completedAt: string }): Promise<boolean> {
  return send<ApiSession>('/sessions', { method: 'POST', body: JSON.stringify({ task_id: session.taskId, session_type: session.type, duration: session.duration, completed_at: session.completedAt, completed: true }) }, token)
}

export async function pushSettings(token: string, values: { language: string; theme: string; soundEnabled: boolean; focusModeAutoEnter: boolean; focusModeShowDndReminder: boolean; focusModeAutoFullscreen: boolean }): Promise<boolean> {
  return send<ApiSettings>('/settings', { method: 'PUT', body: JSON.stringify({ language: values.language, theme: values.theme, sound_enabled: values.soundEnabled, auto_focus_mode: values.focusModeAutoEnter, show_dnd_reminder: values.focusModeShowDndReminder, auto_fullscreen: values.focusModeAutoFullscreen }) }, token)
}
