import { useEffect } from 'react'
import { useTimerStore } from '@/store/useTimerStore'

export function TimerEngine() {
  const status = useTimerStore((state) => state.status)
  const completeIfDue = useTimerStore((state) => state.completeIfDue)

  useEffect(() => {
    if (status !== 'running') return
    const tick = () => completeIfDue()
    tick()
    const id = window.setInterval(tick, 250)
    const onVisible = () => {
      if (document.visibilityState === 'visible') tick()
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', tick)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', tick)
    }
  }, [status, completeIfDue])

  return null
}
