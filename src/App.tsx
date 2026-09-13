import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { KeyboardShortcuts } from '@/components/layout/KeyboardShortcuts'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { TimerEngine } from '@/components/layout/TimerEngine'
import { DashboardPage } from '@/pages/DashboardPage'
import { FocusPage } from '@/pages/FocusPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { StatisticsPage } from '@/pages/StatisticsPage'
import { TasksPage } from '@/pages/TasksPage'

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <TimerEngine />
        <KeyboardShortcuts />
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="focus" element={<FocusPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="statistics" element={<StatisticsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
