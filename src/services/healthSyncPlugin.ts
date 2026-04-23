import { registerPlugin } from '@capacitor/core'
import type { HealthSyncPlugin } from './definitions'

const HealthSync = registerPlugin<HealthSyncPlugin>('HealthSync')

// Convenience wrappers for calling the plugin
export const healthSync = {
  async syncWaterData(waterToday: any, goal: number) {
    try {
      await HealthSync.syncWaterData({ waterToday, goal })
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

  async logWaterFromWidget(amount: number) {
    try {
      await HealthSync.logWaterFromWidget(amount)
    } catch (error) {
      console.error('Failed to log water from widget:', error)
    }
  },
}
