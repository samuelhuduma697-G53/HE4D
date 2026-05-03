import { useState, useEffect } from 'react'
import { Card } from '../common/Card'
import { Input } from '../common/Input'
import { adminService } from '../../services/adminService'
import { formatters } from '../../utils/formatters'

export const AuditLogs = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ action: '', page: 1 })

  useEffect(() => {
    fetchLogs()
  }, [filter])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const data = await adminService.getAuditLogs(filter)
      setLogs(data.logs || [])
    } finally {
      setLoading(false)
    }
  }

  const actionColors = {
    login: 'text-accent-success',
    login_failed: 'text-accent-emergency',
    helper_verified: 'text-accent-success',
    helper_rejected: 'text-accent-emergency',
    admin_invite_sent: 'text-primary-gold',
    data_exported: 'text-accent-info'
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Audit Logs</h3>
        <Input 
          placeholder="Filter by action..." 
          value={filter.action} 
          onChange={(e) => setFilter({ ...filter, action: e.target.value })}
          className="w-64"
        />
      </div>

      <div className="space-y-1 max-h-[600px] overflow-y-auto">
        {loading ? (
          <p className="text-gray-400 text-center py-4">Loading...</p>
        ) : logs.map(log => (
          <div key={log._id} className="p-3 glass-card text-sm">
            <div className="flex items-center gap-3">
              <span className={`font-medium ${actionColors[log.action] || 'text-gray-300'}`}>
                {log.action}
              </span>
              <span className="text-gray-400">{log.adminEmail}</span>
              <span className="text-gray-500 ml-auto">{formatters.formatDate(log.createdAt, 'relative')}</span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
              <span>IP: {log.ipAddress}</span>
              <span>Status: {log.status}</span>
              {log.resourceType && <span>Resource: {log.resourceType}/{log.resourceId}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-4">
        <button 
          onClick={() => setFilter({ ...filter, page: Math.max(1, filter.page - 1) })}
          disabled={filter.page === 1}
          className="text-primary-gold disabled:opacity-50"
        >
          ← Previous
        </button>
        <span className="text-gray-400">Page {filter.page}</span>
        <button 
          onClick={() => setFilter({ ...filter, page: filter.page + 1 })}
          className="text-primary-gold"
        >
          Next →
        </button>
      </div>
    </Card>
  )
}
