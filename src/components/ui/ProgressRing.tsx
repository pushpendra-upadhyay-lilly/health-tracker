interface ProgressRingProps {
  value: number // 0-100
  size?: number // px
  strokeWidth?: number
  color?: string
  bgColor?: string
  label?: string
  sublabel?: string
}

export default function ProgressRing({
  value,
  size = 120,
  strokeWidth = 10,
  color = '#00FF87',
  bgColor = '#2A2A2A',
  label,
  sublabel,
}: ProgressRingProps) {
  const clamped = Math.min(100, Math.max(0, value))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clamped / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
        />
      </svg>

      {/* Center text */}
      {(label || sublabel) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {label && <span className="text-[12px] font-bold text-white leading-tight">{label}</span>}
          {sublabel && <span className="text-[10px] text-[#666666] mt-0.5">{sublabel}</span>}
        </div>
      )}
    </div>
  )
}
