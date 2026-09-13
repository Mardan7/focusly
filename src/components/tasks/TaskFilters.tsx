import type { TaskFilter, TaskSort } from '@/types/task'
import { cn } from '@/utils/cn'
import { useI18n } from '@/i18n'

interface TaskFiltersProps {
  filter: TaskFilter
  sort: TaskSort
  onFilter: (filter: TaskFilter) => void
  onSort: (sort: TaskSort) => void
}

export function TaskFilters({ filter, sort, onFilter, onSort }: TaskFiltersProps) {
  const { t } = useI18n()
  const filters: Array<{ id: TaskFilter; label: string }> = [
    { id: 'all', label: t('tasks.all') },
    { id: 'active', label: t('tasks.active') },
    { id: 'completed', label: t('tasks.completed') },
  ]
  const sorts: Array<{ id: TaskSort; label: string }> = [
    { id: 'priority', label: t('tasks.sortPriority') },
    { id: 'date', label: t('tasks.sortDate') },
    { id: 'pomodoros', label: t('tasks.sortPomodoros') },
  ]
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex rounded-full border border-border bg-elevated p-1">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onFilter(item.id)}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-medium text-muted',
              filter === item.id && 'bg-card text-text',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 text-xs text-muted">
        <span>{t('tasks.sort')}</span>
        <select
          value={sort}
          onChange={(event) => onSort(event.target.value as TaskSort)}
          className="h-9 rounded-xl border border-border bg-elevated px-2 text-text"
          aria-label={t('tasks.sort')}
        >
          {sorts.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
