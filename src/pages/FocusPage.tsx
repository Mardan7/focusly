import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { PomodoroTimer } from '@/components/timer/PomodoroTimer'
import { Card } from '@/components/ui/Card'
import { useTaskStore } from '@/store/useTaskStore'
import { useTimerStore } from '@/store/useTimerStore'

export function FocusPage() {
  const tasks = useTaskStore((state) => state.tasks).filter((task) => !task.completed)
  const activeTaskId = useTimerStore((state) => state.activeTaskId)
  const setActiveTask = useTimerStore((state) => state.setActiveTask)
  return <div className="space-y-5"><Link to="/" className="inline-flex items-center gap-2 text-sm text-muted hover:text-text"><ArrowLeft size={15} /> Dashboard</Link><div className="grid gap-5 lg:grid-cols-[1fr_320px]"><Card className="flex min-h-[620px] items-center justify-center"><PomodoroTimer /></Card><Card><p className="text-xs uppercase tracking-[.18em] text-muted">Focus task</p><h2 className="mt-1 text-xl font-semibold">What are you working on?</h2><div className="mt-5 space-y-2">{tasks.map((task) => <button key={task.id} type="button" onClick={() => setActiveTask(task.id)} className={`w-full rounded-2xl border px-3 py-3 text-left text-sm ${activeTaskId === task.id ? 'border-accent/50 bg-accent-soft' : 'border-border bg-elevated/60'}`}><span className="block truncate">{task.title}</span><span className="mt-1 block text-xs text-muted">{task.completedPomodoros}/{task.estimatedPomodoros} pomodoros</span></button>)}{tasks.length === 0 ? <p className="text-sm text-muted">Create an active task first.</p> : null}</div></Card></div></div>
}