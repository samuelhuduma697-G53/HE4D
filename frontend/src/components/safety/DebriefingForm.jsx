import { useState } from 'react'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { Input } from '../common/Input'
import { safetyService } from '../../services/safetyService'
import toast from 'react-hot-toast'

export const DebriefingForm = ({ crisisId, matchId, onComplete }) => {
  const [formData, setFormData] = useState({
    sessionType: 'self',
    emotionalState: 'calm',
    stressLevel: 3,
    concerns: [],
    notes: '',
    needsFollowUp: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await safetyService.createDebriefing({
        crisisId,
        matchId,
        ...formData,
        sessionDate: new Date().toISOString()
      })
      toast.success('Debriefing submitted. Thank you for your service.')
      onComplete?.()
    } catch (error) {
      toast.error('Failed to submit debriefing')
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleConcern = (concern) => {
    setFormData(prev => ({
      ...prev,
      concerns: prev.concerns.includes(concern)
        ? prev.concerns.filter(c => c !== concern)
        : [...prev.concerns, concern]
    }))
  }

  const concernsList = [
    'personal_safety', 'emotional_impact', 'physical_health', 
    'work_life_balance', 'burnout'
  ]

  return (
    <Card>
      <h3 className="text-xl font-bold text-white mb-4">Post-Crisis Debriefing</h3>
      <p className="text-gray-400 mb-6">
        This helps us monitor helper wellbeing and improve our support system.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-300 mb-2">Session Type</label>
          <select value={formData.sessionType} onChange={(e) => setFormData({ ...formData, sessionType: e.target.value })} className="glass-input">
            <option value="self">Self-Debriefing</option>
            <option value="peer">Peer Support</option>
            <option value="professional">Professional</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">Emotional State</label>
          <select value={formData.emotionalState} onChange={(e) => setFormData({ ...formData, emotionalState: e.target.value })} className="glass-input">
            <option value="calm">Calm</option>
            <option value="anxious">Anxious</option>
            <option value="distressed">Distressed</option>
            <option value="overwhelmed">Overwhelmed</option>
            <option value="traumatized">Traumatized</option>
            <option value="resilient">Resilient</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">Stress Level (1-10)</label>
          <input type="range" min="1" max="10" value={formData.stressLevel} onChange={(e) => setFormData({ ...formData, stressLevel: parseInt(e.target.value) })} className="w-full" />
          <div className="flex justify-between text-sm">
            <span className="text-accent-success">Low</span>
            <span className="text-primary-gold">{formData.stressLevel}</span>
            <span className="text-accent-emergency">High</span>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">Concerns (select all that apply)</label>
          <div className="grid grid-cols-2 gap-2">
            {concernsList.map(c => (
              <label key={c} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={formData.concerns.includes(c)} onChange={() => toggleConcern(c)} />
                {c.replace(/_/g, ' ')}
              </label>
            ))}
          </div>
        </div>

        <Input
          label="Notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Any additional notes..."
        />

        <label className="flex items-center gap-2">
          <input type="checkbox" checked={formData.needsFollowUp} onChange={(e) => setFormData({ ...formData, needsFollowUp: e.target.checked })} />
          <span className="text-gray-300">I would like a follow-up session</span>
        </label>

        <Button type="submit" isLoading={isSubmitting} fullWidth>
          Submit Debriefing
        </Button>
      </form>
    </Card>
  )
}
