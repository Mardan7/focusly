import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { DEFAULT_SETTINGS, type Settings, type ThemePreference } from '@/types/settings'
import { sanitizeSettings } from '@/utils/guards'
import { safeStorage } from '@/utils/storage'

interface SettingsState extends Settings {
  updateSettings: (patch: Partial<Settings>) => void
  setTheme: (theme: ThemePreference) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      updateSettings: (patch) => set((state) => sanitizeSettings({ ...state, ...patch })),
      setTheme: (theme) => set({ theme }),
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
