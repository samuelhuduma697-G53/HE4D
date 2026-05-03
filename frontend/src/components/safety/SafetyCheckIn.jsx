import { useState, useEffect } from 'react'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { safetyService } from '../../services/safetyService'
import { useGeolocation } from '../../hooks/useGeolocation'
import toast from 'react-hot-toast'

export const SafetyCheckIn = ({ sessionId }) => {
  const [status, setStatus] = useState('safe')
  const [notes, setNotes] = useState('')
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [lastCheckIn, setLastCheckIn] = useState(null)
  const { location } = useGeolocation()

  const handleCheckIn = async () => {
    setIsCheckingIn(true)
    try {
      await safetyService.checkIn(sessionId, status, location?.latitude, location?.longitude, notes)
      setLastCheckIn(new Date())
      toast.success('Safety check-in recorded')
      setNotes('')
    } catch (error) {
      toast.error('Check-in failed')
    } finally {
      setIsCheckingIn(false)
    }
  }

  return (
    <Card>
      <h3 className="text-xl font-bold text-white mb-4">Safety Check-In</h3>
      
      {lastCheckIn && (
        <p className="text-accent-success mb-4">
          ✓ Last check-in: {lastCheckIn.toLocaleTimeString()}
        </p>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-300 mb-2">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="glass-input">
            <option value="safe">✅ Safe - Everything is fine</option>
            <option value="concerned">⚠️ Concerned - Need monitoring</option>
            <option value="emergency">🚨 Emergency - Need help</option>
          </select>
        </div>

        <Input
          label="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional information..."
        />

        <Button onClick={handleCheckIn} isLoading={isCheckingIn} fullWidth>
          Send Check-In
        </Button>
      </div>
    </Card>
  )
}
