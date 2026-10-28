import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { AuthGate } from '@/components/auth/AuthGate'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { I18nProvider } from '@/i18n/I18nProvider'
import { DashboardPage } from '@/pages/DashboardPage'
import { FocusPage } from '@/pages/FocusPage'
import { SettingsPage } from '@/pages/SettingsPage'
const StatisticsPage = lazy(() => import('@/pages/StatisticsPage').then((module) => ({ default: module.StatisticsPage })))
import { TasksPage } from '@/pages/TasksPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ProfilePage } from '@/pages/ProfilePage'

function App() {
  return (
    <BrowserRouter>
      <I18nProvider>
        <ThemeProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route element={<AuthGate><AppLayout /></AuthGate>}>
              <Route index element={<DashboardPage />} />
              <Route path="focus" element={<FocusPage />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="statistics" element={<Suspense fallback={<div role="status" aria-label="Loading" className="h-64 animate-pulse rounded-2xl bg-card" />}><StatisticsPage /></Suspense>} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </ThemeProvider>
      </I18nProvider>
    </BrowserRouter>
  )
}

export default App
