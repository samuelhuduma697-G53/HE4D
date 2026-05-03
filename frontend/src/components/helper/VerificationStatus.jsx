import { useState } from 'react'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { helperService } from '../../services/helperService'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'

export const VerificationStatus = ({ status }) => {
  const { user } = useAuth()
  const [showUpload, setShowUpload] = useState(false)
  const [showExperience, setShowExperience] = useState(false)
  const [documentType, setDocumentType] = useState('certificate')
  const [documentUrl, setDocumentUrl] = useState('')
  const [experience, setExperience] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)

  const experienceType = user?.helperProfile?.experienceType || 'Professional'

  const statusConfig = {
    pending: { color: 'text-yellow-400', bg: 'bg-yellow-400/20', icon: '⏳', message: 'Your account is pending verification. Complete your profile below to speed up the process.' },
    verified: { color: 'text-green-400', bg: 'bg-green-400/20', icon: '✅', message: 'Your account is verified! You can now accept crises and help seekers.' },
    rejected: { color: 'text-red-400', bg: 'bg-red-400/20', icon: '❌', message: 'Your verification was rejected. Please re-submit your documents or contact support.' },
    suspended: { color: 'text-red-400', bg: 'bg-red-400/20', icon: '🚫', message: 'Your account has been suspended.' }
  }

  const config = statusConfig[status?.verificationStatus] || statusConfig.pending
  const canSubmit = ['pending', 'rejected'].includes(status?.verificationStatus)

  // Handle file upload from device
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingFile(true)
    try {
      // Convert file to base64 and store as data URL
      const reader = new FileReader()
      reader.onload = async (event) => {
        const dataUrl = event.target.result
        await helperService.uploadDocuments(documentType, dataUrl)
        toast.success('Document uploaded successfully!')
        setShowUpload(false)
        setTimeout(() => window.location.reload(), 1000)
      }
      reader.readAsDataURL(file)
    } catch {
      toast.error('Failed to upload file')
    } finally { setUploadingFile(false) }
  }

  // Handle URL upload
  const handleDocumentUpload = async (e) => {
    e.preventDefault()
    if (!documentUrl.trim()) { toast.error('Please enter a document URL'); return }
    setSubmitting(true)
    try {
      await helperService.uploadDocuments(documentType, documentUrl)
      toast.success('Document uploaded!')
      setDocumentUrl('')
      setShowUpload(false)
      setTimeout(() => window.location.reload(), 1000)
    } catch { toast.error('Failed to upload document') }
    finally { setSubmitting(false) }
  }

  const handleExperienceSubmit = async (e) => {
    e.preventDefault()
    if (experience.length < 20) { toast.error('Please write at least 20 characters'); return }
    setSubmitting(true)
    try {
      await helperService.updateProfile({ bio: experience, livedExperienceDescription: experience })
      toast.success('Experience submitted for verification!')
      setShowExperience(false)
      setTimeout(() => window.location.reload(), 1000)
    } catch { toast.error('Failed to submit') }
    finally { setSubmitting(false) }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <div className="text-center py-8">
          <div className={`w-16 h-16 ${config.bg} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <span className="text-3xl">{config.icon}</span>
          </div>
          <h2 className={`text-2xl font-bold ${config.color} mb-2`}>{status?.verificationStatus?.toUpperCase() || 'PENDING'}</h2>
          <p className="text-gray-300 mb-4">{config.message}</p>
          <p className="text-gray-500 text-sm">Documents submitted: {status?.documentsSubmitted || 0}</p>
        </div>
      </Card>

      {canSubmit && (
        <>
          {experienceType === 'Professional' && (
            <Card>
              <h3 className="text-lg font-bold text-white mb-3">📄 Upload Verification Documents</h3>
              <p className="text-gray-400 text-sm mb-4">Upload your certificate, license, or ID from your device or via URL.</p>
              
              {!showUpload ? (
                <Button onClick={() => setShowUpload(true)} variant="primary">Upload Document</Button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Document Type</label>
                    <select value={documentType} onChange={e => setDocumentType(e.target.value)} className="glass-input w-full">
                      <option value="certificate">Professional Certificate</option>
                      <option value="license">Practice License</option>
                      <option value="nationalId">National ID</option>
                      <option value="other">Other Document</option>
                    </select>
                  </div>

                  {/* File Upload from Device */}
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Upload from Device</label>
                    <input type="file" accept="image/*,.pdf" onChange={handleFileUpload} className="glass-input w-full text-sm" />
                    {uploadingFile && <p className="text-yellow-400 text-xs mt-1">Uploading...</p>}
                  </div>

                  {/* OR URL Upload */}
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                    <div className="relative flex justify-center"><span className="bg-dark-elevated px-3 text-xs text-gray-500">OR paste URL</span></div>
                  </div>

                  <form onSubmit={handleDocumentUpload}>
                    <input type="url" value={documentUrl} onChange={e => setDocumentUrl(e.target.value)} placeholder="https://drive.google.com/your-document" className="glass-input w-full" />
                    <div className="flex gap-2 mt-3">
                      <Button type="submit" isLoading={submitting}>Submit URL</Button>
                      <Button variant="secondary" onClick={() => setShowUpload(false)}>Cancel</Button>
                    </div>
                  </form>
                </div>
              )}
            </Card>
          )}

          {experienceType === 'Peer Support (Lived Experience)' && (
            <Card>
              <h3 className="text-lg font-bold text-white mb-3">💬 Share Your Lived Experience</h3>
              <p className="text-gray-400 text-sm mb-4">Describe your personal experience and how you can help others.</p>
              {!showExperience ? (
                <Button onClick={() => setShowExperience(true)}>Describe Experience</Button>
              ) : (
                <form onSubmit={handleExperienceSubmit} className="space-y-4">
                  <textarea value={experience} onChange={e => setExperience(e.target.value)} placeholder="Describe what you went through and how you can support others..." rows={6} className="glass-input w-full resize-none" maxLength={1000} />
                  <p className="text-xs text-gray-500">{experience.length}/1000</p>
                  <div className="flex gap-2">
                    <Button type="submit" isLoading={submitting}>Submit</Button>
                    <Button variant="secondary" onClick={() => setShowExperience(false)}>Cancel</Button>
                  </div>
                </form>
              )}
            </Card>
          )}

          {status?.documentsSubmitted > 0 && (
            <Card>
              <h3 className="text-lg font-bold text-white mb-2">📋 Already Submitted</h3>
              <p className="text-gray-400 text-sm">You have {status.documentsSubmitted} document(s). An admin will review your application.</p>
            </Card>
          )}
        </>
      )}

      {status?.verificationStatus === 'verified' && (
        <Card>
          <h3 className="text-lg font-bold text-white mb-2">🎉 You're Verified!</h3>
          <p className="text-gray-400 text-sm">Trust Score: {status?.trustScore || 0}/5</p>
        </Card>
      )}
    </div>
  )
}
