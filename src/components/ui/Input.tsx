import { ChevronDown, ChevronUp } from 'lucide-react'
import type { InputHTMLAttributes, KeyboardEvent } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  suffix?: string
}

export default function Input({ label, hint, error, suffix, className = '', id, ...props }: InputProps) {
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
  const isNumeric = props.type === 'number'

  const stepValue = (dir: 1 | -1) => {
    const step = Number(props.step ?? 1)
    const current = parseFloat(String(props.value ?? '')) || 0
    const min = props.min !== undefined ? Number(props.min) : -Infinity
    const max = props.max !== undefined ? Number(props.max) : Infinity
    const next = Math.min(Math.max(current + dir * step, min), max)
    props.onChange?.({ target: { value: String(next) } } as React.ChangeEvent<HTMLInputElement>)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (isNumeric && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault()
      stepValue(e.key === 'ArrowUp' ? 1 : -1)
    }
    props.onKeyDown?.(e)
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-[#A0A0A0] uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <input
          id={inputId}
          className={`
            w-full bg-[#111111] border rounded-[10px] px-3 py-2.5
            text-white text-sm placeholder:text-[#444444]
            outline-none transition-all duration-150
            focus:border-[#00FF87] focus:ring-1 focus:ring-[#00FF87]/20
            ${error ? 'border-[#FF4757]' : 'border-[#2A2A2A] hover:border-[#3A3A3A]'}
            ${isNumeric && suffix ? 'pr-16' : isNumeric ? 'pr-8' : suffix ? 'pr-12' : ''}
            ${className}
          `}
          {...props}
          onKeyDown={handleKeyDown}
        />
        {suffix && (
          <span className={`absolute ${isNumeric ? 'right-8' : 'right-3'} text-xs text-[#666666] font-medium pointer-events-none`}>
            {suffix}
          </span>
        )}
        {isNumeric && (
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col">
            <button
              type="button"
              onClick={() => stepValue(1)}
              className="text-[#555555] active:text-white transition-colors px-1 pt-0.5"
              tabIndex={-1}
            >
              <ChevronUp size={20} />
            </button>
            <button
              type="button"
              onClick={() => stepValue(-1)}
              className="text-[#555555] active:text-white transition-colors px-1 pb-0.5"
              tabIndex={-1}
            >
              <ChevronDown size={20} />
            </button>
          </div>
        )}
      </div>
      {hint && !error && <p className="text-xs text-[#555555]">{hint}</p>}
      {error && <p className="text-xs text-[#FF4757]">{error}</p>}
    </div>
  )
}
