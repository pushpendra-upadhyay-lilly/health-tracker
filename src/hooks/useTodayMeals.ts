import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { getTodayString } from '../utils/dateHelpers'
import type { MealLog } from '../db/types'

export function useTodayMeals(): MealLog[] {
  return useLiveQuery(
    () => db.mealLogs.where('date').equals(getTodayString()).sortBy('createdAt'),
    [],
    []
  )
}
