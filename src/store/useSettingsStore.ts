import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { DEFAULT_SETTINGS, type Settings, type ThemePreference } from '@/types/settings'
import { sanitizeSettings } from '@/utils/guards'
import { safeStorage } from '@/utils/storage'
import { pushSettings } from '@/api/remote'
import { useAuthStore } from './useAuthStore'
import { useLanguageStore } from './useLanguageStore'

interface SettingsState extends Settings {
  updateSettings: (patch: Partial<Settings>) => void
  setTheme: (theme: ThemePreference) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SETTINGS,
      updateSettings: (patch) => {
        set((state) => sanitizeSettings({ ...state, ...patch }))
        const token = useAuthStore.getState().token
        if (token) void pushSettings(token, { language: useLanguageStore.getState().language, theme: get().theme, soundEnabled: get().soundEnabled, focusModeAutoEnter: get().focusModeAutoEnter, focusModeShowDndReminder: get().focusModeShowDndReminder, focusModeAutoFullscreen: get().focusModeAutoFullscreen })
      },
      setTheme: (theme) => {
        set({ theme })
        const token = useAuthStore.getState().token
        if (token) void pushSettings(token, { language: useLanguageStore.getState().language, theme, soundEnabled: get().soundEnabled, focusModeAutoEnter: get().focusModeAutoEnter, focusModeShowDndReminder: get().focusModeShowDndReminder, focusModeAutoFullscreen: get().focusModeAutoFullscreen })
      },
    }),
    {
      name: 'focusly-settings',
      storage: createJSONStorage(() => safeStorage),
      merge: (persisted, current) => {
        const next = sanitizeSettings(persisted)
        return {
          ...current,
          ...next,
        }
      },
    },
  ),
)
