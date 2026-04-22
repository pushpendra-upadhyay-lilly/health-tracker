import { LocalNotifications } from '@capacitor/local-notifications'
import { db, getSettings } from '../db'
import { rescheduleWaterReminders } from '../hooks/useNotifications'

export async function registerNativeNotificationActions() {
  await LocalNotifications.registerActionTypes({
    types: [
      {
        id: 'WATER_ACTIONS',
        actions: [{ id: 'drank', title: 'Drank 1 glass (250ml)' }],
      },
    ],
  })
}

export function initNativeNotificationListeners() {
  LocalNotifications.addListener('localNotificationActionPerformed', async (event) => {
    if (event.actionId === 'drank') {
      const today = new Date().toISOString().split('T')[0]
      const existing = await db.waterLogs.where('date').equals(today).first()
      const newEntry = { amount: 250, time: new Date().toISOString() }

      if (existing) {
        await db.waterLogs.update(existing.id, {
          entries: [...existing.entries, newEntry],
        })
      } else {
        const settings = await getSettings()
        await db.waterLogs.add({
          id: crypto.randomUUID(),
          date: today,
          entries: [newEntry],
          goal: settings.waterGoal,
        })
      }

      // Re-evaluate water reminders now that intake has changed
      await rescheduleWaterReminders()
    }
  })
}
