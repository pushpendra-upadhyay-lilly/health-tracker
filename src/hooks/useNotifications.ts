import { useCallback } from 'react'

export function useNotifications() {
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) return false
    if (Notification.permission === 'granted') return true
    const result = await Notification.requestPermission()
    return result === 'granted'
  }, [])

  const scheduleReminder = useCallback((title: string, body: string, delayMs: number) => {
    if (Notification.permission !== 'granted') return
    setTimeout(() => {
      new Notification(title, { body, icon: '/icon-192.png', badge: '/icon-192.png' })
    }, delayMs)
  }, [])

  const isSupported = 'Notification' in window
  const isGranted = isSupported && Notification.permission === 'granted'

  return { requestPermission, scheduleReminder, isSupported, isGranted }
}
