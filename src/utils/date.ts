const DAY = 24 * 60 * 60 * 1000
import type { Language } from '@/store/useLanguageStore'
import { locales } from '@/i18n/core'

export function startOfDay(date: Date): Date {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

export function toDayKey(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function addDays(date: Date, amount: number): Date {
  return new Date(date.getTime() + amount * DAY)
}

export function formatLongDate(date: Date = new Date(), language: Language = 'en'): string {
  return date.toLocaleDateString(locales[language], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

export function formatShortDate(iso: string, language: Language = 'en'): string {
  return new Date(iso).toLocaleDateString(locales[language], {
    month: 'short',
    day: 'numeric',
  })
}

export function greetingForHour(hour: number = new Date().getHours()): string {
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export function weekdayLabels(language: Language = 'en'): string[] {
  const formatter = new Intl.DateTimeFormat(locales[language], { weekday: 'short' })
  const monday = startOfDay(new Date())
  const day = monday.getDay()
  const diff = day === 0 ? -6 : 1 - day
  monday.setDate(monday.getDate() + diff)
  return Array.from({ length: 7 }, (_, i) => formatter.format(addDays(monday, i)))
}

export function startOfWeek(date: Date = new Date()): Date {
  const start = startOfDay(date)
  const day = start.getDay()
  const diff = day === 0 ? -6 : 1 - day
  start.setDate(start.getDate() + diff)
  return start
}

export function daysBack(count: number, from: Date = new Date()): Date[] {
  const end = startOfDay(from)
  return Array.from({ length: count }, (_, i) => addDays(end, i - (count - 1)))
}

export function isValidDateString(value: string | null): boolean {
  if (!value) return true
  const parsed = new Date(value)
  return !Number.isNaN(parsed.getTime())
}
