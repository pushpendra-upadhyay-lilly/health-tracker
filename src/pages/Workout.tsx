import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuid } from 'uuid'
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Dumbbell } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import ProgressBar from '../components/ui/ProgressBar'
import EmptyState from '../components/ui/EmptyState'
import { useActivePlan } from '../hooks/useActivePlan'
import { useTodayWorkout } from '../hooks/useTodayWorkout'
import { db } from '../db'
import type { WorkoutLog, ExerciseLog, SetLog } from '../db/types'
import { getDayOfWeek, getTodayString, DAY_FULL_LABELS } from '../utils/dateHelpers'
import { pct } from '../utils/calculations'

export default function Workout() {
  const navigate = useNavigate()
  const activePlan = useActivePlan()
  const todayWorkout = useTodayWorkout()
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null)

  const todayDOW = getDayOfWeek()
  const todayPlan = activePlan?.weekTemplate.find((d) => d.dayOfWeek === todayDOW)
  const isRestDay = todayPlan?.isRest ?? false

  const initTodayWorkout = async () => {
    if (!activePlan || !todayPlan || isRestDay) return
    const exercises: ExerciseLog[] = todayPlan.exercises.map((planned) => ({
      exerciseId: planned.exerciseId,
      name: planned.name,
      completed: false,
      sets: Array.from({ length: planned.sets }, (_, i) => ({
        setNumber: i + 1,
        targetReps: planned.reps,
        actualReps: null,
        targetWeight: planned.weight,
        actualWeight: planned.weight,
        completed: false,
      })),
    }))

    const log: WorkoutLog = {
      id: uuid(),
      date: getTodayString(),
      planId: activePlan.id,
      exercises,
      completed: false,
      startedAt: new Date().toISOString(),
    }
    await db.workoutLogs.put(log)
  }

  const toggleSet = async (exIdx: number, setIdx: number) => {
    if (!todayWorkout) return
    const updated = { ...todayWorkout }
    const set = updated.exercises[exIdx].sets[setIdx]
    set.completed = !set.completed
    if (set.completed && set.actualReps === null) {
      set.actualReps = set.targetReps
    }

    // Mark exercise complete if all sets done
    updated.exercises[exIdx].completed = updated.exercises[exIdx].sets.every((s) => s.completed)
    // Mark workout complete if all exercises done
    updated.completed = updated.exercises.every((e) => e.completed)
    if (updated.completed) updated.completedAt = new Date().toISOString()

    await db.workoutLogs.put(updated)
  }

  const updateSetValue = async (exIdx: number, setIdx: number, field: 'actualReps' | 'actualWeight', value: number) => {
    if (!todayWorkout) return
    const updated = { ...todayWorkout }
    updated.exercises[exIdx].sets[setIdx] = {
      ...updated.exercises[exIdx].sets[setIdx],
      [field]: value,
    }
    await db.workoutLogs.put(updated)
  }

  const completedCount = todayWorkout?.exercises.filter((e) => e.completed).length ?? 0
  const totalCount = todayWorkout?.exercises.length ?? todayPlan?.exercises.length ?? 0
  const progressPct = pct(completedCount, totalCount)

  if (!activePlan) {
    return (
      <div className="pb-24">
        <PageHeader title="Workout" subtitle={DAY_FULL_LABELS[todayDOW]} />
        <EmptyState
          icon={<Dumbbell size={48} className="text-[#2A2A2A]" />}
          title="No active plan"
          description="Create and activate a workout plan to start logging your exercises."
          action={<Button onClick={() => navigate('/plan')}>Go to Plans</Button>}
        />
      </div>
    )
  }

  if (isRestDay) {
    return (
      <div className="pb-24">
        <PageHeader title="Workout" subtitle={DAY_FULL_LABELS[todayDOW]} />
        <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
          <div className="text-6xl mb-4">😴</div>
          <h2 className="text-xl font-black text-white mb-2">Rest Day</h2>
          <p className="text-[#666666] text-sm max-w-xs">Recovery is part of the plan. Take it easy today and come back stronger tomorrow.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-32">
      <PageHeader
        title="Today's Workout"
        subtitle={`${activePlan.name} · ${DAY_FULL_LABELS[todayDOW]}`}
      />

      <div className="px-4 space-y-4">
        {/* Progress summary */}
        {todayWorkout && (
          <Card border className={todayWorkout.completed ? 'border-[#00FF87]/40 bg-[#0D2A1A]' : ''}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-[#666666] mb-0.5">Progress</p>
                <p className="text-lg font-black text-white">{completedCount}/{totalCount} exercises</p>
              </div>
              {todayWorkout.completed && (
                <div className="flex items-center gap-2 text-[#00FF87]">
                  <CheckCircle2 size={20} />
                  <span className="text-sm font-bold">Complete!</span>
                </div>
              )}
            </div>
            <ProgressBar value={progressPct} color="green" height="md" />
          </Card>
        )}

        {/* Start workout */}
        {!todayWorkout && (
          <Button fullWidth size="lg" onClick={initTodayWorkout} icon={<Dumbbell size={18} />}>
            Start Workout
          </Button>
        )}

        {/* Exercise list */}
        {(todayWorkout ? todayWorkout.exercises : todayPlan?.exercises ?? []).map((ex: any, exIdx: number) => {
          const isExerciseLog = 'sets' in ex && ex.sets?.[0] && 'completed' in ex.sets[0]
          const exerciseKey = isExerciseLog ? ex.exerciseId : ex.exerciseId
          const isExpanded = expandedExercise === `${exerciseKey}-${exIdx}`

          return (
            <Card key={`${exerciseKey}-${exIdx}`} border className={isExerciseLog && ex.completed ? 'border-[#00FF87]/20' : ''}>
              <button
                className="w-full flex items-center gap-3 text-left"
                onClick={() => setExpandedExercise(isExpanded ? null : `${exerciseKey}-${exIdx}`)}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isExerciseLog && ex.completed ? 'bg-[#00FF87]/15' : 'bg-[#0D0D0D]'
                }`}>
                  {isExerciseLog && ex.completed
                    ? <CheckCircle2 size={16} className="text-[#00FF87]" />
                    : <Dumbbell size={16} className="text-[#FF6B35]" />
                  }
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">{ex.name}</p>
                  {isExerciseLog ? (
                    <p className="text-xs text-[#555555]">
                      {ex.sets.filter((s: SetLog) => s.completed).length}/{ex.sets.length} sets done
                    </p>
                  ) : (
                    <p className="text-xs text-[#555555]">
                      {ex.sets}×{ex.reps} @ {ex.weight}{ex.unit}
                    </p>
                  )}
                </div>
                {isExpanded ? <ChevronUp size={16} className="text-[#555555]" /> : <ChevronDown size={16} className="text-[#555555]" />}
              </button>

              {/* Sets */}
              {isExpanded && isExerciseLog && todayWorkout && (
                <div className="mt-4 space-y-2">
                  {/* Header */}
                  <div className="grid grid-cols-4 gap-2 px-1">
                    <p className="text-[10px] text-[#555555] text-center">SET</p>
                    <p className="text-[10px] text-[#555555] text-center">TARGET</p>
                    <p className="text-[10px] text-[#555555] text-center">REPS</p>
                    <p className="text-[10px] text-[#555555] text-center">WEIGHT</p>
                  </div>
                  {(ex as ExerciseLog).sets.map((set: SetLog, setIdx: number) => (
                    <div
                      key={setIdx}
                      className={`grid grid-cols-4 gap-2 items-center p-2 rounded-xl transition-all ${
                        set.completed ? 'bg-[#00FF87]/5' : 'bg-[#0D0D0D]'
                      }`}
                    >
                      <button
                        className="flex items-center justify-center"
                        onClick={() => toggleSet(exIdx, setIdx)}
                      >
                        {set.completed
                          ? <CheckCircle2 size={20} className="text-[#00FF87]" />
                          : <Circle size={20} className="text-[#3A3A3A]" />
                        }
                      </button>
                      <p className="text-xs text-[#666666] text-center">
                        {set.targetReps}×{set.targetWeight}
                      </p>
                      <input
                        type="number"
                        className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-2 py-1.5 text-sm text-white text-center outline-none focus:border-[#00FF87] w-full"
                        value={set.actualReps ?? ''}
                        placeholder={String(set.targetReps)}
                        onChange={(e) => updateSetValue(exIdx, setIdx, 'actualReps', parseInt(e.target.value) || 0)}
                      />
                      <input
                        type="number"
                        className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-2 py-1.5 text-sm text-white text-center outline-none focus:border-[#00FF87] w-full"
                        value={set.actualWeight ?? ''}
                        placeholder={String(set.targetWeight)}
                        onChange={(e) => updateSetValue(exIdx, setIdx, 'actualWeight', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
