import assert from 'node:assert/strict'
import { createServer } from 'vite'

const values = new Map()
globalThis.window = { setTimeout: (callback, delay) => setTimeout(callback, delay).unref() }
globalThis.localStorage = {
  getItem: (key) => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, value),
  removeItem: (key) => values.delete(key),
}

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } })
try {
  const { focusLevel, minuteLevel } = await server.ssrLoadModule('/src/utils/level.ts')
  const thresholds = [1, 501, 751, 950, 1150, 1350, 1530, 1700, 1850, 2000]
  for (const [index, threshold] of thresholds.entries()) {
    assert.equal(minuteLevel(threshold - 1).level, index)
    assert.equal(minuteLevel(threshold).level, index + 1)
  }
  assert.equal(minuteLevel(2500).level, 10)
  assert.equal(minuteLevel(2000).remaining, 0)
  assert.equal(minuteLevel(2000).progress, 100)
  assert.equal(minuteLevel(251).progress, 50)
  assert.equal(minuteLevel(-1).level, 0)
  const focus = (duration) => ({ type: 'focus', duration })
  assert.equal(focusLevel([]).level, 0)
  assert.equal(focusLevel([focus(59)]).level, 0)
  assert.equal(focusLevel([focus(500 * 60)]).level, 1)
  assert.equal(focusLevel([focus(501 * 60)]).level, 2)
  assert.equal(focusLevel([focus(750 * 60)]).level, 2)
  assert.equal(focusLevel([focus(751 * 60)]).level, 3)
  assert.equal(focusLevel([focus(2000 * 60)]).level, 10)
  assert.equal(focusLevel([focus(2000 * 60)]).remaining, 0)
  assert.equal(focusLevel([focus(30), focus(30)]).minutes, 1)
  assert.equal(focusLevel([{ type: 'longBreak', duration: 360000 }, focus(-5), focus(NaN)]).hours, 0)

  const { backupAnonymousData, restoreAnonymousData, hydrateRemoteData } = await server.ssrLoadModule('/src/api/sync.ts')
  const { useTaskStore } = await server.ssrLoadModule('/src/store/useTaskStore.ts')
  const { useTimerStore } = await server.ssrLoadModule('/src/store/useTimerStore.ts')
  const { useAuthStore } = await server.ssrLoadModule('/src/store/useAuthStore.ts')
  const { useSessionStore } = await server.ssrLoadModule('/src/store/useSessionStore.ts')
  const { useSettingsStore } = await server.ssrLoadModule('/src/store/useSettingsStore.ts')

  const guestTask = { id: 'guest', title: 'Guest task', description: '', category: 'Other', priority: 'Medium', estimatedPomodoros: 1, completedPomodoros: 0, completed: false, completedAt: null, createdAt: new Date().toISOString(), dueDate: null }
  useTaskStore.setState({ tasks: [guestTask] })
  backupAnonymousData()
  useTaskStore.setState({ tasks: [] })
  useTimerStore.setState({ status: 'running', endsAt: Date.now() + 10000, activeTaskId: 'account-task', completedFocusInCycle: 2 })
  restoreAnonymousData()
  assert.deepEqual(useTaskStore.getState().tasks, [guestTask])
  assert.equal(useTimerStore.getState().status, 'idle')
  assert.equal(useTimerStore.getState().activeTaskId, null)
  assert.equal(useTimerStore.getState().completedFocusInCycle, 0)

  const updatedTask = { ...guestTask, title: 'Updated guest task' }
  useTaskStore.setState({ tasks: [updatedTask] })
  backupAnonymousData()
  useTaskStore.setState({ tasks: [] })
  restoreAnonymousData()
  assert.deepEqual(useTaskStore.getState().tasks, [updatedTask])

  // An old account's pending hydration must not overwrite state after logout.
  const pending = []
  globalThis.fetch = () => new Promise((resolve) => pending.push(resolve))
  useAuthStore.setState({ token: 'old-account' })
  const hydration = hydrateRemoteData('old-account')
  useAuthStore.setState({ token: null })
  for (const resolve of pending) resolve(new Response(JSON.stringify([])))
  await hydration
  assert.deepEqual(useTaskStore.getState().tasks, [updatedTask])

  // Completing a timer after its task was deleted still records the session.
  useSettingsStore.setState({ soundEnabled: false, desktopNotifications: false })
  useTimerStore.setState({ mode: 'focus', status: 'running', endsAt: Date.now() - 1, activeTaskId: 'deleted' })
  useTimerStore.getState().completeIfDue()
  assert.equal(useSessionStore.getState().sessions.at(-1).taskId, null)

  // A settings change must not alter the duration of a session in progress.
  useTimerStore.getState().setMode('focus')
  useTimerStore.getState().start()
  const deadline = useTimerStore.getState().endsAt
  useTimerStore.getState().start()
  assert.equal(useTimerStore.getState().endsAt, deadline)
  useSettingsStore.setState({ focusDuration: 45 })
  useTimerStore.setState({ endsAt: Date.now() - 1 })
  useTimerStore.getState().completeIfDue()
  assert.equal(useSessionStore.getState().sessions.at(-1).duration, 1500)

  const user = { id: 42, name: 'Test', email: 'test@example.com', created_at: new Date().toISOString() }
  useAuthStore.setState({ token: 'valid', user })
  globalThis.fetch = async () => { throw new TypeError('Network unavailable') }
  assert.deepEqual(await useAuthStore.getState().loadCurrentUser(), user)
  assert.equal(useAuthStore.getState().token, 'valid')
  const beforeTasks = useTaskStore.getState().tasks
  assert.equal(await useTaskStore.getState().addTask({ title: 'Unsaved', description: '', category: 'Other', priority: 'Medium', estimatedPomodoros: 1, dueDate: null }), undefined)
  assert.deepEqual(useTaskStore.getState().tasks, beforeTasks)

  // A late profile response cannot log a user back in after logout.
  let resolveProfile
  globalThis.fetch = () => new Promise((resolve) => { resolveProfile = resolve })
  const loadingProfile = useAuthStore.getState().loadCurrentUser()
  useAuthStore.getState().logout()
  resolveProfile(new Response(JSON.stringify(user)))
  await loadingProfile
  assert.equal(useAuthStore.getState().user, null)

  const { saveLocalPreferences } = await server.ssrLoadModule('/src/api/localPreferences.ts')
  saveLocalPreferences(42, { ...useSettingsStore.getState(), focusDuration: 45 })
  useAuthStore.setState({ token: 'valid', user })
  globalThis.fetch = async (url) => new Response(JSON.stringify(url.endsWith('/settings') ? { user_id: 42, theme: 'dark', language: 'en', sound_enabled: false, auto_focus_mode: false, show_dnd_reminder: true, auto_fullscreen: false } : []))
  await hydrateRemoteData('valid')
  assert.equal(useSettingsStore.getState().focusDuration, 45)
  assert.equal(useTimerStore.getState().remainingMs, 45 * 60000)

  globalThis.fetch = async () => new Response('{}', { status: 401 })
  await useAuthStore.getState().loadCurrentUser()
  assert.equal(useAuthStore.getState().token, null)
  values.set('focusly-anonymous-backup', 'invalid-json')
  assert.doesNotThrow(() => restoreAnonymousData())
  const { remainingFromTimestamp } = await server.ssrLoadModule('/src/utils/timer.ts')
  assert.equal(remainingFromTimestamp(120000, 60000, 0), 60000)
  const { enterNativeFullscreen, exitNativeFullscreen } = await server.ssrLoadModule('/src/utils/fullscreen.ts')
  globalThis.document = { documentElement: {} }
  assert.equal(await enterNativeFullscreen(), false)
  document.documentElement.requestFullscreen = async () => { throw new Error('Fullscreen denied') }
  assert.equal(await enterNativeFullscreen(), false)
  document.documentElement.requestFullscreen = async () => { document.fullscreenElement = document.documentElement }
  document.exitFullscreen = async () => { document.fullscreenElement = null }
  assert.equal(await enterNativeFullscreen(), true)
  await exitNativeFullscreen()
  assert.equal(document.fullscreenElement, null)
  delete document.documentElement.requestFullscreen
  delete document.exitFullscreen
  document.documentElement.webkitRequestFullscreen = () => { document.webkitFullscreenElement = document.documentElement }
  document.webkitExitFullscreen = () => { document.webkitFullscreenElement = null }
  assert.equal(await enterNativeFullscreen(), true)
  await exitNativeFullscreen()
  assert.equal(document.webkitFullscreenElement, null)
  const { daysBack, toDayKey } = await server.ssrLoadModule('/src/utils/date.ts')
  const { computeStreak, weeklyFocusMinutes } = await server.ssrLoadModule('/src/utils/statistics.ts')
  const previousTimezone = process.env.TZ
  process.env.TZ = 'America/New_York'
  try {
    assert.deepEqual(daysBack(3, new Date(2026, 2, 9)).map(toDayKey), ['2026-03-07', '2026-03-08', '2026-03-09'])
    const sessions = [7, 8, 9].map((day) => ({ id: String(day), type: 'focus', duration: 60, taskId: null, completedAt: new Date(2026, 2, day, 12).toISOString() }))
    assert.equal(computeStreak(sessions, new Date(2026, 2, 12)).best, 3)
    assert.equal(weeklyFocusMinutes([{ ...sessions[0], completedAt: new Date(2026, 10, 1, 23, 30).toISOString() }], new Date(2026, 10, 1))[6], 1)
  } finally {
    if (previousTimezone === undefined) delete process.env.TZ
    else process.env.TZ = previousTimezone
  }
  console.log('State regressions passed: backups, logout, stale responses, timer duration, network failures, task writes and account preferences.')
} finally {
  await server.close()
}
