import { useState } from 'react'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import toast from 'react-hot-toast'

export const SafetyReportForm = ({ crisisId, onClose }) => {
  const [type, setType] = useState('')
  const [severity, setSeverity] = useState('moderate')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!type || !description) return toast.error('Please fill all fields')
    setSubmitting(true)
    try {
      await fetch('/api/safety/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('huduma_token')}` },
        body: JSON.stringify({ crisisId, incidentType: type, severity, description })
      })
      toast.success('Safety report submitted')
      onClose?.()
    } catch { toast.error('Failed to submit') }
    finally { setSubmitting(false) }
  }

  return (
    <Card>
      <h3 className="text-lg font-bold text-white mb-4">🛡️ Report Safety Issue</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <select value={type} onChange={e => setType(e.target.value)} className="glass-input w-full">
          <option value="">Select type...</option>
          <option value="threat">Threat</option>
          <option value="unsafe_location">Unsafe Location</option>
          <option value="medical">Medical Emergency</option>
          <option value="harassment">Harassment</option>
          <option value="other">Other</option>
        </select>
        <select value={severity} onChange={e => setSeverity(e.target.value)} className="glass-input w-full">
          <option value="low">Low</option>
          <option value="moderate">Moderate</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the safety issue..." rows={3} className="glass-input w-full" />
        <Button type="submit" fullWidth isLoading={submitting}>Submit Report</Button>
      </form>
    </Card>
  )
}
