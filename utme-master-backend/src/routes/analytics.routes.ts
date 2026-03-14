// ==========================================
// ANALYTICS ROUTES - Phase 4
// ==========================================
// API endpoints for analytics

import { Router } from 'express'
import * as analyticsController from '../controllers/analytics.controller'
import { authenticate, authorizeRole } from '../middleware/auth.middleware'

const router = Router()

// ==========================================
// STUDENT ROUTES
// ==========================================

// GET STUDENT DASHBOARD
// GET /api/analytics/student/dashboard
router.get(
  '/student/dashboard',
  authenticate,
  authorizeRole(['STUDENT']),
  analyticsController.getStudentDashboard
)

// GET SUBJECT ANALYSIS
// GET /api/analytics/student/subjects/:subjectId
router.get(
  '/student/subjects/:subjectId',
  authenticate,
  authorizeRole(['STUDENT']),
  analyticsController.getSubjectAnalysis
)

// GET PERFORMANCE COMPARISON
// GET /api/analytics/student/comparison
router.get(
  '/student/comparison',
  authenticate,
  authorizeRole(['STUDENT']),
  analyticsController.getPerformanceComparison
)

// GET PROGRESS OVER TIME
// GET /api/analytics/student/progress
router.get(
  '/student/progress',
  authenticate,
  authorizeRole(['STUDENT']),
  analyticsController.getProgressOverTime
)

// ==========================================
// ADMIN ROUTES
// ==========================================

// GET ADMIN DASHBOARD
// GET /api/analytics/admin/dashboard
router.get(
  '/admin/dashboard',
  authenticate,
  authorizeRole(['ADMIN', 'TEACHER']),
  analyticsController.getAdminDashboard
)

export default router

// ==========================================
// ENDPOINT SUMMARY
// ==========================================
//
// Student Analytics:
// GET    /api/analytics/student/dashboard              - Student dashboard stats
// GET    /api/analytics/student/subjects/:subjectId    - Subject analysis
// GET    /api/analytics/student/comparison             - Performance comparison
// GET    /api/analytics/student/progress               - Progress over time
//
// Admin Analytics:
// GET    /api/analytics/admin/dashboard                - Admin dashboard stats
