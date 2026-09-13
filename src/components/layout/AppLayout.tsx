import { Outlet } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { MobileNav } from '@/components/layout/MobileNav'
import { PageTransition } from '@/components/layout/PageTransition'
import { Sidebar } from '@/components/layout/Sidebar'
import { TaskModal } from '@/components/tasks/TaskModal'
import { ToastViewport } from '@/components/ui/Toast'

export function AppLayout() {
  return (
    <div className="flex min-h-screen bg-transparent text-text">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="app-scroll flex-1 overflow-x-hidden overflow-y-auto px-4 py-6 pb-24 lg:px-8 lg:pb-10">
          <div className="mx-auto w-full max-w-6xl">
            <PageTransition>
              <Outlet />
            </PageTransition>
          </div>
        </main>
      </div>
      <MobileNav />
      <TaskModal />
      <ToastViewport />
    </div>
  )
}
