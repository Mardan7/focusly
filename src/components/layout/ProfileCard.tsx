import { PROFILE } from '@/data/seed'
import { translate } from '@/i18n/core'
import { useLanguageStore } from '@/store/useLanguageStore'
import { useAuthStore } from '@/store/useAuthStore'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { restoreAnonymousData } from '@/api'
import { useI18n } from '@/i18n'

export function ProfileCard() {
  const language = useLanguageStore((state) => state.language)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const signOut = () => {
    restoreAnonymousData()
    logout()
    navigate('/login', { replace: true })
  }
  return (
    <div className="relative">
      <button type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)} className="flex w-full items-center gap-3 rounded-2xl border border-border bg-elevated/60 px-3 py-2.5 text-left hover:border-accent/30">
      <div
        aria-hidden="true"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent"
      >
        {(user?.name ?? PROFILE.name).slice(0, 2).toUpperCase()}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-text">{user?.name ?? PROFILE.name}</p>
        <p className="truncate text-[11px] text-muted">{translate(language, 'profile.role')}</p>
      </div>
      </button>
      {open ? <div className="absolute bottom-[calc(100%+0.5rem)] left-0 right-0 z-20 rounded-2xl border border-border bg-card p-1 shadow-xl"><Link to="/profile" onClick={() => setOpen(false)} className="block rounded-xl px-3 py-2 text-sm hover:bg-elevated">{t('profile.title')}</Link><Link to="/settings" onClick={() => setOpen(false)} className="block rounded-xl px-3 py-2 text-sm hover:bg-elevated">{t('nav.settings')}</Link><button type="button" onClick={signOut} className="block w-full rounded-xl px-3 py-2 text-left text-sm text-danger hover:bg-elevated">{t('auth.logout')}</button></div> : null}
    </div>
  )
}
