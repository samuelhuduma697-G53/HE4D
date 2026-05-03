import { useState, useEffect, useCallback, useRef } from 'react'
import toast from 'react-hot-toast'

export const useGeolocation = (options = {}) => {
  const { enableHighAccuracy = true, timeout = 10000, maximumAge = 0, watchMode = false } = options
  
  const [location, setLocation] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const watchIdRef = useRef(null)

  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported')
      toast.error('Geolocation is not supported by your browser')
      return
    }

    setIsLoading(true)
    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude, accuracy } = position.coords
        setLocation({ latitude, longitude, accuracy, timestamp: position.timestamp })
        setError(null)
        setIsLoading(false)
      },
      err => {
        setError(err.message)
        setIsLoading(false)
        toast.error(`Location error: ${err.message}`)
      },
      { enableHighAccuracy, timeout, maximumAge }
    )
  }, [enableHighAccuracy, timeout, maximumAge])

  const startWatching = useCallback(() => {
    if (!navigator.geolocation) return
    
    watchIdRef.current = navigator.geolocation.watchPosition(
      position => {
        const { latitude, longitude, accuracy, speed, heading } = position.coords
        setLocation({ latitude, longitude, accuracy, speed, heading, timestamp: position.timestamp })
        setError(null)
      },
      err => setError(err.message),
      { enableHighAccuracy, timeout, maximumAge }
    )
  }, [enableHighAccuracy, timeout, maximumAge])

  const stopWatching = useCallback(() => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
  }, [])

  useEffect(() => {
    if (watchMode) startWatching()
    return () => stopWatching()
  }, [watchMode, startWatching, stopWatching])

  return { location, error, isLoading, getCurrentPosition, startWatching, stopWatching }
}
