export type SessionType = 'focus' | 'shortBreak' | 'longBreak'

export interface Session {
  id: string
  taskId: string | null
  type: SessionType
  duration: number
  completedAt: string
}
