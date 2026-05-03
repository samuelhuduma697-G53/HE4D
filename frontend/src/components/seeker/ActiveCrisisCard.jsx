import { useEffect, useState } from 'react'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { MapView } from '../common/MapView'
import { ChatWindow } from '../chat/ChatWindow'
import { CallButton } from '../common/CallButton'
import { crisisService } from '../../services/crisisService'
import { useGeolocation } from '../../hooks/useGeolocation'
import { useSocket } from '../../hooks/useSocket'

export const ActiveCrisisCard = ({ crisis }) => {
  const [status, setStatus] = useState(crisis?.status || 'triaging')
  const { location } = useGeolocation()
  const { socket } = useSocket()
  const [helperLocation, setHelperLocation] = useState(null)

  const helperName = crisis?.match?.helperId?.name || 'A Helper'
  const helperPhone = crisis?.match?.helperId?.phone || ''

  useEffect(() => {
    if (!socket) return
    socket.on('location-changed', (data) => {
      if (data.crisisId === crisis?._id) setHelperLocation(data.location)
    })
    socket.on('crisis-resolved', () => setStatus('resolved'))
    return () => {
      socket.off('location-changed')
      socket.off('crisis-resolved')
    }
  }, [socket, crisis?._id])

  const markers = []
  if (crisis?.location?.coordinates) {
    markers.push({ lat: crisis.location.coordinates[1], lng: crisis.location.coordinates[0], color: '#ff4d4d', popup: 'Your Location' })
  }
  if (helperLocation) {
    markers.push({ lat: helperLocation.latitude, lng: helperLocation.longitude, color: '#22c55e', popup: 'Helper' })
  }

  return (
    <Card>
      <h3 className="text-xl font-bold text-white mb-4">
        {status === 'resolved' ? '✅ Crisis Resolved' : '🚨 Active Crisis'}
      </h3>

      <div className="mb-4 space-y-1">
        <p className="text-gray-400">Status: <span className="text-white capitalize">{(status || 'triaging').replace('_', ' ')}</span></p>
        <p className="text-gray-400">Helper: <span className="text-primary-gold font-semibold">{helperName}</span></p>
        {helperPhone && <p className="text-gray-400">Contact: <span className="text-white">{helperPhone}</span></p>}
      </div>

      <div className="h-48 mb-4 rounded-xl overflow-hidden">
        <MapView 
          center={location || { lat: crisis?.location?.coordinates?.[1] || -3.63, lng: crisis?.location?.coordinates?.[0] || 39.85 }} 
          markers={markers} 
          zoom={14} 
          interactive={false}
        />
      </div>

      {status !== 'resolved' && (
        <>
          <div className="mb-4">
            <CallButton crisisId={crisis?._id} label="Helper" />
          </div>
          <ChatWindow crisisId={crisis?._id} />
        </>
      )}
    </Card>
  )
}
