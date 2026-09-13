import { Settings } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { Logo } from '@/components/layout/Logo'
import { PROFILE } from '@/data/seed'
import { useI18n } from '@/i18n'

export function Header() {
  const location = useLocation()
  const { t } = useI18n()
  const titles: Record<string, string> = {
    '/': t('nav.dashboard'), '/focus': t('nav.focus'), '/tasks': t('nav.tasks'), '/statistics': t('nav.statistics'), '/settings': t('nav.settings'),
  }
  return (
    <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 lg:hidden">
      <Logo compact={false} />
      <div className="flex items-center gap-2">
        <p className="text-xs text-muted">{titles[location.pathname] ?? 'FOCUSLY'}</p>
        <Link
          to="/settings"
          aria-label={t('nav.settings')}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted"
        >
          <Settings size={16} />
        </Link>
        <div
          aria-hidden="true"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-[11px] font-semibold text-accent"
        >
          {PROFILE.initials}
        </div>
      </div>
    </header>
  )
}
