import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'react-hot-toast'
import { ErrorBoundary } from 'react-error-boundary'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import { ThemeProvider } from './context/ThemeContext'
import { NotificationProvider } from './context/NotificationContext'
import './styles/globals.css'
import './styles/animations.css'
import './styles/variables.css'

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-base">
      <div className="glass-card p-8 max-w-md text-center">
        <h2 className="text-2xl font-bold text-accent-emergency mb-4">Something went wrong</h2>
        <p className="text-gray-300 mb-6">{error.message}</p>
        <button onClick={resetErrorBoundary} className="btn-primary">
          Try Again
        </button>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <HelmetProvider>
        <BrowserRouter>
          <ThemeProvider>
            <AuthProvider>
              <SocketProvider>
                <NotificationProvider>
                  <App />
                  <Toaster 
                    position="top-right"
                    toastOptions={{
                      duration: 4000,
                      style: {
                        background: '#2d3748',
                        color: '#fff',
                        borderRadius: '12px',
                        border: '1px solid rgba(245, 176, 65, 0.2)'
                      },
                      success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
                      error: { iconTheme: { primary: '#ff4d4d', secondary: '#fff' } }
                    }}
                  />
                </NotificationProvider>
              </SocketProvider>
            </AuthProvider>
          </ThemeProvider>
        </BrowserRouter>
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>
)
