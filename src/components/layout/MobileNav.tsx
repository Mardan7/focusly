import { NavLink } from 'react-router-dom'
import { BarChart3, CheckSquare, LayoutDashboard, Timer } from 'lucide-react'
import { cn } from '@/utils/cn'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/focus', label: 'Focus', icon: Timer },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/statistics', label: 'Stats', icon: BarChart3 },
]

export function MobileNav() {
  return (
    <nav
      aria-label="Mobile"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/90 px-2 py-2 backdrop-blur-xl lg:hidden"
    >
      <div className="mx-auto grid max-w-lg grid-cols-4">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 rounded-2xl px-2 py-1.5 text-[11px] font-medium text-muted',
                isActive && 'text-text',
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
      </div>
    </nav>
  )
}
