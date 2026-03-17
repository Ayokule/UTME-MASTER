// ==========================================
// NOTIFICATION CENTER COMPONENT
// ==========================================
// Real-time notification management interface

import React, { useState, useEffect } from 'react'
import { Bell, X, Check, AlertCircle, Info, CheckCircle, XCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import webSocketClient from '../../services/websocket.service'
import { api } from '../../api/client'

interface Notification {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  isRead: boolean
  createdAt: string
  examId?: string
}

const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  // Load notifications on mount
  useEffect(() => {
    loadNotifications()
    loadUnreadCount()

    // Listen for real-time notifications
    webSocketClient.on('notification', handleNewNotification)
    webSocketClient.on('unread-count', handleUnreadCount)

    return () => {
      webSocketClient.off('notification', handleNewNotification)
      webSocketClient.off('unread-count', handleUnreadCount)
    }
  }, [])

  // Load notifications from API
  const loadNotifications = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/notifications')
      setNotifications(response.data.notifications || [])
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load unread count
  const loadUnreadCount = () => {
    webSocketClient.getUnreadCount()
  }

  // Handle new real-time notification
  const handleNewNotification = (notification: any) => {
    setNotifications(prev => [notification, ...prev])
    setUnreadCount(prev => prev + 1)
  }

  // Handle unread count update
  const handleUnreadCount = (data: { count: number }) => {
    setUnreadCount(data.count)
  }

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await api.patch(`/api/notifications/${notificationId}/read`)
      webSocketClient.markNotificationRead(notificationId)
      
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId
            ? { ...notif, isRead: true }
            : notif
        )
      )
      
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await api.patch('/api/notifications/mark-all-read')
      
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      )
      
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      await api.delete(`/api/notifications/${notificationId}`)
      
      setNotifications(prev =>
        prev.filter(notif => notif.id !== notificationId)
      )
      
      // Update unread count if notification was unread
      const notification = notifications.find(n => n.id === notificationId)
      if (notification && !notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-lg border z-50 max-h-96 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  <div className="flex items-center space-x-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Mark all read
                      </button>
                    )}
                    <button
                      onClick={() => setIsOpen(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-80 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center text-gray-500">
                    Loading notifications...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No notifications yet
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 hover:bg-gray-50 transition-colors ${
                          !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          {getNotificationIcon(notification.type)}
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-gray-900 truncate">
                                {notification.title}
                              </p>
                              <div className="flex items-center space-x-1">
                                {!notification.isRead && (
                                  <button
                                    onClick={() => markAsRead(notification.id)}
                                    className="text-blue-600 hover:text-blue-800"
                                    title="Mark as read"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => deleteNotification(notification.id)}
                                  className="text-gray-400 hover:text-red-600"
                                  title="Delete"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            
                            <p className="text-xs text-gray-400 mt-2">
                              {formatTime(notification.createdAt)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default NotificationCenter