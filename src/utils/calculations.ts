/** Calculate BMI from weight (kg) and height (cm) */
export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100
  return parseFloat((weightKg / (heightM * heightM)).toFixed(1))
}

/** Get BMI category label */
export function getBMICategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: 'Underweight', color: '#FF6B35' }
  if (bmi < 25) return { label: 'Normal', color: '#00FF87' }
  if (bmi < 30) return { label: 'Overweight', color: '#FF6B35' }
  return { label: 'Obese', color: '#FF4757' }
}

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
