import type { WaterLog } from '../db/types'

export interface HealthSyncPlugin {
  syncWaterData(options: {
    waterToday?: WaterLog
    goal: number
  }): Promise<void>

  syncMealData(options: {
    mealCount: number
    calories: number
    goal: number
  }): Promise<void>

  syncWorkoutData(options: {
    exists: boolean
    completed?: boolean
  }): Promise<void>

  syncStepData(options: {
    steps: number
    goal: number
  }): Promise<void>

  logWaterFromWidget(amount: number): Promise<void>
}
