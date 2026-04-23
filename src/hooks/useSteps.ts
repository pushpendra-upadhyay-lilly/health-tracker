import { Health } from '@capgo/capacitor-health'
import { useEffect, useState } from 'react'
import { getSettings } from '../db'
import { healthSync } from '../services/healthSyncPlugin'

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
    const stepCount = result.samples[0]?.value ?? 0
    setSteps(stepCount)

    // Sync to widget
    const settings = await getSettings()
    await healthSync.syncStepData(stepCount, settings.stepGoal)
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
