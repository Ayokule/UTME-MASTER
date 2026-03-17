// ==========================================
// PROGRESS ROUTES
// ==========================================
// API endpoints for student progress tracking

import { Router } from 'express'
import * as progressController from '../controllers/progress.controller'
import { authenticate, authorizeRole } from '../middleware/auth.middleware'

const router = Router()

// ==========================================
// MIDDLEWARE
// ==========================================
// All progress routes require student authentication
router.use(authenticate)
router.use(authorizeRole(['STUDENT']))

// ==========================================
// PROGRESS ROUTES
// ==========================================

// GET PROGRESS SUMMARY
// GET /api/student/progress/summary?range=30d
router.get('/summary', progressController.getProgressSummary)

// GET SUBJECT PROGRESS
// GET /api/student/progress/subjects?range=30d
router.get('/subjects', progressController.getSubjectProgress)

// GET PERFORMANCE TRENDS
// GET /api/student/progress/trends?range=30d
router.get('/trends', progressController.getPerformanceTrends)

// GET STUDY STREAK
// GET /api/student/progress/streak
router.get('/streak', progressController.getStudyStreak)

// GET PROGRESS INSIGHTS
// GET /api/student/progress/insights
router.get('/insights', progressController.getProgressInsights)

// GET DETAILED SUBJECT ANALYSIS
// GET /api/student/progress/subjects/:subjectId/detailed
router.get('/subjects/:subjectId/detailed', progressController.getDetailedSubjectAnalysis)

// UPDATE PROGRESS (Internal use)
// POST /api/student/progress/update
router.post('/update', progressController.updateProgress)

export default router

// ==========================================
// ENDPOINT SUMMARY
// ==========================================
//
// Student Progress Tracking:
// GET    /api/student/progress/summary              - Overall progress summary
// GET    /api/student/progress/subjects             - Subject-wise progress
// GET    /api/student/progress/trends               - Performance trends over time
// GET    /api/student/progress/streak               - Study streak information
// GET    /api/student/progress/insights             - AI-generated insights
// GET    /api/student/progress/subjects/:id/detailed - Detailed subject analysis
// POST   /api/student/progress/update               - Update progress data