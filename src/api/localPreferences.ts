import type { Settings } from '@/types/settings'
import { sanitizeSettings } from '@/utils/guards'
import { parseJson, safeStorage } from '@/utils/storage'

// These device preferences are not part of the server's settings schema.
export function saveLocalPreferences(userId: number, settings: Settings): void {
  safeStorage.setItem(`focusly-preferences-${userId}`, JSON.stringify(settings))
}

export function loadLocalPreferences(userId: number): Settings {
  return sanitizeSettings(parseJson(safeStorage.getItem(`focusly-preferences-${userId}`)))
}
