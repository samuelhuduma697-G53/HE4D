import { useState, useEffect } from 'react'
import { Card } from '../common/Card'
import { adminService } from '../../services/adminService'
import toast from 'react-hot-toast'

export const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  useEffect(() => {
    adminService.getUsers().then(d => setUsers(d.users || []))
  }, [])

  const filtered = users.filter(u => {
    const matchSearch = !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    return matchSearch && matchRole
  })

  const toggleStatus = async (userId, isActive) => {
    await adminService.updateUserStatus(userId, !isActive)
    setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: !isActive } : u))
    toast.success('User status updated')
  }

  const elevateToAdmin = async (userId) => {
    if (!confirm('Make this user an admin? This grants full system access.')) return
    try {
      await fetch(`/api/admin/users/${userId}/elevate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('huduma_token')}` }
      })
      toast.success('User elevated to admin')
    } catch { toast.error('Failed') }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h3 className="text-xl font-bold text-white mb-4">User Management</h3>

      {/* Filter Bar: Dropdown Left, Search Right */}
      <div className="flex items-center gap-3 mb-4">
        <select 
          value={roleFilter} 
          onChange={e => setRoleFilter(e.target.value)} 
          className="glass-input w-40"
        >
          <option value="all">All Roles</option>
          <option value="seeker">Seekers</option>
          <option value="helper">Helpers</option>
        </select>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="glass-input flex-1"
        />
      </div>

      {/* User List */}
      <Card className="p-0 overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No users found</p>
        ) : (
          filtered.map((user, i) => (
            <div 
              key={user._id} 
              className={`flex items-center justify-between p-4 ${i !== 0 ? 'border-t border-white/5' : ''}`}
            >
              <div>
                <p className="text-white text-sm font-medium">{user.name}</p>
                <p className="text-gray-500 text-xs">{user.email} · <span className="capitalize">{user.role}</span></p>
              </div>
              <div className="flex items-center gap-2">
                {user.role !== 'admin' && (
                  <button 
                    onClick={() => elevateToAdmin(user._id)} 
                    className="text-xs text-primary-gold hover:underline"
                  >
                    Make Admin
                  </button>
                )}
                <button
                  onClick={() => toggleStatus(user._id, user.isActive)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                    user.isActive !== false 
                      ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                      : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                  }`}
                >
                  {user.isActive !== false ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  )
}
