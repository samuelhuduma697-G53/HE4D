import { createContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/authService'
import toast from 'react-hot-toast'

export const AuthContext = createContext(null)

// Helper: check if JWT token is expired
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 < Date.now()
  } catch { return true }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(false)

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('huduma_token')
      const storedUser = localStorage.getItem('huduma_user')
      const role = localStorage.getItem('huduma_role')
      
      // Skip if no token or token expired
      if (!token || isTokenExpired(token)) {
        localStorage.removeItem('huduma_token')
        localStorage.removeItem('huduma_user')
        localStorage.removeItem('huduma_role')
        setIsLoading(false)
        return
      }
      
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
          
          // Only call getMe for non-admin users, and only if token is valid
          if (role !== 'admin' && !isTokenExpired(token)) {
            try {
              const response = await authService.getMe()
              if (response?.user) setUser(response.user)
            } catch {
              // Keep stored user if getMe fails
            }
          }
        } catch {
          localStorage.clear()
        }
      }
      setIsLoading(false)
    }
    initAuth()
  }, [])

  const login = useCallback(async (emailOrPhone, password) => {
    if (!emailOrPhone || !password) throw new Error('Credentials required')
    const response = await authService.login(emailOrPhone, password)
    setUser(response.user)
    setIsGuest(false)
    localStorage.setItem('huduma_role', response.user?.role || 'seeker')
    toast.success('Welcome back!')
    return response
  }, [])

  const adminLogin = useCallback(async (email, password) => {
    if (!email || !password) throw new Error('Credentials required')
    const response = await authService.adminLogin(email, password)
    setUser(response.admin)
    setIsGuest(false)
    localStorage.setItem('huduma_role', 'admin')
    toast.success('Welcome Admin!')
    return response
  }, [])

  const registerSeeker = useCallback(async (data) => {
    const response = await authService.registerSeeker(data)
    setUser(response.user)
    setIsGuest(false)
    localStorage.setItem('huduma_role', 'seeker')
    toast.success('Account created!')
    return response
  }, [])

  const registerHelper = useCallback(async (data) => {
    const response = await authService.registerHelper(data)
    toast.success('Registration submitted for verification')
    return response
  }, [])

  const startGuestSession = useCallback(async (name, phone) => {
    const response = await authService.guestSession(name, phone)
    setUser(response.user)
    setIsGuest(true)
    toast.success('Guest session started.')
    return response
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const response = await authService.getMe()
      if (response?.user) setUser(response.user)
    } catch {}
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
    setIsGuest(false)
    localStorage.clear()
    toast.success('Logged out')
  }, [])

  return (
    <AuthContext.Provider value={{
      user, isLoading, isGuest, isAuthenticated: !!user,
      login, adminLogin, registerSeeker, registerHelper,
      startGuestSession, logout, refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  )
}
