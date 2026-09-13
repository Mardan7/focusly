import type { TimerMode } from '@/types/settings'
import { cn } from '@/utils/cn'

const modes: Array<{ id: TimerMode; label: string }> = [
  { id: 'focus', label: 'Focus' },
  { id: 'shortBreak', label: 'Short Break' },
  { id: 'longBreak', label: 'Long Break' },
]

interface TimerModeSelectorProps {
  value: TimerMode
  onChange: (mode: TimerMode) => void
}

export function TimerModeSelector({ value, onChange }: TimerModeSelectorProps) {
  return (
    <div className="mx-auto flex w-full max-w-md rounded-full border border-border bg-elevated/70 p-1" role="tablist">
      {modes.map((mode) => (
        <button
          key={mode.id}
          role="tab"
          aria-selected={value === mode.id}
          type="button"
          onClick={() => onChange(mode.id)}
          className={cn(
            'flex-1 rounded-full px-2 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted sm:text-xs',
            value === mode.id && 'bg-card text-text shadow-[0_0_0_1px_rgb(0_255_198/0.18)]',
          )}
        >
          {mode.label}
        </button>
      ))}
    </div>
  )
}
