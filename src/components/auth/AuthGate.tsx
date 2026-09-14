import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState, type ReactNode } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { hydrateRemoteData } from '@/api/sync'
import { useI18n } from '@/i18n'

export function AuthGate({ children }: { children?: ReactNode }) {
  const location = useLocation()
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const loadCurrentUser = useAuthStore((state) => state.loadCurrentUser)
  const [ready, setReady] = useState(false)
  const { t } = useI18n()

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const current = await loadCurrentUser()
      if (current && useAuthStore.getState().token) {
        try {
          await hydrateRemoteData(useAuthStore.getState().token as string)
        } catch {
          // Existing local state remains visible if the API is temporarily unavailable.
        }
      }
      if (mounted) setReady(true)
    }
    void load()
    return () => { mounted = false }
  }, [loadCurrentUser])

  if (!ready) return <div className="flex min-h-screen items-center justify-center bg-bg text-sm text-muted">{t('auth.loading')}</div>
  if (!token || !user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return children ? children : <Outlet />
}
