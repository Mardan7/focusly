import { NavLink } from 'react-router-dom'
import { BarChart3, LayoutDashboard, Settings, Timer, CheckSquare } from 'lucide-react'
import { Logo } from '@/components/layout/Logo'
import { ProfileCard } from '@/components/layout/ProfileCard'
import { cn } from '@/utils/cn'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/focus', label: 'Focus', icon: Timer },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/statistics', label: 'Statistics', icon: BarChart3 },
]

export function Sidebar() {
  return (
    <aside className="hidden h-screen w-[248px] shrink-0 flex-col border-r border-border bg-surface/80 px-4 py-5 lg:flex">
      <div className="px-2 pb-8">
        <Logo />
      </div>
      <nav className="flex flex-1 flex-col gap-1" aria-label="Primary">
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
              Settings
            </>
          )}
        </NavLink>
        <ProfileCard />
      </div>
    </aside>
  )
}
