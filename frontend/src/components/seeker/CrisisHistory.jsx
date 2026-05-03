import { useState, useEffect } from 'react'
import { Card } from '../common/Card'
import { crisisService } from '../../services/crisisService'
import { formatters } from '../../utils/formatters'

export const CrisisHistory = () => {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    crisisService.getHistory()
      .then(res => setHistory(res.crises || []))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Card>
        <h3 className="text-xl font-bold text-white mb-4">Recent Crises</h3>
        <p className="text-gray-400">Loading...</p>
      </Card>
    )
  }

  if (!history.length) {
    return (
      <Card>
        <h3 className="text-xl font-bold text-white mb-4">Recent Crises</h3>
        <p className="text-gray-400">No crisis history yet.</p>
      </Card>
    )
  }

  return (
    <Card>
      <h3 className="text-xl font-bold text-white mb-4">Recent Crises ({history.length})</h3>
      <div className="space-y-3">
        {history.slice(0, 10).map((crisis) => {
          const score = crisis.triage?.acuityScore || 0
          const info = score >= 8 ? { label: 'Critical', color: '#dc2626' } :
                       score >= 6 ? { label: 'High', color: '#f97316' } :
                       score >= 4 ? { label: 'Moderate', color: '#eab308' } :
                       { label: 'Low', color: '#22c55e' }
          return (
            <div key={crisis._id} className="flex items-center justify-between p-3 glass-card">
              <div>
                <p className="text-white text-sm">{crisis.rawInput?.substring(0, 60)}...</p>
                <p className="text-gray-500 text-xs">
                  {crisis.createdAt ? new Date(crisis.createdAt).toLocaleDateString('en-KE', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                  {' · '}{crisis.location?.ward || 'Unknown'}
                </p>
              </div>
              <span className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: info.color + '20', color: info.color }}>
                {info.label}
              </span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
