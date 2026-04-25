import { Capacitor } from '@capacitor/core'
import { db, getSettings } from '../db'
import { getTodayString } from '../utils/dateHelpers'
import { totalCalories, totalWater } from '../utils/calculations'
import { healthSync } from './healthSyncPlugin'

let _lastSteps = 0
export function setLastKnownSteps(steps: number) { _lastSteps = steps }
export function getLastKnownSteps(): number { return _lastSteps }

export async function syncNotificationStats(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return
  try {
    const today = getTodayString()
    const [settings, meals, waterLog] = await Promise.all([
      getSettings(),
      db.mealLogs.where('date').equals(today).toArray(),
      db.waterLogs.where('date').equals(today).first(),
    ])

    const activePlan = settings?.activePlanId
      ? await db.plans.get(settings.activePlanId)
      : null

    await healthSync.updateHealthNotification({
      calories:    totalCalories(meals),
      calorieGoal: activePlan?.calorieGoal ?? 2000,
      waterMl:     totalWater(waterLog?.entries ?? []),
      waterGoal:   settings?.waterGoal ?? 3000,
      steps:       _lastSteps,
      stepGoal:    settings?.stepGoal ?? 10000,
    })
  } catch (error) {
    console.error('syncNotificationStats failed:', error)
  }
}
