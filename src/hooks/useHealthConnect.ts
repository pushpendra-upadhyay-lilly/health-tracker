import { useEffect, useState, useCallback } from 'react'
import { HealthConnect, type RecordType } from 'capacitor-health-connect'
import { Preferences } from '@capacitor/preferences'
import { isNative } from '../utils/platform'

type Availability = 'loading' | 'Available' | 'NotInstalled' | 'NotSupported'

const PREF_KEY = 'health_connect_connected'

const READ_TYPES: RecordType[] = ['Steps', 'ActiveCaloriesBurned', 'HeartRateSeries', 'Weight']

export function useHealthConnect() {
  const [availability, setAvailability] = useState<Availability>('loading')
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isNative) {
      setAvailability('NotSupported')
      return
    }
    async function init() {
      try {
        const { availability: status } = await HealthConnect.checkAvailability()
        setAvailability(status)
        if (status === 'Available') {
          const { value } = await Preferences.get({ key: PREF_KEY })
          if (value === 'true') {
            const { hasAllPermissions } = await HealthConnect.checkHealthPermissions({
              read: READ_TYPES,
              write: [],
            })
            setIsConnected(hasAllPermissions)
            if (!hasAllPermissions) await Preferences.remove({ key: PREF_KEY })
          }
        }
      } catch {
        setAvailability('NotSupported')
      }
    }
    init()
  }, [])

  const connect = useCallback(async () => {
    setIsLoading(true)
    try {
      const { grantedPermissions } = await HealthConnect.requestHealthPermissions({
        read: READ_TYPES,
        write: [],
      })
      if (grantedPermissions.length > 0) {
        await Preferences.set({ key: PREF_KEY, value: 'true' })
        setIsConnected(true)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const disconnect = useCallback(async () => {
    await Preferences.remove({ key: PREF_KEY })
    setIsConnected(false)
  }, [])

  return { availability, isConnected, isLoading, connect, disconnect }
}
