import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface DataPoint {
  date: string
  actual: number
  target: number
}

interface PlanVsActualChartProps {
  data: DataPoint[]
  unit?: string
}

export function PlanVsActualChart({ data, unit = '' }: PlanVsActualChartProps) {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
        <defs>
          <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00FF87" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#00FF87" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradTarget" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: '#555555', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: '#555555', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 8, color: '#fff', fontSize: 11 }}
          formatter={(v: number, name: string) => [`${v} ${unit}`, name === 'actual' ? 'Actual' : 'Target']}
        />
        <Legend
          formatter={(v) => <span style={{ color: '#A0A0A0', fontSize: 11 }}>{v === 'actual' ? 'Actual' : 'Target'}</span>}
        />
        <Area type="monotone" dataKey="target" stroke="#FF6B35" strokeWidth={1.5} strokeDasharray="4 3" fill="url(#gradTarget)" dot={false} />
        <Area type="monotone" dataKey="actual" stroke="#00FF87" strokeWidth={2} fill="url(#gradActual)" dot={false} activeDot={{ r: 4, fill: '#00FF87' }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
