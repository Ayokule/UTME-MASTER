// ==========================================
// STUDENT DASHBOARD CONTROLLER
// ==========================================
// Separate endpoints for Official Exams and Practice Tests dashboards

import { Request, Response } from 'express'
import { asyncHandler } from '../middleware/error.middleware'
import * as dashboardService from '../services/student-dashboard.service'
import { logger } from '../utils/logger'

// ==========================================
// GET OFFICIAL EXAMS DASHBOARD
// ==========================================
// GET /api/student/dashboard/official-exams
export const getOfficialExamsDashboard = asyncHandler(async (req: Request, res: Response) => {
  try {
    const studentId = (req as any).user?.id

    if (!studentId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      })
      return
    }

    console.log('🔄 [DASHBOARD] Loading official exams dashboard for student:', studentId)
    const data = await dashboardService.getOfficialExamsDashboard(studentId)
    console.log('✅ [DASHBOARD] Official exams dashboard loaded successfully')

    res.json({
      success: true,
      data
    })
  } catch (error: any) {
    logger.error('Failed to load official exams dashboard:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to load official exams dashboard',
      error: error.message
    })
  }
})

// ==========================================
// GET PRACTICE TESTS DASHBOARD
// ==========================================
// GET /api/student/dashboard/practice-tests
export const getPracticeTestsDashboard = asyncHandler(async (req: Request, res: Response) => {
  try {
    const studentId = (req as any).user?.id

    if (!studentId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      })
      return
    }

    console.log('🔄 [DASHBOARD] Loading practice tests dashboard for student:', studentId)
    const data = await dashboardService.getPracticeTestsDashboard(studentId)
    console.log('✅ [DASHBOARD] Practice tests dashboard loaded successfully')

    res.json({
      success: true,
      data
    })
  } catch (error: any) {
    logger.error('Failed to load practice tests dashboard:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to load practice tests dashboard',
      error: error.message
    })
  }
})
