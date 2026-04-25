import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect } from 'react'
import { Capacitor } from '@capacitor/core'
import { db, getSettings } from '../db'
import { getTodayString } from '../utils/dateHelpers'
import { healthSync } from '../services/healthSyncPlugin'

export function useRealtimeWidgetSync() {
  const isNative = Capacitor.isNativePlatform()
  const today = getTodayString()

  const waterLog = useLiveQuery(
    () => db.waterLogs.where('date').equals(today).first(),
    [today],
  )

  const meals = useLiveQuery(
    () => db.mealLogs.where('date').equals(today).toArray(),
    [today],
    [],
  )

  const workout = useLiveQuery(
    () => db.workoutLogs.where('date').equals(today).first(),
    [today],
  )

  const config = useLiveQuery(async () => {
    const settings = await getSettings()
    const plan = settings?.activePlanId
      ? await db.plans.get(settings.activePlanId)
      : null
    return {
      waterGoal: settings?.waterGoal ?? 3000,
      calorieGoal: plan?.calorieGoal ?? 2000,
    }
  }, [])

  useEffect(() => {
    if (!isNative || waterLog === undefined || config === undefined) return
    const totalMl = waterLog?.entries.reduce((sum, e) => sum + e.amount, 0) ?? 0
    healthSync.syncWaterData(totalMl, config.waterGoal)
  }, [waterLog, config, isNative])

  useEffect(() => {
    if (!isNative || meals === undefined || config === undefined) return
    const calories = meals.reduce((sum, m) => sum + m.calories, 0)
    healthSync.syncMealData(meals.length, calories, config.calorieGoal)
  }, [meals, config, isNative])

  useEffect(() => {
    if (!isNative || workout === undefined) return
    healthSync.syncWorkoutData(!!workout, workout?.completed ?? false)
  }, [workout, isNative])
}
