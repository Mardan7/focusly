import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { TaskCard } from '@/components/tasks/TaskCard'
import { TaskFilters } from '@/components/tasks/TaskFilters'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useTaskStore, filterTasks, sortTasks } from '@/store/useTaskStore'
import { useTimerStore } from '@/store/useTimerStore'
import { useUIStore } from '@/store/useUIStore'
import type { TaskFilter, TaskSort } from '@/types/task'

export function TasksPage() {
  const navigate = useNavigate()
  const tasks = useTaskStore((state) => state.tasks)
  const toggleTask = useTaskStore((state) => state.toggleTask)
  const deleteTask = useTaskStore((state) => state.deleteTask)
  const [filter, setFilter] = useState<TaskFilter>('all')
  const [sort, setSort] = useState<TaskSort>('priority')
  const openTaskModal = useUIStore((state) => state.openTaskModal)
  const setActiveTask = useTimerStore((state) => state.setActiveTask)
  const visible = useMemo(() => sortTasks(filterTasks(tasks, filter), sort), [filter, sort, tasks])
  return <div className="space-y-5"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm text-accent">Task system</p><h1 className="mt-1 text-3xl font-semibold">Tasks</h1><p className="mt-2 text-sm text-muted">Shape your workload into focused sessions.</p></div><Button variant="accent" onClick={() => openTaskModal()}><Plus size={16} /> New task</Button></div><Card><TaskFilters filter={filter} sort={sort} onFilter={setFilter} onSort={setSort} /><div className="mt-5 space-y-3">{visible.map((task) => <TaskCard key={task.id} task={task} onToggle={toggleTask} onEdit={openTaskModal} onDelete={deleteTask} onFocus={(id) => { setActiveTask(id); navigate('/focus') }} />)}{visible.length === 0 ? <p className="py-12 text-center text-sm text-muted">No tasks in this view.</p> : null}</div></Card></div>
}