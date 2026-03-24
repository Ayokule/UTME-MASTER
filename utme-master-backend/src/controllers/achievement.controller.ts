// ==========================================
// ACHIEVEMENT CONTROLLER
// ==========================================
// API endpoints for student achievements

import { Request, Response } from 'express'
import { asyncHandler } from '../middleware/error.middleware'
import { logger } from '../utils/logger'
import { getStudentAchievements, getAchievementById, getAchievementLeaderboard } from '../services/achievement.service'

// ==========================================
// GET STUDENT ACHIEVEMENTS
// ==========================================
// GET /api/achievements/student
export const getStudentAchievements = asyncHandler(async (req: Request, res: Response) => {
  const studentId = (req as any).user?.id
  
  const achievements = await getStudentAchievements(studentId)
  
  logger.info(`Achievements retrieved for student ${studentId}`)
  
  res.json({
    success: true,
    data: achievements
  })
})

// ==========================================
// GET ACHIEVEMENT BY ID
// ==========================================
// GET /api/achievements/:achievementId
export const getAchievementById = asyncHandler(async (req: Request, res: Response) => {
  const { achievementId } = req.params
  
  const achievement = await getAchievementById(achievementId)
  
  res.json({
    success: true,
    data: achievement
  })
})

// ==========================================
// GET ACHIEVEMENT LEADERBOARD
// ==========================================
// GET /api/achievements/leaderboard
export const getAchievementLeaderboard = asyncHandler(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10
  
  const leaderboard = await getAchievementLeaderboard(limit)
  
  res.json({
    success: true,
    data: leaderboard
  })
})
