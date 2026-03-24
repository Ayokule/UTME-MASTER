// ==========================================
// ACHIEVEMENT ROUTES
// ==========================================
// API routes for student achievements

import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware'
import { authorizeRole } from '../middleware/auth.middleware'
import * as achievementController from '../controllers/achievement.controller'

const router = Router()

// ==========================================
// STUDENT ACHIEVEMENTS
// ==========================================

// GET /api/achievements/student
router.get(
  '/student',
  authenticate,
  authorizeRole(['STUDENT']),
  achievementController.getStudentAchievements
)

// ==========================================
// ACHIEVEMENT BY ID
// ==========================================

// GET /api/achievements/:achievementId
router.get(
  '/:achievementId',
  achievementController.getAchievementById
)

// ==========================================
// ACHIEVEMENT LEADERBOARD
// ==========================================

// GET /api/achievements/leaderboard
router.get(
  '/leaderboard',
  achievementController.getAchievementLeaderboard
)

export default router
