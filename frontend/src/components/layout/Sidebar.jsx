import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export const Sidebar = ({ role, onClose }) => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [openMenu, setOpenMenu] = useState(null)

  const toggle = (menu) => setOpenMenu(openMenu === menu ? null : menu)

  const seekerLinks = [
    { to: '/dashboard/seeker', label: 'Dashboard', icon: '🏠' },
    { to: '/profile', label: 'Profile', icon: '👤' },
    { to: '/resources', label: 'Resources', icon: '📚' },
  ]

  const helperLinks = [
    { to: '/dashboard/helper', label: 'Dashboard', icon: '🏠' },
    { to: '/profile', label: 'Profile', icon: '👤' },
    { to: '/resources', label: 'Resources', icon: '📚' },
  ]

  const adminLinks = [
    { to: '/dashboard/admin', label: 'Dashboard', icon: '🏠' },
    { to: '/profile', label: 'Profile', icon: '👤' },
  ]

  const links = role === 'seeker' ? seekerLinks : role === 'helper' ? helperLinks : adminLinks

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <aside className="w-64 bg-dark-elevated border-r border-white/10 h-screen flex flex-col">
      {/* Close button (Mobile Only) */}
      {onClose && (
        <div className="flex justify-end p-4 lg:hidden">
          <button onClick={onClose} className="p-2 rounded-lg text-white hover:bg-white/10">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive ? 'bg-primary-gold/20 text-primary-gold font-semibold' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}

        {/* Dropdown: More */}
        <div>
          <button
            onClick={() => toggle('more')}
            className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition"
          >
            <span className="flex items-center gap-3"><span>🔽</span><span>More</span></span>
            <span className="text-xs">{openMenu === 'more' ? '▲' : '▼'}</span>
          </button>
          {openMenu === 'more' && (
            <div className="ml-8 space-y-1 mt-1">
              <NavLink to="/success-stories" onClick={onClose} className="block px-4 py-2 text-sm text-gray-400 hover:text-white rounded-lg">📖 Success Stories</NavLink>
              <NavLink to="/about" onClick={onClose} className="block px-4 py-2 text-sm text-gray-400 hover:text-white rounded-lg">ℹ️ About</NavLink>
              <NavLink to="/contact" onClick={onClose} className="block px-4 py-2 text-sm text-gray-400 hover:text-white rounded-lg">📧 Contact</NavLink>
            </div>
          )}
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10 space-y-1">
        {/* Donate Button */}
        <button
          onClick={() => navigate('/donate')}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-primary-gold hover:bg-primary-gold/10 transition"
        >
          <span>💛</span>
          <span>Donate</span>
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-400 hover:bg-red-400/10 transition"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
