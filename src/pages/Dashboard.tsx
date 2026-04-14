import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { Dumbbell, Droplets, Flame, ChevronRight, Plus, Activity, Sparkles, Wand2, GlassWater, TrendingUp } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { v4 as uuid } from 'uuid'
import Card from '../components/ui/Card'
import LogMealModal, { MEAL_EMOJIS } from '../components/modals/LogMealModal'
import { useActivePlan } from '../hooks/useActivePlan'
import { useTodayWater } from '../hooks/useTodayWater'
import { useTodayMeals } from '../hooks/useTodayMeals'
import { useTodayWorkout } from '../hooks/useTodayWorkout'
import { totalWater, totalCalories, pct, formatWater } from '../utils/calculations'
import { getDayOfWeek, getTodayString } from '../utils/dateHelpers'
import { db, getSettings } from '../db'
import type { WaterLog } from '../db/types'
import Button from '../components/ui/Button'

const WATER_PRESETS = [
  { label: '½ glass', amount: 125 },
  { label: '1 glass', amount: 250 },
  { label: '500ml', amount: 500 },
  { label: '1L', amount: 1000 },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const activePlan = useActivePlan()
  const todayWater = useTodayWater()
  const todayMeals = useTodayMeals()
  const todayWorkout = useTodayWorkout()
  const settings = useLiveQuery(() => getSettings())

  const [customWater, setCustomWater] = useState('')
  const [showMealModal, setShowMealModal] = useState(false)

  // ── Computed ────────────────────────────────────────────────────────────────
  const waterTotal = totalWater(todayWater?.entries ?? [])
  const waterGoal = settings?.waterGoal ?? todayWater?.goal ?? 3000
  const waterPct = pct(waterTotal, waterGoal)

  const calorieTotal = totalCalories(todayMeals)
  const calorieGoal = settings?.calorieGoal ?? 2000
  const caloriePct = pct(calorieTotal, calorieGoal)

  const todayDOW = getDayOfWeek()
  const todayPlan = activePlan?.weekTemplate.find((d) => d.dayOfWeek === todayDOW)
  const isRestDay = todayPlan?.isRest ?? false
  const plannedExercises = todayPlan?.exercises.length ?? 0
  const completedExercises = todayWorkout?.exercises.filter((e) => e.completed).length ?? 0
  const workoutPct = plannedExercises > 0 ? pct(completedExercises, plannedExercises) : 0

  const today = new Date()

  // ── Water handler ───────────────────────────────────────────────────────────
  const addWater = async (amount: number) => {
    if (amount <= 0) return
    const entry = { amount, time: new Date().toISOString() }
    if (todayWater) {
      await db.waterLogs.update(todayWater.id, { entries: [...todayWater.entries, entry] })
    } else {
      const log: WaterLog = {
        id: uuid(), date: getTodayString(),
        entries: [entry], goal: settings?.waterGoal ?? 3000,
      }
      await db.waterLogs.put(log)
    }
  }

  return (
    <div className="px-4 pb-6 safe-top">
      {/* Header */}
      <div className="pt-0 pb-5">
        <p className="text-[#666666] text-sm mb-1">{format(today, 'EEEE, MMMM d')}</p>
        <h1 className="text-2xl font-black text-white">
          {settings?.name ? `Hey, ${settings.name}` : 'Good day!'}
        </h1>
      </div>

      {/* Active Plan Banner */}
      {activePlan ? (
        <Card
          padding="md"
          hover
          border
          className="mb-4 border-[#00FF87]/20 bg-gradient-to-r from-[#1A1A1A] to-[#0D2A1A]"
          onClick={() => navigate('/workout')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#00FF87]/10 rounded-xl flex items-center justify-center">
                <Activity size={20} className="text-[#00FF87]" />
              </div>
              <div>
                <p className="text-xs text-[#00FF87] font-semibold uppercase tracking-wider mb-0.5">Active Plan</p>
                <p className="text-sm font-bold text-white">{activePlan.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isRestDay ? (
                <span className="text-xs bg-[#2A2A2A] text-[#A0A0A0] px-3 py-1 rounded-full">Rest Day</span>
              ) : (
                <span className="text-xs text-[#A0A0A0]">{completedExercises}/{plannedExercises} done</span>
              )}
              <ChevronRight size={16} className="text-[#666666]" />
            </div>
          </div>
        </Card>
      ) : (
        <Card padding="md" hover border className="mb-4" onClick={() => navigate('/plan')}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1A1A1A] rounded-xl flex items-center justify-center border border-dashed border-[#3A3A3A]">
              <Plus size={20} className="text-[#666666]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#A0A0A0]">No active plan</p>
              <p className="text-xs text-[#555555]">Create a workout plan to get started</p>
            </div>
            <ChevronRight size={16} className="text-[#666666] ml-auto" />
          </div>
        </Card>
      )}

      {/* ── Compact Stats Grid ── */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {/* Workout */}
        <button
          onClick={() => navigate('/workout')}
          className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-3 flex items-center gap-2.5 text-left active:scale-[0.97] transition-transform"
        >
          <div className="w-7 h-7 bg-[#FF6B35]/10 rounded-lg flex items-center justify-center shrink-0">
            <Dumbbell size={13} className="text-[#FF6B35]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-[#666] leading-none mb-1">Workout</p>
            <p className="text-sm font-bold text-white leading-none mb-1.5">
              {isRestDay ? 'Rest Day' : `${completedExercises}/${plannedExercises}`}
            </p>
            <div className="h-0.5 bg-[#2A2A2A] rounded-full overflow-hidden">
              <div className="h-full bg-[#FF6B35] rounded-full transition-all" style={{ width: `${workoutPct}%` }} />
            </div>
          </div>
        </button>

        {/* Water */}
        <button
          onClick={() => navigate('/nutrition')}
          className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-3 flex items-center gap-2.5 text-left active:scale-[0.97] transition-transform"
        >
          <div className="w-7 h-7 bg-blue-500/10 rounded-lg flex items-center justify-center shrink-0">
            <Droplets size={13} className="text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-[#666] leading-none mb-1">Water</p>
            <p className="text-sm font-bold text-white leading-none mb-1.5">{formatWater(waterTotal)}</p>
            <div className="h-0.5 bg-[#2A2A2A] rounded-full overflow-hidden">
              <div className="h-full bg-blue-400 rounded-full transition-all" style={{ width: `${waterPct}%` }} />
            </div>
          </div>
        </button>

        {/* Calories */}
        <button
          onClick={() => navigate('/nutrition')}
          className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-3 flex items-center gap-2.5 text-left active:scale-[0.97] transition-transform"
        >
          <div className="w-7 h-7 bg-[#00FF87]/10 rounded-lg flex items-center justify-center shrink-0">
            <Flame size={13} className="text-[#00FF87]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-[#666] leading-none mb-1">Calories</p>
            <p className="text-sm font-bold text-white leading-none mb-1.5">
              {calorieTotal} <span className="text-[10px] text-[#555] font-normal">kcal</span>
            </p>
            <div className="h-0.5 bg-[#2A2A2A] rounded-full overflow-hidden">
              <div className="h-full bg-[#00FF87] rounded-full transition-all" style={{ width: `${caloriePct}%` }} />
            </div>
          </div>
        </button>

        {/* Weekly Progress */}
        <button
          onClick={() => navigate('/progress')}
          className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-3 flex items-center gap-2.5 text-left active:scale-[0.97] transition-transform"
        >
          <div className="w-7 h-7 bg-white/5 rounded-lg flex items-center justify-center shrink-0">
            <TrendingUp size={13} className="text-[#00FF87]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-[#666] leading-none mb-1">Progress</p>
            <p className="text-sm font-bold text-white leading-none mb-1.5">
              {workoutPct}<span className="text-[10px] text-[#555] font-normal">%</span>
            </p>
            <div className="h-0.5 bg-[#2A2A2A] rounded-full overflow-hidden">
              <div className="h-full bg-[#00FF87] rounded-full transition-all" style={{ width: `${workoutPct}%` }} />
            </div>
          </div>
        </button>
      </div>

      {/* ── Water Quick Log ── */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-[#666666] uppercase tracking-wider font-semibold">Water</p>
          <span className="text-xs text-blue-400 font-medium">
            {formatWater(waterTotal)} / {formatWater(waterGoal)}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1.5 mb-2">
          {WATER_PRESETS.map(({ label, amount }) => (
            <button
              key={label}
              onClick={() => addWater(amount)}
              className="flex flex-col items-center justify-center gap-0.5 bg-blue-500/10 hover:bg-blue-500/20 active:scale-95 text-blue-400 text-[10px] font-bold py-2 rounded-xl transition-all"
            >
              <GlassWater size={12} />
              +{label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Custom ml"
            className="flex-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-[#444] outline-none focus:border-blue-400"
            value={customWater}
            onChange={(e) => setCustomWater(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { addWater(parseInt(customWater) || 0); setCustomWater('') }
            }}
          />
          <button
            onClick={() => { addWater(parseInt(customWater) || 0); setCustomWater('') }}
            className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
          >
            Add
          </button>
        </div>
      </div>

      {/* ── Meal Log ── */}
      <div className="mb-4">
        <Button
          onClick={() => setShowMealModal(true)}
          variant='primary'
          fullWidth
        >
          <Plus size={14} />
          Log Food / Meal
        </Button>
      </div>

      {/* ── AI Quick Actions ── */}
      <div className="mb-4">
        <p className="text-xs text-[#666666] uppercase tracking-wider font-semibold mb-3">AI Assistant</p>
        <div className="grid grid-cols-2 gap-3">
          <Card padding="md" hover border className="border-[#00FF87]/10" onClick={() => navigate('/ai?mode=feedback')}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#00FF87]/10 rounded-xl flex items-center justify-center shrink-0">
                <Sparkles size={18} className="text-[#00FF87]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">AI Coach</p>
                <p className="text-xs text-[#555555]">Analyze progress</p>
              </div>
            </div>
          </Card>
          <Card padding="md" hover border className="border-[#FF6B35]/10" onClick={() => navigate('/ai?mode=plan')}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#FF6B35]/10 rounded-xl flex items-center justify-center shrink-0">
                <Wand2 size={18} className="text-[#FF6B35]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">AI Plan</p>
                <p className="text-xs text-[#555555]">Create with AI</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <LogMealModal isOpen={showMealModal} onClose={() => setShowMealModal(false)} />
    </div>
  )
}
