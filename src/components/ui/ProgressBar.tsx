interface ProgressBarProps {
  value: number // 0-100
  color?: 'green' | 'orange' | 'blue' | 'red'
  height?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  label?: string
  animated?: boolean
}

const COLOR_STYLES = {
  green: 'bg-[#00FF87]',
  orange: 'bg-[#FF6B35]',
  blue: 'bg-blue-400',
  red: 'bg-[#FF4757]',
}

const HEIGHT_STYLES = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
}

export default function ProgressBar({
  value,
  color = 'green',
  height = 'md',
  showLabel,
  label,
  animated = true,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div className="w-full">
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs text-[#A0A0A0]">{label}</span>}
          {showLabel && <span className="text-xs font-medium text-white">{Math.round(clamped)}%</span>}
        </div>
      )}
      <div className={`w-full bg-[#2A2A2A] rounded-full overflow-hidden ${HEIGHT_STYLES[height]}`}>
        <div
          className={`h-full rounded-full ${COLOR_STYLES[color]} ${animated ? 'transition-all duration-500 ease-out' : ''}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
