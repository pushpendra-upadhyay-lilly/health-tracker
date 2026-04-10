import { v4 as uuid } from 'uuid'
import { db } from './index'
import type { Exercise } from './types'

const LIBRARY: Omit<Exercise, 'id'>[] = [
  // ── Chest ─────────────────────────────────────────────────────────────────
  { name: 'Bench Press', muscleGroup: 'chest', defaultSets: 4, defaultReps: 8, defaultWeight: 60, unit: 'kg', isCustom: false },
  { name: 'Incline Bench Press', muscleGroup: 'chest', defaultSets: 3, defaultReps: 10, defaultWeight: 50, unit: 'kg', isCustom: false },
  { name: 'Dumbbell Flyes', muscleGroup: 'chest', defaultSets: 3, defaultReps: 12, defaultWeight: 15, unit: 'kg', isCustom: false },
  { name: 'Push-Ups', muscleGroup: 'chest', defaultSets: 3, defaultReps: 15, defaultWeight: 0, unit: 'bodyweight', isCustom: false },
  { name: 'Cable Crossover', muscleGroup: 'chest', defaultSets: 3, defaultReps: 12, defaultWeight: 15, unit: 'kg', isCustom: false },
  { name: 'Chest Dips', muscleGroup: 'chest', defaultSets: 3, defaultReps: 10, defaultWeight: 0, unit: 'bodyweight', isCustom: false },

  // ── Back ──────────────────────────────────────────────────────────────────
  { name: 'Deadlift', muscleGroup: 'back', defaultSets: 4, defaultReps: 5, defaultWeight: 80, unit: 'kg', isCustom: false },
  { name: 'Pull-Ups', muscleGroup: 'back', defaultSets: 4, defaultReps: 8, defaultWeight: 0, unit: 'bodyweight', isCustom: false },
  { name: 'Barbell Row', muscleGroup: 'back', defaultSets: 4, defaultReps: 8, defaultWeight: 60, unit: 'kg', isCustom: false },
  { name: 'Lat Pulldown', muscleGroup: 'back', defaultSets: 3, defaultReps: 12, defaultWeight: 55, unit: 'kg', isCustom: false },
  { name: 'Seated Cable Row', muscleGroup: 'back', defaultSets: 3, defaultReps: 12, defaultWeight: 50, unit: 'kg', isCustom: false },
  { name: 'Face Pulls', muscleGroup: 'back', defaultSets: 3, defaultReps: 15, defaultWeight: 20, unit: 'kg', isCustom: false },
  { name: 'T-Bar Row', muscleGroup: 'back', defaultSets: 3, defaultReps: 10, defaultWeight: 40, unit: 'kg', isCustom: false },

  // ── Shoulders ─────────────────────────────────────────────────────────────
  { name: 'Overhead Press', muscleGroup: 'shoulders', defaultSets: 4, defaultReps: 8, defaultWeight: 40, unit: 'kg', isCustom: false },
  { name: 'Dumbbell Shoulder Press', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 10, defaultWeight: 18, unit: 'kg', isCustom: false },
  { name: 'Lateral Raises', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 15, defaultWeight: 8, unit: 'kg', isCustom: false },
  { name: 'Front Raises', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 12, defaultWeight: 8, unit: 'kg', isCustom: false },
  { name: 'Arnold Press', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 10, defaultWeight: 15, unit: 'kg', isCustom: false },
  { name: 'Upright Row', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 12, defaultWeight: 30, unit: 'kg', isCustom: false },

  // ── Arms ──────────────────────────────────────────────────────────────────
  { name: 'Barbell Curl', muscleGroup: 'arms', defaultSets: 3, defaultReps: 12, defaultWeight: 25, unit: 'kg', isCustom: false },
  { name: 'Dumbbell Curl', muscleGroup: 'arms', defaultSets: 3, defaultReps: 12, defaultWeight: 12, unit: 'kg', isCustom: false },
  { name: 'Hammer Curl', muscleGroup: 'arms', defaultSets: 3, defaultReps: 12, defaultWeight: 12, unit: 'kg', isCustom: false },
  { name: 'Tricep Pushdown', muscleGroup: 'arms', defaultSets: 3, defaultReps: 15, defaultWeight: 25, unit: 'kg', isCustom: false },
  { name: 'Skull Crushers', muscleGroup: 'arms', defaultSets: 3, defaultReps: 12, defaultWeight: 25, unit: 'kg', isCustom: false },
  { name: 'Overhead Tricep Extension', muscleGroup: 'arms', defaultSets: 3, defaultReps: 12, defaultWeight: 20, unit: 'kg', isCustom: false },
  { name: 'Close-Grip Bench Press', muscleGroup: 'arms', defaultSets: 3, defaultReps: 10, defaultWeight: 45, unit: 'kg', isCustom: false },
  { name: 'Preacher Curl', muscleGroup: 'arms', defaultSets: 3, defaultReps: 12, defaultWeight: 20, unit: 'kg', isCustom: false },

  // ── Legs ──────────────────────────────────────────────────────────────────
  { name: 'Squat', muscleGroup: 'legs', defaultSets: 4, defaultReps: 8, defaultWeight: 80, unit: 'kg', isCustom: false },
  { name: 'Romanian Deadlift', muscleGroup: 'legs', defaultSets: 3, defaultReps: 10, defaultWeight: 60, unit: 'kg', isCustom: false },
  { name: 'Leg Press', muscleGroup: 'legs', defaultSets: 4, defaultReps: 12, defaultWeight: 120, unit: 'kg', isCustom: false },
  { name: 'Leg Extension', muscleGroup: 'legs', defaultSets: 3, defaultReps: 15, defaultWeight: 40, unit: 'kg', isCustom: false },
  { name: 'Leg Curl', muscleGroup: 'legs', defaultSets: 3, defaultReps: 12, defaultWeight: 30, unit: 'kg', isCustom: false },
  { name: 'Lunges', muscleGroup: 'legs', defaultSets: 3, defaultReps: 12, defaultWeight: 20, unit: 'kg', isCustom: false },
  { name: 'Bulgarian Split Squat', muscleGroup: 'legs', defaultSets: 3, defaultReps: 10, defaultWeight: 20, unit: 'kg', isCustom: false },
  { name: 'Calf Raises', muscleGroup: 'legs', defaultSets: 4, defaultReps: 15, defaultWeight: 0, unit: 'bodyweight', isCustom: false },
  { name: 'Goblet Squat', muscleGroup: 'legs', defaultSets: 3, defaultReps: 12, defaultWeight: 24, unit: 'kg', isCustom: false },

  // ── Core ──────────────────────────────────────────────────────────────────
  { name: 'Plank', muscleGroup: 'core', defaultSets: 3, defaultReps: 1, defaultWeight: 60, unit: 'minutes', isCustom: false },
  { name: 'Crunches', muscleGroup: 'core', defaultSets: 3, defaultReps: 20, defaultWeight: 0, unit: 'bodyweight', isCustom: false },
  { name: 'Russian Twists', muscleGroup: 'core', defaultSets: 3, defaultReps: 20, defaultWeight: 0, unit: 'bodyweight', isCustom: false },
  { name: 'Leg Raises', muscleGroup: 'core', defaultSets: 3, defaultReps: 15, defaultWeight: 0, unit: 'bodyweight', isCustom: false },
  { name: 'Ab Wheel Rollout', muscleGroup: 'core', defaultSets: 3, defaultReps: 10, defaultWeight: 0, unit: 'bodyweight', isCustom: false },
  { name: 'Cable Crunch', muscleGroup: 'core', defaultSets: 3, defaultReps: 15, defaultWeight: 30, unit: 'kg', isCustom: false },

  // ── Cardio ────────────────────────────────────────────────────────────────
  { name: 'Running', muscleGroup: 'cardio', defaultSets: 1, defaultReps: 1, defaultWeight: 30, unit: 'minutes', isCustom: false },
  { name: 'Cycling', muscleGroup: 'cardio', defaultSets: 1, defaultReps: 1, defaultWeight: 30, unit: 'minutes', isCustom: false },
  { name: 'Jump Rope', muscleGroup: 'cardio', defaultSets: 3, defaultReps: 1, defaultWeight: 5, unit: 'minutes', isCustom: false },
  { name: 'Rowing Machine', muscleGroup: 'cardio', defaultSets: 1, defaultReps: 1, defaultWeight: 20, unit: 'minutes', isCustom: false },
  { name: 'Burpees', muscleGroup: 'cardio', defaultSets: 3, defaultReps: 15, defaultWeight: 0, unit: 'bodyweight', isCustom: false },
  { name: 'HIIT Intervals', muscleGroup: 'cardio', defaultSets: 8, defaultReps: 1, defaultWeight: 1, unit: 'minutes', isCustom: false },

  // ── Full Body ─────────────────────────────────────────────────────────────
  { name: 'Clean and Press', muscleGroup: 'full_body', defaultSets: 4, defaultReps: 5, defaultWeight: 40, unit: 'kg', isCustom: false },
  { name: 'Turkish Get-Up', muscleGroup: 'full_body', defaultSets: 3, defaultReps: 5, defaultWeight: 12, unit: 'kg', isCustom: false },
  { name: 'Kettlebell Swing', muscleGroup: 'full_body', defaultSets: 4, defaultReps: 15, defaultWeight: 16, unit: 'kg', isCustom: false },
  { name: 'Thruster', muscleGroup: 'full_body', defaultSets: 4, defaultReps: 8, defaultWeight: 30, unit: 'kg', isCustom: false },
]

export async function seedExerciseLibrary(): Promise<void> {
  const exercises = LIBRARY.map((e) => ({ ...e, id: uuid() }))
  await db.exercises.bulkPut(exercises)
}
