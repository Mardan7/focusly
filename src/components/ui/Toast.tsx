import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Info, X } from 'lucide-react'
import { useToastStore } from '@/store/useToastStore'

export function ToastViewport() {
  const toasts = useToastStore((state) => state.toasts)
  const dismiss = useToastStore((state) => state.dismiss)

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[60] flex w-[min(100%-2rem,360px)] flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            className="pointer-events-auto glass flex items-start gap-3 rounded-2xl px-4 py-3"
          >
            {toast.kind === 'success' ? (
              <CheckCircle2 className="mt-0.5 text-accent" size={18} />
            ) : (
              <Info className="mt-0.5 text-muted" size={18} />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-text">{toast.title}</p>
              {toast.description ? <p className="mt-0.5 text-xs text-muted">{toast.description}</p> : null}
            </div>
            <button
              type="button"
              aria-label="Dismiss notification"
              className="text-muted hover:text-text"
              onClick={() => dismiss(toast.id)}
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
