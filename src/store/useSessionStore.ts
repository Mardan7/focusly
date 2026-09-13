import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { Session, SessionType } from '@/types/session'
import { sanitizeSessions } from '@/utils/guards'
import { safeStorage } from '@/utils/storage'

interface SessionState {
  sessions: Session[]
  addSession: (input: { taskId: string | null; type: SessionType; duration: number }) => void
  clearSessions: () => void
}

function removeLegacyDemoSessions(sessions: Session[]): Session[] {
  return sessions.filter((session) => !session.id.startsWith('seed-'))
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      sessions: [],
      addSession: ({ taskId, type, duration }) => {
        const session: Session = {
          id: crypto.randomUUID(),
          taskId,
          type,
          duration,
          completedAt: new Date().toISOString(),
        }
        set({ sessions: [...get().sessions, session] })
      },
      clearSessions: () => set({ sessions: [] }),
    }),
    {
      name: 'focusly-sessions',
      storage: createJSONStorage(() => safeStorage),
      merge: (persisted, current) => {
        const data = persisted as { sessions?: unknown } | undefined
        return {
          ...current,
          sessions: data ? removeLegacyDemoSessions(sanitizeSessions(data.sessions)) : current.sessions,
        }
      },
    },
  ),
)
