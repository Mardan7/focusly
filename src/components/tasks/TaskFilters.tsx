import type { TaskFilter, TaskSort } from '@/types/task'
import { cn } from '@/utils/cn'

interface TaskFiltersProps {
  filter: TaskFilter
  sort: TaskSort
  onFilter: (filter: TaskFilter) => void
  onSort: (sort: TaskSort) => void
}

const filters: TaskFilter[] = ['all', 'active', 'completed']
const sorts: Array<{ id: TaskSort; label: string }> = [
  { id: 'priority', label: 'Priority' },
  { id: 'date', label: 'Date' },
  { id: 'pomodoros', label: 'Pomodoros' },
]

export function TaskFilters({ filter, sort, onFilter, onSort }: TaskFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex rounded-full border border-border bg-elevated p-1">
        {filters.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onFilter(item)}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-medium capitalize text-muted',
              filter === item && 'bg-card text-text',
            )}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 text-xs text-muted">
        <span>Sort</span>
        <select
          value={sort}
          onChange={(event) => onSort(event.target.value as TaskSort)}
          className="h-9 rounded-xl border border-border bg-elevated px-2 text-text"
          aria-label="Sort tasks"
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
