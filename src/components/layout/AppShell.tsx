import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import BottomNav from './BottomNav'
import { getSettings } from '../../db'
import { useNotifications } from '../../hooks/useNotifications'

export default function AppShell() {
  const location = useLocation()
  const isOnboarding = location.pathname === '/onboarding'
  const settings = useLiveQuery(() => getSettings())
  const { initReminders, stopAllReminders } = useNotifications()

  useEffect(() => {
    if (settings === undefined) return
    if (settings.notificationsEnabled) {
      initReminders()
    } else {
      stopAllReminders()
    }
  }, [settings?.notificationsEnabled, settings?.workoutReminderTime, settings?.activePlanId])

  return (
    <div className="flex flex-col h-full bg-[#0D0D0D]">
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <Outlet />
      </main>
      {!isOnboarding && <BottomNav />}
    </div>
  )
}
