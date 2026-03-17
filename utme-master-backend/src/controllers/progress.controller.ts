// ==========================================
// PROGRESS CONTROLLER
// ==========================================
// HTTP handlers for student progress tracking

import { Request, Response } from 'express'
import { asyncHandler } from '../middleware/error.middleware'
import * as progressService from '../services/progress.service'
import { logger } from '../utils/logger'
import { ensureAuthenticated } from '../utils/errorStandardization'

// ==========================================
// GET PROGRESS SUMMARY
// ==========================================
// GET /api/student/progress/summary
export const getProgressSummary = asyncHandler(async (req: Request, res: Response) => {
  ensureAuthenticated(req.user)

  const timeRange = (req.query.range as '7d' | '30d' | '90d' | 'all') || '30d'
  const summary = await progressService.getProgressSummary(req.user!.id, timeRange)

  logger.info(`Progress summary retrieved for student: ${req.user!.id}`)

  res.json({
    success: true,
    data: { summary }
  })
})

// ==========================================
// GET SUBJECT PROGRESS
// ==========================================
// GET /api/student/progress/subjects
export const getSubjectProgress = asyncHandler(async (req: Request, res: Response) => {
  ensureAuthenticated(req.user)

  const timeRange = (req.query.range as '7d' | '30d' | '90d' | 'all') || '30d'
  const subjects = await progressService.getSubjectProgress(req.user!.id, timeRange)

  logger.info(`Subject progress retrieved for student: ${req.user!.id}`)

  res.json({
    success: true,
    data: { subjects }
  })
})

// ==========================================
// GET PERFORMANCE TRENDS
// ==========================================
// GET /api/student/progress/trends
export const getPerformanceTrends = asyncHandler(async (req: Request, res: Response) => {
  ensureAuthenticated(req.user)

  const timeRange = (req.query.range as '7d' | '30d' | '90d' | 'all') || '30d'
  const trends = await progressService.getPerformanceTrends(req.user!.id, timeRange)

  logger.info(`Performance trends retrieved for student: ${req.user!.id}`)

  res.json({
    success: true,
    data: { trends }
  })
})

// ==========================================
// GET STUDY STREAK
// ==========================================
// GET /api/student/progress/streak
export const getStudyStreak = asyncHandler(async (req: Request, res: Response) => {
  ensureAuthenticated(req.user)

  const streak = await progressService.getStudyStreak(req.user!.id)

  logger.info(`Study streak retrieved for student: ${req.user!.id}`)

  res.json({
    success: true,
    data: { streak }
  })
})

// ==========================================
// GET PROGRESS INSIGHTS
// ==========================================
// GET /api/student/progress/insights
export const getProgressInsights = asyncHandler(async (req: Request, res: Response) => {
  ensureAuthenticated(req.user)

  // Generate insights based on progress data
  const summary = await progressService.getProgressSummary(req.user!.id, '30d')
  const subjects = await progressService.getSubjectProgress(req.user!.id, '30d')
  const streak = await progressService.getStudyStreak(req.user!.id)

  const insights = generateInsights(summary, subjects, streak)

  logger.info(`Progress insights generated for student: ${req.user!.id}`)

  res.json({
    success: true,
    data: { insights }
  })
})

// ==========================================
// GET DETAILED SUBJECT ANALYSIS
// ==========================================
// GET /api/student/progress/subjects/:subjectId/detailed
export const getDetailedSubjectAnalysis = asyncHandler(async (req: Request, res: Response) => {
  ensureAuthenticated(req.user)

  const { subjectId } = req.params
  
  // Get detailed subject analysis (mock implementation)
  const analysis = {
    subjectId,
    detailedTopics: [
      { name: 'Algebra', accuracy: 85, questionsAnswered: 45, timeSpent: 120 },
      { name: 'Geometry', accuracy: 78, questionsAnswered: 32, timeSpent: 95 },
      { name: 'Calculus', accuracy: 62, questionsAnswered: 28, timeSpent: 110 }
    ],
    difficultyBreakdown: {
      easy: { accuracy: 92, count: 35 },
      medium: { accuracy: 74, count: 48 },
      hard: { accuracy: 58, count: 22 }
    },
    recentPerformance: [
      { date: '2024-03-15', score: 78 },
      { date: '2024-03-16', score: 82 },
      { date: '2024-03-17', score: 85 }
    ]
  }

  logger.info(`Detailed subject analysis retrieved for student: ${req.user!.id}, subject: ${subjectId}`)

  res.json({
    success: true,
    data: { analysis }
  })
})

