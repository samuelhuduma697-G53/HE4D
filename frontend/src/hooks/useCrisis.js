import { useState, useCallback } from 'react'
import { crisisService } from '../services/crisisService'
import { useSocket } from './useSocket'
import toast from 'react-hot-toast'

export const useCrisis = () => {
  const [activeCrisis, setActiveCrisis] = useState(null)
  const [crisisHistory, setCrisisHistory] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const { socket } = useSocket()

  const submitCrisis = useCallback(async (data) => {
    setIsLoading(true)
    try {
      const response = await crisisService.submitCrisis(data)
      setActiveCrisis(response.crisis)
      toast.success('Crisis reported. Help is on the way.')
      
      if (socket) {
        socket.emit('join-crisis', response.crisis.id)
      }
      return response
    } catch (error) {
      toast.error(error.message || 'Failed to submit crisis')
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [socket])

  const triggerPanic = useCallback(async (latitude, longitude, text) => {
    setIsLoading(true)
    try {
      const response = await crisisService.triggerPanic(latitude, longitude, text)
      setActiveCrisis(response.crisis)
      
      if (socket) {
        socket.emit('panic-alert', { crisisId: response.crisisId, latitude, longitude })
        socket.emit('join-crisis', response.crisisId)
      }
      
      toast.success('Emergency alert sent! Help is on the way.')
      return response
    } catch (error) {
      toast.error('Failed to send emergency alert')
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [socket])

  const fetchHistory = useCallback(async (page = 1) => {
    setIsLoading(true)
    try {
      const response = await crisisService.getHistory(page)
      setCrisisHistory(response.crises)
      return response
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getCrisis = useCallback(async (crisisId) => {
    const response = await crisisService.getCrisis(crisisId)
    setActiveCrisis(response.crisis)
    return response
  }, [])

  return {
    activeCrisis,
    crisisHistory,
    isLoading,
    submitCrisis,
    triggerPanic,
    fetchHistory,
    getCrisis,
    setActiveCrisis
  }
}
