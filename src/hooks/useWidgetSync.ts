import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Capacitor } from '@capacitor/core'
import { db, getSettings } from '../db'
import { getTodayString } from '../utils/dateHelpers'
import { healthSync } from '../services/healthSyncPlugin'
import { useAddWater } from './useAddWater'

export function useWidgetSync() {
  const addWater = useAddWater()
  const addWaterRef = useRef(addWater)
  addWaterRef.current = addWater

  const navigate = useNavigate()
  const navigateRef = useRef(navigate)
  navigateRef.current = navigate

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    const sync = async () => {
      if (document.visibilityState !== 'visible') return

      const action = await healthSync.getWidgetAction()
      if (action === 'nutrition') {
        navigateRef.current('/nutrition')
      } else if (action === 'nutrition_log_meal') {
        navigateRef.current('/nutrition', { state: { openLogMeal: true } })
      }

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

      const pendingAmount = await healthSync.getPendingWidgetWater()
      if (pendingAmount > 0) {
        await addWaterRef.current(pendingAmount)
      } else {
        const totalMl = waterLog?.entries.reduce((sum, e) => sum + e.amount, 0) ?? 0
        await healthSync.syncWaterData(totalMl, settings?.waterGoal ?? 3000)
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
