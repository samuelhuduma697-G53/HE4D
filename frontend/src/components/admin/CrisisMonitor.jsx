import { useState, useEffect } from 'react'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { MapView } from '../common/MapView'
import { useSocket } from '../../hooks/useSocket'
import toast from 'react-hot-toast'

export const CrisisMonitor = () => {
  const [allCrises, setAllCrises] = useState([])
  const [selectedCrisis, setSelectedCrisis] = useState(null)
  const [statusFilter, setStatusFilter] = useState('active')
  const [timeFilter, setTimeFilter] = useState('all')
  const { socket } = useSocket()

  useEffect(() => { fetchCrises() }, [])

  useEffect(() => {
    if (!socket) return
    socket.on('new-crisis-nearby', () => fetchCrises())
    socket.on('crisis-resolved', () => fetchCrises())
    return () => { socket.off('new-crisis-nearby'); socket.off('crisis-resolved') }
  }, [socket])

  const fetchCrises = async () => {
    try {
      const token = localStorage.getItem('huduma_token')
      const res = await fetch('/api/admin/dashboard', { headers: { Authorization: `Bearer ${token}` } })
      const dash = await res.json()
      setAllCrises(dash.recentCrises || [])
    } catch {}
  }

  // Apply filters
  const now = Date.now()
  const timeRanges = {
    '24h': now - 24 * 60 * 60 * 1000,
    '7d': now - 7 * 24 * 60 * 60 * 1000,
    '30d': now - 30 * 24 * 60 * 60 * 1000,
    'all': 0
  }

  const crises = allCrises.filter(c => {
    // Status filter
    const matchStatus = statusFilter === 'active' ? !['resolved', 'expired'].includes(c.status) :
                        statusFilter === 'resolved' ? c.status === 'resolved' : true

    // Time filter
    const crisisTime = new Date(c.createdAt).getTime()
    const matchTime = timeFilter === 'all' ? true : crisisTime > timeRanges[timeFilter]

    return matchStatus && matchTime
  })

  const escalateCrisis = async (crisisId) => {
    try {
      const token = localStorage.getItem('huduma_token')
      await fetch(`/api/admin/verify-resolution/${crisisId}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ approve: true })
      })
      toast.success('Crisis resolved')
      fetchCrises(); setSelectedCrisis(null)
    } catch { toast.error('Action failed') }
  }

  const resolveCrisis = async (crisisId) => {
    try {
      const token = localStorage.getItem('huduma_token')
      await fetch(`/api/crisis/${crisisId}/status`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'resolved', notes: 'Resolved by admin' })
      })
      if (socket) socket.emit('crisis-resolved', { crisisId, resolution: 'Resolved by admin' })
      toast.success('Crisis resolved')
      fetchCrises(); setSelectedCrisis(null)
    } catch { toast.error('Failed to resolve') }
  }

  const sevColor = (s) => s >= 8 ? '#dc2626' : s >= 6 ? '#f97316' : s >= 4 ? '#eab308' : '#22c55e'
  const sevLabel = (s) => s >= 8 ? 'Critical' : s >= 6 ? 'High' : s >= 4 ? 'Moderate' : 'Low'

  const activeForMap = crises.filter(c => !['resolved', 'expired'].includes(c.status))
  const markers = activeForMap.map(c => ({
    lat: c.location?.coordinates?.[1] || -3.63,
    lng: c.location?.coordinates?.[0] || 39.85,
    color: sevColor(c.triage?.acuityScore || 0),
    popup: `${sevLabel(c.triage?.acuityScore || 0)} - ${c.location?.ward || 'Unknown'}`
  }))

  const statusTabs = [
    { id: 'active', label: '🚨 Active' },
    { id: 'resolved', label: '✅ Resolved' },
    { id: 'all', label: '📋 All' }
  ]

  const timeTabs = [
    { id: '24h', label: '24h' },
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: 'all', label: 'All Time' }
  ]

  return (
    <div className="space-y-6">
      {/* Header with clear separation */}
      <div className="border-b border-white/10 pb-4">
        <h2 className="text-2xl font-bold text-white">Crisis Monitor</h2>
        <p className="text-gray-400 text-sm mt-1">
          {statusFilter === 'active' ? 'Viewing active crises requiring attention' :
           statusFilter === 'resolved' ? 'Viewing resolved crises' :
           'Viewing complete crisis history'}
        </p>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Status Tabs */}
        <div className="flex gap-1 bg-dark-elevated rounded-lg p-1">
          {statusTabs.map(t => (
            <button
              key={t.id}
              onClick={() => setStatusFilter(t.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                statusFilter === t.id ? 'bg-primary-gold text-dark-base' : 'text-gray-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Separator */}
        <div className="w-px h-8 bg-white/10 hidden sm:block" />

        {/* Time Filter */}
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-xs uppercase tracking-wider">Time</span>
          <div className="flex gap-1 bg-dark-elevated rounded-lg p-1">
            {timeTabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTimeFilter(t.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  timeFilter === t.id ? 'bg-primary-gold/20 text-primary-gold' : 'text-gray-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Count Badge */}
        <div className="ml-auto">
          <span className="text-sm text-gray-400">{crises.length} crisis{crises.length !== 1 ? 'es' : ''} found</span>
        </div>
      </div>

      {/* Map (only for active) */}
      {statusFilter === 'active' && (
        <Card className="h-72 p-0 overflow-hidden">
          <MapView center={{ lat: -3.63, lng: 39.85 }} markers={markers} zoom={10} />
        </Card>
      )}

      {/* Crisis List + Actions */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="max-h-[500px] overflow-y-auto">
          {crises.length === 0 ? (
            <p className="text-gray-400 text-center py-12">No crises found for this filter</p>
          ) : (
            crises.map(crisis => {
              const id = crisis._id
              const score = crisis.triage?.acuityScore || 0
              const color = sevColor(score)
              const label = sevLabel(score)
              const text = crisis.rawInput || ''
              const ward = crisis.location?.ward || 'Unknown'
              const status = crisis.status || 'pending'
              const time = crisis.createdAt ? new Date(crisis.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''

              return (
                <div
                  key={id}
                  onClick={() => setSelectedCrisis(selectedCrisis?._id === id ? null : crisis)}
                  className={`p-3 mb-2 rounded-lg cursor-pointer transition border ${
                    selectedCrisis?._id === id ? 'border-primary-gold bg-primary-gold/5' : 'glass-card border-transparent hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-sm font-medium truncate flex-1">{text.substring(0, 45)}...</span>
                    <span className="text-xs px-2 py-0.5 rounded ml-2 whitespace-nowrap" style={{ backgroundColor: color + '20', color }}>{label}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-xs">
                      {ward} · <span className="capitalize">{status?.replace('_', ' ')}</span>
                    </span>
                    <span className="text-gray-600 text-xs">{time}</span>
                  </div>
                </div>
              )
            })
          )}
        </Card>

        {/* Selected Crisis Details */}
        {selectedCrisis && selectedCrisis.status !== 'resolved' && (
          <Card>
            <h4 className="text-white font-bold mb-2">Selected Crisis</h4>
            <p className="text-gray-300 text-sm mb-4">{selectedCrisis.rawInput || selectedCrisis.description}</p>
            <div className="grid grid-cols-2 gap-2 text-sm mb-4">
              <div className="glass-card p-2 rounded">
                <p className="text-gray-500 text-xs">Status</p>
                <p className="text-white capitalize">{(selectedCrisis.status || '').replace('_', ' ')}</p>
              </div>
              <div className="glass-card p-2 rounded">
                <p className="text-gray-500 text-xs">Severity</p>
                <p style={{ color: sevColor(selectedCrisis.triage?.acuityScore || 0) }}>{sevLabel(selectedCrisis.triage?.acuityScore || 0)}</p>
              </div>
              <div className="glass-card p-2 rounded">
                <p className="text-gray-500 text-xs">Location</p>
                <p className="text-white">{selectedCrisis.location?.ward || 'Unknown'}</p>
              </div>
              <div className="glass-card p-2 rounded">
                <p className="text-gray-500 text-xs">Reported</p>
                <p className="text-white text-xs">{selectedCrisis.createdAt ? new Date(selectedCrisis.createdAt).toLocaleString('en-KE') : ''}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => resolveCrisis(selectedCrisis._id)} variant="secondary" className="flex-1">✓ Resolve</Button>
              <Button onClick={() => escalateCrisis(selectedCrisis._id)} className="flex-1">↑ Escalate</Button>
            </div>
          </Card>
        )}

        {selectedCrisis && selectedCrisis.status === 'resolved' && (
          <Card>
            <h4 className="text-green-400 font-bold mb-2">✅ This crisis has been resolved</h4>
            <p className="text-gray-300 text-sm">{selectedCrisis.rawInput?.substring(0, 100)}</p>
            <p className="text-gray-500 text-xs mt-3">Resolved at: {selectedCrisis.updatedAt ? new Date(selectedCrisis.updatedAt).toLocaleString('en-KE') : 'Unknown'}</p>
          </Card>
        )}
      </div>
    </div>
  )
}
