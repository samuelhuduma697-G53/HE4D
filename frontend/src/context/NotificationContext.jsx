import { createContext, useState, useCallback, useEffect } from 'react'
import { useSocket, useSocketEvent } from '../hooks/useSocket'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

export const NotificationContext = createContext(null)

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const { user } = useAuth()
  const { socket } = useSocket()

  useSocketEvent('notification', (data) => {
    setNotifications(prev => [data, ...prev])
    setUnreadCount(prev => prev + 1)
    toast(data.title, { description: data.body, icon: '🔔' })
  })

  useSocketEvent('emergency-panic', (data) => {
    toast.error(`🚨 EMERGENCY: ${data.seekerName || 'Someone'} needs immediate help!`, {
      duration: 10000,
      position: 'top-center'
    })
  })

  useSocketEvent('new-crisis-nearby', (data) => {
    toast.success(`New crisis nearby - ${data.ward || 'Your area'}`, {
      description: `Acuity: ${data.acuity}/10 | Severity: ${data.severity}`
    })
  })

  useSocketEvent('new-message', (data) => {
    if (data.sender?.id !== user?.id) {
      toast(`${data.sender?.name || 'Someone'}: ${data.message?.substring(0, 50)}...`, {
        icon: '💬'
      })
    }
  })

  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
    setUnreadCount(0)
  }, [])

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      clearAll
    }}>
      {children}
    </NotificationContext.Provider>
  )
}
