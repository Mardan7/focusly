import { Link } from 'react-router-dom'
import { Logo } from '@/components/layout/Logo'
import { Avatar } from '@/components/ui/Avatar'
import { useI18n } from '@/i18n'

export function Header() {
  const { t } = useI18n()
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 lg:hidden">
      <Logo compact={false} />
      <div className="ml-auto flex shrink-0 items-center gap-2">
        <Link
          to="/profile"
          aria-label={t('profile.title')}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-[11px] font-semibold text-accent"
        >
          <Avatar className="h-9 w-9" />
        </Link>
      </div>
    </header>
  )
}
