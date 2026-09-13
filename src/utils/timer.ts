export function clampMinutes(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, Math.round(value)))
}

export function minutesToMs(minutes: number): number {
  return Math.max(1, minutes) * 60 * 1000
}

export function formatClock(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function formatDuration(totalMinutes: number): string {
  const safe = Math.max(0, Math.round(totalMinutes))
  const hours = Math.floor(safe / 60)
  const minutes = safe % 60
  return `${hours}h ${String(minutes).padStart(2, '0')}m`
}

export function remainingFromTimestamp(endsAt: number | null, fallbackMs: number, now = Date.now()): number {
  if (endsAt == null) return Math.max(0, fallbackMs)
  return Math.max(0, endsAt - now)
}
