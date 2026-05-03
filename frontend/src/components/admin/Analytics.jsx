import { useState, useEffect } from 'react'
import { Card } from '../common/Card'

export const Analytics = () => {
  const [data, setData] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('huduma_token')
    Promise.all([
      fetch('/api/admin/dashboard', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/crisis/stats/summary', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).catch(() => ({})),
      fetch('/api/helpers/stats', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).catch(() => ({}))
    ]).then(([dash, crisisStats, helperStats]) => {
      setData({ dash, crisisStats, helperStats })
    })
  }, [])

  if (!data) return <Card><p className="text-gray-400">Loading analytics...</p></Card>

  const { dash, crisisStats } = data
  const totalCrises = crisisStats.total || 0
  const bySeverity = crisisStats.bySeverity || []
  const resolved = bySeverity.find(s => s._id === 'resolved')?.count || 0
  const resolutionRate = totalCrises > 0 ? Math.round((resolved / totalCrises) * 100) : 0

  const severityColors = { critical: '#dc2626', high: '#f97316', moderate: '#eab308', low: '#22c55e' }
  const severityData = ['critical', 'high', 'moderate', 'low'].map(sev => {
    const count = bySeverity.find(s => s._id === sev)?.count || 0
    const pct = totalCrises > 0 ? Math.round((count / totalCrises) * 100) : 0
    return { sev, count, pct, color: severityColors[sev] }
  })

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-3xl font-bold text-primary-gold">{(dash.stats?.users?.totalSeekers || 0) + (dash.stats?.users?.totalHelpers || 0)}</p>
          <p className="text-gray-400 text-sm">Total Users</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-primary-gold">{totalCrises}</p>
          <p className="text-gray-400 text-sm">Total Crises</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-primary-gold">{resolutionRate}%</p>
          <p className="text-gray-400 text-sm">Resolution Rate</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-primary-gold">{dash.stats?.users?.totalHelpers || 0}</p>
          <p className="text-gray-400 text-sm">Active Helpers</p>
        </Card>
      </div>

      {/* Crisis by Severity Bar Chart */}
      <Card>
        <h3 className="text-lg font-bold text-white mb-4">Crises by Severity</h3>
        <div className="space-y-3">
          {severityData.map(item => (
            <div key={item.sev} className="flex items-center gap-3">
              <span className="text-sm text-gray-400 w-20 capitalize">{item.sev}</span>
              <div className="flex-1 bg-dark-base rounded-full h-5 overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500" 
                  style={{ width: `${item.pct}%`, backgroundColor: item.color, minWidth: item.count > 0 ? '20px' : '0' }}
                />
              </div>
              <span className="text-sm text-white w-12 text-right">{item.count}</span>
              <span className="text-xs text-gray-500 w-10">{item.pct}%</span>
            </div>
          ))}
        </div>
        {totalCrises === 0 && <p className="text-gray-500 text-sm mt-4 text-center">No crises recorded yet</p>}
      </Card>

      {/* Crisis Trend (simplified) */}
      <Card>
        <h3 className="text-lg font-bold text-white mb-4">Platform Overview</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 glass-card">
            <p className="text-gray-400">Seekers Registered</p>
            <p className="text-white text-xl font-bold">{dash.stats?.users?.totalSeekers || 0}</p>
          </div>
          <div className="p-3 glass-card">
            <p className="text-gray-400">Helpers Registered</p>
            <p className="text-white text-xl font-bold">{dash.stats?.users?.totalHelpers || 0}</p>
          </div>
          <div className="p-3 glass-card">
            <p className="text-gray-400">Pending Verifications</p>
            <p className="text-white text-xl font-bold">{dash.stats?.verifications?.pending || 0}</p>
          </div>
          <div className="p-3 glass-card">
            <p className="text-gray-400">Region</p>
            <p className="text-white text-xl font-bold">Kilifi</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
