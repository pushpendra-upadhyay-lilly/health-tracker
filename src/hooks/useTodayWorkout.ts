import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { getTodayString } from '../utils/dateHelpers'
import type { WorkoutLog } from '../db/types'

export function useTodayWorkout(): WorkoutLog | undefined {
  return useLiveQuery(
    () => db.workoutLogs.where('date').equals(getTodayString()).first(),
    []
  )
}
