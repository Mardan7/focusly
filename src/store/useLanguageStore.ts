import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { safeStorage } from '@/utils/storage'
import { pushSettings } from '@/api/remote'
import { useAuthStore } from './useAuthStore'
import { useSettingsStore } from './useSettingsStore'

export type Language = 'en' | 'ru' | 'kk'

interface LanguageState {
  language: Language
  setLanguage: (language: Language) => void
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (language) => {
        set({ language })
        const token = useAuthStore.getState().token
        if (token) {
          const settings = useSettingsStore.getState()
          void pushSettings(token, { language, theme: settings.theme, soundEnabled: settings.soundEnabled, focusModeAutoEnter: settings.focusModeAutoEnter, focusModeShowDndReminder: settings.focusModeShowDndReminder, focusModeAutoFullscreen: settings.focusModeAutoFullscreen })
        }
      },
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
