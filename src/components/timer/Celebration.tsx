import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useI18n } from '@/i18n'

export function Celebration({ active }: { active: boolean }) {
  const { t } = useI18n()
  return (
    <AnimatePresence>
      {active ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
        >
          <div className="flex items-center gap-2 rounded-full border border-accent/30 bg-accent-soft px-4 py-2 text-sm font-medium text-accent">
            <Sparkles size={16} />
            {t('timer.sessionComplete')}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
