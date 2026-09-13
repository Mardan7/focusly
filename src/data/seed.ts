import type { Session } from '@/types/session'
import type { Task } from '@/types/task'
import { addDays, startOfDay } from '@/utils/date'

function isoDaysAgo(days: number, hour = 10, minute = 0): string {
  const date = startOfDay(new Date())
  date.setDate(date.getDate() - days)
  date.setHours(hour, minute, 0, 0)
  return date.toISOString()
}

export const PROFILE = {
  name: 'Mardan',
  fullName: 'Mardan K.',
  role: 'Software Engineering Student',
  initials: 'MK',
}

export const seedTasks: Task[] = [
  {
    id: 'task-portfolio',
    title: 'Finish React portfolio',
    description: 'Polish FOCUSLY, write case study copy, and ship the live demo.',
    category: 'Coding',
    priority: 'High',
    estimatedPomodoros: 6,
    completedPomodoros: 4,
    completed: false,
    completedAt: null,
    createdAt: isoDaysAgo(6, 9),
    dueDate: addDays(new Date(), 2).toISOString(),
  },
  {
    id: 'task-typescript',
    title: 'Study TypeScript',
    description: 'Generics, discriminated unions, and utility types.',
    category: 'Study',
    priority: 'Medium',
    estimatedPomodoros: 3,
    completedPomodoros: 3,
    completed: true,
    completedAt: isoDaysAgo(0, 11, 20),
    createdAt: isoDaysAgo(4, 8),
    dueDate: isoDaysAgo(0, 18),
  },
  {
    id: 'task-auth',
    title: 'Build authentication',
    description: 'Design a local-first auth-ready architecture without a backend.',
    category: 'Coding',
    priority: 'High',
    estimatedPomodoros: 4,
    completedPomodoros: 1,
    completed: false,
    completedAt: null,
    createdAt: isoDaysAgo(3, 14),
    dueDate: addDays(new Date(), 5).toISOString(),
  },
  {
    id: 'task-algo',
    title: 'Practice algorithms',
    description: 'Two pointers, sliding window, and graph warmups.',
    category: 'Study',
    priority: 'Medium',
    estimatedPomodoros: 2,
    completedPomodoros: 0,
    completed: false,
    completedAt: null,
    createdAt: isoDaysAgo(2, 16),
    dueDate: addDays(new Date(), 1).toISOString(),
  },
  {
    id: 'task-linux',
    title: 'Read Linux chapter',
    description: 'Process management and filesystem internals.',
    category: 'Study',
    priority: 'Low',
    estimatedPomodoros: 2,
    completedPomodoros: 1,
    completed: false,
    completedAt: null,
    createdAt: isoDaysAgo(5, 19),
    dueDate: null,
  },
  {
    id: 'task-personal',
    title: 'Plan weekly review',
    description: 'Capture wins, blockers, and next-week bets.',
    category: 'Personal',
    priority: 'Low',
    estimatedPomodoros: 1,
    completedPomodoros: 1,
    completed: true,
    completedAt: isoDaysAgo(1, 21),
    createdAt: isoDaysAgo(8, 10),
    dueDate: isoDaysAgo(1, 21),
  },
]

function session(id: string, daysAgo: number, duration: number, taskId: string | null, hour: number): Session {
  return {
    id,
    taskId,
    type: 'focus',
    duration,
    completedAt: isoDaysAgo(daysAgo, hour, 15),
  }
}

export function createSeedSessions(): Session[] {
  const sessions: Session[] = []
  let n = 0
  const push = (daysAgo: number, count: number, taskId: string | null) => {
    for (let i = 0; i < count; i += 1) {
      n += 1
      sessions.push(session(`seed-${n}`, daysAgo, 25 * 60, taskId, 9 + i * 2))
    }
  }

  for (let day = 40; day >= 14; day -= 1) {
    push(day, day % 3 === 0 ? 2 : 1, 'task-linux')
  }
  for (let day = 11; day >= 0; day -= 1) {
    const taskId = day % 2 === 0 ? 'task-portfolio' : day % 3 === 0 ? 'task-auth' : 'task-typescript'
    push(day, day === 0 ? 8 : 2, taskId)
  }

  return sessions
}

export const TODAY_SESSION_GOAL = 8
