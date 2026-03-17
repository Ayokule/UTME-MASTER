// ==========================================
// BLANK PAGE DETECTOR
// ==========================================
// Detects and prevents blank pages
// Shows helpful debugging info

import { useEffect, useState } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface BlankPageDetectorProps {
  pageName: string
  hasContent: boolean
}

export default function BlankPageDetector({ pageName, hasContent }: BlankPageDetectorProps) {
  const [isBlank, setIsBlank] = useState(false)
  const [showDebugInfo, setShowDebugInfo] = useState(false)

  useEffect(() => {
    // Check if page is blank after 2 seconds
    const timer = setTimeout(() => {
      if (!hasContent) {
        console.warn(`⚠️ [${pageName}] Page appears to be blank - no content detected`)
        setIsBlank(true)
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [hasContent, pageName])

  if (!isBlank) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-yellow-100 rounded-full">
            <AlertCircle className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Page Appears Blank
        </h2>

        <p className="text-gray-600 text-center mb-6">
          {pageName} is loading but no content is visible. This might be a data loading issue.
        </p>

        <div className="space-y-4 mb-6">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-semibold text-blue-900 mb-2">Try these steps:</p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Check browser console (F12) for errors</li>
              <li>✓ Check Network tab for failed requests</li>
              <li>✓ Verify backend is running (http://localhost:3000/api/health)</li>
              <li>✓ Check database has data (/api/health/database)</li>
            </ul>
          </div>

          <button
            onClick={() => setShowDebugInfo(!showDebugInfo)}
            className="w-full text-sm text-gray-600 hover:text-gray-900 font-semibold py-2 px-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {showDebugInfo ? 'Hide' : 'Show'} Debug Info
          </button>

          {showDebugInfo && (
            <div className="p-4 bg-gray-100 rounded-lg border border-gray-300 max-h-40 overflow-auto">
              <p className="text-xs font-mono text-gray-700 mb-2">
                <strong>Page:</strong> {pageName}
              </p>
              <p className="text-xs font-mono text-gray-700 mb-2">
                <strong>URL:</strong> {window.location.href}
              </p>
              <p className="text-xs font-mono text-gray-700 mb-2">
                <strong>Time:</strong> {new Date().toLocaleTimeString()}
              </p>
              <p className="text-xs font-mono text-gray-700">
                <strong>Console:</strong> Check F12 for errors
              </p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Reload Page
          </button>

          <button
            onClick={() => setIsBlank(false)}
            className="w-full px-4 py-3 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}
