import { db, updateSettings } from '../db'
import { healthSync } from '../services/healthSyncPlugin'

export async function runHCBackfill(): Promise<void> {
  const meals = await db.mealLogs.toArray()
  for (const meal of meals) {
    await healthSync.writeNutritionRecord(meal)
  }

  const waterLogs = await db.waterLogs.toArray()
  for (const log of waterLogs) {
    for (const entry of log.entries) {
      await healthSync.writeHydrationRecord(entry.amount, entry.time)
    }
  }

  const workouts = await db.workoutLogs
    .filter((w) => w.completed && !!w.startedAt && !!w.completedAt)
    .toArray()
  for (const workout of workouts) {
    await healthSync.writeExerciseSession(workout)
  }

  await updateSettings({ hcBackfillDone: true })
}
