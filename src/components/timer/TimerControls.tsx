import { Pause, Play, RotateCcw, SkipForward } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { TimerStatus } from '@/types/settings'
import { useI18n } from '@/i18n'

interface TimerControlsProps {
  status: TimerStatus
  onStart: () => void
  onPause: () => void
  onReset: () => void
  onSkip: () => void
}

export function TimerControls({ status, onStart, onPause, onReset, onSkip }: TimerControlsProps) {
  const { t } = useI18n()
  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
      {status === 'running' ? (
        <Button variant="accent" size="lg" onClick={onPause}>
          <Pause size={16} />
          {t('timer.pause')}
        </Button>
      ) : (
        <Button variant="accent" size="lg" onClick={onStart}>
          <Play size={16} />
          {status === 'paused' ? t('timer.resume') : t('timer.start')}
        </Button>
      )}
      <Button variant="secondary" size="lg" onClick={onReset}>
        <RotateCcw size={16} />
        {t('timer.reset')}
      </Button>
      <Button variant="ghost" size="lg" onClick={onSkip}>
        <SkipForward size={16} />
        {t('timer.skip')}
      </Button>
    </div>
  )
}
