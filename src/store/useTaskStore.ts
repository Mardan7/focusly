import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { Task, TaskCategory, TaskPriority } from '@/types/task'
import { sanitizeTasks } from '@/utils/guards'
import { safeStorage } from '@/utils/storage'

interface TaskState {
  tasks: Task[]
  addTask: (input: Omit<Task, 'id' | 'completed' | 'completedAt' | 'createdAt' | 'completedPomodoros'>) => Task
  updateTask: (id: string, patch: Partial<Omit<Task, 'id' | 'createdAt'>>) => void
  deleteTask: (id: string) => void
  toggleTask: (id: string) => void
  incrementPomodoro: (id: string) => void
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
      addTask: (input) => {
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
        set({ tasks: [task, ...get().tasks] })
        return task
      },
      updateTask: (id, patch) => {
        set({
          tasks: get().tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  ...patch,
                  title: patch.title != null ? patch.title.trim() : task.title,
                  description: patch.description != null ? patch.description.trim() : task.description,
                }
              : task,
          ),
        })
      },
      deleteTask: (id) => {
        set({ tasks: get().tasks.filter((task) => task.id !== id) })
      },
      toggleTask: (id) => {
        set({
          tasks: get().tasks.map((task) => {
            if (task.id !== id) return task
            const completed = !task.completed
            return {
              ...task,
              completed,
              completedAt: completed ? new Date().toISOString() : null,
            }
          }),
        })
      },
      incrementPomodoro: (id) => {
        set({
          tasks: get().tasks.map((task) =>
            task.id === id ? { ...task, completedPomodoros: task.completedPomodoros + 1 } : task,
          ),
        })
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
