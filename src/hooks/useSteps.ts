import { Health } from '@capgo/capacitor-health'
import { useEffect, useState } from 'react'

export function useSteps() {
  const [steps, setSteps] = useState<number | null>(null)
  const [available, setAvailable] = useState(false)
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function init() {
      try {
        const { available: isAvailable } = await Health.isAvailable()
        setAvailable(isAvailable)
        if (!isAvailable) return

        const status = await Health.checkAuthorization({ read: ['steps'] })
        if (status.readAuthorized.includes('steps')) {
          setConnected(true)
          await fetchSteps()
        }
      } catch {
        // health data is optional
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [])

  async function fetchSteps() {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const result = await Health.queryAggregated({
      dataType: 'steps',
      startDate: startOfDay.toISOString(),
      endDate: now.toISOString(),
      bucket: 'day',
      aggregation: 'sum',
    })
    setSteps(result.samples[0]?.value ?? 0)
  }

  async function connect() {
    try {
      await Health.requestAuthorization({ read: ['steps'] })
      setConnected(true)
      await fetchSteps()
    } catch {
      // user denied — stay on connect screen
    }
  }

  return { steps, available, connected, loading, connect }
}
