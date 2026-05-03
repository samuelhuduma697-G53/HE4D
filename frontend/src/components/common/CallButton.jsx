import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWebRTC } from '../../hooks/useWebRTC'

export const CallButton = ({ crisisId, label = 'Call' }) => {
  const { isCallActive, isIncoming, callerName, startCall, acceptIncoming, endCall } = useWebRTC(crisisId)
  const [showConfirm, setShowConfirm] = useState(false)

  if (!crisisId) return null

  return (
    <>
      {/* Call Button */}
      <button
        onClick={() => isCallActive ? endCall() : setShowConfirm(true)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
          isCallActive 
            ? 'bg-red-600 hover:bg-red-700 text-white' 
            : 'bg-green-600 hover:bg-green-700 text-white'
        }`}
      >
        {isCallActive ? '🔴 End Call' : `📞 ${label}`}
      </button>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
            <div className="bg-gray-800 rounded-xl p-6 max-w-sm mx-4 text-center">
              <p className="text-white text-lg mb-4">Start audio call with {label}?</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setShowConfirm(false)} className="px-4 py-2 bg-gray-600 text-white rounded-lg">Cancel</button>
                <button onClick={() => { setShowConfirm(false); startCall(); }} className="px-4 py-2 bg-green-600 text-white rounded-lg">📞 Call Now</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Incoming Call Modal */}
      <AnimatePresence>
        {isIncoming && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
            <div className="bg-gray-800 rounded-xl p-8 max-w-sm mx-4 text-center animate-pulse">
              <div className="text-6xl mb-4">📞</div>
              <p className="text-white text-xl font-bold mb-2">{callerName} is calling</p>
              <p className="text-gray-400 mb-6">Incoming audio call...</p>
              <div className="flex gap-4 justify-center">
                <button onClick={() => { setIsIncoming(false); }} className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold">Decline</button>
                <button onClick={acceptIncoming} className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold">📞 Accept</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
