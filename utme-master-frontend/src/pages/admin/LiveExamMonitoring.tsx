// ==========================================
// LIVE EXAM MONITORING DASHBOARD
// ==========================================
// Real-time monitoring of active exam sessions

import React, { useState, useEffect } from 'react'
import { 
  Users, 
  Clock, 
  Activity, 
  AlertTriangle, 
  Send, 
  UserX,
  Eye,
  RefreshCw,
  Monitor
} from 'lucide-react'
import { motion } from 'framer-motion'
import webSocketClient from '../../services/websocket.service'
import { api } from '../../api/client'

interface ExamSession {
  examId: string
  studentId: string
  studentName: string
  startTime: Date
  lastActivity: Date
  status: 'active' | 'paused' | 'submitted'
  timeRemaining: number
  isOnline: boolean
}

interface ExamStats {
  examId: string
  examTitle: string
  onlineStudents: number
  totalSessions: number
  activeSessions: number
  pausedSessions: number
  submittedSessions: number
}

interface ActivityLog {
  id: string
  examId: string
  studentId: string
  studentName: string
  action: string
  timestamp: Date
}

const LiveExamMonitoring: React.FC = () => {
  const [activeSessions, setActiveSessions] = useState<ExamSession[]>([])
  const [examStats, setExamStats] = useState<ExamStats[]>([])
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([])
  const [selectedExam, setSelectedExam] = useState<string>('')
  const [announcementMessage, setAnnouncementMessage] = useState('')
  const [loading, setLoading] = useState(true)

  // Load initial data
  useEffect(() => {
    loadExamStats()
    loadActiveSessions()
    
    // Setup WebSocket listeners
    webSocketClient.on('student-joined-exam', handleStudentJoined)
    webSocketClient.on('student-left-exam', handleStudentLeft)
    webSocketClient.on('exam-submitted', handleExamSubmitted)
    webSocketClient.on('student-activity', handleStudentActivity)
    webSocketClient.on('session-inactive', handleSessionInactive)
    webSocketClient.on('active-sessions', handleActiveSessionsUpdate)
    webSocketClient.on('exam-stats', handleExamStatsUpdate)

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadActiveSessions()
      if (selectedExam) {
        webSocketClient.getExamStats(selectedExam)
      }
    }, 30000)

    return () => {
      clearInterval(interval)
      webSocketClient.off('student-joined-exam', handleStudentJoined)
      webSocketClient.off('student-left-exam', handleStudentLeft)
      webSocketClient.off('exam-submitted', handleExamSubmitted)
      webSocketClient.off('student-activity', handleStudentActivity)
      webSocketClient.off('session-inactive', handleSessionInactive)
      webSocketClient.off('active-sessions', handleActiveSessionsUpdate)
      webSocketClient.off('exam-stats', handleExamStatsUpdate)
    }
  }, [selectedExam])

  // Load exam statistics
  const loadExamStats = async () => {
    try {
      const response = await api.get('/api/admin/exams/active-stats')
      setExamStats(response.data.stats || [])
    } catch (error) {
      console.error('Error loading exam stats:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load active sessions
  const loadActiveSessions = () => {
    webSocketClient.getActiveSessions()
  }

  // WebSocket event handlers
  const handleStudentJoined = (data: any) => {
    addActivityLog({
      id: Date.now().toString(),
      examId: data.examId,
      studentId: data.studentId,
      studentName: data.studentName,
      action: 'joined exam',
      timestamp: new Date(data.timestamp)
    })
  }

  const handleStudentLeft = (data: any) => {
    addActivityLog({
      id: Date.now().toString(),
      examId: data.examId,
      studentId: data.studentId,
      studentName: data.studentName,
      action: 'left exam',
      timestamp: new Date(data.timestamp)
    })
  }

  const handleExamSubmitted = (data: any) => {
    addActivityLog({
      id: Date.now().toString(),
      examId: data.examId,
      studentId: data.studentId,
      studentName: data.studentName,
      action: 'submitted exam',
      timestamp: new Date(data.timestamp)
    })
  }

  const handleStudentActivity = (data: any) => {
    addActivityLog({
      id: Date.now().toString(),
      examId: data.examId,
      studentId: data.studentId,
      studentName: data.studentName || 'Unknown',
      action: data.action,
      timestamp: new Date(data.timestamp)
    })
  }

  const handleSessionInactive = (data: any) => {
    addActivityLog({
      id: Date.now().toString(),
      examId: data.examId,
      studentId: data.studentId,
      studentName: data.studentName || 'Unknown',
      action: 'session inactive',
      timestamp: new Date(data.timestamp)
    })
  }

  const handleActiveSessionsUpdate = (data: { sessions: ExamSession[] }) => {
    setActiveSessions(data.sessions)
  }

  const handleExamStatsUpdate = (stats: ExamStats) => {
    setExamStats(prev => 
      prev.map(stat => 
        stat.examId === stats.examId ? { ...stat, ...stats } : stat
      )
    )
  }

  // Add activity log entry
  const addActivityLog = (activity: ActivityLog) => {
    setActivityLog(prev => [activity, ...prev.slice(0, 49)]) // Keep last 50 entries
  }

  // Send announcement to exam
  const sendAnnouncement = () => {
    if (!selectedExam || !announcementMessage.trim()) return

    webSocketClient.sendExamAnnouncement(selectedExam, announcementMessage)
    setAnnouncementMessage('')
    
    addActivityLog({
      id: Date.now().toString(),
      examId: selectedExam,
      studentId: 'admin',
      studentName: 'Administrator',
      action: `sent announcement: "${announcementMessage}"`,
      timestamp: new Date()
    })
  }

  // Force disconnect student
  const forceDisconnectStudent = (studentId: string, reason: string) => {
    webSocketClient.forceDisconnectStudent(studentId, reason)
    
    addActivityLog({
      id: Date.now().toString(),
      examId: selectedExam,
      studentId: 'admin',
      studentName: 'Administrator',
      action: `force disconnected student ${studentId}: ${reason}`,
      timestamp: new Date()
    })
  }

  // Format time remaining
  const formatTimeRemaining = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'paused': return 'text-yellow-600 bg-yellow-100'
      case 'submitted': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Exam Monitoring</h1>
          <p className="text-gray-600">Real-time monitoring of active exam sessions</p>
        </div>
        
        <button
          onClick={loadActiveSessions}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Exam Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {examStats.map((stat) => (
          <motion.div
            key={stat.examId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedExam(stat.examId)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {stat.examTitle || `Exam ${stat.examId.slice(0, 8)}`}
                </p>
                <p className="text-2xl font-bold text-gray-900">{stat.onlineStudents}</p>
                <p className="text-sm text-gray-500">Online Students</p>
              </div>
              <Monitor className="w-8 h-8 text-blue-600" />
            </div>
            
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <p className="font-semibold text-green-600">{stat.activeSessions}</p>
                <p className="text-gray-500">Active</p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-yellow-600">{stat.pausedSessions}</p>
                <p className="text-gray-500">Paused</p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-blue-600">{stat.submittedSessions}</p>
                <p className="text-gray-500">Submitted</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Sessions */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Active Sessions</h2>
            <p className="text-sm text-gray-600">
              {activeSessions.length} active sessions
            </p>
          </div>
          
          <div className="p-6">
            {activeSessions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No active exam sessions
              </div>
            ) : (
              <div className="space-y-4">
                {activeSessions.map((session) => (
                  <motion.div
                    key={`${session.examId}-${session.studentId}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        session.isOnline ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                      
                      <div>
                        <p className="font-medium text-gray-900">
                          {session.studentName || 'Unknown Student'}
                        </p>
                        <p className="text-sm text-gray-600">
                          Exam: {session.examId.slice(0, 8)}...
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {formatTimeRemaining(session.timeRemaining)}
                        </p>
                        <p className="text-xs text-gray-500">remaining</p>
                      </div>
                      
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        getStatusColor(session.status)
                      }`}>
                        {session.status}
                      </span>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            // View student details
                            console.log('View student:', session.studentId)
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => forceDisconnectStudent(session.studentId, 'Administrative action')}
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="Force Disconnect"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Control Panel */}
        <div className="space-y-6">
          {/* Exam Announcement */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Send Announcement</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Exam
                </label>
                <select
                  value={selectedExam}
                  onChange={(e) => setSelectedExam(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select an exam...</option>
                  {examStats.map((stat) => (
                    <option key={stat.examId} value={stat.examId}>
                      {stat.examTitle || `Exam ${stat.examId.slice(0, 8)}`}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={announcementMessage}
                  onChange={(e) => setAnnouncementMessage(e.target.value)}
                  placeholder="Enter announcement message..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <button
                onClick={sendAnnouncement}
                disabled={!selectedExam || !announcementMessage.trim()}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                <span>Send Announcement</span>
              </button>
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Activity Log</h3>
              <p className="text-sm text-gray-600">Recent exam activities</p>
            </div>
            
            <div className="p-6">
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {activityLog.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No recent activity
                  </p>
                ) : (
                  activityLog.map((activity) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start space-x-3 text-sm"
                    >
                      <Activity className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900">
                          <span className="font-medium">{activity.studentName}</span>
                          {' '}
                          <span className="text-gray-600">{activity.action}</span>
                        </p>
                        <p className="text-xs text-gray-500">
                          {activity.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LiveExamMonitoring