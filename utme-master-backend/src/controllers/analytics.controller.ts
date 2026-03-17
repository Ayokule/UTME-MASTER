// ==========================================
// ANALYTICS CONTROLLER - Phase 4
// ==========================================
// HTTP handlers for analytics endpoints

import { Request, Response } from 'express'
import * as analyticsService from '../services/analytics.service'
import { asyncHandler } from '../middleware/error.middleware'
import { prisma } from '../config/database'
import { logger } from '../utils/logger'
import { ensureAuthenticated } from '../utils/errorStandardization'

// ==========================================
// GET STUDENT DASHBOARD STATS
// ==========================================
// GET /api/analytics/student/dashboard
export const getStudentDashboard = asyncHandler(async (req: Request, res: Response) => {
  const studentId = (req as any).user.id
  
  const stats = await analyticsService.getStudentDashboardStats(studentId)
  
  res.json({
    success: true,
    data: stats
  })
})

// ==========================================
// GET SUBJECT ANALYSIS
// ==========================================
// GET /api/analytics/student/subjects/:subjectId
export const getSubjectAnalysis = asyncHandler(async (req: Request, res: Response) => {
  const studentId = (req as any).user.id
  const { subjectId } = req.params
  
  const analysis = await analyticsService.getSubjectAnalysis(studentId, subjectId)
  
  res.json({
    success: true,
    data: analysis
  })
})

// ==========================================
// GET PERFORMANCE COMPARISON
// ==========================================
// GET /api/analytics/student/comparison
export const getPerformanceComparison = asyncHandler(async (req: Request, res: Response) => {
  const studentId = (req as any).user.id
  
  const comparison = await analyticsService.getPerformanceComparison(studentId)
  
  res.json({
    success: true,
    data: comparison
  })
})

// ==========================================
// GET PROGRESS OVER TIME
// ==========================================
// GET /api/analytics/student/progress
export const getProgressOverTime = asyncHandler(async (req: Request, res: Response) => {
  const studentId = (req as any).user.id
  const days = parseInt(req.query.days as string) || 30
  
  const progress = await analyticsService.getProgressOverTime(studentId, days)
  
  res.json({
    success: true,
    data: progress
  })
})

// ==========================================
// GET ADMIN DASHBOARD STATS
// ==========================================
// GET /api/analytics/admin/dashboard
export const getAdminDashboard = asyncHandler(async (req: Request, res: Response) => {
  const stats = await analyticsService.getAdminDashboardStats()
  
  res.json({
    success: true,
    data: stats
  })
})

// ==========================================
// NEW ANALYTICS ENDPOINTS
// ==========================================

// ==========================================
// GET STUDENT PERFORMANCE STATS
// ==========================================
// GET /api/analytics/student/:studentId/performance
// Requires authentication (student can only view own stats, admin/teacher can view any)
export const getStudentPerformanceStats = asyncHandler(async (req: Request, res: Response) => {
  const { studentId } = req.params
  
  // Check authorization
  ensureAuthenticated(req.user)
  
  // Students can only view their own stats, admins/teachers can view any
  if (req.user.role === 'STUDENT' && req.user.id !== studentId) {
    return res.status(403).json({
      success: false,
      error: { message: 'Access denied' }
    })
  }
  
  const stats = await analyticsService.getStudentPerformanceStats(studentId)
  
  res.json({
    success: true,
    data: { stats }
  })
})

// ==========================================
// GET EXAM STATISTICS
// ==========================================
// GET /api/analytics/exam/:examId/statistics
// Requires admin or teacher authentication
export const getExamStatistics = asyncHandler(async (req: Request, res: Response) => {
  const { examId } = req.params
  
  if (!req.user || !['ADMIN', 'TEACHER'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: { message: 'Access denied. Admin or teacher role required.' }
    })
  }
  
  const statistics = await analyticsService.getExamStatistics(examId)
  
  res.json({
    success: true,
    data: { statistics }
  })
})

