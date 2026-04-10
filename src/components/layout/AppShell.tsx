import { Outlet, useLocation } from 'react-router-dom'
import BottomNav from './BottomNav'

export default function AppShell() {
  const location = useLocation()
  const isOnboarding = location.pathname === '/onboarding'

  return (
    <div className="flex flex-col h-full bg-[#0D0D0D]">
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <Outlet />
      </main>
      {!isOnboarding && <BottomNav />}
    </div>
  )
}
