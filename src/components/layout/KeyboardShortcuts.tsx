import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useTimerStore } from '@/store/useTimerStore'
import { useUIStore } from '@/store/useUIStore'

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable
}

export function KeyboardShortcuts() {
  const location = useLocation()
  const start = useTimerStore((state) => state.start)
  const pause = useTimerStore((state) => state.pause)
  const reset = useTimerStore((state) => state.reset)
  const skip = useTimerStore((state) => state.skip)
  const status = useTimerStore((state) => state.status)
  const openTaskModal = useUIStore((state) => state.openTaskModal)
  const focusMode = useUIStore((state) => state.focusMode)
  const enterFocusMode = useUIStore((state) => state.enterFocusMode)
  const exitFocusMode = useUIStore((state) => state.exitFocusMode)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const key = event.key.toLowerCase()
      if (key === 'f') {
        event.preventDefault()
        if (focusMode) exitFocusMode()
        else enterFocusMode()
        return
      }
      if (key === 'escape') {
        if (focusMode) {
          event.preventDefault()
          if (document.fullscreenElement) void document.exitFullscreen?.()
          else exitFocusMode()
        }
        return
      }
      if (event.code === 'Space' || key === ' ') {
        event.preventDefault()
        if (status === 'running') pause()
        else start()
        return
      }
      if (key === 'r') {
        event.preventDefault()
        reset()
      }
      if (key === 's') {
        event.preventDefault()
        skip()
      }
      if (key === 'n') {
        event.preventDefault()
        openTaskModal()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [enterFocusMode, exitFocusMode, focusMode, location.pathname, openTaskModal, pause, reset, skip, start, status])

  return null
}
