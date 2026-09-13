import { useEffect, useState } from 'react'
import { Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Celebration } from '@/components/timer/Celebration'
import { TimerControls } from '@/components/timer/TimerControls'
import { TimerModeSelector } from '@/components/timer/TimerModeSelector'
import { TimerProgress } from '@/components/timer/TimerProgress'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useTimerStore } from '@/store/useTimerStore'
import { useUIStore } from '@/store/useUIStore'
import { minutesToMs, remainingFromTimestamp, formatClock } from '@/utils/timer'
import { useI18n } from '@/i18n'

export function PomodoroTimer() {
  const { t } = useI18n()
  const mode = useTimerStore((s) => s.mode)
  const status = useTimerStore((s) => s.status)
  const endsAt = useTimerStore((s) => s.endsAt)
  const remainingMs = useTimerStore((s) => s.remainingMs)
  const start = useTimerStore((s) => s.start)
  const pause = useTimerStore((s) => s.pause)
  const reset = useTimerStore((s) => s.reset)
  const skip = useTimerStore((s) => s.skip)
  const setMode = useTimerStore((s) => s.setMode)
  const celebration = useUIStore((s) => s.celebration)
  const focusDuration = useSettingsStore((s) => s.focusDuration)
  const shortBreak = useSettingsStore((s) => s.shortBreak)
  const longBreak = useSettingsStore((s) => s.longBreak)
  const enterFocusMode = useUIStore((s) => s.enterFocusMode)

  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (status !== 'running') return
    const id = window.setInterval(() => setNow(Date.now()), 200)
    return () => window.clearInterval(id)
  }, [status])

  const remaining = remainingFromTimestamp(status === 'running' ? endsAt : null, remainingMs, now)
  const total =
    mode === 'focus' ? minutesToMs(focusDuration) : mode === 'shortBreak' ? minutesToMs(shortBreak) : minutesToMs(longBreak)
  const progress = 1 - remaining / total

  return (
    <div className="relative mx-auto max-w-xl text-center">
      <TimerModeSelector value={mode} onChange={setMode} />
      <p className="mt-8 text-xs font-semibold uppercase tracking-[0.28em] text-muted">{mode === 'focus' ? t('timer.focusSession') : mode === 'shortBreak' ? t('timer.shortBreak') : t('timer.longBreak')}</p>
      <div className="relative mt-6">
        <TimerProgress progress={Number.isFinite(progress) ? progress : 0}>
          <p className="font-sans text-6xl font-semibold tracking-tight tabular-nums sm:text-7xl">
            {formatClock(remaining)}
          </p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.32em] text-muted">
            {status === 'running' ? t('timer.live') : status === 'paused' ? t('timer.paused') : mode === 'focus' ? t('timer.focus') : t('timer.break')}
          </p>
        </TimerProgress>
        <Celebration active={celebration} />
      </div>
      <TimerControls
        status={status}
        onStart={start}
        onPause={pause}
        onReset={reset}
        onSkip={skip}
      />
      <Button variant="secondary" size="sm" className="mt-4" onClick={enterFocusMode}>
        <Maximize2 size={15} /> {t('timer.focusMode')}
      </Button>
    </div>
  )
}
