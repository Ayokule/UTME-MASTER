// ==========================================
// STUDENT DASHBOARD ROUTES
// ==========================================
// Separate routes for Official Exams and Practice Tests dashboards

import { Router } from 'express'
import * as dashboardController from '../controllers/student-dashboard.controller'
import { authenticate, authorizeRole } from '../middleware/auth.middleware'

const router = Router()

// ==========================================
// OFFICIAL EXAMS DASHBOARD
// ==========================================
// GET /api/student/dashboard/official-exams
router.get(
  '/official-exams',
  authenticate,
  authorizeRole(['STUDENT']),
  dashboardController.getOfficialExamsDashboard
)

// ==========================================
// PRACTICE TESTS DASHBOARD
// ==========================================
// GET /api/student/dashboard/practice-tests
router.get(
  '/practice-tests',
  authenticate,
  authorizeRole(['STUDENT']),
  dashboardController.getPracticeTestsDashboard
)

export default router
