import { en } from './translations/en'
import { kk } from './translations/kk'
import { ru } from './translations/ru'
import type { Language } from '@/store/useLanguageStore'

export type TranslationKey = keyof typeof en
export const languageLabels: Record<Language, TranslationKey> = {
  en: 'settings.languageEnglish',
  ru: 'settings.languageRussian',
  kk: 'settings.languageKazakh',
}

export const locales: Record<Language, string> = { en: 'en-US', ru: 'ru-RU', kk: 'kk-KZ' }
type Dictionary = { [K in keyof typeof en]: string }
const dictionaries: Record<Language, Dictionary> = { en, ru, kk }

function interpolate(value: string, params?: Record<string, string | number>): string {
  if (!params) return value
  return Object.entries(params).reduce((result, [key, replacement]) => result.replaceAll(`{${key}}`, String(replacement)), value)
}

export function translate(language: Language, key: TranslationKey, params?: Record<string, string | number>): string {
  return interpolate(dictionaries[language][key], params)
}

export function formatLocalizedDuration(totalMinutes: number, language: Language): string {
  const safe = Math.max(0, Math.round(totalMinutes))
  return translate(language, 'common.hoursMinutes', {
    hours: Math.floor(safe / 60),
    minutes: String(safe % 60).padStart(2, '0'),
  })
}

export function formatLocalizedCount(language: Language, count: number, unit: 'day' | 'session' | 'task'): string {
  const category = new Intl.PluralRules(locales[language]).select(count)
  const suffix = category === 'one' ? 'One' : category === 'few' ? 'Few' : 'Many'
  return translate(language, `common.${unit}${suffix}` as TranslationKey, { count: formatLocalizedNumber(count, language) })
}

export function formatLocalizedNumber(value: number, language: Language): string {
  return new Intl.NumberFormat(locales[language]).format(value)
}
