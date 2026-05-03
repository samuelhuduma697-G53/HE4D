import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-base via-dark-elevated to-dark-base flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-red/5 rounded-full blur-3xl" />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-gold">Huduma Ecosystem</h1>
          <p className="text-gray-400 mt-2">Crisis Support • Kilifi Region</p>
        </div>
        
        <div className="glass-card p-8">
          <Outlet />
        </div>
        
        <div className="mt-6 p-4 glass-card border-accent-emergency/30 bg-accent-emergency/5">
          <p className="text-sm text-center text-gray-300">
            <span className="text-accent-emergency font-bold">⚠️ In immediate danger?</span>
            <br />
            Call <span className="font-bold">119</span> or <span className="font-bold">999</span> 
            {' '}OR Press Panic Button once logged in.
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default AuthLayout
