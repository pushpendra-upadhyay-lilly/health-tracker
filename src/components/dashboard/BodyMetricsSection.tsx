import { useLiveQuery } from 'dexie-react-hooks'
import { ChevronRight, Scale } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Card from '../ui/Card'
import { db } from '../../db'
import type { UserSettings } from '../../db/types'
import { calculateBMI, getBMICategory, getBodyFatCategory } from '../../utils/bodyMetrics'

interface Props {
  settings: UserSettings | undefined
}

export default function BodyMetricsSection({ settings }: Props) {
  const navigate = useNavigate()
  const latestMetric = useLiveQuery(() => db.bodyMetrics.orderBy('date').last())

  return (
    <Card border hover className="mb-4" onClick={() => navigate('/body')}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#1A1A1A] rounded-xl flex items-center justify-center">
            <Scale size={16} className="text-[#FF6B35]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#555555] uppercase tracking-wider mb-1">Body Metrics</p>
            {latestMetric ? (
              <div className="flex items-center gap-3">
                {latestMetric.weight && (
                  <span className="text-sm font-bold text-white">
                    {latestMetric.weight}<span className="text-xs text-[#555555] ml-0.5">kg</span>
                  </span>
                )}
                {latestMetric.weight && latestMetric.height && (() => {
                  const b = calculateBMI(latestMetric.weight!, latestMetric.height!)
                  const info = getBMICategory(b)
                  return <span className="text-xs font-semibold" style={{ color: info.color }}>BMI {b}</span>
                })()}
                {latestMetric.bodyFat && (() => {
                  const info = getBodyFatCategory(latestMetric.bodyFat!, settings?.gender ?? 'male')
                  return <span className="text-xs font-semibold" style={{ color: info.color }}>Body Fat {latestMetric.bodyFat}%</span>
                })()}
              </div>
            ) : (
              <p className="text-xs text-[#555555]">No entries yet — tap to log</p>
            )}
          </div>
        </div>
        <ChevronRight size={24} className="text-[#666666]" />
      </div>
    </Card>
  )
}
