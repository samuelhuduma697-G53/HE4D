import { useEffect, useState } from 'react'
import { MapView } from '../common/MapView'
import { useSocket } from '../../hooks/useSocket'

export const HelperTracking = ({ crisis }) => {
  const [helperLocation, setHelperLocation] = useState(null)
  const { socket } = useSocket()

  useEffect(() => {
    if (!socket || !crisis?._id) return

    socket.emit('join-crisis', crisis._id)

    socket.on('location-changed', (data) => {
      if (data.userId === crisis.match?.helperId) {
        setHelperLocation(data.location)
      }
    })

    return () => {
      socket.off('location-changed')
    }
  }, [socket, crisis])

  const markers = []
  
  if (crisis?.location?.coordinates) {
    markers.push({
      lat: crisis.location.coordinates[1],
      lng: crisis.location.coordinates[0],
      color: '#ff4d4d',
      label: 'Your Location'
    })
  }

  if (helperLocation) {
    markers.push({
      lat: helperLocation.latitude,
      lng: helperLocation.longitude,
      color: '#22c55e',
      label: 'Helper'
    })
  }

  const center = helperLocation || (crisis?.location?.coordinates ? {
    lat: crisis.location.coordinates[1],
    lng: crisis.location.coordinates[0]
  } : { lat: -3.63, lng: 39.85 })

  return (
    <div className="h-64 rounded-xl overflow-hidden">
      <MapView center={center} markers={markers} zoom={14} />
    </div>
  )
}
