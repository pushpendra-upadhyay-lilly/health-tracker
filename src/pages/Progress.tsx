import { lazy, Suspense, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { subDays, format, parseISO, eachDayOfInterval } from 'date-fns'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import { useActivePlan } from '../hooks/useActivePlan'
import { db, getSettings } from '../db'
import { toDateString } from '../utils/dateHelpers'
import { totalWater, totalCalories } from '../utils/calculations'

const PlanVsActualChart = lazy(() =>
  import('../components/charts/PlanVsActualChart').then(m => ({ default: m.PlanVsActualChart }))
)

type Range = '7d' | '14d' | '30d'

export default function Progress() {
  const [range, setRange] = useState<Range>('7d')
  const activePlan = useActivePlan()
  const settings = useLiveQuery(() => getSettings())

  const days = range === '7d' ? 7 : range === '14d' ? 14 : 30
  const today = new Date()
  const startDate = subDays(today, days - 1)

  const dateRange = eachDayOfInterval({ start: startDate, end: today }).map(toDateString)

  const workoutLogs = useLiveQuery(
    () => db.workoutLogs.where('date').between(dateRange[0], dateRange[dateRange.length - 1], true, true).toArray(),
    [dateRange[0], dateRange[dateRange.length - 1]],
    [],
  )

  const waterLogs = useLiveQuery(
    () => db.waterLogs.where('date').between(dateRange[0], dateRange[dateRange.length - 1], true, true).toArray(),
    [dateRange[0], dateRange[dateRange.length - 1]],
    [],
  )

  const mealLogs = useLiveQuery(
    () => db.mealLogs.where('date').between(dateRange[0], dateRange[dateRange.length - 1], true, true).toArray(),
    [dateRange[0], dateRange[dateRange.length - 1]],
    [],
  )

  const waterGoal = activePlan?.waterTarget ?? settings?.waterGoal ?? 3000
  const calorieGoal = activePlan?.calorieTarget ?? settings?.calorieGoal ?? 2000

  // Build chart data per day
  const calorieData = dateRange.map((date) => {
    const meals = mealLogs?.filter((m) => m.date === date) ?? []
    return {
      date: format(parseISO(date), 'MMM d'),
      actual: totalCalories(meals),
      target: calorieGoal,
    }
  })

  const waterData = dateRange.map((date) => {
    const log = waterLogs?.find((w) => w.date === date)
    return {
      date: format(parseISO(date), 'MMM d'),
      actual: totalWater(log?.entries ?? []),
      target: waterGoal,
    }
  })

  const workoutData = dateRange.map((date) => {
    const log = workoutLogs?.find((w) => w.date === date)
    const totalSets = log?.exercises.flatMap((e) => e.sets).length ?? 0
    const doneSets = log?.exercises.flatMap((e) => e.sets).filter((s) => s.completed).length ?? 0
    return {
      date: format(parseISO(date), 'MMM d'),
      actual: doneSets,
      target: totalSets || doneSets,
    }
  })

  return (
    <div className="pb-32">
      <PageHeader title="Progress" subtitle="Plan vs Actual" back/>

      <div className="px-4 space-y-5">
        {/* Range selector */}
        <div className="flex gap-2">
          {(['7d', '14d', '30d'] as Range[]).map((r) => (
            <button
              key={r}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                range === r ? 'bg-[#00FF87] text-[#0D0D0D]' : 'bg-[#1A1A1A] text-[#666666]'
              }`}
              onClick={() => setRange(r)}
            >
              {r === '7d' ? '1 Week' : r === '14d' ? '2 Weeks' : '1 Month'}
            </button>
          ))}
        </div>

        {/* Charts */}
        <Suspense fallback={
          <div className="space-y-4">
            {[0, 1, 2].map(i => (
              <div key={i} className="h-40 bg-[#2A2A2A] rounded-2xl animate-pulse" />
            ))}
          </div>
        }>
          {/* Calorie chart */}
          <Card border>
            <p className="text-xs font-semibold text-[#555555] uppercase tracking-wider mb-4">🔥 Calories</p>
            <PlanVsActualChart data={calorieData} unit="kcal" />
          </Card>

          {/* Water chart */}
          <Card border>
            <p className="text-xs font-semibold text-[#555555] uppercase tracking-wider mb-4">💧 Water</p>
            <PlanVsActualChart data={waterData} unit="ml" />
          </Card>

          {/* Workout chart */}
          <Card border>
            <p className="text-xs font-semibold text-[#555555] uppercase tracking-wider mb-4">💪 Workout Sets</p>
            <PlanVsActualChart data={workoutData} unit="sets" />
          </Card>
        </Suspense>
      </div>
    </div>
  )
}
