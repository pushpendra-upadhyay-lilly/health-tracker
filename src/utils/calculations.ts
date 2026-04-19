export { calculateBMI, getBMICategory, calculateNavyBodyFat } from './bodyMetrics'

/** Sum calories across meal logs */
export function totalCalories(meals: { calories: number }[]): number {
  return meals.reduce((sum, m) => sum + m.calories, 0)
}

/** Sum macros across meal logs */
export function totalMacros(meals: { protein: number; carbs: number; fat: number }[]): {
  protein: number
  carbs: number
  fat: number
} {
  return meals.reduce(
    (acc, m) => ({
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }),
    { protein: 0, carbs: 0, fat: 0 },
  )
}

/** Total water consumed in ml */
export function totalWater(entries: { amount: number }[]): number {
  return entries.reduce((sum, e) => sum + e.amount, 0)
}

/** Calculate percentage, clamped to 0-100 */
export function pct(actual: number, target: number): number {
  if (target === 0) return 0
  return Math.min(100, Math.round((actual / target) * 100))
}

/** Calculate total exercise volume (sets × reps × weight) */
export function exerciseVolume(sets: { actualReps: number | null; actualWeight: number | null; completed: boolean }[]): number {
  return sets
    .filter((s) => s.completed && s.actualReps !== null && s.actualWeight !== null)
    .reduce((sum, s) => sum + (s.actualReps ?? 0) * (s.actualWeight ?? 0), 0)
}

/** Format ml as display string (e.g. 2400 → "2.4L") */
export function formatWater(ml: number): string {
  if (ml >= 1000) return `${(ml / 1000).toFixed(1)}L`
  return `${ml}ml`
}

/** kg to lbs */
export function kgToLbs(kg: number): number {
  return parseFloat((kg * 2.20462).toFixed(1))
}

/** lbs to kg */
export function lbsToKg(lbs: number): number {
  return parseFloat((lbs / 2.20462).toFixed(1))
}
