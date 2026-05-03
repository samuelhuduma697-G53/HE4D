import { useState, useEffect } from 'react'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { Input } from '../common/Input'
import { helperService } from '../../services/helperService'
import { useForm } from '../../hooks/useForm'
import toast from 'react-hot-toast'

export const HelperProfile = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState(null)

  const { values, handleChange, setFieldValue } = useForm({
    name: '',
    phone: '',
    bio: '',
    specializations: [],
    maxResponseDistance: 20
  })

  useEffect(() => {
    helperService.getProfile().then(res => {
      setProfile(res.helper)
      setFieldValue('name', res.helper.name)
      setFieldValue('phone', res.helper.phone)
      setFieldValue('bio', res.helper.profile?.bio || '')
      setFieldValue('specializations', res.helper.helperProfile?.specializations || [])
      setFieldValue('maxResponseDistance', res.helper.helperProfile?.maxResponseDistance || 20)
    })
  }, [])

  const handleSave = async () => {
    try {
      await helperService.updateProfile(values)
      toast.success('Profile updated')
      setIsEditing(false)
    } catch (error) {
      toast.error('Failed to update profile')
    }
  }

  if (!profile) return null

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Helper Profile</h3>
        <Button variant="ghost" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? 'Cancel' : 'Edit'}
        </Button>
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <Input label="Name" name="name" value={values.name} onChange={handleChange} />
          <Input label="Phone" name="phone" value={values.phone} onChange={handleChange} />
          <div>
            <label className="block text-sm text-gray-300 mb-2">Bio</label>
            <textarea name="bio" value={values.bio} onChange={handleChange} rows={3} className="glass-input" />
          </div>
          <Input label="Max Response Distance (km)" name="maxResponseDistance" type="number" value={values.maxResponseDistance} onChange={handleChange} />
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div><span className="text-gray-400">Name:</span> <span className="text-white">{profile.name}</span></div>
          <div><span className="text-gray-400">Phone:</span> <span className="text-white">{profile.phone}</span></div>
          <div><span className="text-gray-400">Trust Score:</span> <span className="text-primary-gold">{profile.helperProfile?.trustScore || 5.0}/5.0</span></div>
          <div><span className="text-gray-400">Total Cases:</span> <span className="text-white">{profile.helperProfile?.totalCases || 0}</span></div>
        </div>
      )}
    </Card>
  )
}
