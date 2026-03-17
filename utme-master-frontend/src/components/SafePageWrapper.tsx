// ==========================================
// SAFE PAGE WRAPPER
// ==========================================
// Prevents blank pages by catching all errors
// Shows helpful error messages instead

import { ReactNode, useState, useEffect } from 'react'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface SafePageWrapperProps {
  children: ReactNode
  pageName: string
  fallbackComponent?: ReactNode
}

export default function SafePageWrapper({ 
  children, 
  pageName,
  fallbackComponent 
}: SafePageWrapperProps) {
  const [error, setError] = useState<Error | null>(null)
  const [hasError, setHasError] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Catch unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error(`❌ [${pageName}] Unhandled promise rejection:`, event.reason)
      setError(event.reason)
      setHasError(true)
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection)
  }, [pageName])

  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-red-100 rounded-full">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Oops! Something went wrong
          </h1>
          <p className="text-gray-600 text-center mb-4">
            {pageName} encountered an error
          </p>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-700 font-mono break-words">
              {error?.message || 'Unknown error'}
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                setHasError(false)
                setError(null)
                window.location.reload()
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Reload Page
            </button>
            <button
              onClick={() => navigate('/student/dashboard')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              <Home className="w-5 h-5" />
              Go to Dashboard
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-6">
            Error ID: {Date.now()}
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      {children}
      {fallbackComponent}
    </>
  )
}
