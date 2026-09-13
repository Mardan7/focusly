import { Pause, Play, RotateCcw, SkipForward } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { TimerStatus } from '@/types/settings'

interface TimerControlsProps {
  status: TimerStatus
  onStart: () => void
  onPause: () => void
  onReset: () => void
  onSkip: () => void
}

export function TimerControls({ status, onStart, onPause, onReset, onSkip }: TimerControlsProps) {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
      {status === 'running' ? (
        <Button variant="accent" size="lg" onClick={onPause}>
          <Pause size={16} />
          Pause
        </Button>
      ) : (
        <Button variant="accent" size="lg" onClick={onStart}>
          <Play size={16} />
          {status === 'paused' ? 'Resume' : 'Start Focus'}
        </Button>
      )}
      <Button variant="secondary" size="lg" onClick={onReset}>
        <RotateCcw size={16} />
        Reset
      </Button>
      <Button variant="ghost" size="lg" onClick={onSkip}>
        <SkipForward size={16} />
        Skip
      </Button>
    </div>
  )
}
