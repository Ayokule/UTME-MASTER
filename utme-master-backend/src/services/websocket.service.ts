// ==========================================
// WEBSOCKET SERVICE
// ==========================================
// Real-time communication service for UTME Master
// Handles live exam monitoring, notifications, and concurrent user management

import { Server as SocketIOServer, Socket } from 'socket.io'
import { Server as HTTPServer } from 'http'
import jwt from 'jsonwebtoken'
import { prisma } from '../config/database'
import { logger } from '../utils/logger'

// Types for WebSocket events
interface AuthenticatedSocket extends Socket {
  userId?: string
  userRole?: string
  examId?: string
  userName?: string
}

interface ExamSession {
  examId: string
  studentId: string
  startTime: Date
  lastActivity: Date
  status: 'active' | 'paused' | 'submitted'
  timeRemaining: number
}

interface NotificationData {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  userId?: string
  examId?: string
  timestamp: Date
}

class WebSocketService {
  private io: SocketIOServer | null = null
  private activeSessions: Map<string, ExamSession> = new Map()
  private userSockets: Map<string, string[]> = new Map() // userId -> socketIds
  private examRooms: Map<string, Set<string>> = new Map() // examId -> socketIds

  // Initialize WebSocket server
  initialize(server: HTTPServer): void {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling']
    })

    // Authentication middleware
    this.io.use(this.authenticateSocket.bind(this))

    // Handle connections
    this.io.on('connection', this.handleConnection.bind(this))

    logger.info('✅ WebSocket service initialized')
  }

  // Authenticate socket connections
  private async authenticateSocket(socket: any, next: any): Promise<void> {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '')
      
      if (!token) {
        return next(new Error('Authentication token required'))
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
      
      // Verify user exists and is active
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId, isActive: true },
        select: { id: true, role: true, firstName: true, lastName: true }
      })

      if (!user) {
        return next(new Error('Invalid user'))
      }

      socket.userId = user.id
      socket.userRole = user.role
      socket.userName = `${user.firstName} ${user.lastName}`

      next()
    } catch (error) {
      logger.error('Socket authentication failed:', error)
      next(new Error('Authentication failed'))
    }
  }

  // Handle new socket connections
  private handleConnection(socket: AuthenticatedSocket): void {
    const userId = socket.userId!
    const userRole = socket.userRole!

    logger.info(`User connected: ${userId} (${userRole}) - Socket: ${socket.id}`)

    // Track user sockets
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, [])
    }
    this.userSockets.get(userId)!.push(socket.id)

    // Join user-specific room
    socket.join(`user:${userId}`)

    // Join role-specific rooms
    socket.join(`role:${userRole}`)
    if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
      socket.join('admins')
    }

    // Send welcome message
    socket.emit('connected', {
      message: 'Connected to UTME Master',
      userId,
      socketId: socket.id,
      timestamp: new Date()
    })

    // Handle exam-related events
    this.setupExamHandlers(socket)

    // Handle notification events
    this.setupNotificationHandlers(socket)

    // Handle admin monitoring events
    if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
      this.setupAdminHandlers(socket)
    }

    // Handle disconnection
    socket.on('disconnect', () => this.handleDisconnection(socket))
  }
  // Setup exam-related event handlers
  private setupExamHandlers(socket: AuthenticatedSocket): void {
    const userId = socket.userId!

    // Student joins exam session
    socket.on('join-exam', async (data: { examId: string }) => {
      try {
        const { examId } = data
        
        // Verify student has access to exam
        const studentExam = await prisma.studentExam.findUnique({
          where: {
            examId_studentId: { examId, studentId: userId }
          },
          include: { exam: true }
        })

        if (!studentExam) {
          socket.emit('exam-error', { message: 'Exam not found or access denied' })
          return
        }

        // Join exam room
        socket.join(`exam:${examId}`)
        socket.examId = examId

        // Track exam room
        if (!this.examRooms.has(examId)) {
          this.examRooms.set(examId, new Set())
        }
        this.examRooms.get(examId)!.add(socket.id)

        // Create or update session
        const sessionKey = `${examId}:${userId}`
        const session: ExamSession = {
          examId,
          studentId: userId,
          startTime: studentExam.startedAt || new Date(),
          lastActivity: new Date(),
          status: studentExam.status === 'IN_PROGRESS' ? 'active' : 'paused',
          timeRemaining: studentExam.timeRemaining || studentExam.exam.duration
        }
        
        this.activeSessions.set(sessionKey, session)

        // Notify admins of student joining
        this.io!.to('admins').emit('student-joined-exam', {
          examId,
          studentId: userId,
          studentName: socket.userName,
          timestamp: new Date()
        })

        socket.emit('exam-joined', {
          examId,
          timeRemaining: session.timeRemaining,
          status: session.status
        })

        logger.info(`Student ${userId} joined exam ${examId}`)
      } catch (error) {
        logger.error('Error joining exam:', error)
        socket.emit('exam-error', { message: 'Failed to join exam' })
      }
    })

    // Student leaves exam session
    socket.on('leave-exam', (data: { examId: string }) => {
      this.handleExamLeave(socket, data.examId)
    })

    // Student activity heartbeat
    socket.on('exam-activity', (data: { examId: string, action: string }) => {
      this.updateExamActivity(socket, data.examId, data.action)
    })

    // Answer submission
    socket.on('submit-answer', async (data: { examId: string, questionId: string, answer: any }) => {
      try {
        const sessionKey = `${data.examId}:${userId}`
        const session = this.activeSessions.get(sessionKey)
        
        if (session) {
          session.lastActivity = new Date()
          
          // Notify admins of answer submission
          this.io!.to('admins').emit('answer-submitted', {
            examId: data.examId,
            studentId: userId,
            questionId: data.questionId,
            timestamp: new Date()
          })
        }

        socket.emit('answer-received', { questionId: data.questionId })
      } catch (error) {
        logger.error('Error handling answer submission:', error)
      }
    })

    // Exam submission
    socket.on('submit-exam', async (data: { examId: string }) => {
      try {
        const sessionKey = `${data.examId}:${userId}`
        const session = this.activeSessions.get(sessionKey)
        
        if (session) {
          session.status = 'submitted'
          session.lastActivity = new Date()
          
          // Notify admins
          this.io!.to('admins').emit('exam-submitted', {
            examId: data.examId,
            studentId: userId,
            studentName: socket.userName,
            timestamp: new Date()
          })
        }

        this.handleExamLeave(socket, data.examId)
        
        socket.emit('exam-submitted', { examId: data.examId })
        
        logger.info(`Student ${userId} submitted exam ${data.examId}`)
      } catch (error) {
        logger.error('Error handling exam submission:', error)
      }
    })
  }

  // Setup notification event handlers
  private setupNotificationHandlers(socket: AuthenticatedSocket): void {
    // Mark notification as read
    socket.on('mark-notification-read', async (data: { notificationId: string }) => {
      try {
        // Note: Using any type for now due to Prisma client generation issues
        await (prisma as any).notification.update({
          where: { id: data.notificationId },
          data: { isRead: true, readAt: new Date() }
        })
        
        socket.emit('notification-marked-read', { notificationId: data.notificationId })
      } catch (error) {
        logger.error('Error marking notification as read:', error)
      }
    })

    // Get unread notification count
    socket.on('get-unread-count', async () => {
      try {
        const count = await (prisma as any).notification.count({
          where: { userId: socket.userId!, isRead: false }
        })
        
        socket.emit('unread-count', { count })
      } catch (error) {
        logger.error('Error getting unread count:', error)
      }
    })
  }

  // Setup admin monitoring event handlers
  private setupAdminHandlers(socket: AuthenticatedSocket): void {
    // Get active exam sessions
    socket.on('get-active-sessions', () => {
      const sessions = Array.from(this.activeSessions.values()).map(session => ({
        ...session,
        isOnline: this.examRooms.get(session.examId)?.size || 0
      }))
      
      socket.emit('active-sessions', { sessions })
    })

    // Get exam room statistics
    socket.on('get-exam-stats', (data: { examId: string }) => {
      const examRoom = this.examRooms.get(data.examId)
      const activeSessions = Array.from(this.activeSessions.values())
        .filter(session => session.examId === data.examId)
      
      socket.emit('exam-stats', {
        examId: data.examId,
        onlineStudents: examRoom?.size || 0,
        totalSessions: activeSessions.length,
        activeSessions: activeSessions.filter(s => s.status === 'active').length,
        pausedSessions: activeSessions.filter(s => s.status === 'paused').length,
        submittedSessions: activeSessions.filter(s => s.status === 'submitted').length
      })
    })

    // Force disconnect student
    socket.on('force-disconnect-student', (data: { studentId: string, reason: string }) => {
      const studentSockets = this.userSockets.get(data.studentId) || []
      
      studentSockets.forEach(socketId => {
        const studentSocket = this.io!.sockets.sockets.get(socketId)
        if (studentSocket) {
          studentSocket.emit('force-disconnect', { reason: data.reason })
          studentSocket.disconnect(true)
        }
      })
      
      logger.info(`Admin ${socket.userId} force disconnected student ${data.studentId}: ${data.reason}`)
    })

    // Send announcement to exam room
    socket.on('send-exam-announcement', (data: { examId: string, message: string }) => {
      this.io!.to(`exam:${data.examId}`).emit('exam-announcement', {
        message: data.message,
        timestamp: new Date(),
        from: 'Administrator'
      })
      
      logger.info(`Admin ${socket.userId} sent announcement to exam ${data.examId}`)
    })
  }
  // Handle socket disconnection
  private handleDisconnection(socket: AuthenticatedSocket): void {
    const userId = socket.userId!
    
    logger.info(`User disconnected: ${userId} - Socket: ${socket.id}`)

    // Remove from user sockets
    const userSocketList = this.userSockets.get(userId) || []
    const updatedSockets = userSocketList.filter(id => id !== socket.id)
    
    if (updatedSockets.length === 0) {
      this.userSockets.delete(userId)
    } else {
      this.userSockets.set(userId, updatedSockets)
    }

    // Handle exam disconnection
    if (socket.examId) {
      this.handleExamLeave(socket, socket.examId)
    }

    // Remove from exam rooms
    this.examRooms.forEach((sockets, examId) => {
      if (sockets.has(socket.id)) {
        sockets.delete(socket.id)
        if (sockets.size === 0) {
          this.examRooms.delete(examId)
        }
      }
    })
  }

  // Handle student leaving exam
  private handleExamLeave(socket: AuthenticatedSocket, examId: string): void {
    const userId = socket.userId!
    const sessionKey = `${examId}:${userId}`
    
    // Update session status
    const session = this.activeSessions.get(sessionKey)
    if (session) {
      session.status = 'paused'
      session.lastActivity = new Date()
    }

    // Leave exam room
    socket.leave(`exam:${examId}`)
    
    // Remove from exam room tracking
    const examRoom = this.examRooms.get(examId)
    if (examRoom) {
      examRoom.delete(socket.id)
      if (examRoom.size === 0) {
        this.examRooms.delete(examId)
      }
    }

    // Notify admins
    this.io!.to('admins').emit('student-left-exam', {
      examId,
      studentId: userId,
      studentName: socket.userName,
      timestamp: new Date()
    })

    socket.examId = undefined
    
    logger.info(`Student ${userId} left exam ${examId}`)
  }

  // Update exam activity
  private updateExamActivity(socket: AuthenticatedSocket, examId: string, action: string): void {
    const userId = socket.userId!
    const sessionKey = `${examId}:${userId}`
    const session = this.activeSessions.get(sessionKey)
    
    if (session) {
      session.lastActivity = new Date()
      
      // Notify admins of activity
      this.io!.to('admins').emit('student-activity', {
        examId,
        studentId: userId,
        action,
        timestamp: new Date()
      })
    }
  }

  // Public methods for sending notifications

  // Send notification to specific user
  async sendNotificationToUser(userId: string, notification: NotificationData): Promise<void> {
    try {
      // Save to database using any type for now due to Prisma client generation issues
      await (prisma as any).notification.create({
        data: {
          id: notification.id,
          type: notification.type.toUpperCase(),
          title: notification.title,
          message: notification.message,
          userId,
          examId: notification.examId,
          isRead: false,
          createdAt: notification.timestamp
        }
      })

      // Send via WebSocket if user is online
      this.io?.to(`user:${userId}`).emit('notification', notification)
      
      logger.info(`Notification sent to user ${userId}: ${notification.title}`)
    } catch (error) {
      logger.error('Error sending notification to user:', error)
    }
  }

  // Send notification to all users in exam
  async sendNotificationToExam(examId: string, notification: NotificationData): Promise<void> {
    try {
      // Get all students in exam
      const studentExams = await prisma.studentExam.findMany({
        where: { examId },
        select: { studentId: true }
      })

      // Send to each student
      for (const studentExam of studentExams) {
        await this.sendNotificationToUser(studentExam.studentId, {
          ...notification,
          examId
        })
      }
      
      logger.info(`Notification sent to exam ${examId}: ${notification.title}`)
    } catch (error) {
      logger.error('Error sending notification to exam:', error)
    }
  }

  // Send notification to all admins
  async sendNotificationToAdmins(notification: NotificationData): Promise<void> {
    try {
      // Get all admin users
      const admins = await prisma.user.findMany({
        where: { 
          role: { in: ['ADMIN', 'SUPER_ADMIN'] },
          isActive: true 
        },
        select: { id: true }
      })

      // Send to each admin
      for (const admin of admins) {
        await this.sendNotificationToUser(admin.id, notification)
      }
      
      logger.info(`Notification sent to all admins: ${notification.title}`)
    } catch (error) {
      logger.error('Error sending notification to admins:', error)
    }
  }

  // Broadcast system announcement
  broadcastSystemAnnouncement(message: string, type: 'info' | 'warning' | 'error' = 'info'): void {
    const announcement = {
      type,
      title: 'System Announcement',
      message,
      timestamp: new Date()
    }

    this.io?.emit('system-announcement', announcement)
    
    logger.info(`System announcement broadcasted: ${message}`)
  }

  // Get active sessions count
  getActiveSessionsCount(): number {
    return this.activeSessions.size
  }

  // Get online users count
  getOnlineUsersCount(): number {
    return this.userSockets.size
  }

  // Get exam room statistics
  getExamRoomStats(examId: string): any {
    const examRoom = this.examRooms.get(examId)
    const activeSessions = Array.from(this.activeSessions.values())
      .filter(session => session.examId === examId)
    
    return {
      examId,
      onlineStudents: examRoom?.size || 0,
      totalSessions: activeSessions.length,
      activeSessions: activeSessions.filter(s => s.status === 'active').length,
      pausedSessions: activeSessions.filter(s => s.status === 'paused').length,
      submittedSessions: activeSessions.filter(s => s.status === 'submitted').length
    }
  }

  // Cleanup inactive sessions (run periodically)
  cleanupInactiveSessions(): void {
    const now = new Date()
    const inactiveThreshold = 5 * 60 * 1000 // 5 minutes

    this.activeSessions.forEach((session, key) => {
      const timeSinceActivity = now.getTime() - session.lastActivity.getTime()
      
      if (timeSinceActivity > inactiveThreshold && session.status !== 'submitted') {
        session.status = 'paused'
        
        // Notify admins of inactive session
        this.io?.to('admins').emit('session-inactive', {
          examId: session.examId,
          studentId: session.studentId,
          inactiveTime: timeSinceActivity,
          timestamp: now
        })
      }
    })
  }

  // Get WebSocket server instance
  getIO(): SocketIOServer | null {
    return this.io
  }
}

// Export singleton instance
export const webSocketService = new WebSocketService()
export default webSocketService