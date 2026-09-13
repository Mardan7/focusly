import { AnimatePresence, motion } from 'framer-motion'
import { BellOff, Check, Maximize, Minimize, Pause, Play, Volume2, VolumeX, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useTaskStore } from '@/store/useTaskStore'
import { useTimerStore } from '@/store/useTimerStore'
import { useUIStore } from '@/store/useUIStore'
import { formatClock, minutesToMs, remainingFromTimestamp } from '@/utils/timer'
import { useI18n } from '@/i18n'

export function FocusMode() {
  const { t } = useI18n()
  const active = useUIStore((state) => state.focusMode)
  const exit = useUIStore((state) => state.exitFocusMode)
  const completion = useUIStore((state) => state.focusCompletion)
  const clearCompletion = useUIStore((state) => state.clearFocusCompletion)
  const mode = useTimerStore((state) => state.mode)
  const status = useTimerStore((state) => state.status)
  const endsAt = useTimerStore((state) => state.endsAt)
  const remainingMs = useTimerStore((state) => state.remainingMs)
  const start = useTimerStore((state) => state.start)
  const pause = useTimerStore((state) => state.pause)
  const reset = useTimerStore((state) => state.reset)
  const activeTaskId = useTimerStore((state) => state.activeTaskId)
  const task = useTaskStore((state) => state.tasks.find((item) => item.id === activeTaskId))
  const focusDuration = useSettingsStore((state) => state.focusDuration)
  const shortBreak = useSettingsStore((state) => state.shortBreak)
  const longBreak = useSettingsStore((state) => state.longBreak)
  const soundEnabled = useSettingsStore((state) => state.soundEnabled)
  const updateSettings = useSettingsStore((state) => state.updateSettings)
  const showReminder = useSettingsStore((state) => state.focusModeShowDndReminder)
  const autoFullscreen = useSettingsStore((state) => state.focusModeAutoFullscreen)
  const [now, setNow] = useState(() => Date.now())
  const [reminderDismissed, setReminderDismissed] = useState(false)
  const [fullscreen, setFullscreen] = useState(() => document.fullscreenElement != null)
  const [fullscreenControlsVisible, setFullscreenControlsVisible] = useState(true)
  const fullscreenControlsTimer = useRef<number | null>(null)

  useEffect(() => {
    if (!active || !autoFullscreen || document.fullscreenElement || !document.documentElement.requestFullscreen) return
    void document.documentElement.requestFullscreen().catch(() => undefined)
  }, [active, autoFullscreen])

  useEffect(() => {
    if (status !== 'running') return
    const id = window.setInterval(() => setNow(Date.now()), 200)
    return () => window.clearInterval(id)
  }, [status])

  useEffect(() => {
    const onFullscreenChange = () => {
      const isFullscreen = document.fullscreenElement != null
      setFullscreen(isFullscreen)
      if (isFullscreen) setFullscreenControlsVisible(true)
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  useEffect(() => {
    if (!fullscreen) return
    fullscreenControlsTimer.current = window.setTimeout(() => setFullscreenControlsVisible(false), 3200)
    return () => {
      if (fullscreenControlsTimer.current != null) window.clearTimeout(fullscreenControlsTimer.current)
    }
  }, [fullscreen])

  if (!active) return null

  const total = mode === 'focus' ? minutesToMs(focusDuration) : mode === 'shortBreak' ? minutesToMs(shortBreak) : minutesToMs(longBreak)
  const remaining = remainingFromTimestamp(status === 'running' ? endsAt : null, remainingMs, now)
  const progress = Math.max(0, Math.min(1, 1 - remaining / total))
  const completionTask = completion?.taskId ? useTaskStore.getState().tasks.find((item) => item.id === completion.taskId) : task

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen?.()
        return
      }
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen()
      }
    } catch {
      // Fullscreen can be unavailable or denied by the browser.
    }
  }

  const revealFullscreenControls = () => {
    setFullscreenControlsVisible(true)
    if (fullscreenControlsTimer.current != null) window.clearTimeout(fullscreenControlsTimer.current)
    fullscreenControlsTimer.current = window.setTimeout(() => setFullscreenControlsVisible(false), 3200)
  }

  const endSession = () => {
    reset()
    clearCompletion()
    exit()
  }

  const finishCompletion = () => {
    clearCompletion()
    exit()
  }

  if (fullscreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[70] flex min-h-screen items-center justify-center overflow-hidden bg-[#08090a] text-text"
        onPointerMove={revealFullscreenControls}
        onPointerDown={revealFullscreenControls}
        role="dialog"
        aria-modal="true"
        aria-label={t('focus.fullscreenTimer')}
      >
        <div className="select-none text-[clamp(5rem,18vw,13rem)] font-semibold leading-none tracking-tight tabular-nums text-accent drop-shadow-[0_0_36px_rgb(0_255_198/0.18)]">
          {formatClock(remaining)}
        </div>
        <AnimatePresence>
          {fullscreenControlsVisible ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="fixed bottom-8 left-1/2 flex -translate-x-1/2 gap-3"
            >
              <Button variant="accent" size="md" onClick={status === 'running' ? pause : start}>
                {status === 'running' ? <Pause size={16} /> : <Play size={16} />}
                {status === 'running' ? t('timer.pause') : t('timer.resume')}
              </Button>
              <Button variant="secondary" size="md" onClick={toggleFullscreen}>
                <Minimize size={16} /> {t('focus.exitFullscreen')}
              </Button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        key="focus-mode"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 overflow-y-auto bg-[#08090a]/95 px-4 py-6 text-text backdrop-blur-xl sm:px-8 sm:py-10"
        role="dialog"
        aria-modal="true"
        aria-label={t('timer.focusMode')}
      >
        <div className="mx-auto flex min-h-[calc(100dvh-3rem)] max-w-4xl flex-col">
          <header className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-sm font-semibold tracking-[0.2em] text-accent">
              <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_18px_var(--accent)]" />
              {t('timer.focusMode')}
            </div>
            <Button variant="ghost" size="sm" onClick={exit} aria-label={t('focus.exit')}>
              <X size={16} /> {t('focus.exit')}
            </Button>
          </header>

          <main className="flex flex-1 flex-col items-center justify-center py-10 text-center">
            <AnimatePresence mode="wait">
              {completion ? (
                <motion.div key="complete" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-xl">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-accent/30 bg-accent-soft text-accent">
                    <Check size={30} />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">{t('timer.focusComplete')}</p>
                  <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">{t('focus.greatWork')}</h1>
                  <p className="mt-4 text-muted">{completionTask?.title ?? t('timer.focusSession')} · {t('focus.focused', { count: completion.durationMinutes })}</p>
                  <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <Button variant="accent" size="lg" onClick={() => { clearCompletion(); start() }}><Play size={16} /> {t('focus.startBreak')}</Button>
                    <Button variant="secondary" size="lg" onClick={finishCompletion}>{t('focus.finish')}</Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="timer" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">{mode === 'focus' ? t('timer.focusSession') : mode === 'shortBreak' ? t('timer.shortBreak') : t('timer.longBreak')}</p>
                  <p className="mt-5 min-h-7 text-lg font-medium text-text">{task?.title ?? t('focus.chooseTaskToBegin')}</p>
                  <div className="mt-8 text-[clamp(4.5rem,16vw,9rem)] font-semibold leading-none tracking-[-0.04em] tabular-nums text-text">{formatClock(remaining)}</div>
                  <div className="mx-auto mt-10 h-2 w-full max-w-xl overflow-hidden rounded-full bg-elevated" aria-label={t('focus.progress', { count: Math.round(progress * 100) })}>
                    <motion.div className="h-full rounded-full bg-accent shadow-[0_0_24px_var(--glow)]" animate={{ width: `${progress * 100}%` }} transition={{ duration: 0.2 }} />
                  </div>
                  <div className="mt-10 flex flex-wrap justify-center gap-3">
                    <Button variant="accent" size="lg" onClick={status === 'running' ? pause : start}>
                      {status === 'running' ? <Pause size={17} /> : <Play size={17} />}
                      {status === 'running' ? t('timer.pause') : status === 'paused' ? t('timer.resume') : t('timer.start')}
                    </Button>
                    <Button variant="secondary" size="lg" onClick={endSession}>{t('focus.endSession')}</Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          <footer className="flex flex-col items-center justify-between gap-4 border-t border-border pt-5 text-xs text-muted sm:flex-row">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => updateSettings({ soundEnabled: !soundEnabled })} aria-label={soundEnabled ? t('focus.muteSound') : t('focus.enableSound')}>
                {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
                {soundEnabled ? t('focus.soundOn') : t('focus.soundOff')}
              </Button>
              <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
                {fullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
                {fullscreen ? t('focus.exitFullscreen') : t('focus.enterFullscreen')}
              </Button>
            </div>
            <span>{t('focus.shortcutHint')}</span>
          </footer>

          <AnimatePresence>
            {showReminder && !reminderDismissed ? (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="fixed bottom-5 left-1/2 z-[60] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-3 rounded-2xl border border-border bg-card/95 px-4 py-3 text-sm shadow-2xl backdrop-blur-xl">
                <BellOff size={17} className="shrink-0 text-accent" />
                <span className="flex-1">{t('focus.dndReminder')}</span>
                <button type="button" onClick={() => setReminderDismissed(true)} className="shrink-0 text-muted hover:text-text" aria-label={t('focus.dismissReminder')}>{t('common.dismiss')}</button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
