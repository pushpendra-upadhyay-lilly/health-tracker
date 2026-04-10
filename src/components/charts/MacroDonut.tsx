import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface MacroDonutProps {
  protein: number
  carbs: number
  fat: number
  size?: number
}

const COLORS = ['#00FF87', '#FF6B35', '#FF4757']

export function MacroDonut({ protein, carbs, fat, size = 100 }: MacroDonutProps) {
  const data = [
    { name: 'Protein', value: protein },
    { name: 'Carbs', value: carbs },
    { name: 'Fat', value: fat },
  ].filter((d) => d.value > 0)

  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-full bg-[#2A2A2A]"
        style={{ width: size, height: size }}
      >
        <span className="text-xs text-[#555555]">—</span>
      </div>
    )
  }

  return (
    <div style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={size * 0.3}
            outerRadius={size * 0.45}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 8, fontSize: 11 }}
            labelStyle={{ color: '#A0A0A0' }}
            itemStyle={{ color: '#ffffff' }}
            formatter={(value: number, name: string) => [`${value.toFixed(0)}g`, name]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
