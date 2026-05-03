import { Helmet } from 'react-helmet-async'
import { useAuth } from '../hooks/useAuth'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Input } from '../components/common/Input'
import { useState } from 'react'
import { helperService } from '../services/helperService'
import toast from 'react-hot-toast'

export const ProfilePage = () => {
  const { user, refreshUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      if (user?.role === 'helper') {
        await helperService.updateProfile({ name, phone })
      } else {
        const token = localStorage.getItem('huduma_token')
        await fetch('/api/auth/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ name, phone })
        })
      }
      toast.success('Profile updated')
      setIsEditing(false)
      if (refreshUser) refreshUser()
      else window.location.reload()
    } catch {
      toast.error('Failed to update profile')
    } finally { setSaving(false) }
  }

  const memberSince = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A'

  return (
    <>
      <Helmet><title>Profile | Huduma Ecosystem</title></Helmet>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">My Profile</h1>
        <Card>
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 bg-primary-gold/20 rounded-full flex items-center justify-center text-3xl font-bold text-primary-gold">
              {user?.name?.charAt(0)?.toUpperCase() || '👤'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user?.name}</h2>
              <p className="text-gray-400 capitalize">{(user?.role || '').replace('_', ' ')}</p>
            </div>
            <Button variant="ghost" onClick={() => setIsEditing(!isEditing)} className="ml-auto">
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <Input label="Name" value={name} onChange={e => setName(e.target.value)} />
              <Input label="Email" value={user?.email || ''} disabled />
              <Input label="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
              <Button onClick={handleSave} isLoading={saving}>Save Changes</Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-gray-400">Email</span>
                <span className="text-white">{user?.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-gray-400">Phone</span>
                <span className="text-white">{user?.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-gray-400">Role</span>
                <span className="text-white capitalize">{(user?.role || '').replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-400">Member Since</span>
                <span className="text-white">{memberSince}</span>
              </div>
            </div>
          )}
        </Card>
      </div>
    </>
  )
}

export default ProfilePage
