import { useEffect, useRef } from 'react'
import { Capacitor } from '@capacitor/core'
import { db, getSettings } from '../db'
import { getTodayString } from '../utils/dateHelpers'
import { healthSync } from '../services/healthSyncPlugin'
import { useAddWater } from './useAddWater'

export function useWidgetSync() {
  const addWater = useAddWater()
  const addWaterRef = useRef(addWater)
  addWaterRef.current = addWater

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    const sync = async () => {
      if (document.visibilityState !== 'visible') return

      const today = getTodayString()
      const [waterLog, meals, workout, settings] = await Promise.all([
        db.waterLogs.where('date').equals(today).first(),
        db.mealLogs.where('date').equals(today).toArray(),
        db.workoutLogs.where('date').equals(today).first(),
        getSettings(),
      ])

      const activePlan = settings?.activePlanId
        ? await db.plans.get(settings.activePlanId)
        : null

      // Ingest any pending widget water into Dexie first
      const pending = await healthSync.getPendingWidgetWater()
      if (pending > 0) {
        // addWater writes to Dexie and calls syncWaterData internally
        await addWaterRef.current(pending)
      } else {
        await healthSync.syncWaterData(waterLog, settings?.waterGoal ?? 3000)
      }

      const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0)
      await healthSync.syncMealData(
        meals.length,
        totalCalories,
        activePlan?.calorieGoal ?? 2000,
      )

      await healthSync.syncWorkoutData(!!workout, workout?.completed ?? false)
    }

    document.addEventListener('visibilitychange', sync)
    sync()

    return () => document.removeEventListener('visibilitychange', sync)
  }, [])
}
