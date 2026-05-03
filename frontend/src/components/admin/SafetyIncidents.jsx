import { useState, useEffect } from 'react'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { Modal } from '../common/Modal'
import { adminService } from '../../services/adminService'
import { formatters } from '../../utils/formatters'
import toast from 'react-hot-toast'

export const SafetyIncidents = () => {
  const [incidents, setIncidents] = useState([])
  const [selectedIncident, setSelectedIncident] = useState(null)
  const [filter, setFilter] = useState({ status: '', severity: '' })

  useEffect(() => {
    fetchIncidents()
  }, [filter])

  const fetchIncidents = async () => {
    const data = await adminService.getSafetyIncidents(filter)
    setIncidents(data.incidents || [])
  }

  const handleResolve = async (incidentId, resolution) => {
    try {
      await adminService.resolveIncident(incidentId, resolution)
      toast.success('Incident resolved')
      fetchIncidents()
      setSelectedIncident(null)
    } catch (error) {
      toast.error('Failed to resolve incident')
    }
  }

  const severityColors = {
    critical: 'text-accent-emergency bg-accent-emergency/20',
    high: 'text-accent-warning bg-accent-warning/20',
    moderate: 'text-primary-gold bg-primary-gold/20',
    low: 'text-accent-success bg-accent-success/20'
  }

  return (
    <>
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Safety Incidents</h3>
          <div className="flex gap-2">
            <select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })} className="glass-input text-sm">
              <option value="">All Status</option>
              <option value="reported">Reported</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
            </select>
            <select value={filter.severity} onChange={(e) => setFilter({ ...filter, severity: e.target.value })} className="glass-input text-sm">
              <option value="">All Severity</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="moderate">Moderate</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          {incidents.map(incident => (
            <div key={incident._id} className="p-3 glass-card cursor-pointer hover:bg-white/5" onClick={() => setSelectedIncident(incident)}>
              <div className="flex items-center justify-between">
                <span className="text-white">{incident.helperId?.name || 'Unknown'}</span>
                <span className={`px-2 py-1 rounded text-xs ${severityColors[incident.severity]}`}>
                  {incident.severity}
                </span>
              </div>
              <p className="text-gray-400 text-sm truncate">{incident.incidentType}</p>
              <p className="text-gray-500 text-xs">{formatters.formatDate(incident.createdAt, 'relative')}</p>
            </div>
          ))}
        </div>
      </Card>

      <Modal isOpen={!!selectedIncident} onClose={() => setSelectedIncident(null)} title="Incident Details">
        {selectedIncident && (
          <div className="space-y-4">
            <div>
              <p className="text-gray-400">Helper</p>
              <p className="text-white">{selectedIncident.helperId?.name}</p>
            </div>
            <div>
              <p className="text-gray-400">Type</p>
              <p className="text-white">{selectedIncident.incidentType}</p>
            </div>
            <div>
              <p className="text-gray-400">Severity</p>
              <p className="text-white">{selectedIncident.severity}</p>
            </div>
            <div>
              <p className="text-gray-400">Description</p>
              <p className="text-white">{selectedIncident.description}</p>
            </div>
            <div>
              <p className="text-gray-400">Location</p>
              <p className="text-white">{selectedIncident.location?.ward}, {selectedIncident.location?.subCounty}</p>
            </div>
            {selectedIncident.status !== 'resolved' && (
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => handleResolve(selectedIncident._id, 'safe')}>Mark Safe</Button>
                <Button variant="secondary" onClick={() => handleResolve(selectedIncident._id, 'assisted')}>Mark Assisted</Button>
                <Button onClick={() => handleResolve(selectedIncident._id, 'escalated')}>Escalate</Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  )
}
