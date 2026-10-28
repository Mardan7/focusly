import { Link } from 'react-router-dom'
import { Avatar } from '@/components/ui/Avatar'
import { useAuthStore } from '@/store/useAuthStore'
import { useSessionStore } from '@/store/useSessionStore'
import { focusLevel, levelColor } from '@/utils/level'
import { useI18n } from '@/i18n'

export function ProfileCard() {
  const user = useAuthStore((state) => state.user)
  const sessions = useSessionStore((state) => state.sessions)
  const { level } = focusLevel(sessions)
  const { t } = useI18n()
  return <Link to="/profile" className="flex items-center gap-3 rounded-2xl border border-border bg-elevated/60 px-3 py-2.5 hover:border-accent/30">
    <Avatar />
    <span className="min-w-0"><span className="block truncate text-sm font-medium">{user?.name ?? t('profile.title')}</span><span className="text-xs" style={{ color: levelColor(level) }}>{level ? t('profile.level', { level }) : t('profile.beginner')}</span></span>
  </Link>
}
