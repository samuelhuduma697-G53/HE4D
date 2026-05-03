import { useState, useEffect } from 'react'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { crisisService } from '../../services/crisisService'
import { matchingService } from '../../services/matchingService'
import toast from 'react-hot-toast'

export const CrisisQueue = ({ isAvailable, onAccept }) => {
  const [crises, setCrises] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAvailable) { setCrises([]); setLoading(false); return }
    crisisService.getQueue()
      .then(res => setCrises(res.queue || []))
      .catch(() => setCrises([]))
      .finally(() => setLoading(false))
  }, [isAvailable])

  const handleAccept = async (crisisId) => {
    try {
      const result = await matchingService.acceptCrisis(crisisId)
      toast.success('Crisis accepted! Navigating to seeker...')
      if (onAccept) onAccept(result)
      setCrises(prev => prev.filter(c => c._id !== crisisId && c.crisisId !== crisisId))
    } catch (error) {
      toast.error('Failed to accept crisis')
    }
  }

  if (loading) return <Card><p className="text-gray-400">Loading crises...</p></Card>
  if (!isAvailable) return <Card><p className="text-gray-400">Go online to see available crises.</p></Card>
  if (!crises.length) return <Card><p className="text-gray-400">No crises available right now. Check back soon.</p></Card>

  return (
    <div className="space-y-3">
      {crises.map((crisis) => {
        const id = crisis._id || crisis.crisisId
        const score = crisis.triage?.acuityScore || crisis.acuityScore || 0
        const severity = crisis.triage?.severity || crisis.severity || 'low'
        const color = score >= 8 ? '#dc2626' : score >= 6 ? '#f97316' : score >= 4 ? '#eab308' : '#22c55e'
        const label = score >= 8 ? 'Critical' : score >= 6 ? 'High' : score >= 4 ? 'Moderate' : 'Low'
        const text = crisis.rawInput || crisis.description || 'Crisis report'
        const location = crisis.location?.ward || crisis.ward || 'Nearby'
        const time = crisis.createdAt ? new Date(crisis.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''

        return (
          <Card key={id} className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm">{text.substring(0, 50)}...</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: color + '20', color }}>{label}</span>
                <span className="text-gray-500 text-xs">{location}{time ? ' · ' + time : ''}</span>
              </div>
            </div>
            <Button onClick={() => handleAccept(id)} size="sm">Accept</Button>
          </Card>
        )
      })}
    </div>
  )
}
