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

interface TimerState {
  mode: TimerMode
  status: TimerStatus
  remainingMs: number
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

function finishCurrent(get: () => TimerState, set: (partial: Partial<TimerState>) => void, skipped: boolean) {
  const { mode, activeTaskId, completedFocusInCycle } = get()
  const settings = useSettingsStore.getState()
  const planned = durationMs(mode)

  if (!skipped) {
    useSessionStore.getState().addSession({
      taskId: mode === 'focus' ? activeTaskId : null,
      type: mode,
      duration: planned / 1000,
    })
    if (mode === 'focus' && activeTaskId) {
      useTaskStore.getState().incrementPomodoro(activeTaskId)
    }
    if (settings.soundEnabled) {
      void playChime()
    }
    if (settings.desktopNotifications) {
      const title = mode === 'focus' ? 'Focus session complete' : 'Break complete'
      const body = mode === 'focus' ? 'Time for a recharge.' : 'Ready when you are.'
      notifyDesktop(title, body)
    }
    if (mode === 'focus') {
      useToastStore.getState().push({
        kind: 'success',
        title: 'Focus session completed',
        description: 'Logged to your productivity timeline.',
      })
      useUIStore.getState().triggerCelebration()
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
      endsAt: null,
      completedFocusInCycle: 0,
      activeTaskId: 'task-portfolio',
      setActiveTask: (id) => set({ activeTaskId: id }),
      setMode: (mode) =>
        set({
          mode,
          status: 'idle',
          endsAt: null,
          remainingMs: durationMs(mode),
        }),
      start: () => {
        const current = get()
        const remaining = current.remainingMs > 0 ? current.remainingMs : durationMs(current.mode)
        set({
          status: 'running',
          remainingMs: remaining,
          endsAt: Date.now() + remaining,
        })
      },
      pause: () => {
        const current = get()
        if (current.status !== 'running') return
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
        })
      },
      skip: () => {
        if (completing) return
        completing = true
        finishCurrent(get, set, true)
        completing = false
      },
      completeIfDue: () => {
        const current = get()
        if (current.status !== 'running' || current.endsAt == null) return
        if (Date.now() < current.endsAt) return
        if (completing) return
        completing = true
        set({ status: 'idle', remainingMs: 0, endsAt: null })
        finishCurrent(get, set, false)
        completing = false
      },
      applyDurations: () => {
        const current = get()
        if (current.status !== 'idle') return
        set({ remainingMs: durationMs(current.mode) })
      },
    }),
    {
      name: 'focusly-timer',
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({
        mode: state.mode,
        status: state.status,
        remainingMs: state.remainingMs,
        endsAt: state.endsAt,
        completedFocusInCycle: state.completedFocusInCycle,
        activeTaskId: state.activeTaskId,
      }),
    },
  ),
)
