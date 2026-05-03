import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { PanicButton } from '../common/PanicButton'
import { useAuth } from '../../hooks/useAuth'

export const DashboardLayout = () => {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-dark-base">
      <Navbar onMenuClick={() => setSidebarOpen(true)} />

      <div className="flex pt-16">
        {/* Desktop Sidebar - always visible */}
        <div className="hidden lg:block">
          <Sidebar role={user?.role} />
        </div>

        {/* Mobile Sidebar - slides in with overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />

              {/* Sliding Sidebar */}
              <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: 'spring', damping: 25 }}
                className="fixed top-0 left-0 z-50 h-full lg:hidden"
              >
                <Sidebar role={user?.role} onClose={() => setSidebarOpen(false)} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 ml-0 lg:ml-64">
          <Outlet />
        </main>
      </div>

      {user?.role === 'seeker' && <PanicButton />}
    </div>
  )
}

export default DashboardLayout
