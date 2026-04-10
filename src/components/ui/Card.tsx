import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
  active?: boolean
  border?: boolean
}

const PADDING_STYLES = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
}

export default function Card({
  children,
  padding = 'md',
  hover = false,
  active = false,
  border = false,
  className = '',
  ...props
}: CardProps) {
  return (
    <div
      className={`
        bg-[#1A1A1A] rounded-[16px]
        ${PADDING_STYLES[padding]}
        ${hover ? 'hover:bg-[#252525] transition-colors duration-150 cursor-pointer' : ''}
        ${active ? 'bg-[#252525]' : ''}
        ${border ? 'border border-[#2A2A2A]' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}
