import type { Session } from '@/types/session'

export function focusLevel(sessions: Session[]) {
  const seconds = sessions.reduce((sum, session) => sum + (session.type === 'focus' && Number.isFinite(session.duration) ? Math.max(0, session.duration) : 0), 0)
  const hours = seconds / 3600
  const level = Math.min(10, Math.floor(hours / 100))
  return { hours, level, progress: level === 10 ? 100 : (hours % 100), remaining: level === 10 ? 0 : Math.max(0, (level + 1) * 100 - hours) }
}

export function levelColor(level: number) {
  if (level === 10) return '#ef4444'
  if (level >= 8) return '#f97316'
  if (level >= 5) return '#eab308'
  if (level >= 1) return '#22c55e'
  return '#94a3b8'
}
