import { LogOut, Settings } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Logo } from '@/components/layout/Logo'
import { PROFILE } from '@/data/seed'
import { useI18n } from '@/i18n'
import { useAuthStore } from '@/store/useAuthStore'
import { Button } from '@/components/ui/Button'

export function Header() {
  const { t } = useI18n()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 lg:hidden">
      <Logo compact={false} />
      <div className="ml-auto flex shrink-0 items-center gap-2">
        <Link
          to="/settings"
          aria-label={t('nav.settings')}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted"
        >
          <Settings size={16} />
        </Link>
        <Button variant="ghost" size="sm" onClick={logout} className="shrink-0 px-2 text-danger">
          <LogOut size={16} /> {t('auth.logout')}
        </Button>
        <Link
          to="/profile"
          aria-label={t('profile.title')}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-[11px] font-semibold text-accent"
        >
          {(user?.name ?? PROFILE.name).slice(0, 2).toUpperCase()}
        </Link>
      </div>
    </header>
  )
}
