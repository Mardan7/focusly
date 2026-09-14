import { apiRequest } from './client'
import type { ApiSession, ApiSettings, ApiTask } from './types'
import type { Task } from '@/types/task'

export async function pushTask(token: string, task: Task): Promise<void> {
  await apiRequest<ApiTask>('/tasks', { method: 'POST', body: JSON.stringify({ id: task.id, title: task.title, description: task.description, category: task.category, priority: task.priority, estimated_pomodoros: task.estimatedPomodoros, completed_pomodoros: task.completedPomodoros, completed: task.completed, due_date: task.dueDate }) }, token)
}

export async function updateRemoteTask(token: string, task: Task): Promise<void> {
  await apiRequest<ApiTask>(`/tasks/${encodeURIComponent(task.id)}`, { method: 'PUT', body: JSON.stringify({ title: task.title, description: task.description, category: task.category, priority: task.priority, estimated_pomodoros: task.estimatedPomodoros, completed_pomodoros: task.completedPomodoros, completed: task.completed, due_date: task.dueDate }) }, token)
}

export async function deleteRemoteTask(token: string, id: string): Promise<void> {
  await apiRequest<void>(`/tasks/${encodeURIComponent(id)}`, { method: 'DELETE' }, token)
}

export async function pushSession(token: string, session: { taskId: string | null; type: string; duration: number; completedAt: string }): Promise<void> {
  await apiRequest<ApiSession>('/sessions', { method: 'POST', body: JSON.stringify({ task_id: session.taskId, session_type: session.type, duration: session.duration, completed_at: session.completedAt, completed: true }) }, token)
}

export async function pushSettings(token: string, values: { language: string; theme: string; soundEnabled: boolean; focusModeAutoEnter: boolean; focusModeShowDndReminder: boolean; focusModeAutoFullscreen: boolean }): Promise<void> {
  await apiRequest<ApiSettings>('/settings', { method: 'PUT', body: JSON.stringify({ language: values.language, theme: values.theme, sound_enabled: values.soundEnabled, auto_focus_mode: values.focusModeAutoEnter, show_dnd_reminder: values.focusModeShowDndReminder, auto_fullscreen: values.focusModeAutoFullscreen }) }, token)
}
