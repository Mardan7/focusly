import type { Session } from '@/types/session'

export const MINUTE_THRESHOLDS = [1, 501, 751, 950, 1150, 1350, 1530, 1700, 1850, 2000] as const

export function minuteLevel(value: number) {
  const minutes = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0
  const level = MINUTE_THRESHOLDS.filter((threshold) => minutes >= threshold).length
  const start = level === 0 ? 0 : MINUTE_THRESHOLDS[level - 1]
  const next = MINUTE_THRESHOLDS[level]
  return {
    minutes,
    level,
    progress: next === undefined ? 100 : (minutes - start) / (next - start) * 100,
    remaining: next === undefined ? 0 : next - minutes,
  }
}

export function focusLevel(sessions: Session[]) {
  const seconds = sessions.reduce((sum, session) => sum + (session.type === 'focus' && Number.isFinite(session.duration) ? Math.max(0, session.duration) : 0), 0)
  return { ...minuteLevel(seconds / 60), hours: seconds / 3600, sessionCount: sessions.filter(session => session.type === 'focus' && session.duration > 0 && Number.isFinite(session.duration)).length }
}

export function levelColor(level: number) {
  if (level === 10) return '#ef4444'
  if (level >= 8) return '#f97316'
  if (level >= 5) return '#eab308'
  if (level >= 1) return '#22c55e'
  return '#94a3b8'
}
