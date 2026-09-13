import type { SelectHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'h-11 w-full rounded-2xl border border-border bg-elevated px-3 text-sm text-text',
        className,
      )}
      {...props}
    />
  )
}
