import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../common/Button'

export const Navbar = ({ onMenuClick }) => {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-30 glass-card rounded-none border-t-0 border-x-0 px-4 md:px-6 py-3"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-3">
          {/* Hamburger Menu Button (Mobile Only) */}
          {isAuthenticated && onMenuClick && (
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg text-white hover:bg-white/10 transition"
              aria-label="Open menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            </button>
          )}

          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Huduma" className="h-10 w-auto rounded-full" />
            <span className="text-lg font-bold text-primary-gold hidden sm:inline">
              Huduma Ecosystem
            </span>
            <span className="text-lg font-bold text-primary-gold sm:hidden">
              Huduma
            </span>
          </Link>
        </div>

        {/* Right: Nav Links */}
        <div className="flex items-center gap-2 md:gap-4">
          {!isAuthenticated ? (
            <>
              <Link to="/about" className="text-gray-300 hover:text-white text-sm hidden md:inline">About</Link>
              <Link to="/success-stories" className="text-gray-300 hover:text-white text-sm hidden md:inline">Stories</Link>
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Login</Button>
              <Button size="sm" onClick={() => navigate('/register')}>Get Help</Button>
            </>
          ) : (
            <>
              <span className="text-gray-300 text-sm hidden md:inline">
                {user?.name?.split(' ')[0]}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>Logout</Button>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  )
}
