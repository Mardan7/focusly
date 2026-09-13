import type { Session } from '@/types/session'
import type { Task, TaskCategory } from '@/types/task'
import { daysBack, startOfWeek, toDayKey } from '@/utils/date'

export function focusSessions(sessions: Session[]): Session[] {
  return sessions.filter((session) => session.type === 'focus')
}

export function totalFocusMinutes(sessions: Session[]): number {
  return focusSessions(sessions).reduce((sum, session) => sum + session.duration / 60, 0)
}

export function sessionsInRange(sessions: Session[], days: number, now = new Date()): Session[] {
  const start = daysBack(days, now)[0]
  if (!start) return []
  const startMs = start.getTime()
  return focusSessions(sessions).filter((session) => new Date(session.completedAt).getTime() >= startMs)
}

export function weeklyFocusMinutes(sessions: Session[], now = new Date()): number[] {
  const start = startOfWeek(now)
  const buckets = Array.from({ length: 7 }, () => 0)
  for (const session of focusSessions(sessions)) {
    const completed = new Date(session.completedAt)
    const diff = Math.floor((completed.getTime() - start.getTime()) / (24 * 60 * 60 * 1000))
    if (diff >= 0 && diff < 7) {
      buckets[diff] += session.duration / 60
    }
  }
  return buckets
}

export function dailyFocusMinutes(sessions: Session[], days: number, now = new Date()): Array<{ date: string; minutes: number }> {
  const keys = daysBack(days, now).map((date) => toDayKey(date))
  const map = new Map(keys.map((key) => [key, 0]))
  for (const session of focusSessions(sessions)) {
    const key = toDayKey(session.completedAt)
    if (map.has(key)) {
      map.set(key, (map.get(key) ?? 0) + session.duration / 60)
    }
  }
  return keys.map((date) => ({ date, minutes: Math.round(map.get(date) ?? 0) }))
}

export function categoryDistribution(
  sessions: Session[],
  tasks: Task[],
): Array<{ name: TaskCategory; minutes: number }> {
  const taskMap = new Map(tasks.map((task) => [task.id, task.category]))
  const buckets: Record<TaskCategory, number> = {
    Study: 0,
    Work: 0,
    Personal: 0,
    Coding: 0,
    Other: 0,
  }
  for (const session of focusSessions(sessions)) {
    const category = session.taskId ? (taskMap.get(session.taskId) ?? 'Other') : 'Other'
    buckets[category] += session.duration / 60
  }
  return (Object.entries(buckets) as Array<[TaskCategory, number]>).map(([name, minutes]) => ({
    name,
    minutes: Math.round(minutes),
  }))
}

export function computeStreak(sessions: Session[], now = new Date()): { current: number; best: number } {
  const days = new Set(focusSessions(sessions).map((session) => toDayKey(session.completedAt)))
  if (days.size === 0) return { current: 0, best: 0 }

  const today = toDayKey(now)
  const yesterdayDate = new Date(now)
  yesterdayDate.setDate(yesterdayDate.getDate() - 1)
  const yesterday = toDayKey(yesterdayDate)
  const cursor = new Date(days.has(today) ? now : days.has(yesterday) ? yesterdayDate : now)

  let current = 0
  if (days.has(today) || days.has(yesterday)) {
    while (days.has(toDayKey(cursor))) {
      current += 1
      cursor.setDate(cursor.getDate() - 1)
    }
  }

  const sorted = [...days].sort()
  let best = 1
  let run = 1
  for (let i = 1; i < sorted.length; i += 1) {
    const prev = new Date(`${sorted[i - 1]}T00:00:00`)
    const next = new Date(`${sorted[i]}T00:00:00`)
    const diff = (next.getTime() - prev.getTime()) / (24 * 60 * 60 * 1000)
    if (diff === 1) {
      run += 1
      best = Math.max(best, run)
    } else {
      run = 1
    }
  }

  return { current, best: Math.max(best, current) }
}

export function todayStats(sessions: Session[], tasks: Task[], now = new Date()) {
  const today = toDayKey(now)
  const todays = focusSessions(sessions).filter((session) => toDayKey(session.completedAt) === today)
  return {
    focusMinutes: todays.reduce((sum, session) => sum + session.duration / 60, 0),
    sessions: todays.length,
    tasksCompleted: tasks.filter(
      (task) => task.completed && task.completedAt && toDayKey(task.completedAt) === today,
    ).length,
  }
}
