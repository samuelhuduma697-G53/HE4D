import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useAuth } from './hooks/useAuth'
import { Spinner } from './components/common/Spinner'
import { routes, protectedRoutes, publicRoutes } from './routes'
import { ProtectedRoute, PublicRoute } from './components/auth/ProtectedRoute'
import DashboardLayout from './components/layout/DashboardLayout'
import AuthLayout from './components/layout/AuthLayout'

const HomePage = lazy(() => import('./pages/HomePage'))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'))
const DonatePage = lazy(() => import('./pages/DonatePage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const RegisterHelperPage = lazy(() => import('./pages/RegisterHelperPage'))
const SeekerDashboardPage = lazy(() => import('./pages/SeekerDashboardPage'))
const HelperDashboardPage = lazy(() => import('./pages/HelperDashboardPage'))
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const SuccessStoriesPage = lazy(() => import('./pages/SuccessStoriesPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const ResourcesPage = lazy(() => import('./pages/ResourcesPage'))

function App() {
  const { isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-base">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-dark-base">
          <Spinner size="lg" />
        </div>
      }>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomePage />} />
          <Route element={<PublicRoute />}>
            <Route element={<AuthLayout />}>
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/register/helper" element={<RegisterHelperPage />} />
            </Route>
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard/seeker" element={<SeekerDashboardPage />} />
              <Route path="/dashboard/helper" element={<HelperDashboardPage />} />
              <Route path="/dashboard/admin" element={<AdminDashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>
          <Route path="/donate" element={<DonatePage />} />
          <Route path="/success-stories" element={<SuccessStoriesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  )
}

export default App
