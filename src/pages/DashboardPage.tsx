import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Flame, Plus, Target } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PomodoroTimer } from '@/components/timer/PomodoroTimer'
import { useSessionStore } from '@/store/useSessionStore'
import { useTaskStore } from '@/store/useTaskStore'
import { useUIStore } from '@/store/useUIStore'
import { computeStreak, todayStats } from '@/utils/statistics'
import { formatLongDate } from '@/utils/date'
import { formatDuration } from '@/utils/timer'

export function DashboardPage() {
  const tasks = useTaskStore((state) => state.tasks)
  const sessions = useSessionStore((state) => state.sessions)
  const openTaskModal = useUIStore((state) => state.openTaskModal)
  const today = todayStats(sessions, tasks)
  const streak = computeStreak(sessions)
  const active = tasks.filter((task) => !task.completed).slice(0, 3)
  return <div className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm text-accent">{formatLongDate()}</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Make space for deep work.</h1><p className="mt-2 text-sm text-muted">A calm place to turn attention into progress.</p></div><Button variant="accent" onClick={() => openTaskModal()}><Plus size={16} /> New task</Button></div>
    <div className="grid gap-4 sm:grid-cols-3"><Card className="flex items-center gap-3"><Target className="text-accent" /><div><p className="text-2xl font-semibold">{today.sessions}</p><p className="text-xs text-muted">Sessions today</p></div></Card><Card className="flex items-center gap-3"><Flame className="text-orange-300" /><div><p className="text-2xl font-semibold">{streak.current} days</p><p className="text-xs text-muted">Current streak</p></div></Card><Card className="flex items-center gap-3"><CheckCircle2 className="text-accent" /><div><p className="text-2xl font-semibold">{today.tasksCompleted}</p><p className="text-xs text-muted">Tasks completed</p></div></Card></div>
    <div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]"><Card className="flex min-h-[510px] flex-col justify-center"><PomodoroTimer /></Card><Card><div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-[.18em] text-muted">Today</p><h2 className="mt-1 text-xl font-semibold">Your focus plan</h2></div><Link className="text-sm text-accent" to="/statistics">View stats <ArrowRight className="inline" size={14} /></Link></div><div className="mt-6 space-y-3">{active.map((task) => <div key={task.id} className="flex items-center justify-between rounded-2xl bg-elevated/70 px-3 py-3"><div className="min-w-0"><p className="truncate text-sm font-medium">{task.title}</p><p className="mt-1 text-xs text-muted">{task.completedPomodoros}/{task.estimatedPomodoros} pomodoros</p></div><span className="text-xs text-accent">{task.priority}</span></div>)}{active.length === 0 ? <p className="py-10 text-center text-sm text-muted">Everything is complete. Nice work.</p> : null}</div><div className="mt-6 border-t border-border pt-5"><div className="flex justify-between text-sm"><span className="text-muted">Focus time</span><span>{formatDuration(today.focusMinutes)}</span></div><div className="mt-2 h-2 rounded-full bg-elevated"><div className="h-full rounded-full bg-accent" style={{ width: `${Math.min(100, (today.sessions / 8) * 100)}%` }} /></div></div></Card></div>
  </div>
}