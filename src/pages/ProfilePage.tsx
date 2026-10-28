import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Camera, ChevronRight, Settings, Trophy, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { useI18n } from '@/i18n'
import { useAuthStore } from '@/store/useAuthStore'
import { useSessionStore } from '@/store/useSessionStore'
import { focusLevel, levelColor, MINUTE_THRESHOLDS } from '@/utils/level'
import { prepareAvatar } from '@/utils/avatar'

export function ProfilePage() {
  const { t, locale } = useI18n()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const updateAvatar = useAuthStore((state) => state.updateAvatar)
  const sessions = useSessionStore((state) => state.sessions)
  const rank = focusLevel(sessions)
  const navigate = useNavigate()
  const input = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  if (!user) return null
  const saveAvatar = async (file: File | null) => {
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      let avatar: string | null = null
      if (file) {
        try { avatar = await prepareAvatar(file) }
        catch { setError(t('profile.avatarInvalid')); return }
      }
      await updateAvatar(avatar)
      setSaved(true)
    } catch { setError(t('profile.avatarError')) }
    finally { setSaving(false) }
  }
  const number = (value: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value)
  return <div className="mx-auto max-w-4xl space-y-5">
    <Link to="/" className="inline-flex min-h-11 items-center gap-2 text-sm text-muted hover:text-text"><ArrowLeft size={18} />{t('focus.backDashboard')}</Link>
    <section aria-label={t('profile.progress')} className="relative isolate overflow-hidden rounded-2xl border border-yellow-400/25 bg-[#111211] p-5 text-white shadow-[inset_0_1px_0_0_#d6bd5955] sm:p-6">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10" style={{ background: 'repeating-linear-gradient(125deg, transparent 0 105px, #c5ac3010 105px 175px, transparent 175px 225px), linear-gradient(110deg, #9b85231f, transparent 65%)' }} />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3"><Sparkles size={18} className="mt-1 text-yellow-300" /><div><h2 className="font-semibold">{t('profile.progress')}</h2><p className="mt-1 text-sm text-white/50">{t('profile.levelRules')}</p></div></div>
        <Link to="/statistics" className="inline-flex min-h-8 items-center gap-1 text-sm font-medium text-white/60 hover:text-white">{t('nav.statistics')}<ChevronRight size={16} /></Link>
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div role="progressbar" aria-label={t('profile.progress')} aria-valuenow={Math.floor(rank.progress)} aria-valuemin={0} aria-valuemax={100} className="relative h-[72px] w-[72px] shrink-0">
            <svg viewBox="0 0 72 72" className="h-full w-full -rotate-90" aria-hidden="true"><circle cx="36" cy="36" r="28" fill="none" stroke="#ffffff10" strokeWidth="6" /><circle cx="36" cy="36" r="28" fill="none" stroke={rank.level === 10 ? '#ef4444' : '#facc15'} strokeWidth="6" strokeDasharray="175.93" strokeDashoffset={175.93 * (1 - rank.progress / 100)} strokeLinecap="round" /></svg>
            <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold">{rank.level}</span>
          </div>
          <div><p className="text-3xl font-bold tabular-nums">{number(rank.minutes)}</p><p className="mt-1 text-xs text-white/50">{t('profile.focusMinutes')}</p></div>
        </div>
        <div className="space-y-2 text-sm sm:text-right"><p><strong className="tabular-nums">{rank.sessionCount}</strong> <span className="text-white/50">{t('profile.sessions')}</span><span className="mx-3 text-white/20">&middot;</span><strong>{t('profile.hours', { hours: number(rank.hours) })}</strong></p><p className="text-white/50">{rank.level === 10 ? t('profile.maxLevel') : t('profile.nextLevel', { minutes: number(rank.remaining), level: rank.level + 1 })}</p></div>
      </div>
    </section>
    <Card>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="relative self-start">
          <Avatar className="h-24 w-24 text-3xl ring-4 ring-accent/10" />
          <button type="button" disabled={saving} onClick={() => input.current?.click()} aria-label={t('profile.changeAvatar')} className="absolute -bottom-1 -right-1 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-accent disabled:opacity-50"><Camera size={18} /></button>
        </div>
        <div className="min-w-0 flex-1"><p className="text-sm text-accent">{t('profile.title')}</p><h1 className="mt-1 break-words text-3xl font-semibold">{user.name}</h1><p className="mt-2 break-all text-sm text-muted">{user.email}</p></div>
        <div className="flex items-center gap-3 self-start rounded-2xl border border-border px-4 py-3" style={{ color: levelColor(rank.level) }}><Trophy size={24} /><span className="font-semibold">{rank.level ? t('profile.level', { level: rank.level }) : t('profile.beginner')}</span></div>
      </div>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" aria-label={t('profile.changeAvatar')} onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ''; if (file) void saveAvatar(file) }} />
      <div className="mt-5 flex flex-wrap gap-2"><Button variant="secondary" disabled={saving} onClick={() => input.current?.click()}>{saving ? t('profile.saving') : t('profile.changeAvatar')}</Button>{user.avatar && <Button variant="ghost" disabled={saving} onClick={() => void saveAvatar(null)}>{t('profile.removeAvatar')}</Button>}</div>
      <p className="mt-2 text-xs text-muted">{t('profile.avatarHint')}</p>
      {error && <p role="alert" className="mt-3 text-sm text-danger">{error}</p>}
      {saved && <p role="status" className="mt-3 text-sm text-accent">{t('profile.saved')}</p>}
    </Card>
    <Card>
      <h2 className="text-lg font-semibold">{t('profile.levelScale')}</h2>
      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5">{MINUTE_THRESHOLDS.map((minimum, index) => {
        const level = index + 1
        const maximum = MINUTE_THRESHOLDS[index + 1]
        return <div key={level} className="flex items-center gap-3 rounded-xl border border-border p-3" style={{ backgroundColor: level === rank.level ? `${levelColor(level)}18` : undefined }}>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold" style={{ color: levelColor(level), borderColor: levelColor(level) }}>{level}</span>
          <span className="text-xs text-muted">{t('profile.minutes', { minutes: maximum === undefined ? `${minimum}+` : `${minimum}\u2013${maximum - 1}` })}</span>
        </div>
      })}</div>
      <p className="mt-4 text-xs leading-relaxed text-muted">{t('profile.countedTime')}</p>
    </Card>
    <Link to="/settings" className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 hover:border-accent/40"><Settings className="text-accent" size={22} /><span className="min-w-0 flex-1"><span className="block font-semibold">{t('nav.settings')}</span><span className="mt-1 block text-sm text-muted">{t('profile.settingsHint')}</span></span><ChevronRight size={20} className="text-muted" /></Link>
    <div className="flex flex-wrap items-center justify-between gap-4 pb-4"><p className="text-xs text-muted">{t('profile.accountCreated')}: {new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(new Date(user.created_at))}</p><Button variant="danger" onClick={() => { logout(); navigate('/login', { replace: true }) }}>{t('auth.logout')}</Button></div>
  </div>
}
