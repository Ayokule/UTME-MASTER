// ==========================================
// WEBSOCKET CLIENT SERVICE
// ==========================================
// Frontend WebSocket client for real-time communication

import { io, Socket } from 'socket.io-client'
import { toast } from 'react-hot-toast'

// Types
interface NotificationData {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  timestamp: Date
}

interface ExamSession {
  examId: string
  timeRemaining: number
  status: 'active' | 'paused' | 'submitted'
}

interface SystemAnnouncement {
  type: 'info' | 'warning' | 'error'
  title: string
  message: string
  timestamp: Date
}

class WebSocketClientService {
  private socket: Socket | null = null
  private isConnected = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  // Event listeners
  private eventListeners: Map<string, Function[]> = new Map()

  // Initialize connection
  connect(token: string): void {
    if (this.socket?.connected) {
      return
    }

    const serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

    this.socket = io(serverUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    })

    this.setupEventHandlers()
  }

  // Setup event handlers
  private setupEventHandlers(): void {
    if (!this.socket) return

    // Connection events
    this.socket.on('connect', () => {
      this.isConnected = true
      this.reconnectAttempts = 0
      console.log('✅ WebSocket connected')
      this.emit('connected', { socketId: this.socket?.id })
    })

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false
      console.log('❌ WebSocket disconnected:', reason)
      this.emit('disconnected', { reason })
      
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        this.handleReconnection()
      }
    })

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error)
      this.handleReconnection()
    })

    // Welcome message
    this.socket.on('connected', (data) => {
      console.log('Welcome message:', data)
    })
    // Notification events
    this.socket.on('notification', (notification: NotificationData) => {
      this.handleNotification(notification)
      this.emit('notification', notification)
    })

    // Exam events
    this.socket.on('exam-joined', (data: ExamSession) => {
      this.emit('exam-joined', data)
    })

    this.socket.on('exam-error', (data: { message: string }) => {
      toast.error(data.message)
      this.emit('exam-error', data)
    })

    this.socket.on('answer-received', (data: { questionId: string }) => {
      this.emit('answer-received', data)
    })

    this.socket.on('exam-submitted', (data: { examId: string }) => {
      this.emit('exam-submitted', data)
    })

    this.socket.on('exam-announcement', (data: { message: string, timestamp: Date, from: string }) => {
      toast.info(`${data.from}: ${data.message}`)
      this.emit('exam-announcement', data)
    })

    this.socket.on('force-disconnect', (data: { reason: string }) => {
      toast.error(`Disconnected by administrator: ${data.reason}`)
      this.disconnect()
      this.emit('force-disconnect', data)
    })

    // System events
    this.socket.on('system-announcement', (announcement: SystemAnnouncement) => {
      this.handleSystemAnnouncement(announcement)
      this.emit('system-announcement', announcement)
    })

    // Admin events (for admin users)
    this.socket.on('student-joined-exam', (data) => {
      this.emit('student-joined-exam', data)
    })

    this.socket.on('student-left-exam', (data) => {
      this.emit('student-left-exam', data)
    })

    this.socket.on('exam-submitted', (data) => {
      this.emit('exam-submitted', data)
    })

    this.socket.on('student-activity', (data) => {
      this.emit('student-activity', data)
    })

    this.socket.on('session-inactive', (data) => {
      this.emit('session-inactive', data)
    })

    this.socket.on('active-sessions', (data) => {
      this.emit('active-sessions', data)
    })

    this.socket.on('exam-stats', (data) => {
      this.emit('exam-stats', data)
    })
  }

  // Handle notifications
  private handleNotification(notification: NotificationData): void {
    switch (notification.type) {
      case 'success':
        toast.success(notification.message)
        break
      case 'error':
        toast.error(notification.message)
        break
      case 'warning':
        toast.error(notification.message, { duration: 6000 })
        break
      case 'info':
      default:
        toast(notification.message)
        break
    }
  }

  // Handle system announcements
  private handleSystemAnnouncement(announcement: SystemAnnouncement): void {
    switch (announcement.type) {
      case 'error':
        toast.error(`${announcement.title}: ${announcement.message}`, { duration: 10000 })
        break
      case 'warning':
        toast.error(`${announcement.title}: ${announcement.message}`, { duration: 8000 })
        break
      case 'info':
      default:
        toast(`${announcement.title}: ${announcement.message}`, { duration: 6000 })
        break
    }
  }

  // Handle reconnection
  private handleReconnection(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      toast.error('Connection lost. Please refresh the page.')
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)

    setTimeout(() => {
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      this.socket?.connect()
    }, delay)
  }

  // Exam methods
  joinExam(examId: string): void {
    this.socket?.emit('join-exam', { examId })
  }

  leaveExam(examId: string): void {
    this.socket?.emit('leave-exam', { examId })
  }

  sendExamActivity(examId: string, action: string): void {
    this.socket?.emit('exam-activity', { examId, action })
  }

  submitAnswer(examId: string, questionId: string, answer: any): void {
    this.socket?.emit('submit-answer', { examId, questionId, answer })
  }

  submitExam(examId: string): void {
    this.socket?.emit('submit-exam', { examId })
  }

  // Notification methods
  markNotificationRead(notificationId: string): void {
    this.socket?.emit('mark-notification-read', { notificationId })
  }

  getUnreadCount(): void {
    this.socket?.emit('get-unread-count')
  }

  // Admin methods
  getActiveSessions(): void {
    this.socket?.emit('get-active-sessions')
  }

  getExamStats(examId: string): void {
    this.socket?.emit('get-exam-stats', { examId })
  }

  forceDisconnectStudent(studentId: string, reason: string): void {
    this.socket?.emit('force-disconnect-student', { studentId, reason })
  }

  sendExamAnnouncement(examId: string, message: string): void {
    this.socket?.emit('send-exam-announcement', { examId, message })
  }

  // Event listener management
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(callback)
  }

  off(event: string, callback?: Function): void {
    if (!callback) {
      this.eventListeners.delete(event)
      return
    }

    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(callback => callback(data))
    }
  }

  // Connection management
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true
  }

  getSocketId(): string | undefined {
    return this.socket?.id
  }
}

// Export singleton instance
export const webSocketClient = new WebSocketClientService()
export default webSocketClient