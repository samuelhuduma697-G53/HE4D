import { useState, useEffect } from 'react'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { adminService } from '../../services/adminService'
import { formatters } from '../../utils/formatters'
import toast from 'react-hot-toast'

export const HelperVerification = () => {
  const [pending, setPending] = useState([])
  const [selectedHelper, setSelectedHelper] = useState(null)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    adminService.getPendingVerifications().then(data => setPending(data.pendingHelpers || []))
  }, [])

  const handleVerify = async (helperId, approve) => {
    try {
      await adminService.verifyHelper(helperId, approve, notes)
      toast.success(`Helper ${approve ? 'verified' : 'rejected'}`)
      setPending(pending.filter(h => h._id !== helperId))
      setSelectedHelper(null)
      setNotes('')
    } catch { toast.error('Verification failed') }
  }

  return (
    <>
      <Card>
        <h3 className="text-xl font-bold text-white mb-4">Pending Helper Verifications ({pending.length})</h3>
        {pending.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No pending verifications</p>
        ) : (
          pending.map(helper => (
            <div key={helper._id} onClick={() => setSelectedHelper(helper)}
              className="flex items-center justify-between p-3 glass-card cursor-pointer hover:bg-white/5 mb-2">
              <div>
                <p className="text-white font-medium">{helper.name}</p>
                <p className="text-gray-500 text-sm">{helper.email} • {helper.phone}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${helper.helperProfile?.experienceType === 'Professional' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                    {helper.helperProfile?.experienceType || 'Unknown'}
                  </span>
                  <span className="text-gray-500 text-xs">Applied: {formatters.formatDate(helper.createdAt, 'date')}</span>
                </div>
              </div>
              <span className="text-yellow-400 bg-yellow-400/20 px-2 py-1 rounded text-xs">Pending</span>
            </div>
          ))
        )}
      </Card>

      {/* Selected Helper Modal */}
      {selectedHelper && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelectedHelper(null)}>
          <div className="bg-dark-elevated rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white mb-4">Verify Helper</h3>

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div><p className="text-gray-400 text-xs">Name</p><p className="text-white font-medium">{selectedHelper.name}</p></div>
              <div><p className="text-gray-400 text-xs">Email</p><p className="text-white text-sm">{selectedHelper.email}</p></div>
              <div><p className="text-gray-400 text-xs">Phone</p><p className="text-white">{selectedHelper.phone}</p></div>
              <div><p className="text-gray-400 text-xs">National ID</p><p className="text-white">{selectedHelper.helperProfile?.nationalId || 'N/A'}</p></div>
            </div>

            {/* Experience Type */}
            <div className="border-t border-white/10 pt-3 mb-4">
              <p className="text-gray-400 text-xs mb-1">Experience Type</p>
              <p className="text-white font-medium">{selectedHelper.helperProfile?.experienceType}</p>
              {selectedHelper.helperProfile?.yearsOfExperience > 0 && (
                <p className="text-white text-sm mt-1">{selectedHelper.helperProfile?.yearsOfExperience} years</p>
              )}
            </div>

            {/* Lived Experience (Peer Support) */}
            {selectedHelper.helperProfile?.experienceType === 'Peer Support (Lived Experience)' && (
              <div className="border-t border-white/10 pt-3 mb-4">
                <p className="text-gray-400 text-xs mb-1">Lived Experience Description</p>
                <div className="bg-dark-base rounded-lg p-3">
                  <p className="text-white text-sm whitespace-pre-wrap">
                    {selectedHelper.helperProfile?.livedExperienceDescription || selectedHelper.profile?.bio || 'No description provided'}
                  </p>
                </div>
              </div>
            )}

            {/* Uploaded Documents */}
            {selectedHelper.helperProfile?.verificationDocuments?.length > 0 && (
              <div className="border-t border-white/10 pt-3 mb-4">
                <p className="text-gray-400 text-xs mb-2">Uploaded Documents ({selectedHelper.helperProfile.verificationDocuments.length})</p>
                {selectedHelper.helperProfile.verificationDocuments.map((doc, i) => (
                  <div key={i} className="bg-dark-base rounded-lg p-3 mb-2">
                    <p className="text-white text-sm font-medium capitalize">{doc.type}</p>
                    {doc.url?.startsWith('data:') ? (
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-primary-gold text-xs hover:underline">
                        📎 View Uploaded File →
                      </a>
                    ) : (
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-primary-gold text-xs hover:underline">
                        🔗 View Document →
                      </a>
                    )}
                    <p className="text-gray-500 text-xs mt-1">Uploaded: {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString('en-KE') : 'Unknown'}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Notes */}
            <div className="border-t border-white/10 pt-3 mb-4">
              <label className="block text-gray-400 text-xs mb-1">Admin Notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes..." rows={2} className="glass-input w-full resize-none text-sm" />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => handleVerify(selectedHelper._id, false)} className="flex-1">❌ Reject</Button>
              <Button onClick={() => handleVerify(selectedHelper._id, true)} className="flex-1">✅ Approve</Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
