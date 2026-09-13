export type ThemePreference = 'dark' | 'light' | 'system'
export type TimerMode = 'focus' | 'shortBreak' | 'longBreak'
export type TimerStatus = 'idle' | 'running' | 'paused'

export interface Settings {
  focusDuration: number
  shortBreak: number
  longBreak: number
  longBreakInterval: number
  autoStartFocus: boolean
  autoStartBreak: boolean
  soundEnabled: boolean
  desktopNotifications: boolean
  focusModeAutoEnter: boolean
  focusModeShowDndReminder: boolean
  focusModeAutoFullscreen: boolean
  theme: ThemePreference
}

export const DEFAULT_SETTINGS: Settings = {
  focusDuration: 25,
  shortBreak: 5,
  longBreak: 15,
  longBreakInterval: 4,
  autoStartFocus: false,
  autoStartBreak: true,
  soundEnabled: true,
  desktopNotifications: false,
  focusModeAutoEnter: false,
  focusModeShowDndReminder: true,
  focusModeAutoFullscreen: false,
  theme: 'dark',
}
