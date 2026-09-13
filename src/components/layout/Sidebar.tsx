import { NavLink } from 'react-router-dom'
import { BarChart3, LayoutDashboard, Settings, Timer, CheckSquare } from 'lucide-react'
import { Logo } from '@/components/layout/Logo'
import { ProfileCard } from '@/components/layout/ProfileCard'
import { cn } from '@/utils/cn'
import { translate } from '@/i18n/core'
import { useLanguageStore } from '@/store/useLanguageStore'

export function Sidebar() {
  const language = useLanguageStore((state) => state.language)
  const links = [
    { to: '/', label: translate(language, 'nav.dashboard'), icon: LayoutDashboard },
    { to: '/focus', label: translate(language, 'nav.focus'), icon: Timer },
    { to: '/tasks', label: translate(language, 'nav.tasks'), icon: CheckSquare },
    { to: '/statistics', label: translate(language, 'nav.statistics'), icon: BarChart3 },
  ]
  return (
    <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 self-start flex-col border-r border-border bg-surface/80 px-4 py-5 lg:flex">
      <div className="px-2 pb-8">
        <Logo />
      </div>
      <nav className="flex flex-1 flex-col gap-1" aria-label={translate(language, 'nav.primary')}>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-muted transition-colors',
                isActive && 'bg-accent-soft text-text shadow-[inset_0_0_0_1px_rgb(0_255_198/0.12)]',
              )
            }
          >
            {({ isActive }) => (
              <>
                <link.icon size={18} className={isActive ? 'text-accent' : ''} />
                {link.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="space-y-3">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-muted',
              isActive && 'bg-accent-soft text-text',
            )
          }
        >
          {({ isActive }) => (
            <>
              <Settings size={18} className={isActive ? 'text-accent' : ''} />
              {translate(language, 'nav.settings')}
            </>
          )}
        </NavLink>
        <ProfileCard />
      </div>
    </aside>
  )
}
