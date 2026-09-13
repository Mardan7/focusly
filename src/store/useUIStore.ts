import { create } from 'zustand'

interface UIState {
  taskModalOpen: boolean
  editingTaskId: string | null
  celebration: boolean
  focusMode: boolean
  focusCompletion: { taskId: string | null; durationMinutes: number } | null
  openTaskModal: (taskId?: string) => void
  closeTaskModal: () => void
  triggerCelebration: () => void
  clearCelebration: () => void
  enterFocusMode: () => void
  exitFocusMode: () => void
  triggerFocusCompletion: (taskId: string | null, durationMinutes: number) => void
  clearFocusCompletion: () => void
}

export const useUIStore = create<UIState>((set) => ({
  taskModalOpen: false,
  editingTaskId: null,
  celebration: false,
  focusMode: false,
  focusCompletion: null,
  openTaskModal: (taskId) => set({ taskModalOpen: true, editingTaskId: taskId ?? null }),
  closeTaskModal: () => set({ taskModalOpen: false, editingTaskId: null }),
  triggerCelebration: () => {
    set({ celebration: true })
    window.setTimeout(() => set({ celebration: false }), 1400)
  },
  clearCelebration: () => set({ celebration: false }),
  enterFocusMode: () => set({ focusMode: true }),
  exitFocusMode: () => set({ focusMode: false, focusCompletion: null }),
  triggerFocusCompletion: (taskId, durationMinutes) => set({ focusCompletion: { taskId, durationMinutes } }),
  clearFocusCompletion: () => set({ focusCompletion: null }),
}))
