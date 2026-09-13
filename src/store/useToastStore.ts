import { create } from 'zustand'

export type ToastKind = 'success' | 'info' | 'error'

export interface Toast {
  id: string
  title: string
  description?: string
  kind: ToastKind
}

interface ToastState {
  toasts: Toast[]
  push: (toast: Omit<Toast, 'id'>) => void
  dismiss: (id: string) => void
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  push: (toast) => {
    const id = crypto.randomUUID()
    set({ toasts: [...get().toasts, { ...toast, id }] })
    window.setTimeout(() => {
      get().dismiss(id)
    }, 3200)
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((toast) => toast.id !== id) }),
}))
