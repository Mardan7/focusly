import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface BadgeProps {
  children: ReactNode
  tone?: 'neutral' | 'accent' | 'danger' | 'warn'
  className?: string
}

export function Badge({ children, tone = 'neutral', className }: BadgeProps) {
  const tones = {
    neutral: 'bg-elevated text-muted border-border',
    accent: 'bg-accent-soft text-accent border-accent/20',
    danger: 'bg-danger/10 text-danger border-danger/20',
    warn: 'bg-amber-400/10 text-amber-300 border-amber-400/20',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
