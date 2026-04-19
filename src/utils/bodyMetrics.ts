export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100
  return parseFloat((weightKg / (heightM * heightM)).toFixed(1))
}

export function getBMICategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: 'Underweight', color: '#FF6B35' }
  if (bmi < 25) return { label: 'Normal', color: '#00FF87' }
  if (bmi < 30) return { label: 'Overweight', color: '#FF6B35' }
  return { label: 'Obese', color: '#FF4757' }
}

export function getBodyFatCategory(bodyFat: number, gender: 'male' | 'female' | 'other'): { label: string; color: string } {
  if (gender !== 'female') {
    if (bodyFat < 6) return { label: 'Essential Fat', color: '#FF6B35' }
    if (bodyFat < 14) return { label: 'Athletes', color: '#00FF87' }
    if (bodyFat < 18) return { label: 'Fitness', color: '#00FF87' }
    if (bodyFat < 25) return { label: 'Average', color: '#FF6B35' }
    return { label: 'Obese', color: '#FF4757' }
  } else {
    if (bodyFat < 16) return { label: 'Essential Fat', color: '#FF6B35' }
    if (bodyFat < 24) return { label: 'Athletes', color: '#00FF87' }
    if (bodyFat < 30) return { label: 'Fitness', color: '#00FF87' }
    if (bodyFat < 35) return { label: 'Average', color: '#FF6B35' }
  }

  return { label: 'Obese', color: '#FF4757' }
}

/** US Navy method — all measurements in cm. Returns null if inputs are invalid. */
export function calculateNavyBodyFat(
  gender: 'male' | 'female' | 'other',
  heightCm: number,
  waistCm: number,
  neckCm: number,
  hipCm?: number,
): number | null {
  if (gender === 'female' && !hipCm) return null
  const log = Math.log10
  const g = gender === 'other' ? 'male' : gender
  if (g === 'male') {
    const diff = waistCm - neckCm
    if (diff <= 0) return null
    const bf = 495 / (1.0324 - 0.19077 * log(diff) + 0.15456 * log(heightCm)) - 450
    return parseFloat(bf.toFixed(1))
  }
  const sum = waistCm + hipCm! - neckCm
  if (sum <= 0) return null
  const bf = 495 / (1.29579 - 0.35004 * log(sum) + 0.22100 * log(heightCm)) - 450
  return parseFloat(bf.toFixed(1))
}

/** Derive navy body fat from string form fields + settings values. */
export function navyBodyFatFromForm(
  gender: 'male' | 'female' | 'other' | null | undefined,
  heightCm: number,
  waist: string,
  neck: string,
  hip: string,
): number | null {
  if (!waist || !neck || !heightCm) return null
  return calculateNavyBodyFat(
    gender === 'other' || !gender ? 'male' : gender,
    heightCm,
    parseFloat(waist),
    parseFloat(neck),
    hip ? parseFloat(hip) : undefined,
  )
}
