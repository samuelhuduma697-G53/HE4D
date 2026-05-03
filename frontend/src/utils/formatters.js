export const formatters = {
  formatDate: (date, format = 'full') => {
    const d = new Date(date)
    if (format === 'relative') return formatters.getRelativeTime(d)
    if (format === 'time') return d.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })
    return d.toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })
  },
  
  getRelativeTime: (date) => {
    const now = new Date()
    const diff = Math.floor((now - date) / 1000)
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  },
  
  formatPhone: (phone) => {
    if (!phone) return ''
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.startsWith('254')) return `+${cleaned.slice(0,3)} ${cleaned.slice(3,6)} ${cleaned.slice(6)}`
    if (cleaned.startsWith('0')) return `+254 ${cleaned.slice(1,4)} ${cleaned.slice(4)}`
    return phone
  },
  
  formatDistance: (km) => km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`,
  
  formatDuration: (minutes) => minutes < 60 ? `${minutes} min` : `${Math.floor(minutes/60)}h ${minutes%60}m`,
  
  getAcuityInfo: (score) => {
    if (score >= 8) return { label: 'Critical', color: '#dc2626' }
    if (score >= 6) return { label: 'High', color: '#f97316' }
    if (score >= 4) return { label: 'Moderate', color: '#eab308' }
    return { label: 'Low', color: '#22c55e' }
  }
}
