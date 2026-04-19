import { useEffect, useRef, useState } from 'react'
import { Info } from 'lucide-react'

interface TooltipProps {
  content: React.ReactNode
}

export default function Tooltip({ content }: TooltipProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [open])

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="text-[#444444] hover:text-[#888888] transition-colors"
      >
        <Info size={12} />
      </button>
      {open && (
        <div className="absolute z-50 top-full right-0 mt-2 w-52 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-3 shadow-xl">
          <div className="text-[11px] text-[#AAAAAA] leading-relaxed">{content}</div>
          {/* Arrow */}
          <div className="absolute top-[-5px] right-2 w-2.5 h-2.5 bg-[#1A1A1A] border-l border-t border-[#2A2A2A] rotate-45" />
        </div>
      )}
    </div>
  )
}
