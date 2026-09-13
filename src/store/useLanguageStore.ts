import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { safeStorage } from '@/utils/storage'

export type Language = 'en' | 'ru' | 'kk'

interface LanguageState {
  language: Language
  setLanguage: (language: Language) => void
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'focusly-language',
      storage: createJSONStorage(() => safeStorage),
      merge: (persisted, current) => {
        const language = (persisted as { language?: unknown } | undefined)?.language
        return { ...current, language: language === 'ru' || language === 'kk' || language === 'en' ? language : 'en' }
      },
    },
  ),
)
