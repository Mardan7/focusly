import { createContext } from 'react'
import type { Language } from '@/store/useLanguageStore'
import { locales, translate, type TranslationKey } from './core'

export const I18nContext = createContext<{
  language: Language
  locale: string
  t: (key: TranslationKey, params?: Record<string, string | number>) => string
}>({ language: 'en', locale: locales.en, t: (key, params) => translate('en', key, params) })
