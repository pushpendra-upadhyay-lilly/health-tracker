import { registerPlugin } from '@capacitor/core'
import { Capacitor } from '@capacitor/core'
import type { HealthSyncPlugin } from './definitions'
import type { MealLog, WorkoutLog } from '../db/types'

const HealthSync = registerPlugin<HealthSyncPlugin>('HealthSync')

export const healthSync = {
  async syncWaterData(waterMl: number, goal: number) {
    try {
      await HealthSync.syncWaterData({ waterMl, goal })
    } catch (error) {
      console.error('Failed to sync water data:', error)
    }
  },

  async syncMealData(mealCount: number, calories: number, goal: number) {
    try {
      await HealthSync.syncMealData({ mealCount, calories, goal })
    } catch (error) {
      console.error('Failed to sync meal data:', error)
    }
  },

  async syncWorkoutData(exists: boolean, completed?: boolean) {
    try {
      await HealthSync.syncWorkoutData({ exists, completed })
    } catch (error) {
      console.error('Failed to sync workout data:', error)
    }
  },

  async syncStepData(steps: number, goal: number) {
    try {
      await HealthSync.syncStepData({ steps, goal })
    } catch (error) {
      console.error('Failed to sync step data:', error)
    }
  },

  async getWidgetAction(): Promise<string> {
    try {
      const { action } = await HealthSync.getWidgetAction()
      return action
    } catch {
      return ''
    }
  },

  async getPendingWidgetWater(): Promise<number> {
    try {
      const { amount } = await HealthSync.getPendingWidgetWater()
      return amount
    } catch {
      return 0
    }
  },

  async checkActivityPermission(): Promise<string> {
    try {
      const { activityRecognition } = await HealthSync.checkPermissions()
      return activityRecognition
    } catch {
      return 'granted'
    }
  },

  async requestActivityPermission(): Promise<string> {
    try {
      const { activityRecognition } = await HealthSync.requestPermissions()
      return activityRecognition
    } catch {
      return 'denied'
    }
  },

  async getStepsFromSensor(): Promise<number | null> {
    try {
      const { steps } = await HealthSync.getStepsFromSensor()
      return steps
    } catch (error) {
      console.error('Step sensor not available:', error)
      return null
    }
  },

  async pinWidget(): Promise<{ success: boolean; message?: string }> {
    try {
      await HealthSync.pinWidget()
      return { success: true }
    } catch (error: any) {
      return { success: false, message: error?.message ?? 'Failed to pin widget' }
    }
  },

  async saveToDownloads(filename: string, text: string): Promise<void> {
    await HealthSync.saveToDownloads({ filename, text })
  },

  // ─── Health Connect ────────────────────────────────────────────────────────

  async isHealthConnectAvailable(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return false
    try {
      const { available } = await HealthSync.isHealthConnectAvailable()
      return available
    } catch {
      return false
    }
  },

  async checkHealthPermissions(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return false
    try {
      const { granted } = await HealthSync.checkHealthPermissions()
      return granted
    } catch {
      return false
    }
  },

  async requestHealthPermissions(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return false
    try {
      const { granted } = await HealthSync.requestHealthPermissions()
      return granted
    } catch (error: any) {
      console.error('HC requestHealthPermissions failed:', error?.message ?? error)
      return false
    }
  },

  async writeNutritionRecord(meal: MealLog): Promise<void> {
    if (!Capacitor.isNativePlatform()) return
    try {
      await HealthSync.writeNutritionRecord({
        name: meal.name,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
        mealType: meal.mealType,
        startTime: meal.createdAt,
      })
    } catch (error) {
      console.error('HC writeNutritionRecord failed:', error)
    }
  },

  async deleteNutritionRecord(startTime: string, endTime: string): Promise<void> {
    if (!Capacitor.isNativePlatform()) return
    try {
      await HealthSync.deleteNutritionRecord({ startTime, endTime })
    } catch (error) {
      console.error('HC deleteNutritionRecord failed:', error)
    }
  },

  async writeHydrationRecord(volumeMl: number, startTime: string): Promise<void> {
    if (!Capacitor.isNativePlatform()) return
    try {
      await HealthSync.writeHydrationRecord({ volumeMl, startTime })
    } catch (error) {
      console.error('HC writeHydrationRecord failed:', error)
    }
  },

  async deleteHydrationRecord(startTime: string, endTime: string): Promise<void> {
    if (!Capacitor.isNativePlatform()) return
    try {
      await HealthSync.deleteHydrationRecord({ startTime, endTime })
    } catch (error) {
      console.error('HC deleteHydrationRecord failed:', error)
    }
  },

  async writeExerciseSession(workout: WorkoutLog): Promise<void> {
    if (!Capacitor.isNativePlatform()) return
    if (!workout.startedAt || !workout.completedAt) return
    try {
      const hasCardio = workout.exercises.some(e =>
        e.name.toLowerCase().includes('run') ||
        e.name.toLowerCase().includes('cardio') ||
        e.name.toLowerCase().includes('cycling')
      )
      await HealthSync.writeExerciseSession({
        title: workout.dayLabel ?? 'Workout',
        startTime: workout.startedAt,
        endTime: workout.completedAt,
        exerciseType: hasCardio ? 'cardio' : 'weights',
      })
    } catch (error) {
      console.error('HC writeExerciseSession failed:', error)
    }
  },

  async deleteExerciseSession(startTime: string, endTime: string): Promise<void> {
    if (!Capacitor.isNativePlatform()) return
    try {
      await HealthSync.deleteExerciseSession({ startTime, endTime })
    } catch (error) {
      console.error('HC deleteExerciseSession failed:', error)
    }
  },
}
