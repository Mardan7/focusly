import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { Task, TaskCategory, TaskPriority } from '@/types/task'
import { sanitizeTasks } from '@/utils/guards'
import { safeStorage } from '@/utils/storage'
import { useLanguageStore } from './useLanguageStore'
import { useToastStore } from './useToastStore'
import { translate } from '@/i18n/core'
import { deleteRemoteTask, pushTask, updateRemoteTask } from '@/api/remote'
import { useAuthStore } from './useAuthStore'

interface TaskState {
  tasks: Task[]
  addTask: (input: Omit<Task, 'id' | 'completed' | 'completedAt' | 'createdAt' | 'completedPomodoros'>) => Promise<Task | undefined>
  updateTask: (id: string, patch: Partial<Omit<Task, 'id' | 'createdAt'>>) => Promise<boolean>
  deleteTask: (id: string) => Promise<void>
  toggleTask: (id: string) => Promise<void>
  incrementPomodoro: (id: string) => Promise<void>
  clearTasks: () => void
}

const legacyDemoTaskIds = new Set(['task-portfolio', 'task-typescript', 'task-auth', 'task-algo', 'task-linux', 'task-personal'])

function createId(): string {
  return crypto.randomUUID()
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      addTask: async (input) => {
        const task: Task = {
          id: createId(),
          title: input.title.trim(),
          description: input.description.trim(),
          category: input.category,
          priority: input.priority,
          estimatedPomodoros: Math.max(1, Math.min(20, input.estimatedPomodoros)),
          completedPomodoros: 0,
          completed: false,
          completedAt: null,
          createdAt: new Date().toISOString(),
          dueDate: input.dueDate,
        }
        const token = useAuthStore.getState().token
        if (token && !(await pushTask(token, task))) return
        set({ tasks: [task, ...get().tasks] })
        useToastStore.getState().push({ kind: 'success', title: translate(useLanguageStore.getState().language, 'tasks.created') })
        return task
      },
      updateTask: async (id, patch) => {
        const current = get().tasks.find((task) => task.id === id)
        if (!current) return false
        const updated = { ...current, ...patch, title: patch.title?.trim() ?? current.title, description: patch.description?.trim() ?? current.description }
        const token = useAuthStore.getState().token
        if (token && !(await updateRemoteTask(token, updated))) return false
        set({ tasks: get().tasks.map((task) => task.id === id ? updated : task) })
        useToastStore.getState().push({ kind: 'success', title: translate(useLanguageStore.getState().language, 'tasks.updated') })
        return true
      },
      deleteTask: async (id) => {
        const token = useAuthStore.getState().token
        if (token && !(await deleteRemoteTask(token, id))) return
        set({ tasks: get().tasks.filter((task) => task.id !== id) })
        useToastStore.getState().push({ kind: 'info', title: translate(useLanguageStore.getState().language, 'tasks.deleted') })
      },
      toggleTask: async (id) => {
        const task = get().tasks.find((item) => item.id === id)
        if (!task) return
        await get().updateTask(id, { completed: !task.completed, completedAt: !task.completed ? new Date().toISOString() : null })
      },
      incrementPomodoro: async (id) => {
        const task = get().tasks.find((item) => item.id === id)
        if (task) await get().updateTask(id, { completedPomodoros: task.completedPomodoros + 1 })
      },
      clearTasks: () => set({ tasks: [] }),
    }),
    {
      name: 'focusly-tasks',
      storage: createJSONStorage(() => safeStorage),
      merge: (persisted, current) => {
        const data = persisted as { tasks?: unknown } | undefined
        return {
          ...current,
          tasks: data ? sanitizeTasks(data.tasks).filter((task) => !legacyDemoTaskIds.has(task.id)) : current.tasks,
        }
      },
    },
  ),
)

export function sortTasks(tasks: Task[], sort: 'priority' | 'date' | 'pomodoros'): Task[] {
  const rank: Record<TaskPriority, number> = { High: 0, Medium: 1, Low: 2 }
  return [...tasks].sort((a, b) => {
    if (sort === 'priority') return rank[a.priority] - rank[b.priority]
    if (sort === 'pomodoros') return b.estimatedPomodoros - a.estimatedPomodoros
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

export function filterTasks(tasks: Task[], filter: 'all' | 'active' | 'completed'): Task[] {
  if (filter === 'active') return tasks.filter((task) => !task.completed)
  if (filter === 'completed') return tasks.filter((task) => task.completed)
  return tasks
}

export type { TaskCategory }
