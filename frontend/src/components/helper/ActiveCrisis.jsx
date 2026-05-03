import { useState, useEffect } from 'react'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { MapView } from '../common/MapView'
import { ChatWindow } from '../chat/ChatWindow'
import { CallButton } from '../common/CallButton'
import { matchingService } from '../../services/matchingService'
import { crisisService } from '../../services/crisisService'
import { useGeolocation } from '../../hooks/useGeolocation'
import { useSocket } from '../../hooks/useSocket'
import toast from 'react-hot-toast'

export const ActiveCrisis = ({ match }) => {
  const [crisis, setCrisis] = useState(match?.crisisId)
  const [status, setStatus] = useState(match?.crisisId?.status)
  const { location, getCurrentPosition } = useGeolocation()
  const { emit } = useSocket()

  useEffect(() => {
    if (match?.crisisId?._id) {
      crisisService.getCrisis(match.crisisId._id).then(res => setCrisis(res.crisis))
    }
  }, [match])

  const handleArrival = async () => {
    try {
      let lat = location?.latitude
      let lng = location?.longitude
      if (!lat || !lng) {
        const pos = await getCurrentPosition()
        lat = pos.coords.latitude
        lng = pos.coords.longitude
      }
      await matchingService.confirmArrival(match._id, lat, lng)
      setStatus('in_progress')
      toast.success('Arrival confirmed')
    } catch (error) {
      toast.error('Failed to confirm arrival')
    }
  }

  const handleComplete = async () => {
    try {
      await crisisService.updateStatus(crisis._id, 'resolved', 'Crisis resolved successfully')
      setStatus('resolved')
      if (emit) emit('crisis-resolved', { crisisId: crisis._id, resolution: 'Crisis resolved successfully' })
      if (onComplete) onComplete()
      toast.success('Crisis marked as resolved')
    } catch (error) {
      toast.error('Failed to complete crisis')
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      if (location && status === 'accepted') {
        emit('location-update', { latitude: location.latitude, longitude: location.longitude, crisisId: crisis?._id })
      }
    }, 10000)
    return () => clearInterval(interval)
  }, [location, status, crisis, emit])

  const markers = []
  if (crisis?.location?.coordinates) {
    markers.push({
      lat: crisis.location.coordinates[1],
      lng: crisis.location.coordinates[0],
      color: '#ff4d4d',
      label: 'Seeker Location'
    })
  }
  if (location) {
    markers.push({
      lat: location.latitude,
      lng: location.longitude,
      color: '#22c55e',
      label: 'Your Location'
    })
  }

  return (
    <Card>
      <h3 className="text-xl font-bold text-white mb-4">Active Crisis</h3>
      
      <div className="mb-4">
        <p className="text-gray-400">Status: <span className="text-white capitalize">{status?.replace('_', ' ')}</span></p>
        <p className="text-gray-400">Seeker: <span className="text-white">{crisis?.seekerId?.name || match?.crisisId?.seekerId?.name || 'Seeker'}</span></p>
      </div>

      <div className="h-48 mb-4 rounded-xl overflow-hidden">
        <MapView center={location || { lat: -3.63, lng: 39.85 }} markers={markers} zoom={14} />
      </div>

      <div className="flex gap-3 mb-4">
        {status === 'accepted' && (
          <Button onClick={handleArrival} fullWidth>Confirm Arrival</Button>
        )}
        {status === 'in_progress' && (
          <>
            <Button onClick={handleComplete} fullWidth>Request Resolution</Button>
            <button onClick={() => setShowSafety(true)} className="w-full py-2 text-sm text-yellow-400 hover:bg-yellow-400/10 rounded-lg mt-2">🛡️ Report Safety Issue</button>
          </>
        )}
        {status === 'pending_resolution' && (
          <p className="text-yellow-400 text-sm text-center py-2">⏳ Waiting for admin verification...</p>
        )}
      </div>

      <div className="mb-4">
        <CallButton crisisId={crisis?._id || match?.crisisId?._id || match?.crisisId} label="Seeker" />
      </div>
      <ChatWindow crisisId={crisis?._id || match?.crisisId?._id || match?.crisisId} />
    </Card>
  )
}
