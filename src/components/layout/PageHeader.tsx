import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  back?: boolean | string
  right?: ReactNode
}

export default function PageHeader({ title, subtitle, back, right }: PageHeaderProps) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (typeof back === 'string') navigate(back)
    else navigate(-1)
  }

  return (
    <header className="flex items-center justify-between px-4 pt-12 pb-4 safe-top">
      <div className="flex items-center gap-3">
        {back !== undefined && (
          <button
            onClick={handleBack}
            className="p-2 -ml-2 rounded-xl text-[#A0A0A0] border border-[#333333]"
            aria-label="Go back"
          >
            <ChevronLeft size={22} />
          </button>
        )}
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">{title}</h1>
          {subtitle && <p className="text-xs text-[#666666] mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {right && <div className="flex items-center gap-2">{right}</div>}
    </header>
  )
}
