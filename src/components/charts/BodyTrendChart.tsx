import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import { format, parseISO } from 'date-fns'

interface DataPoint {
  date: string
  weight: number | null
  bmi?: number | null
  bodyFat?: number | null
}

interface BodyTrendChartProps {
  data: DataPoint[]
  goalWeight: number | null
}

export function BodyTrendChart({ data, goalWeight }: BodyTrendChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    dateLabel: format(parseISO(d.date), 'MMM d'),
  }))

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
        <XAxis
          dataKey="dateLabel"
          tick={{ fill: '#555555', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: '#555555', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          domain={['auto', 'auto']}
        />
        <Tooltip
          contentStyle={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 8, color: '#fff', fontSize: 12 }}
          formatter={(v: number) => [`${v} kg`, 'Weight']}
        />
        {goalWeight && (
          <ReferenceLine
            y={goalWeight}
            stroke="#00FF87"
            strokeDasharray="4 4"
            label={{ value: `Goal ${goalWeight}kg`, fill: '#00FF87', fontSize: 10, position: 'insideTopRight' }}
          />
        )}
        <Line
          type="monotone"
          dataKey="weight"
          stroke="#FF6B35"
          strokeWidth={2}
          dot={{ fill: '#FF6B35', r: 3, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: '#FF6B35' }}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
