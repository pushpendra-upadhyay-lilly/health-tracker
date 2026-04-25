export type PermissionState = 'granted' | 'denied' | 'prompt' | 'prompt-with-rationale'

export interface ActivityRecognitionPermission {
  activityRecognition: PermissionState
}

export interface HealthSyncPlugin {
  syncWaterData(options: { waterMl: number; goal: number }): Promise<void>
  syncMealData(options: { mealCount: number; calories: number; goal: number }): Promise<void>
  syncWorkoutData(options: { exists: boolean; completed?: boolean }): Promise<void>
  syncStepData(options: { steps: number; goal: number }): Promise<void>
  getPendingWidgetWater(): Promise<{ amount: number }>
  getWidgetAction(): Promise<{ action: string }>
  checkPermissions(): Promise<ActivityRecognitionPermission>
  requestPermissions(): Promise<ActivityRecognitionPermission>
  getStepsFromSensor(): Promise<{ steps: number }>
  pinWidget(): Promise<void>
  saveToDownloads(opts: { text: string; filename: string }): Promise<void>
  // Health Connect
  isHealthConnectAvailable(): Promise<{ available: boolean }>
  checkHealthPermissions(): Promise<{ granted: boolean }>
  requestHealthPermissions(): Promise<{ granted: boolean }>
  writeNutritionRecord(opts: { name: string; calories: number; protein: number; carbs: number; fat: number; mealType: string; startTime: string }): Promise<void>
  deleteNutritionRecord(opts: { startTime: string; endTime: string }): Promise<void>
  writeHydrationRecord(opts: { volumeMl: number; startTime: string }): Promise<void>
  deleteHydrationRecord(opts: { startTime: string; endTime: string }): Promise<void>
  writeExerciseSession(opts: { title: string; startTime: string; endTime: string; exerciseType: string }): Promise<void>
  deleteExerciseSession(opts: { startTime: string; endTime: string }): Promise<void>
}
