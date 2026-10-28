import { useMemo, type ReactNode } from 'react'
import { useLanguageStore } from '@/store/useLanguageStore'
import { locales, translate, type TranslationKey } from './core'
import { I18nContext } from './context'

export function I18nProvider({ children }: { children: ReactNode }) {
  const language = useLanguageStore((state) => state.language)
  const value = useMemo(() => ({
    language,
    locale: locales[language],
    t: (key: TranslationKey, params?: Record<string, string | number>) => translate(language, key, params),
  }), [language])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
