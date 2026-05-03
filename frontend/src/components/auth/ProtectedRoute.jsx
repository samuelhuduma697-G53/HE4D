import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Spinner } from '../common/Spinner'
import { roleBasedRedirect } from '../../routes'

export const ProtectedRoute = () => {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-base">
        <Spinner size="lg" />
      </div>
    )
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />
}

export const PublicRoute = () => {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-base">
        <Spinner size="lg" />
      </div>
    )
  }

  if (user) {
    // Redirect based on user role instead of always to seeker
    const redirectPath = roleBasedRedirect[user.role] || roleBasedRedirect.seeker
    return <Navigate to={redirectPath} replace />
  }

  return <Outlet />
}

export const RoleRoute = ({ allowedRoles, children }) => {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-base">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  
  if (!allowedRoles.includes(user.role)) {
    const redirectPath = roleBasedRedirect[user.role] || '/'
    return <Navigate to={redirectPath} replace />
  }

  return children
}
