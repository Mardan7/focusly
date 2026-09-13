import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useLanguageStore, type Language } from '@/store/useLanguageStore'
import { locales, translate, type TranslationKey } from './core'

const I18nContext = createContext<{
  language: Language
  locale: string
  t: (key: TranslationKey, params?: Record<string, string | number>) => string
}>({ language: 'en', locale: locales.en, t: (key, params) => translate('en', key, params) })

export function I18nProvider({ children }: { children: ReactNode }) {
  const language = useLanguageStore((state) => state.language)
  const value = useMemo(() => ({
    language,
    locale: locales[language],
    t: (key: TranslationKey, params?: Record<string, string | number>) => translate(language, key, params),
  }), [language])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  return useContext(I18nContext)
}
