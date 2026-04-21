import { eachDayOfInterval, subDays } from 'date-fns'
import { useLiveQuery } from 'dexie-react-hooks'
import { Pencil, Plus, Scale, Trash2 } from 'lucide-react'
import { lazy, Suspense, useMemo, useState } from 'react'
import { v4 as uuid } from 'uuid'
import PageHeader from '../components/layout/PageHeader'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import Tooltip from '../components/ui/Tooltip'
import { db, getSettings } from '../db'
import { useActivePlan } from '../hooks/useActivePlan'
import { calculateBMI, getBMICategory, getBodyFatCategory, navyBodyFatFromForm } from '../utils/bodyMetrics'
import { formatDisplay, getTodayString, toDateString } from '../utils/dateHelpers'

const BodyTrendChart = lazy(() =>
  import('../components/charts/BodyTrendChart').then(m => ({ default: m.BodyTrendChart }))
)

type Range = '7d' | '14d' | '30d'

export default function Body() {
  const metrics = useLiveQuery(() => db.bodyMetrics.orderBy('date').reverse().toArray(), [])
  const settings = useLiveQuery(() => getSettings())
  const activePlan = useActivePlan()
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ weight: '', height: '', bodyFat: '', waist: '', neck: '', hip: '', date: getTodayString() })
  const [range, setRange] = useState<Range>('30d')

  // Merge all same-date entries so duplicates (e.g. from Settings auto-log) don't hide data
  const latest = useMemo(() => {
    if (!metrics?.length) return null
    const mostRecentDate = metrics[0].date
    return metrics
      .filter(m => m.date === mostRecentDate)
      .reduce((acc, m) => ({
        ...acc,
        weight: m.weight ?? acc.weight,
        height: m.height ?? acc.height,
        bmi: m.bmi ?? acc.bmi,
        bodyFat: m.bodyFat ?? acc.bodyFat,
      }))
  }, [metrics])

  const bmi = latest?.weight && latest?.height ? calculateBMI(latest.weight, latest.height) : null
  const bmiInfo = bmi ? getBMICategory(bmi) : null
  const bodyFatInfo = latest?.bodyFat && settings?.gender ? getBodyFatCategory(latest.bodyFat, settings.gender) : null

  const gender = settings?.gender ?? 'male'
  const effectiveHeight = form.height ? parseFloat(form.height) : (settings?.height ?? 0)
  const navyBodyFat = navyBodyFatFromForm(gender, effectiveHeight, form.waist, form.neck, form.hip)

  const resetForm = () => {
    setForm({ weight: '', height: '', bodyFat: '', waist: '', neck: '', hip: '', date: getTodayString() })
    setEditingId(null)
    setShowModal(false)
  }

  const handleEdit = (m: { id: string; date: string; weight: number | null; height: number | null; bodyFat: number | null }) => {
    setForm({
      weight: m.weight ? String(m.weight) : '',
      height: m.height ? String(m.height) : '',
      bodyFat: m.bodyFat ? String(m.bodyFat) : '',
      waist: '', neck: '', hip: '',
      date: m.date,
    })
    setEditingId(m.id)
    setShowModal(true)
  }

  const handleAdd = async () => {
    const height = form.height ? parseFloat(form.height) : settings?.height ?? null
    const weight = form.weight ? parseFloat(form.weight) : null
    const bmiCalc = weight && height ? calculateBMI(weight, height) : null
    const bodyFat = form.bodyFat ? parseFloat(form.bodyFat) : navyBodyFat

    if (editingId) {
      await db.bodyMetrics.update(editingId, {
        date: form.date,
        ...(weight !== null && { weight, bmi: bmiCalc }),
        ...(height !== null && { height }),
        ...(bodyFat !== null && { bodyFat }),
      })
    } else {
      // Collapse all existing entries for this date into one canonical entry
      const existing = await db.bodyMetrics.where('date').equals(form.date).toArray()
      if (existing.length > 0) {
        const base = existing.reduce((acc, m) => ({
          ...acc,
          weight: m.weight ?? acc.weight,
          height: m.height ?? acc.height,
          bmi: m.bmi ?? acc.bmi,
          bodyFat: m.bodyFat ?? acc.bodyFat,
        }))
        const ids = existing.map(e => e.id).filter(id => id !== base.id)
        if (ids.length) await db.bodyMetrics.bulkDelete(ids)
        await db.bodyMetrics.update(base.id, {
          ...(weight !== null && { weight, bmi: bmiCalc }),
          ...(height !== null && { height }),
          ...(bodyFat !== null && { bodyFat }),
        })
      } else {
        await db.bodyMetrics.put({ id: uuid(), date: form.date, weight, height, bodyFat, bmi: bmiCalc })
      }
    }
    resetForm()
  }

  const handleDelete = async (id: string) => {
    await db.bodyMetrics.delete(id)
  }

  const chartData = useMemo(() => {
    const days = range === '7d' ? 7 : range === '14d' ? 14 : 30
    const today = new Date()
    const dateRange = eachDayOfInterval({ start: subDays(today, days - 1), end: today }).map(toDateString)
    const byDate = new Map<string, { weight: number | null; bmi?: number | null; bodyFat?: number | null }>()
    metrics?.forEach(m => byDate.set(m.date, { weight: m.weight, bmi: m.bmi, bodyFat: m.bodyFat }))
    let last: { weight: number | null; bmi?: number | null; bodyFat?: number | null } = { weight: null, bmi: null, bodyFat: null }
    return dateRange.map(date => {
      const entry = byDate.get(date)
      if (entry) last = entry
      return { date, ...last }
    })
  }, [metrics, range])

  return (
    <div className="pb-32">
      <PageHeader
        back
        title="Body Metrics"
        subtitle="Weight & composition tracking"
        right={
          <Button size="sm" icon={<Plus size={14} />} onClick={() => { resetForm(); setShowModal(true) }}>
            Log
          </Button>
        }
      />

      <div className="px-4 space-y-4">
        {/* Stats summary */}
        {latest ? (
          <div className="grid grid-cols-3 gap-3">
            <Card border>
              <p className="text-xs text-[#666666] mb-1">Weight</p>
              <p className="text-xl font-black text-white">{latest.weight ?? '—'}
                <span className="text-xs ml-1 text-[#555555]">kg</span>
              </p>
              
              {settings?.currentWeight && latest.weight && (
                <p className="text-[10px] text-[#00FF87] mt-1">
                  {(latest.weight - settings.currentWeight).toFixed(1)} to goal
                </p>
              )}
            </Card>
            <Card border>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-[#666666]">BMI</p>
                <Tooltip content={((<>
                  <strong>weight (kg) ÷ height (m)²</strong>
                  <br /><br />
                  &lt; 18.5 - <b>Underweight</b><br />
                  18.5 – 24.9 - <b>Normal</b><br />
                  25 – 29.9 - <b>Overweight</b><br />
                  &gt; 30 - <b>Obese</b></>))} />
              </div>
              <p className="text-xl font-black text-white">{bmi ?? '—'}</p>
              {bmiInfo && (
                <p className="text-xs font-semibold mt-0.5" style={{ color: bmiInfo.color }}>
                  {bmiInfo.label}
                </p>
              )}
            </Card>
            <Card border>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-[#666666]">Body Fat</p>
                <Tooltip
                content={(<>
                  <strong>US Navy Method</strong><br /><br />
                  Men: 495 ÷ (1.0324 − 0.19077×log(waist−neck) + 0.15456×log(height)) − 450<br /><br />
                  Women: same formula with hip added to waist.<br /><br />
                  Healthy: <br/>Men 10–20% · Women 20–30%</>
                )}
                />
              </div>
               <p className="text-xl font-black text-white">{latest.bodyFat ?? '—'}
                <span className="text-xs ml-1 text-[#555555]">%</span>
              </p>
              {bodyFatInfo && (
                <p className="text-xs font-semibold mt-0.5" style={{ color: bodyFatInfo.color }}>
                  {bodyFatInfo.label}
                </p>
              )}
            </Card>
          </div>
        ) : (
          <EmptyState
            icon={<Scale size={48} className="text-[#2A2A2A]" />}
            title="No metrics logged"
            description="Start logging your weight and body composition to track your progress over time."
            action={
              <Button icon={<Plus size={16} />} onClick={() => setShowModal(true)}>
                Log First Entry
              </Button>
            }
          />
        )}

        {/* Chart */}
        {chartData.some(d => d.weight !== null) && (
          <Suspense fallback={<div className="h-44 bg-[#2A2A2A] rounded-2xl animate-pulse" />}>
            <Card border>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold text-[#555555] uppercase tracking-wider">Weight Trend</p>
                <div className="flex gap-1">
                  {(['7d', '14d', '30d'] as Range[]).map(r => (
                    <button
                      key={r}
                      onClick={() => setRange(r)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${range === r ? 'bg-[#00FF87] text-[#0D0D0D]' : 'bg-[#1A1A1A] text-[#555555]'}`}
                    >
                      {r === '7d' ? '1W' : r === '14d' ? '2W' : '1M'}
                    </button>
                  ))}
                </div>
              </div>
              <BodyTrendChart data={chartData} goalWeight={activePlan?.weightGoal ?? null} />
            </Card>
          </Suspense>
        )}

        {/* History list */}
        {metrics && metrics.length > 0 && (
          <>
            <p className="text-xs font-semibold text-[#555555] uppercase tracking-wider">History</p>
            <div className="space-y-2">
              {metrics.slice(0, 20).map((m) => (
                <Card key={m.id} border padding="sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">{formatDisplay(m.date)}</p>
                      <p className="text-xs text-[#555555]">
                        {[
                          m.weight && `${m.weight}kg`,
                          m.bmi && `BMI ${m.bmi}`,
                          m.bodyFat && `${m.bodyFat}% BF`,
                        ].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="text-[#555555] hover:text-white transition-colors" onClick={() => handleEdit(m)}>
                        <Pencil size={13} />
                      </button>
                      <button className="text-[#FF4757]/50 hover:text-[#FF4757] transition-colors" onClick={() => handleDelete(m.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      <Modal isOpen={showModal} onClose={resetForm} title={editingId ? 'Edit Entry' : 'Log Body Metrics'}>
        <div className="space-y-4">
          <Input
            label="Date"
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          />
          <Input
            label="Weight"
            type="number"
            suffix="kg"
            placeholder="75.0"
            value={form.weight}
            onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
            autoFocus
          />
          <Input
            label="Height (optional — used for BMI)"
            type="number"
            suffix="cm"
            placeholder={String(settings?.height ?? 175)}
            value={form.height}
            onChange={(e) => setForm((f) => ({ ...f, height: e.target.value }))}
          />
          <Input
            label="Body Fat % (manual override)"
            type="number"
            suffix="%"
            placeholder="15.0"
            value={form.bodyFat}
            onChange={(e) => setForm((f) => ({ ...f, bodyFat: e.target.value }))}
          />
          <div className="bg-[#0D0D0D] rounded-xl p-3 space-y-3">
            <p className="text-xs font-semibold text-[#555555] uppercase tracking-wider">Navy Method (auto-calculate body fat)</p>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Waist" type="number" suffix="cm" placeholder="80" value={form.waist} onChange={(e) => setForm(f => ({ ...f, waist: e.target.value }))} />
              <Input label="Neck" type="number" suffix="cm" placeholder="38" value={form.neck} onChange={(e) => setForm(f => ({ ...f, neck: e.target.value }))} />
            </div>
            {gender === 'female' && (
              <Input label="Hip" type="number" suffix="cm" placeholder="95" value={form.hip} onChange={(e) => setForm(f => ({ ...f, hip: e.target.value }))} />
            )}
            {navyBodyFat !== null && !form.bodyFat && (
              <p className="text-sm font-bold text-[#00FF87]">Estimated Body Fat: {navyBodyFat}%</p>
            )}
          </div>
          {form.weight && (form.height || settings?.height) && (
            <div className="bg-[#0D0D0D] rounded-xl p-3">
              <p className="text-xs text-[#555555] mb-1">Calculated BMI</p>
              {(() => {
                const h = form.height ? parseFloat(form.height) : (settings?.height ?? 0)
                const w = parseFloat(form.weight)
                if (!h || !w) return null
                const b = calculateBMI(w, h)
                const info = getBMICategory(b)
                return (
                  <p className="text-sm font-bold" style={{ color: info.color }}>
                    {b} — {info.label}
                  </p>
                )
              })()}
            </div>
          )}
          <Button fullWidth size="lg" onClick={handleAdd} disabled={!form.weight}>
            Save Entry
          </Button>
        </div>
      </Modal>
    </div>
  )
}