// ==========================================
// GET PROGRESS TRACKING
// ==========================================
// GET /api/analytics/student/:studentId/progress
// Query params: timeRange (week|month|quarter|year)
// Requires authentication (student can only view own progress, admin/teacher can view any)
export const getProgressTracking = asyncHandler(async (req: Request, res: Response) => {
  const { studentId } = req.params
  const { timeRange = 'month' } = req.query
  
  // Check authorization
  ensureAuthenticated(req.user)
  
  // Students can only view their own progress, admins/teachers can view any
  if (req.user.role === 'STUDENT' && req.user.id !== studentId) {
    return res.status(403).json({
      success: false,
      error: { message: 'Access denied' }
    })
  }
  
  // Validate timeRange
  const validRanges = ['week', 'month', 'quarter', 'year']
  if (!validRanges.includes(timeRange as string)) {
    return res.status(400).json({
      success: false,
      error: { message: 'Invalid time range. Must be one of: week, month, quarter, year' }
    })
  }
  
  const progress = await analyticsService.getProgressTracking(
    studentId, 
    timeRange as 'week' | 'month' | 'quarter' | 'year'
  )
  
  res.json({
    success: true,
    data: { progress }
  })
})

// ==========================================
// GET DASHBOARD ANALYTICS
// ==========================================
// GET /api/analytics/dashboard
// Requires admin authentication
export const getDashboardAnalytics = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: { message: 'Access denied. Admin role required.' }
    })
  }
  
  // Get overall system statistics
  const [
    totalStudents,
    totalExams,
    totalQuestions,
    recentActivity
  ] = await Promise.all([
    // Total active students
    prisma.user.count({
      where: { 
        role: 'STUDENT',
        isActive: true
      }
    }),
    
    // Total published exams
    prisma.exam.count({
      where: { 
        isPublished: true,
        isActive: true
      }
    }),
    
    // Total active questions
    prisma.question.count({
      where: { isActive: true }
    }),
    
    // Recent exam completions
    prisma.studentExam.findMany({
      where: {
        status: 'COMPLETED',
        completedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        exam: {
          select: {
            title: true
          }
        }
      },
      orderBy: {
        completedAt: 'desc'
      },
      take: 10
    })
  ])
  
  // Calculate average performance
  const completedExams = await prisma.studentExam.findMany({
    where: {
      status: 'COMPLETED',
      percentage: { not: null }
    },
    select: {
      percentage: true,
      completedAt: true
    }
  })
  
  const averagePerformance = completedExams.length > 0
    ? completedExams.reduce((sum, exam) => sum + (exam.percentage || 0), 0) / completedExams.length
    : 0
  
  // Performance trend (last 30 days vs previous 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
  
  const recentPerformance = await prisma.studentExam.aggregate({
    where: {
      status: 'COMPLETED',
      completedAt: { gte: thirtyDaysAgo }
    },
    _avg: { percentage: true }
  })
  
  const previousPerformance = await prisma.studentExam.aggregate({
    where: {
      status: 'COMPLETED',
      completedAt: { 
        gte: sixtyDaysAgo,
        lt: thirtyDaysAgo
      }
    },
    _avg: { percentage: true }
  })
  
  const performanceTrend = (recentPerformance._avg.percentage || 0) - (previousPerformance._avg.percentage || 0)
  
  const analytics = {
    overview: {
      totalStudents,
      totalExams,
      totalQuestions,
      averagePerformance: Math.round(averagePerformance * 100) / 100,
      performanceTrend: Math.round(performanceTrend * 100) / 100
    },
    recentActivity: recentActivity.map(activity => ({
      id: activity.id,
      studentName: `${activity.student.firstName} ${activity.student.lastName}`,
      examTitle: activity.exam.title,
      score: activity.score,
      percentage: activity.percentage,
      completedAt: activity.completedAt
    }))
  }
  
  logger.info('Dashboard analytics calculated successfully')
  
  res.json({
    success: true,
    data: { analytics }
  })
})
