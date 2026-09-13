import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Field, TextInput } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Toggle } from '@/components/ui/Toggle'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useTimerStore } from '@/store/useTimerStore'
import { requestNotificationPermission } from '@/utils/notifications'
import { useToastStore } from '@/store/useToastStore'

export function SettingsPage() {
  const settings = useSettingsStore()
  const update = settings.updateSettings
  const applyDurations = useTimerStore((state) => state.applyDurations)
  const push = useToastStore((state) => state.push)
  const setNotification = async (enabled: boolean) => { if (enabled && !(await requestNotificationPermission())) { push({ kind: 'info', title: 'Notifications unavailable', description: 'Allow notifications in your browser to use this feature.' }); return } update({ desktopNotifications: enabled }) }
  return <div className="space-y-5"><div><p className="text-sm text-accent">Personalize the system</p><h1 className="mt-1 text-3xl font-semibold">Settings</h1></div><div className="grid gap-5 lg:grid-cols-2"><Card><h2 className="text-lg font-semibold">Timer</h2><div className="mt-5 grid grid-cols-2 gap-3"><Field label="Focus minutes"><TextInput type="number" min={1} max={90} value={settings.focusDuration} onChange={(event) => update({ focusDuration: Number(event.target.value) })} /></Field><Field label="Short break"><TextInput type="number" min={1} max={30} value={settings.shortBreak} onChange={(event) => update({ shortBreak: Number(event.target.value) })} /></Field><Field label="Long break"><TextInput type="number" min={1} max={60} value={settings.longBreak} onChange={(event) => update({ longBreak: Number(event.target.value) })} /></Field><Field label="Long break after"><TextInput type="number" min={2} max={12} value={settings.longBreakInterval} onChange={(event) => update({ longBreakInterval: Number(event.target.value) })} /></Field></div><Button className="mt-5" variant="secondary" onClick={applyDurations}>Apply durations</Button></Card><Card><h2 className="text-lg font-semibold">Preferences</h2><div className="mt-5 space-y-5"><Toggle label="Auto-start breaks" description="Move into the next break automatically." checked={settings.autoStartBreak} onChange={(value) => update({ autoStartBreak: value })} /><Toggle label="Auto-start focus" description="Start the next focus session automatically." checked={settings.autoStartFocus} onChange={(value) => update({ autoStartFocus: value })} /><Toggle label="Completion sound" checked={settings.soundEnabled} onChange={(value) => update({ soundEnabled: value })} /><Toggle label="Desktop notifications" checked={settings.desktopNotifications} onChange={setNotification} /></div></Card><Card><h2 className="text-lg font-semibold">Appearance</h2><div className="mt-5 flex gap-2"><Button variant={settings.theme === 'dark' ? 'accent' : 'secondary'} onClick={() => settings.setTheme('dark')}><Moon size={15} /> Dark</Button><Button variant={settings.theme === 'light' ? 'accent' : 'secondary'} onClick={() => settings.setTheme('light')}><Sun size={15} /> Light</Button><Select className="max-w-[130px]" value={settings.theme} onChange={(event) => settings.setTheme(event.target.value as 'dark' | 'light' | 'system')}><option value="system">System</option><option value="dark">Dark</option><option value="light">Light</option></Select></div></Card></div></div>
}