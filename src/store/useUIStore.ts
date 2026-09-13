import { create } from 'zustand'

interface UIState {
  taskModalOpen: boolean
  editingTaskId: string | null
  celebration: boolean
  openTaskModal: (taskId?: string) => void
  closeTaskModal: () => void
  triggerCelebration: () => void
  clearCelebration: () => void
}

export const useUIStore = create<UIState>((set) => ({
  taskModalOpen: false,
  editingTaskId: null,
  celebration: false,
  openTaskModal: (taskId) => set({ taskModalOpen: true, editingTaskId: taskId ?? null }),
  closeTaskModal: () => set({ taskModalOpen: false, editingTaskId: null }),
  triggerCelebration: () => {
    set({ celebration: true })
    window.setTimeout(() => set({ celebration: false }), 1400)
  },
  clearCelebration: () => set({ celebration: false }),
}))
