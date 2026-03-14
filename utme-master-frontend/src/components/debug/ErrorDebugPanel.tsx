// ==========================================
// ERROR DEBUG PANEL
// ==========================================
// Shows error logs in a floating panel
// Only visible in development mode

import { useState } from 'react'
import { X, ChevronDown, ChevronUp, Trash2, Download } from 'lucide-react'
import { errorLogger } from '../../utils/errorLogger'
import { motion, AnimatePresence } from 'framer-motion'

export default function ErrorDebugPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [logs, setLogs] = useState(errorLogger.getLogs())
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  // Only show in development
  if (import.meta.env.PROD) {
    return null
  }

  const refreshLogs = () => {
    setLogs(errorLogger.getLogs())
  }

  const clearLogs = () => {
    errorLogger.clearLogs()
    setLogs([])
  }

  const downloadLogs = () => {
    const data = errorLogger.exportLogs()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `error-logs-${new Date().toISOString()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      API_ERROR: 'bg-red-100 text-red-800',
      PAGE_ERROR: 'bg-orange-100 text-orange-800',
      EXAM_ERROR: 'bg-red-100 text-red-800',
      AUTH_ERROR: 'bg-pink-100 text-pink-800',
      VALIDATION_ERROR: 'bg-yellow-100 text-yellow-800',
      UNKNOWN_ERROR: 'bg-gray-100 text-gray-800'
    }
    return colors[type] || colors.UNKNOWN_ERROR
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white rounded-lg shadow-2xl border border-gray-200 w-96 max-h-96 flex flex-col mb-4"
          >
            {/* Header */}
            <div className="bg-gray-900 text-white p-4 rounded-t-lg flex items-center justify-between">
              <h3 className="font-bold">🐛 Error Logger ({logs.length})</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={refreshLogs}
                  className="p-1 hover:bg-gray-700 rounded"
                  title="Refresh"
                >
                  🔄
                </button>
                <button
                  onClick={downloadLogs}
                  className="p-1 hover:bg-gray-700 rounded"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={clearLogs}
                  className="p-1 hover:bg-gray-700 rounded"
                  title="Clear"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Logs List */}
            <div className="overflow-y-auto flex-1">
              {logs.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No errors logged
                </div>
              ) : (
                logs.map((log, index) => (
                  <div
                    key={index}
                    className="border-b border-gray-200 p-3 hover:bg-gray-50"
                  >
                    {/* Log Header */}
                    <button
                      onClick={() =>
                        setExpandedIndex(expandedIndex === index ? null : index)
                      }
                      className="w-full flex items-start gap-2 text-left"
                    >
                      <span className={`px-2 py-1 rounded text-xs font-bold ${getTypeColor(log.type)}`}>
                        {log.type}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {log.message}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      {expandedIndex === index ? (
                        <ChevronUp className="w-4 h-4 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 flex-shrink-0" />
                      )}
                    </button>

                    {/* Expanded Details */}
                    {expandedIndex === index && (
                      <div className="mt-2 pt-2 border-t border-gray-200 text-xs space-y-1">
                        {log.endpoint && (
                          <p>
                            <span className="font-bold">Endpoint:</span> {log.method} {log.endpoint}
                          </p>
                        )}
                        {log.statusCode && (
                          <p>
                            <span className="font-bold">Status:</span> {log.statusCode}
                          </p>
                        )}
                        {log.url && (
                          <p>
                            <span className="font-bold">URL:</span> {log.url}
                          </p>
                        )}
                        {log.details && (
                          <details className="mt-2">
                            <summary className="font-bold cursor-pointer">Details</summary>
                            <pre className="mt-1 bg-gray-100 p-2 rounded overflow-auto max-h-32 text-xs">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-lg transition-all ${
          isOpen
            ? 'bg-gray-900'
            : logs.length > 0
            ? 'bg-red-600 animate-pulse'
            : 'bg-gray-600'
        }`}
        title={`${logs.length} errors logged`}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <span className="text-lg">🐛</span>
        )}
      </motion.button>
    </div>
  )
}
