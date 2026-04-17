import { Capacitor } from '@capacitor/core'
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'
import { db } from '../db'
import type { Plan, WorkoutLog, WaterLog, MealLog, BodyMetric, Exercise, UserSettings, CustomFood } from '../db/types'

interface ExportData {
  version: number
  exportedAt: string
  settings: UserSettings[]
  plans: Plan[]
  workoutLogs: WorkoutLog[]
  waterLogs: WaterLog[]
  mealLogs: MealLog[]
  bodyMetrics: BodyMetric[]
  exercises: Exercise[]
  customFoods: CustomFood[]
}

async function shareOrDownload(json: string, filename: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    await Filesystem.writeFile({
      path: filename,
      data: json,
      directory: Directory.Cache,
      encoding: Encoding.UTF8,
    })
    const { uri } = await Filesystem.getUri({ path: filename, directory: Directory.Cache })
    await Share.share({ title: filename, url: uri })
  } else {
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }
}

export async function exportData(): Promise<void> {
  const [settings, plans, workoutLogs, waterLogs, mealLogs, bodyMetrics, exercises, customFoods] =
    await Promise.all([
      db.settings.toArray(),
      db.plans.toArray(),
      db.workoutLogs.toArray(),
      db.waterLogs.toArray(),
      db.mealLogs.toArray(),
      db.bodyMetrics.toArray(),
      db.exercises.filter((e) => e.isCustom).toArray(),
      db.customFoods.toArray(),
    ])

  const payload: ExportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    settings,
    plans,
    workoutLogs,
    waterLogs,
    mealLogs,
    bodyMetrics,
    exercises,
    customFoods,
  }

  const json = JSON.stringify(payload, null, 2)
  const filename = `bodysync-backup-${new Date().toISOString().split('T')[0]}.json`
  await shareOrDownload(json, filename)
}

export async function importData(file: File): Promise<{ success: boolean; error?: string }> {
  try {
    const text = await file.text()
    const data = JSON.parse(text) as ExportData

    if (!data.version || !data.plans) {
      return { success: false, error: 'Invalid backup file format' }
    }

    await db.transaction('rw', [db.settings, db.plans, db.workoutLogs, db.waterLogs, db.mealLogs, db.bodyMetrics, db.exercises, db.customFoods], async () => {
      if (data.settings?.length) await db.settings.bulkPut(data.settings)
      if (data.plans?.length) await db.plans.bulkPut(data.plans)
      if (data.workoutLogs?.length) await db.workoutLogs.bulkPut(data.workoutLogs)
      if (data.waterLogs?.length) await db.waterLogs.bulkPut(data.waterLogs)
      if (data.mealLogs?.length) await db.mealLogs.bulkPut(data.mealLogs)
      if (data.bodyMetrics?.length) await db.bodyMetrics.bulkPut(data.bodyMetrics)
      if (data.exercises?.length) await db.exercises.bulkPut(data.exercises)
      if (data.customFoods?.length) await db.customFoods.bulkPut(data.customFoods)
    })

    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to import data' }
  }
}

export async function exportPlan(planId: string): Promise<void> {
  const plan = await db.plans.get(planId)
  if (!plan) throw new Error('Plan not found')

  const json = JSON.stringify(plan, null, 2)
  const filename = `plan-${plan.name.replace(/\s+/g, '-').toLowerCase()}.json`
  await shareOrDownload(json, filename)
}

export async function importPlan(file: File): Promise<{ success: boolean; error?: string }> {
  try {
    const text = await file.text()
    const plan = JSON.parse(text) as Plan

    if (!plan.id || !plan.weekTemplate) {
      return { success: false, error: 'Invalid plan file format' }
    }

    await db.plans.put({ ...plan, isActive: false })
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to import plan' }
  }
}
