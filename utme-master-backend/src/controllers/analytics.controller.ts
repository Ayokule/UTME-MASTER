// ==========================================
// ANALYTICS CONTROLLER - Phase 4
// ==========================================
// HTTP handlers for analytics endpoints

import { Request, Response } from 'express'
import * as analyticsService from '../services/analytics.service'
import { asyncHandler } from '../middleware/error.middleware'

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
