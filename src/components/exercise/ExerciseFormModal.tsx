import { useState, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { v4 as uuid } from 'uuid'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Button from '../ui/Button'
import { db } from '../../db'
import type { Exercise, MuscleGroup, ExerciseUnit, PlannedExercise } from '../../db/types'

export const MUSCLE_GROUPS_WITH_ALL: { id: MuscleGroup | 'all'; label: string; emoji: string }[] = [
  { id: 'all', label: 'All', emoji: '🏋️' },
  { id: 'chest', label: 'Chest', emoji: '💪' },
  { id: 'back', label: 'Back', emoji: '🔙' },
  { id: 'shoulders', label: 'Shoulders', emoji: '🤸' },
  { id: 'arms', label: 'Arms', emoji: '💪' },
  { id: 'legs', label: 'Legs', emoji: '🦵' },
  { id: 'core', label: 'Core', emoji: '🎯' },
  { id: 'cardio', label: 'Cardio', emoji: '🏃' },
  { id: 'full_body', label: 'Full Body', emoji: '⚡' },
]

export const UNIT_OPTIONS: { value: ExerciseUnit; label: string }[] = [
  { value: 'kg', label: 'kg (weight)' },
  { value: 'lbs', label: 'lbs (weight)' },
  { value: 'bodyweight', label: 'Bodyweight' },
  { value: 'minutes', label: 'Minutes (time)' },
  { value: 'meters', label: 'Meters (distance)' },
]

export const MUSCLE_OPTIONS = MUSCLE_GROUPS_WITH_ALL.filter((g) => g.id !== 'all').map((g) => ({
  value: g.id as string,
  label: `${g.emoji} ${g.label}`,
}))

const EMPTY_FORM = {
  name: '',
  muscleGroup: 'chest' as MuscleGroup,
  sets: '3',
  reps: '10',
  weight: '1',
  unit: 'kg' as ExerciseUnit,
  description: '',
  restSeconds: '90',
}

function exerciseToForm(ex: Exercise) {
  return {
    name: ex.name,
    muscleGroup: ex.muscleGroup,
    sets: String(ex.defaultSets),
    reps: String(ex.defaultReps),
    weight: String(ex.defaultWeight),
    unit: ex.unit,
    description: ex.description ?? '',
    restSeconds: '90',
  }
}

function plannedExerciseToForm(ex: PlannedExercise) {
  return {
    name: ex.name,
    muscleGroup: 'chest' as MuscleGroup,
    sets: String(ex.sets),
    reps: String(ex.reps),
    weight: String(ex.weight),
    unit: ex.unit,
    description: '',
    restSeconds: String(ex.restSeconds),
  }
}

interface ExerciseFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSaved: (data: Exercise | PlannedExercise) => void
  exercise?: Exercise
  plannedExercise?: PlannedExercise
  initialName?: string
  submitLabel?: string
}

export default function ExerciseFormModal({
  isOpen,
  onClose,
  onSaved,
  exercise,
  plannedExercise,
  initialName,
  submitLabel,
}: ExerciseFormModalProps) {
  const isPlanMode = plannedExercise !== undefined
  const isEdit = isPlanMode || Boolean(exercise)
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const allExercises = useLiveQuery(() => db.exercises.toArray(), [])

  useEffect(() => {
    if (!isOpen) return
    if (plannedExercise) {
      setForm(plannedExerciseToForm(plannedExercise))
    } else if (exercise) {
      setForm(exerciseToForm(exercise))
    } else {
      setForm({ ...EMPTY_FORM, name: initialName ?? '' })
    }
    setError('')
    setSaved(false)
  }, [isOpen, exercise, plannedExercise, initialName])

  const handleSubmit = async () => {
    if (isPlanMode) {
      const updated: PlannedExercise = {
        ...plannedExercise!,
        sets: parseInt(form.sets) || 1,
        reps: parseInt(form.reps) || 1,
        weight: parseFloat(form.weight) || 0,
        unit: form.unit,
        restSeconds: parseInt(form.restSeconds) || 60,
      }
      setSaved(true)
      setTimeout(() => onSaved(updated), 500)
      return
    }

    if (!form.name.trim()) {
      setError('Exercise name is required')
      return
    }
    const duplicate = allExercises?.some(
      (e) => e.name.toLowerCase() === form.name.trim().toLowerCase() && e.id !== exercise?.id
    )

    if (duplicate) {
      setError('An exercise with this name already exists, check if you want to use that instead');
      return;
    }

    const exerciseData: Exercise = {
      id: exercise?.id ?? uuid(),
      name: form.name.trim(),
      muscleGroup: form.muscleGroup,
      defaultSets: parseInt(form.sets) || 3,
      defaultReps: parseInt(form.reps) || 10,
      defaultWeight: parseFloat(form.weight) || 0,
      unit: form.unit,
      isCustom: true,
      description: form.description.trim() || undefined,
    }
    await db.exercises.put(exerciseData)
    setSaved(true)
    setTimeout(() => onSaved(exerciseData), 500)
  }

  const label = submitLabel ?? (isEdit ? 'Save Changes' : 'Add to Library')
  const title = isPlanMode ? `Edit ${plannedExercise!.name}` : (isEdit ? 'Edit Exercise' : 'New Exercise')

  const showReps = form.unit !== 'minutes' && form.unit !== 'meters'
  const showWeight = form.unit !== 'bodyweight'
  const weightCols = showWeight ? 'grid-cols-3' : showReps ? 'grid-cols-2' : 'grid-cols-1'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        {!isPlanMode && (
          <>
            <Input
              label="Exercise Name"
              placeholder="e.g. Reverse Curl, Face Pull"
              value={form.name}
              onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setError('') }}
              error={error}
              autoFocus
            />
            <Select
              label="Muscle Group"
              options={MUSCLE_OPTIONS}
              value={form.muscleGroup}
              onChange={(e) => setForm((f) => ({ ...f, muscleGroup: e.target.value as MuscleGroup }))}
            />
          </>
        )}

        <Select
          label="Unit"
          options={UNIT_OPTIONS}
          value={form.unit}
          onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value as ExerciseUnit }))}
        />

        <div className={`grid ${weightCols} gap-3`}>
          <Input
            label="Sets"
            type="number"
            placeholder="3"
            value={form.sets}
            onChange={(e) => setForm((f) => ({ ...f, sets: e.target.value }))}
          />
          {showReps && (
            <Input
              label="Reps"
              type="number"
              placeholder="10"
              value={form.reps}
              onChange={(e) => setForm((f) => ({ ...f, reps: e.target.value }))}
            />
          )}
          {showWeight && (
            <Input
              label={form.unit.toUpperCase()}
              type="number"
              placeholder="0"
              value={form.weight}
              onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
            />
          )}
        </div>

        {isPlanMode && (
          <Input
            label="Rest (seconds)"
            type="number"
            placeholder="90"
            value={form.restSeconds}
            onChange={(e) => setForm((f) => ({ ...f, restSeconds: e.target.value }))}
          />
        )}

        {!isPlanMode && (
          <Input
            label="Description (optional)"
            placeholder="Notes on form, variation, etc."
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        )}

        <Button fullWidth size="lg" onClick={handleSubmit} disabled={saved || (!isPlanMode && !form.name.trim())}>
          {saved ? '✓ Saved' : label}
        </Button>
      </div>
    </Modal>
  )
}
