import { useState, useRef } from 'react'
import { Button } from '../common/Button'
import { useCrisis } from '../../hooks/useCrisis'
import { useGeolocation } from '../../hooks/useGeolocation'
import toast from 'react-hot-toast'

export const CrisisSubmission = ({ onSuccess }) => {
  const [text, setText] = useState('')
  const [language, setLanguage] = useState('swahili')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const { submitCrisis } = useCrisis()
  const { location, getCurrentPosition } = useGeolocation()
  const recognitionRef = useRef(null)

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      toast.error('Voice input not supported on this browser. Please use Chrome.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = language === 'swahili' ? 'sw-KE' : language === 'sheng' ? 'sw-KE' : 'en-KE'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => { setIsListening(false); toast.error('Voice recognition failed. Please type instead.') }
    
    recognition.onresult = (event) => {
      const spoken = event.results[0][0].transcript
      setText(prev => prev ? prev + ' ' + spoken : spoken)
      toast.success('Voice captured!')
    }

    recognitionRef.current = recognition
    recognition.start()
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!text.trim()) { toast.error('Please describe your situation'); return }

    setIsSubmitting(true)
    try {
      let lat = location?.latitude
      let lng = location?.longitude
      if (!lat || !lng) {
        const pos = await getCurrentPosition()
        lat = pos.coords.latitude
        lng = pos.coords.longitude
      }
      await submitCrisis({ text, latitude: lat, longitude: lng, language })
      toast.success('Crisis reported. Help is on the way.')
      onSuccess?.()
    } catch (error) {
      toast.error('Failed to submit crisis')
    } finally { setIsSubmitting(false) }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="text-xl font-bold text-white mb-4">Report a Crisis</h3>

      <div className="mb-4">
        <label className="block text-sm text-gray-300 mb-2">Language</label>
        <select value={language} onChange={(e) => setLanguage(e.target.value)} className="glass-input">
          <option value="swahili">Swahili</option>
          <option value="english">English</option>
          <option value="sheng">Sheng</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm text-gray-300 mb-2">
          Describe your situation
        </label>
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            className="glass-input w-full pr-12"
            placeholder={
              language === 'swahili' ? 'Nahitaji msaada...' :
              language === 'sheng' ? 'Niko kwa shida...' :
              'I need help...'
            }
            required
          />
          {/* Voice Button */}
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            className={`absolute right-3 bottom-3 p-2 rounded-full transition ${
              isListening ? 'bg-red-500 animate-pulse' : 'bg-dark-elevated hover:bg-gray-600'
            }`}
            title={isListening ? 'Stop listening' : 'Click to speak'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill={isListening ? 'white' : '#F5B041'} stroke="currentColor" strokeWidth="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
          </button>
        </div>
        {isListening && (
          <p className="text-red-400 text-xs mt-1 animate-pulse">🎤 Listening... Speak your crisis now</p>
        )}
        <p className="text-gray-500 text-xs mt-1">
          Type or tap the 🎤 microphone to speak your crisis
        </p>
      </div>

      <div className="flex gap-3">
        <Button type="submit" isLoading={isSubmitting}>Submit Crisis</Button>
        <Button type="button" variant="secondary" onClick={() => getCurrentPosition()}>📍 Share Location</Button>
      </div>

      {location && (
        <p className="text-sm text-green-400 mt-3">
          ✓ Location ready: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
        </p>
      )}
    </form>
  )
}
