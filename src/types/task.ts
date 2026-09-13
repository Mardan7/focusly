export const TASK_CATEGORIES = ['Study', 'Work', 'Personal', 'Coding', 'Other'] as const
export const TASK_PRIORITIES = ['Low', 'Medium', 'High'] as const

export type TaskCategory = (typeof TASK_CATEGORIES)[number]
export type TaskPriority = (typeof TASK_PRIORITIES)[number]

export interface Task {
  id: string
  title: string
  description: string
  category: TaskCategory
  priority: TaskPriority
  estimatedPomodoros: number
  completedPomodoros: number
  completed: boolean
  completedAt: string | null
  createdAt: string
  dueDate: string | null
}

export type TaskFilter = 'all' | 'active' | 'completed'
export type TaskSort = 'priority' | 'date' | 'pomodoros'
