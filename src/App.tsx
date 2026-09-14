import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { AuthGate } from '@/components/auth/AuthGate'
import { KeyboardShortcuts } from '@/components/layout/KeyboardShortcuts'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { TimerEngine } from '@/components/layout/TimerEngine'
import { I18nProvider } from '@/i18n'
import { DashboardPage } from '@/pages/DashboardPage'
import { FocusPage } from '@/pages/FocusPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { StatisticsPage } from '@/pages/StatisticsPage'
import { TasksPage } from '@/pages/TasksPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ProfilePage } from '@/pages/ProfilePage'

function App() {
  return (
    <BrowserRouter>
      <I18nProvider>
        <ThemeProvider>
          <TimerEngine />
          <KeyboardShortcuts />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route element={<AuthGate><AppLayout /></AuthGate>}>
              <Route index element={<DashboardPage />} />
              <Route path="focus" element={<FocusPage />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="statistics" element={<StatisticsPage />} />
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
