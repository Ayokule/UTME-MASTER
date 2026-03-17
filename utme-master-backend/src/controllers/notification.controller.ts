// ==========================================
// NOTIFICATION CONTROLLER
// ==========================================
// Handles notification CRUD operations and real-time delivery

import { Request, Response } from 'express'
import { prisma } from '../config/database'
import { logger } from '../utils/logger'
import webSocketService from '../services/websocket.service'
import { z } from 'zod'

// Validation schemas
const createNotificationSchema = z.object({
  type: z.enum(['info', 'warning', 'error', 'success', 'exam_start', 'exam_end', 'system_maintenance']),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  userId: z.string().optional(),
  examId: z.string().optional(),
  userIds: z.array(z.string()).optional(),
  sendToAll: z.boolean().optional()
})

const updateNotificationSchema = z.object({
  isRead: z.boolean().optional(),
  readAt: z.date().optional()
})

// Get user notifications
export const getUserNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    const { page = 1, limit = 20, unreadOnly = false } = req.query

    const skip = (Number(page) - 1) * Number(limit)

    const where: any = { userId }
    if (unreadOnly === 'true') {
      where.isRead = false
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
        include: {
          exam: {
            select: { id: true, title: true }
          }
        }
      }),
      prisma.notification.count({ where })
    ])

    res.json({
      success: true,
      notifications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    })
  } catch (error) {
    logger.error('Error fetching user notifications:', error)
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch notifications' }
    })
  }
}

// Get unread notification count
export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id

    const count = await prisma.notification.count({
      where: { userId, isRead: false }
    })

    res.json({
      success: true,
      count
    })
  } catch (error) {
    logger.error('Error fetching unread count:', error)
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch unread count' }
    })
  }
}

// Mark notification as read
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params
    const userId = req.user?.id

    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId }
    })

    if (!notification) {
      res.status(404).json({
        success: false,
        error: { message: 'Notification not found' }
      })
      return
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: { 
        isRead: true,
        readAt: new Date()
      }
    })

    res.json({
      success: true,
      notification: updatedNotification
    })
  } catch (error) {
    logger.error('Error marking notification as read:', error)
    res.status(500).json({
      success: false,
      error: { message: 'Failed to mark notification as read' }
    })
  }
}

// Mark all notifications as read
export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { 
        isRead: true,
        readAt: new Date()
      }
    })

    res.json({
      success: true,
      message: 'All notifications marked as read'
    })
  } catch (error) {
    logger.error('Error marking all notifications as read:', error)
    res.status(500).json({
      success: false,
      error: { message: 'Failed to mark all notifications as read' }
    })
  }
}

// Delete notification
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params
    const userId = req.user?.id

    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId }
    })

    if (!notification) {
      res.status(404).json({
        success: false,
        error: { message: 'Notification not found' }
      })
      return
    }

    await prisma.notification.delete({
      where: { id: notificationId }
    })

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    })
  } catch (error) {
    logger.error('Error deleting notification:', error)
    res.status(500).json({
      success: false,
      error: { message: 'Failed to delete notification' }
    })
    return
  }
}

// Create notification (Admin only)
export const createNotification = async (req: Request, res: Response) => {
  try {
    const validatedData = createNotificationSchema.parse(req.body)

    // Generate notification ID
    const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const notificationData = {
      id: notificationId,
      type: validatedData.type,
      title: validatedData.title,
      message: validatedData.message,
      examId: validatedData.examId,
      timestamp: new Date()
    }

    // Send to specific user
    if (validatedData.userId) {
      await webSocketService.sendNotificationToUser(validatedData.userId, notificationData)
      return res.status(201).json({
        success: true,
        message: 'Notification sent successfully',
        notificationId
      })
    }
    // Send to multiple users
    else if (validatedData.userIds && validatedData.userIds.length > 0) {
      for (const userId of validatedData.userIds) {
        await webSocketService.sendNotificationToUser(userId, notificationData)
      }
      return res.status(201).json({
        success: true,
        message: 'Notification sent successfully',
        notificationId
      })
    }
    // Send to exam participants
    else if (validatedData.examId) {
      await webSocketService.sendNotificationToExam(validatedData.examId, notificationData)
      return res.status(201).json({
        success: true,
        message: 'Notification sent successfully',
        notificationId
      })
    }
    // Send to all users
    else if (validatedData.sendToAll) {
      const allUsers = await prisma.user.findMany({
        where: { isActive: true },
        select: { id: true }
      })

      for (const user of allUsers) {
        await webSocketService.sendNotificationToUser(user.id, notificationData)
      }
      return res.status(201).json({
        success: true,
        message: 'Notification sent successfully',
        notificationId
      })
    }

    return res.status(400).json({
      success: false,
      error: { message: 'No recipients specified for notification' }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { 
          message: 'Invalid notification data',
          details: error.errors
        }
      })
    }

    logger.error('Error creating notification:', error)
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to create notification' }
    })
  }
}

// Get all notifications (Admin only)
export const getAllNotifications = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50, type, userId, examId } = req.query

    const skip = (Number(page) - 1) * Number(limit)

    const where: any = {}
    if (type) where.type = type
    if (userId) where.userId = userId
    if (examId) where.examId = examId

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true }
          },
          exam: {
            select: { id: true, title: true }
          }
        }
      }),
      prisma.notification.count({ where })
    ])

    res.json({
      success: true,
      notifications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    })
  } catch (error) {
    logger.error('Error fetching all notifications:', error)
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch notifications' }
    })
  }
}

// Get notification statistics (Admin only)
export const getNotificationStats = async (req: Request, res: Response) => {
  try {
    const [
      totalNotifications,
      unreadNotifications,
      notificationsByType,
      recentActivity
    ] = await Promise.all([
      prisma.notification.count(),
      prisma.notification.count({ where: { isRead: false } }),
      prisma.notification.groupBy({
        by: ['type'],
        _count: { type: true },
        orderBy: { _count: { type: 'desc' } }
      }),
      prisma.notification.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { firstName: true, lastName: true }
          }
        }
      })
    ])

    res.json({
      success: true,
      stats: {
        total: totalNotifications,
        unread: unreadNotifications,
        byType: notificationsByType.map(item => ({
          type: item.type,
          count: item._count.type
        })),
        recentActivity
      }
    })
  } catch (error) {
    logger.error('Error fetching notification stats:', error)
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch notification statistics' }
    })
  }
}

// Send system announcement (Admin only)
export const sendSystemAnnouncement = async (req: Request, res: Response) => {
  try {
    const { message, type = 'info' } = req.body
    const adminId = req.user?.id

    if (!message || typeof message !== 'string') {
      res.status(400).json({
        success: false,
        error: { message: 'Message is required' }
      })
      return
    }

    // Broadcast system announcement
    webSocketService.broadcastSystemAnnouncement(message, type)

    logger.info(`Admin ${adminId} sent system announcement: ${message}`)

    res.json({
      success: true,
      message: 'System announcement sent successfully'
    })
  } catch (error) {
    logger.error('Error sending system announcement:', error)
    res.status(500).json({
      success: false,
      error: { message: 'Failed to send system announcement' }
    })
  }
}