import { createContext, useEffect, useState, useCallback } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

export const SocketContext = createContext(null)

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const { user, isAuthenticated } = useAuth()

  const connect = useCallback(() => {
    const token = localStorage.getItem('huduma_token') || localStorage.getItem('huduma_guest_token')
    
    const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    })

    newSocket.on('connect', () => {
      console.log('Socket connected')
      setIsConnected(true)
    })

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected')
      setIsConnected(false)
    })

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      setIsConnected(false)
    })

    newSocket.on('emergency-panic', (data) => {
      toast.error(`🚨 EMERGENCY ALERT: Crisis reported nearby!`)
      console.log('Panic alert received:', data)
    })

    newSocket.on('new-crisis-nearby', (data) => {
      toast.success(`New crisis nearby - Acuity: ${data.acuity}/10`)
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated || localStorage.getItem('huduma_guest_token')) {
      const cleanup = connect()
      return cleanup
    }
  }, [isAuthenticated, connect])

  const emit = useCallback((event, data) => {
    if (socket && isConnected) {
      socket.emit(event, data)
    }
  }, [socket, isConnected])

  const joinCrisis = useCallback((crisisId) => {
    if (socket && isConnected) {
      socket.emit('join-crisis', crisisId)
    }
  }, [socket, isConnected])

  const leaveCrisis = useCallback((crisisId) => {
    if (socket && isConnected) {
      socket.emit('leave-crisis', crisisId)
    }
  }, [socket, isConnected])

  const sendMessage = useCallback((crisisId, message, type = 'text') => {
    if (socket && isConnected) {
      socket.emit('send-message', { crisisId, message, type })
    }
  }, [socket, isConnected])

  const updateLocation = useCallback((latitude, longitude, crisisId = null) => {
    if (socket && isConnected) {
      socket.emit('location-update', { latitude, longitude, crisisId })
    }
  }, [socket, isConnected])

  const sendTyping = useCallback((crisisId, isTyping) => {
    if (socket && isConnected) {
      socket.emit('typing', { crisisId, isTyping })
    }
  }, [socket, isConnected])

  return (
    <SocketContext.Provider value={{
      socket,
      isConnected,
      emit,
      joinCrisis,
      leaveCrisis,
      sendMessage,
      updateLocation,
      sendTyping
    }}>
      {children}
    </SocketContext.Provider>
  )
}
