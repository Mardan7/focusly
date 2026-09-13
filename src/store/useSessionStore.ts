import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { createSeedSessions } from '@/data/seed'
import type { Session, SessionType } from '@/types/session'
import { sanitizeSessions } from '@/utils/guards'
import { safeStorage } from '@/utils/storage'

interface SessionState {
  sessions: Session[]
  addSession: (input: { taskId: string | null; type: SessionType; duration: number }) => void
  clearSessions: () => void
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      sessions: createSeedSessions(),
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
          sessions: data ? sanitizeSessions(data.sessions) : current.sessions,
        }
      },
    },
  ),
)
