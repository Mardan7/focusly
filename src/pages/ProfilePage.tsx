import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useI18n } from '@/i18n'
import { restoreAnonymousData } from '@/api'
import { useAuthStore } from '@/store/useAuthStore'

export function ProfilePage() {
  const { t, locale } = useI18n()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()
  if (!user) return null
  const signOut = () => {
    restoreAnonymousData()
    logout()
    navigate('/login', { replace: true })
  }
  return <div className="space-y-5"><div><p className="text-sm text-accent">{t('profile.title')}</p><h1 className="mt-1 text-3xl font-semibold">{user.name}</h1></div><Card className="max-w-xl"><div className="space-y-5"><div><p className="text-xs uppercase tracking-[0.14em] text-muted">{t('profile.email')}</p><p className="mt-1">{user.email}</p></div><div><p className="text-xs uppercase tracking-[0.14em] text-muted">{t('profile.accountCreated')}</p><p className="mt-1">{new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(new Date(user.created_at))}</p></div><div className="flex flex-wrap gap-2 pt-2"><Button variant="secondary" disabled>{t('profile.edit')}</Button><Button variant="secondary" disabled>{t('profile.changePassword')}</Button><Button variant="danger" onClick={signOut}>{t('auth.logout')}</Button></div></div></Card></div>
}
