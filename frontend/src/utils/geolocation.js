export const geolocation = {
  calculateDistance: (lat1, lng1, lat2, lng2) => {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLng/2) * Math.sin(dLng/2)
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  },
  
  isInServiceRegion: (lat, lng) => lat >= -4.7 && lat <= -1.5 && lng >= 38.5 && lng <= 41.5,
  
  getCurrentPosition: () => new Promise((resolve, reject) => {
    if (!navigator.geolocation) reject(new Error('Geolocation not supported'))
    navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 })
  })
}
