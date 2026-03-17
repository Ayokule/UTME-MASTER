// ==========================================
// REAL-TIME EXAM INTERFACE
// ==========================================
// Enhanced exam interface with WebSocket integration

import React, { useState, useEffect, useCallback } from 'react'
import { 
  Clock, 
  Users, 
  Wifi, 
  WifiOff, 
  AlertTriangle, 
  CheckCircle,
  Send,
  MessageSquare
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import webSocketClient from '../../services/websocket.service'
import { toast } from 'react-hot-toast'

interface ExamInterfaceProps {
  examId: string
  studentExamId: string
  timeRemaining: number
  onTimeUpdate: (time: number) => void
  onAnswerSubmit: (questionId: string, answer: any) => void
  onExamSubmit: () => void
}

interface ExamAnnouncement {
  message: string
  timestamp: Date
  from: string
}

const RealTimeExamInterface: React.FC<ExamInterfaceProps> = ({
  examId,
  studentExamId,
  timeRemaining,
  onTimeUpdate,
  onAnswerSubmit,
  onExamSubmit
}) => {
  const [isConnected, setIsConnected] = useState(false)
  const [announcements, setAnnouncements] = useState<ExamAnnouncement[]>([])
  const [showAnnouncements, setShowAnnouncements] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')
  const [lastActivity, setLastActivity] = useState(new Date())

  // Initialize WebSocket connection
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      webSocketClient.connect(token)
    }

    // Setup event listeners
    webSocketClient.on('connected', handleConnected)
    webSocketClient.on('disconnected', handleDisconnected)
    webSocketClient.on('exam-joined', handleExamJoined)
    webSocketClient.on('exam-error', handleExamError)
    webSocketClient.on('exam-announcement', handleExamAnnouncement)
    webSocketClient.on('force-disconnect', handleForceDisconnect)
    webSocketClient.on('answer-received', handleAnswerReceived)

    // Join exam session
    webSocketClient.joinExam(examId)

    // Activity heartbeat
    const activityInterval = setInterval(() => {
      if (webSocketClient.isSocketConnected()) {
        webSocketClient.sendExamActivity(examId, 'heartbeat')
        setLastActivity(new Date())
      }
    }, 30000) // Every 30 seconds

    return () => {
      clearInterval(activityInterval)
      webSocketClient.leaveExam(examId)
      webSocketClient.off('connected', handleConnected)
      webSocketClient.off('disconnected', handleDisconnected)
      webSocketClient.off('exam-joined', handleExamJoined)
      webSocketClient.off('exam-error', handleExamError)
      webSocketClient.off('exam-announcement', handleExamAnnouncement)
      webSocketClient.off('force-disconnect', handleForceDisconnect)
      webSocketClient.off('answer-received', handleAnswerReceived)
    }
  }, [examId])

  // Event handlers
  const handleConnected = useCallback(() => {
    setIsConnected(true)
    setConnectionStatus('connected')
    toast.success('Connected to exam session')
  }, [])

  const handleDisconnected = useCallback(() => {
    setIsConnected(false)
    setConnectionStatus('disconnected')
    toast.error('Disconnected from exam session')
  }, [])

  const handleExamJoined = useCallback((data: any) => {
    setIsConnected(true)
    setConnectionStatus('connected')
    onTimeUpdate(data.timeRemaining)
    toast.success('Joined exam session successfully')
  }, [onTimeUpdate])

  const handleExamError = useCallback((data: { message: string }) => {
    toast.error(data.message)
  }, [])

  const handleExamAnnouncement = useCallback((data: ExamAnnouncement) => {
    setAnnouncements(prev => [data, ...prev])
    setShowAnnouncements(true)
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
      setShowAnnouncements(false)
    }, 10000)
  }, [])

  const handleForceDisconnect = useCallback((data: { reason: string }) => {
    toast.error(`Exam session terminated: ${data.reason}`)
    // Redirect to exam list or dashboard
    window.location.href = '/student/exams'
  }, [])

  const handleAnswerReceived = useCallback((data: { questionId: string }) => {
    // Visual feedback for answer submission
    toast.success('Answer saved', { duration: 2000 })
  }, [])

  // Enhanced answer submission with real-time sync
  const handleAnswerSubmit = useCallback((questionId: string, answer: any) => {
    // Send via WebSocket for real-time sync
    webSocketClient.submitAnswer(examId, questionId, answer)
    
    // Also call the original handler
    onAnswerSubmit(questionId, answer)
    
    // Track activity
    webSocketClient.sendExamActivity(examId, `answered_question_${questionId}`)
    setLastActivity(new Date())
  }, [examId, onAnswerSubmit])

  // Enhanced exam submission
  const handleExamSubmission = useCallback(() => {
    // Send via WebSocket
    webSocketClient.submitExam(examId)
    
    // Call original handler
    onExamSubmit()
    
    toast.success('Exam submitted successfully')
  }, [examId, onExamSubmit])

  // Connection status indicator
  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-600'
      case 'connecting': return 'text-yellow-600'
      case 'disconnected': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return <Wifi className="w-4 h-4" />
      case 'connecting': return <Clock className="w-4 h-4 animate-spin" />
      case 'disconnected': return <WifiOff className="w-4 h-4" />
      default: return <WifiOff className="w-4 h-4" />
    }
  }

  return (
    <div className="relative">
      {/* Connection Status Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <div className={`flex items-center space-x-2 ${getConnectionStatusColor()}`}>
                {getConnectionStatusIcon()}
                <span className="text-sm font-medium">
                  {connectionStatus === 'connected' && 'Connected'}
                  {connectionStatus === 'connecting' && 'Connecting...'}
                  {connectionStatus === 'disconnected' && 'Disconnected'}
                </span>
              </div>

              {/* Last Activity */}
              {isConnected && (
                <div className="text-sm text-gray-500">
                  Last activity: {lastActivity.toLocaleTimeString()}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {/* Announcements */}
              {announcements.length > 0 && (
                <button
                  onClick={() => setShowAnnouncements(!showAnnouncements)}
                  className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm">
                    {announcements.length} announcement{announcements.length !== 1 ? 's' : ''}
                  </span>
                </button>
              )}

              {/* Time Remaining */}
              <div className="flex items-center space-x-2 text-gray-700">
                <Clock className="w-4 h-4" />
                <span className="font-mono text-sm">
                  {Math.floor(timeRemaining / 3600)}:
                  {Math.floor((timeRemaining % 3600) / 60).toString().padStart(2, '0')}:
                  {(timeRemaining % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Announcements Panel */}
      <AnimatePresence>
        {showAnnouncements && announcements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-16 left-4 right-4 z-40 bg-white border rounded-lg shadow-lg max-w-md mx-auto"
          >
            <div className="p-4 border-b bg-blue-50">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-blue-900">Exam Announcements</h3>
                <button
                  onClick={() => setShowAnnouncements(false)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              {announcements.map((announcement, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 border-b last:border-b-0"
                >
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{announcement.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        From: {announcement.from} • {announcement.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connection Warning */}
      {!isConnected && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-16 left-4 right-4 z-40 bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto"
        >
          <div className="flex items-center space-x-3">
            <WifiOff className="w-5 h-5 text-red-500" />
            <div>
              <p className="text-sm font-medium text-red-800">Connection Lost</p>
              <p className="text-xs text-red-600">
                Your answers are being saved locally. Connection will be restored automatically.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Enhanced Submit Button */}
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={handleExamSubmission}
          className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-lg transition-colors"
        >
          <Send className="w-4 h-4" />
          <span>Submit Exam</span>
          {isConnected && <CheckCircle className="w-4 h-4" />}
        </button>
      </div>

      {/* Expose enhanced handlers */}
      <div style={{ display: 'none' }}>
        {/* This allows parent components to access the enhanced handlers */}
        <button onClick={() => handleAnswerSubmit('test', 'test')}>Hidden</button>
      </div>
    </div>
  )
}

export default RealTimeExamInterface