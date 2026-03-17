// ==========================================
// NOTIFICATION ROUTES
// ==========================================
// API endpoints for notification management

import { Router } from 'express'
import { authenticateToken } from '../middleware/auth.middleware'
import { requireRole } from '../middleware/role.middleware'
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  getAllNotifications,
  getNotificationStats,
  sendSystemAnnouncement
} from '../controllers/notification.controller'

const router = Router()

// All routes require authentication
router.use(authenticateToken)

// User notification routes
router.get('/', getUserNotifications)
router.get('/unread-count', getUnreadCount)
router.patch('/:notificationId/read', markAsRead)
router.patch('/mark-all-read', markAllAsRead)
router.delete('/:notificationId', deleteNotification)

// Admin notification routes
router.post('/', requireRole(['ADMIN', 'SUPER_ADMIN']), createNotification)
router.get('/admin/all', requireRole(['ADMIN', 'SUPER_ADMIN']), getAllNotifications)
router.get('/admin/stats', requireRole(['ADMIN', 'SUPER_ADMIN']), getNotificationStats)
router.post('/admin/system-announcement', requireRole(['ADMIN', 'SUPER_ADMIN']), sendSystemAnnouncement)

export default router