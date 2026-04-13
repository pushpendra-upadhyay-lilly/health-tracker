import { useState, useRef, useCallback, useEffect } from 'react'

interface RestTimerState {
  active: boolean
  remaining: number // seconds
  total: number    // seconds
}

interface UseRestTimer {
  active: boolean
  remaining: number
  total: number
  start: (seconds: number) => void
  stop: () => void
}

export function useRestTimer(onComplete: () => void): UseRestTimer {
  const [state, setState] = useState<RestTimerState>({ active: false, remaining: 0, total: 0 })
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const stop = useCallback(() => {
    clearTimer()
    setState({ active: false, remaining: 0, total: 0 })
  }, [clearTimer])

  const start = useCallback((seconds: number) => {
    clearTimer()
    setState({ active: true, remaining: seconds, total: seconds })

    intervalRef.current = setInterval(() => {
      setState((prev) => {
        const next = prev.remaining - 1
        if (next <= 0) {
          clearInterval(intervalRef.current!)
          intervalRef.current = null
          onCompleteRef.current()
          return { active: false, remaining: 0, total: prev.total }
        }
        return { ...prev, remaining: next }
      })
    }, 1000)
  }, [clearTimer])

  // Clean up on unmount
  useEffect(() => () => clearTimer(), [clearTimer])

  return { active: state.active, remaining: state.remaining, total: state.total, start, stop }
}
