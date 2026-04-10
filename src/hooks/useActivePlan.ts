import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import type { Plan } from '../db/types'

export function useActivePlan(): Plan | undefined {
  return useLiveQuery(
    () => db.plans.filter((p) => p.isActive).first(),
    []
  )
}
