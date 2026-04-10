import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children?: ReactNode
  fullWidth?: boolean
  icon?: ReactNode
}

const VARIANT_STYLES: Record<Variant, string> = {
  primary: 'bg-[#00FF87] text-[#0D0D0D] hover:bg-[#00CC6A] active:scale-[0.97] font-bold',
  secondary: 'bg-[#FF6B35] text-white hover:bg-[#CC5528] active:scale-[0.97] font-bold',
  ghost: 'bg-transparent text-[#A0A0A0] hover:text-white hover:bg-[#1A1A1A] active:scale-[0.97]',
  danger: 'bg-[#FF4757]/10 text-[#FF4757] hover:bg-[#FF4757]/20 active:scale-[0.97] border border-[#FF4757]/30',
  outline: 'bg-transparent text-white border border-[#2A2A2A] hover:border-[#3A3A3A] hover:bg-[#1A1A1A] active:scale-[0.97]',
}

const SIZE_STYLES: Record<Size, string> = {
  sm: 'text-xs px-3 py-2 rounded-[10px] gap-1.5',
  md: 'text-sm px-4 py-2.5 rounded-[12px] gap-2',
  lg: 'text-base px-5 py-3.5 rounded-[12px] gap-2',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  fullWidth,
  icon,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center transition-all duration-150 select-none
        ${VARIANT_STYLES[variant]}
        ${SIZE_STYLES[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  )
}
