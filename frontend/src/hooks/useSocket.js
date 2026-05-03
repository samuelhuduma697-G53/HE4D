import { useContext, useEffect, useCallback } from 'react'
import { SocketContext } from '../context/SocketContext'

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) throw new Error('useSocket must be used within SocketProvider')
  return context
}

export const useSocketEvent = (event, handler) => {
  const { socket, isConnected } = useContext(SocketContext)
  
  useEffect(() => {
    if (!socket || !isConnected) return
    socket.on(event, handler)
    return () => socket.off(event, handler)
  }, [socket, isConnected, event, handler])
}

export const useEmit = () => {
  const { socket, isConnected } = useContext(SocketContext)
  
  return useCallback((event, data) => {
    if (socket && isConnected) socket.emit(event, data)
  }, [socket, isConnected])
}
