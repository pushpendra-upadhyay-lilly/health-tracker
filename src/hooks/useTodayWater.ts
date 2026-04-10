import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { getTodayString } from '../utils/dateHelpers'
import type { WaterLog } from '../db/types'

export function useTodayWater(): WaterLog | undefined {
  return useLiveQuery(
    () => db.waterLogs.where('date').equals(getTodayString()).first(),
    []
  )
}
