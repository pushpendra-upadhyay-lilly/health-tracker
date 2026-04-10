import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      {icon && (
        <div className="text-[#2A2A2A] mb-4 text-5xl">{icon}</div>
      )}
      <h3 className="text-base font-semibold text-[#666666] mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-[#444444] max-w-xs leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
