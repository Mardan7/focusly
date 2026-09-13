import { PROFILE } from '@/data/seed'
import { translate } from '@/i18n/core'
import { useLanguageStore } from '@/store/useLanguageStore'

export function ProfileCard() {
  const language = useLanguageStore((state) => state.language)
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-elevated/60 px-3 py-2.5">
      <div
        aria-hidden="true"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent"
      >
        {PROFILE.initials}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-text">{PROFILE.name}</p>
        <p className="truncate text-[11px] text-muted">{translate(language, 'profile.role')}</p>
      </div>
    </div>
  )
}
