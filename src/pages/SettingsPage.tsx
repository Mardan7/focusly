import { Link } from 'react-router-dom'
import { ArrowLeft, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Field, TextInput } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Toggle } from '@/components/ui/Toggle'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useTimerStore } from '@/store/useTimerStore'
import { requestNotificationPermission } from '@/utils/notifications'
import { useToastStore } from '@/store/useToastStore'
import { useI18n } from '@/i18n'
import { languageLabels } from '@/i18n/core'
import { useLanguageStore, type Language } from '@/store/useLanguageStore'

export function SettingsPage() {
  const settings = useSettingsStore()
  const update = settings.updateSettings
  const applyDurations = useTimerStore((state) => state.applyDurations)
  const push = useToastStore((state) => state.push)
  const { t } = useI18n()
  const language = useLanguageStore((state) => state.language)
  const setLanguage = useLanguageStore((state) => state.setLanguage)
  const setNotification = async (enabled: boolean) => { if (enabled && !(await requestNotificationPermission())) { push({ kind: 'info', title: t('settings.notificationsUnavailable'), description: t('settings.allowNotifications') }); return } update({ desktopNotifications: enabled }) }
  return <div className="space-y-5"><div className="flex flex-wrap items-center justify-between gap-3"><Link to="/profile" className="inline-flex min-h-11 items-center gap-2 text-sm text-muted hover:text-text"><ArrowLeft size={18} />{t('profile.back')}</Link></div><div><p className="text-sm text-accent">{t('settings.eyebrow')}</p><h1 className="mt-1 text-3xl font-semibold">{t('settings.title')}</h1></div><div className="grid gap-5 lg:grid-cols-2"><Card><h2 className="text-lg font-semibold">{t('settings.timer')}</h2><div className="mt-5 divide-y divide-border">
  <TimerSetting label={t('settings.focusMinutes')} hint={t('settings.durationMinutes')} value={settings.focusDuration} min={1} max={90} onCommit={(value) => update({ focusDuration: value })} />
  <TimerSetting label={t('settings.shortBreak')} hint={t('settings.durationMinutes')} value={settings.shortBreak} min={1} max={30} onCommit={(value) => update({ shortBreak: value })} />
  <TimerSetting label={t('settings.longBreak')} hint={t('settings.durationMinutes')} value={settings.longBreak} min={1} max={60} onCommit={(value) => update({ longBreak: value })} />
  <TimerSetting label={t('settings.longBreakAfter')} hint={t('settings.intervalHint')} value={settings.longBreakInterval} min={2} max={12} onCommit={(value) => update({ longBreakInterval: value })} />
</div><Button className="mt-5 w-full sm:w-auto" variant="secondary" onClick={applyDurations}>{t('settings.applyDurations')}</Button></Card><Card><h2 className="text-lg font-semibold">{t('settings.focusMode')}</h2><div className="mt-5 space-y-5"><Toggle label={t('settings.autoFocusMode')} description={t('settings.autoFocusModeDescription')} checked={settings.focusModeAutoEnter} onChange={(value) => update({ focusModeAutoEnter: value })} /><Toggle label={t('settings.dndReminder')} description={t('settings.dndReminderDescription')} checked={settings.focusModeShowDndReminder} onChange={(value) => update({ focusModeShowDndReminder: value })} /><Toggle label={t('settings.autoFullscreen')} description={t('settings.autoFullscreenDescription')} checked={settings.focusModeAutoFullscreen} onChange={(value) => update({ focusModeAutoFullscreen: value })} /></div></Card><Card><h2 className="text-lg font-semibold">{t('settings.preferences')}</h2><div className="mt-5 space-y-5"><Toggle label={t('settings.autoBreaks')} description={t('settings.autoBreaksDescription')} checked={settings.autoStartBreak} onChange={(value) => update({ autoStartBreak: value })} /><Toggle label={t('settings.autoFocus')} description={t('settings.autoFocusDescription')} checked={settings.autoStartFocus} onChange={(value) => update({ autoStartFocus: value })} /><Toggle label={t('settings.completionSound')} checked={settings.soundEnabled} onChange={(value) => update({ soundEnabled: value })} /><Toggle label={t('settings.notifications')} onChange={setNotification} checked={settings.desktopNotifications} /></div></Card><Card><h2 className="text-lg font-semibold">{t('settings.appearance')}</h2><div className="mt-5 flex flex-wrap gap-2"><Button variant={settings.theme === 'dark' ? 'accent' : 'secondary'} onClick={() => settings.setTheme('dark')}><Moon size={15} /> {t('settings.dark')}</Button><Button variant={settings.theme === 'light' ? 'accent' : 'secondary'} onClick={() => settings.setTheme('light')}><Sun size={15} /> {t('settings.light')}</Button><Select className="max-w-[130px]" value={settings.theme} onChange={(event) => settings.setTheme(event.target.value as 'dark' | 'light' | 'system')}><option value="system">{t('settings.system')}</option><option value="dark">{t('settings.dark')}</option><option value="light">{t('settings.light')}</option></Select></div><div className="mt-5"><Field label={t('settings.language')}><Select value={language} onChange={(event) => setLanguage(event.target.value as Language)}>{(['en', 'ru', 'kk'] as Language[]).map((item) => <option key={item} value={item}>{t(languageLabels[item])}</option>)}</Select></Field></div></Card></div></div>
}
function TimerSetting({ label, hint, value, min, max, onCommit }: { label: string; hint: string; value: number; min: number; max: number; onCommit: (value: number) => void }) {
  return <label className="flex items-center justify-between gap-4 py-4">
    <span className="min-w-0"><span className="block text-sm font-medium">{label}</span><span className="mt-1 block text-xs leading-relaxed text-muted">{hint}</span></span>
    <span className="w-24 shrink-0"><TextInput key={value} aria-label={label} type="number" inputMode="numeric" min={min} max={max} step={1} defaultValue={value} className="text-center tabular-nums" onBlur={(event) => {
      const raw = event.currentTarget.valueAsNumber
      const next = Number.isFinite(raw) ? Math.min(max, Math.max(min, Math.round(raw))) : value
      event.currentTarget.value = String(next)
      onCommit(next)
    }} /></span>
  </label>
}
