import { useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

export default function UpdatePrompt() {
  const [dismissed, setDismissed] = useState(false)

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh || dismissed) return null

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm">
      <div className="flex items-center justify-between gap-3 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] px-4 py-3 shadow-lg">
        <p className="text-sm text-white">New version available</p>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setDismissed(true)}
            className="text-xs text-[#888] hover:text-white transition-colors px-2 py-1"
          >
            Later
          </button>
          <button
            onClick={() => updateServiceWorker(true)}
            className="text-xs font-semibold text-[#0D0D0D] bg-[#00FF87] hover:bg-[#00e67a] transition-colors rounded-lg px-3 py-1.5"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  )
}
