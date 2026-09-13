import { motion } from 'framer-motion'
import { Check, MoreHorizontal } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import type { Task } from '@/types/task'
import { cn } from '@/utils/cn'
import { formatShortDate } from '@/utils/date'
import { useI18n } from '@/i18n'

interface TaskCardProps {
  task: Task
  onToggle: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onFocus?: (id: string) => void
}

const priorityTone = {
  High: 'danger',
  Medium: 'warn',
  Low: 'neutral',
} as const

export function TaskCard({ task, onToggle, onEdit, onDelete, onFocus }: TaskCardProps) {
  const [menu, setMenu] = useState(false)
  const { language, t } = useI18n()

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 rounded-2xl border border-border bg-card px-4 py-3.5"
    >
      <button
        type="button"
        aria-label={task.completed ? t('tasks.reopen', { title: task.title }) : t('tasks.complete', { title: task.title })}
        onClick={() => onToggle(task.id)}
        className={cn(
          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors',
          task.completed ? 'border-accent bg-accent text-bg' : 'border-border bg-transparent',
        )}
      >
        <motion.span animate={{ scale: task.completed ? 1 : 0.4 }} className="flex">
          {task.completed ? <Check size={12} strokeWidth={3} /> : null}
        </motion.span>
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className={cn('truncate text-sm font-medium', task.completed && 'text-muted line-through')}>
              {task.title}
            </h3>
            <p className="mt-1 text-xs text-muted">
              {t(`category.${task.category}`)} · {t('tasks.completedPomodoros', { completed: task.completedPomodoros, estimated: task.estimatedPomodoros })}
              {task.dueDate ? ` · ${formatShortDate(task.dueDate, language)}` : ''}
            </p>
          </div>
          <div className="relative flex items-center gap-2">
            <Badge tone={priorityTone[task.priority]}>{t(`priority.${task.priority}`)}</Badge>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 px-0"
              aria-label={t('tasks.actions')}
              onClick={() => setMenu((open) => !open)}
            >
              <MoreHorizontal size={16} />
            </Button>
            {menu ? (
              <div className="absolute right-0 top-9 z-20 min-w-[140px] rounded-xl border border-border bg-card p-1 shadow-xl">
                {onFocus ? (
                  <button
                    type="button"
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-elevated"
                    onClick={() => {
                      onFocus(task.id)
                      setMenu(false)
                    }}
                  >
                    {t('tasks.focus')}
                  </button>
                ) : null}
                <button
                  type="button"
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-elevated"
                  onClick={() => {
                    onEdit(task.id)
                    setMenu(false)
                  }}
                >
                  {t('tasks.edit')}
                </button>
                <button
                  type="button"
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm text-danger hover:bg-elevated"
                  onClick={() => {
                    onDelete(task.id)
                    setMenu(false)
                  }}
                >
                  {t('tasks.delete')}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </motion.article>
  )
}