// ==========================================
// UPDATE PROGRESS (Internal)
// ==========================================
// POST /api/student/progress/update
export const updateProgress = asyncHandler(async (req: Request, res: Response) => {
  ensureAuthenticated(req.user)

  const { subjectId, questionsAnswered, correctAnswers, timeSpent } = req.body

  if (!subjectId || questionsAnswered === undefined || correctAnswers === undefined) {
    return res.status(400).json({
      success: false,
      error: { message: 'Missing required fields' }
    })
  }

  await progressService.updateStudentProgress(
    req.user!.id,
    subjectId,
    questionsAnswered,
    correctAnswers,
    timeSpent || 0
  )

  logger.info(`Progress updated for student: ${req.user!.id}, subject: ${subjectId}`)

  return res.json({
    success: true,
    message: 'Progress updated successfully'
  })
})

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

interface SubjectProgress {
  subjectName: string
  accuracy: number
  trend: 'up' | 'down' | 'stable'
}

interface StudyStreak {
  currentStreak: number
}

interface ProgressSummary {
  overallAccuracy: number
  improvementRate: number
  currentLevel: string
  nextLevelProgress: number
  totalQuestionsAnswered: number
}

function generateInsights(
  summary: ProgressSummary,
  subjects: SubjectProgress[],
  streak: StudyStreak
): {
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  achievements: string[]
} {
  const insights = {
    strengths: [] as string[],
    weaknesses: [] as string[],
    recommendations: [] as string[],
    achievements: [] as string[]
  }

  // Analyze strengths
  const strongSubjects = subjects.filter(s => s.accuracy >= 80)
  if (strongSubjects.length > 0) {
    insights.strengths.push(`Excellent performance in ${strongSubjects.map(s => s.subjectName).join(', ')}`)
  }

  if (summary.overallAccuracy >= 75) {
    insights.strengths.push(`Strong overall accuracy of ${summary.overallAccuracy.toFixed(1)}%`)
  }

  if (streak.currentStreak >= 7) {
    insights.strengths.push(`Consistent study habit with ${streak.currentStreak}-day streak`)
  }

  if (summary.improvementRate > 5) {
    insights.strengths.push(`Significant improvement of ${summary.improvementRate.toFixed(1)}% this month`)
  }

  // Analyze weaknesses
  const weakSubjects = subjects.filter(s => s.accuracy < 60)
  if (weakSubjects.length > 0) {
    insights.weaknesses.push(`Need improvement in ${weakSubjects.map(s => s.subjectName).join(', ')}`)
  }

  const decliningSubjects = subjects.filter(s => s.trend === 'down')
  if (decliningSubjects.length > 0) {
    insights.weaknesses.push(`Performance declining in ${decliningSubjects.map(s => s.subjectName).join(', ')}`)
  }

  if (summary.overallAccuracy < 60) {
    insights.weaknesses.push(`Overall accuracy of ${summary.overallAccuracy.toFixed(1)}% needs improvement`)
  }

  // Generate recommendations
  if (weakSubjects.length > 0) {
    insights.recommendations.push(`Focus more practice time on ${weakSubjects[0].subjectName}`)
  }

  if (decliningSubjects.length > 0) {
    insights.recommendations.push(`Review recent mistakes in ${decliningSubjects[0].subjectName}`)
  }

  if (streak.currentStreak < 3) {
    insights.recommendations.push('Try to maintain a daily study routine for better retention')
  }

  if (summary.currentLevel !== 'Expert') {
    const nextLevel = summary.currentLevel === 'Advanced' ? 'Expert' : 
                     summary.currentLevel === 'Intermediate' ? 'Advanced' : 'Intermediate'
    insights.recommendations.push(`You're ${100 - summary.nextLevelProgress}% away from ${nextLevel} level`)
  }

  // Track achievements
  if (streak.currentStreak >= 10) {
    insights.achievements.push(`🔥 ${streak.currentStreak}-day study streak!`)
  }

  if (summary.overallAccuracy >= 90) {
    insights.achievements.push('🎯 Accuracy Master - 90%+ overall accuracy!')
  }

  if (summary.totalQuestionsAnswered >= 1000) {
    insights.achievements.push('📚 Question Conqueror - 1000+ questions answered!')
  }

  if (strongSubjects.length >= 3) {
    insights.achievements.push('🌟 Multi-Subject Expert - Strong in 3+ subjects!')
  }

  return insights
}