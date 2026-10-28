import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { TimerMode, TimerStatus } from '@/types/settings'
import { notifyDesktop } from '@/utils/notifications'
import { playChime } from '@/utils/sound'
import { safeStorage } from '@/utils/storage'
import { minutesToMs, remainingFromTimestamp } from '@/utils/timer'
import { useSessionStore } from './useSessionStore'
import { useSettingsStore } from './useSettingsStore'
import { useTaskStore } from './useTaskStore'
import { useToastStore } from './useToastStore'
import { useUIStore } from './useUIStore'
import { useLanguageStore } from './useLanguageStore'
import { translate } from '@/i18n/core'

interface TimerState {
  mode: TimerMode
  status: TimerStatus
  remainingMs: number
  sessionDurationMs: number
  endsAt: number | null
  completedFocusInCycle: number
  activeTaskId: string | null
  setActiveTask: (id: string | null) => void
  setMode: (mode: TimerMode) => void
  start: () => void
  pause: () => void
  reset: () => void
  skip: () => void
  completeIfDue: () => void
  applyDurations: () => void
}

let completing = false

function durationMs(mode: TimerMode): number {
  const settings = useSettingsStore.getState()
  if (mode === 'focus') return minutesToMs(settings.focusDuration)
  if (mode === 'shortBreak') return minutesToMs(settings.shortBreak)
  return minutesToMs(settings.longBreak)
}

function finishCurrent(get: () => TimerState, set: (partial: Partial<TimerState>) => void, skipped: boolean, completedAt = Date.now()) {
  const { mode, completedFocusInCycle } = get()
  const activeTaskId = useTaskStore.getState().tasks.some((task) => task.id === get().activeTaskId)
    ? get().activeTaskId : null
  const settings = useSettingsStore.getState()
  const planned = get().sessionDurationMs

  if (!skipped) {
    useSessionStore.getState().addSession({
      taskId: mode === 'focus' ? activeTaskId : null,
      type: mode,
      duration: planned / 1000,
      completedAt: new Date(completedAt).toISOString(),
    })
    if (mode === 'focus' && activeTaskId) {
      useTaskStore.getState().incrementPomodoro(activeTaskId)
    }
    if (settings.soundEnabled) {
      void playChime()
    }
    if (settings.desktopNotifications) {
      const language = useLanguageStore.getState().language
      const title = mode === 'focus' ? translate(language, 'timer.focusComplete') : translate(language, 'timer.breakComplete')
      const body = mode === 'focus' ? translate(language, 'timer.timeForRecharge') : translate(language, 'timer.breakComplete')
      notifyDesktop(title, body)
    }
    if (mode === 'focus') {
      const language = useLanguageStore.getState().language
      useToastStore.getState().push({
        kind: 'success',
        title: translate(language, 'toast.sessionCompleted'),
        description: translate(language, 'toast.sessionLogged'),
      })
      useUIStore.getState().triggerCelebration()
      useUIStore.getState().triggerFocusCompletion(activeTaskId, Math.round(planned / 60000))
    }
  }

  let next: TimerMode = 'focus'
  let cycle = completedFocusInCycle
  if (mode === 'focus') {
    if (skipped) {
      next = 'shortBreak'
    } else {
      cycle = completedFocusInCycle + 1
      if (cycle >= settings.longBreakInterval) {
        next = 'longBreak'
        cycle = 0
      } else {
        next = 'shortBreak'
      }
    }
  }

  const autoStart = next === 'focus' ? settings.autoStartFocus : settings.autoStartBreak
  const remaining = durationMs(next)

  set({
    mode: next,
    completedFocusInCycle: cycle,
    remainingMs: remaining,
    sessionDurationMs: remaining,
    endsAt: autoStart ? Date.now() + remaining : null,
    status: autoStart ? 'running' : 'idle',
  })
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      mode: 'focus',
      status: 'idle',
      remainingMs: minutesToMs(25),
      sessionDurationMs: minutesToMs(25),
      endsAt: null,
      completedFocusInCycle: 0,
      activeTaskId: null,
      setActiveTask: (id) => set({ activeTaskId: id }),
      setMode: (mode) =>
        set({
          mode,
          status: 'idle',
          endsAt: null,
          remainingMs: durationMs(mode),
          sessionDurationMs: durationMs(mode),
        }),
      start: () => {
        const current = get()
        if (current.status === 'running') return
        const remaining = current.remainingMs > 0 ? current.remainingMs : durationMs(current.mode)
        useUIStore.getState().clearFocusCompletion()
        if (current.mode === 'focus' && useSettingsStore.getState().focusModeAutoEnter) {
          useUIStore.getState().enterFocusMode()
        }
        set({
          status: 'running',
          remainingMs: remaining,
          endsAt: Date.now() + remaining,
        })
      },
      pause: () => {
        const current = get()
        if (current.status !== 'running') return
        if (current.endsAt != null && Date.now() >= current.endsAt) {
          get().completeIfDue()
          return
        }
        set({
          status: 'paused',
          remainingMs: remainingFromTimestamp(current.endsAt, current.remainingMs),
          endsAt: null,
        })
      },
      reset: () => {
        const { mode } = get()
        set({
          status: 'idle',
          endsAt: null,
          remainingMs: durationMs(mode),
          sessionDurationMs: durationMs(mode),
        })
      },
      skip: () => {
        if (completing) return
        completing = true
        try {
          finishCurrent(get, set, true)
        } finally {
          completing = false
        }
      },
      completeIfDue: () => {
        const current = get()
        if (current.status !== 'running' || current.endsAt == null) return
        if (Date.now() < current.endsAt) return
        if (completing) return
        completing = true
        set({ status: 'idle', remainingMs: 0, endsAt: null })
        try {
          finishCurrent(get, set, false, current.endsAt)
        } finally {
          completing = false
        }
      },
      applyDurations: () => {
        const current = get()
        if (current.status !== 'idle') return
        set({ remainingMs: durationMs(current.mode), sessionDurationMs: durationMs(current.mode) })
      },
    }),
    {
      name: 'focusly-timer',
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({
        mode: state.mode,
        status: state.status,
        remainingMs: state.remainingMs,
        sessionDurationMs: state.sessionDurationMs,
        endsAt: state.endsAt,
        completedFocusInCycle: state.completedFocusInCycle,
        activeTaskId: state.activeTaskId,
      }),
    },
  ),
)
