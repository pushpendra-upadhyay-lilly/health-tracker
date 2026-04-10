interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
}

export default function Toggle({ checked, onChange, label, disabled }: ToggleProps) {
  return (
    <label className={`flex items-center gap-3 ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}>
      {label && <span className="text-sm text-[#A0A0A0] flex-1">{label}</span>}
      <button
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`
          relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0
          ${checked ? 'bg-[#00FF87]' : 'bg-[#2A2A2A]'}
        `}
      >
        <span
          className={`
            absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm
            transition-transform duration-200
            ${checked ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
    </label>
  )
}
