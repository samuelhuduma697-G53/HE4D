import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

export const MapView = ({ 
  center = { lat: -3.63, lng: 39.85 },
  zoom = 13,
  markers = [],
  onLocationSelect = null,
  interactive = true,
  className = ''
}) => {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const [userLocation, setUserLocation] = useState(null)

  useEffect(() => {
    if (!mapContainer.current) return

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap'
          }
        },
        layers: [{ id: 'osm', type: 'raster', source: 'osm' }]
      },
      center: [center.lng, center.lat],
      zoom: zoom
    })

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right')

    if (interactive && onLocationSelect) {
      map.current.on('click', (e) => {
        onLocationSelect({ lat: e.lngLat.lat, lng: e.lngLat.lng })
      })
    }

    navigator.geolocation?.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation({ lat: latitude, lng: longitude })
        new maplibregl.Marker({ color: '#ff4d4d' })
          .setLngLat([longitude, latitude])
          .setPopup(new maplibregl.Popup().setText('You are here'))
          .addTo(map.current)
      },
      () => console.log('Geolocation not available')
    )

    return () => map.current?.remove()
  }, [])

  useEffect(() => {
    if (!map.current) return
    map.current.flyTo({ center: [center.lng, center.lat], zoom })
  }, [center, zoom])

  useEffect(() => {
    if (!map.current) return
    
    markers.forEach(marker => {
      const el = document.createElement('div')
      el.className = 'marker'
      el.style.backgroundColor = marker.color || '#F5B041'
      el.style.width = '12px'
      el.style.height = '12px'
      el.style.borderRadius = '50%'
      el.style.border = '2px solid white'
      el.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)'
      
      new maplibregl.Marker(el)
        .setLngLat([marker.lng, marker.lat])
        .setPopup(new maplibregl.Popup().setText(marker.label || 'Location'))
        .addTo(map.current)
    })
  }, [markers])

  return (
    <div ref={mapContainer} className={`w-full h-full rounded-xl overflow-hidden ${className}`} />
  )
}
