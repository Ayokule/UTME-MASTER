// ==========================================
// HEALTH CHECK CONTROLLER
// ==========================================
// Monitors system and database health
// Helps identify connection and data issues

import { Request, Response } from 'express'
import { prisma } from '../config/database'
import { asyncHandler } from '../middleware/error.middleware'
import { dbErrorLogger } from '../utils/dbErrorLogger'
import { logger } from '../utils/logger'

// ==========================================
// GET SYSTEM HEALTH
// ==========================================
// GET /api/health
export const getSystemHealth = asyncHandler(async (req: Request, res: Response) => {
  const startTime = Date.now()
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      status: 'unknown',
      connected: false,
      responseTime: 0,
      error: null
    },
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
    },
    database_operations: dbErrorLogger.getPerformanceSummary()
  }

  try {
    // Test database connection
    const dbStartTime = Date.now()
    
    // Simple query to test connection
    const result = await prisma.$queryRaw`SELECT 1`
    
    const dbResponseTime = Date.now() - dbStartTime

    health.database.status = 'healthy'
    health.database.connected = true
    health.database.responseTime = dbResponseTime

    logger.info('✅ [HEALTH] System health check passed', {
      uptime: health.uptime,
      dbResponseTime: `${dbResponseTime}ms`,
      memory: `${health.memory.used}MB / ${health.memory.total}MB`
    })

    res.json({
      success: true,
      data: health
    })
  } catch (error: any) {
    health.status = 'unhealthy'
    health.database.status = 'error'
    health.database.error = error.message

    logger.error('❌ [HEALTH] System health check failed', {
      error: error.message,
      code: error.code
    })

    res.status(503).json({
      success: false,
      data: health,
      error: {
        message: 'System health check failed',
        details: error.message
      }
    })
  }
})

// ==========================================
// GET DATABASE DIAGNOSTICS
// ==========================================
// GET /api/health/database
export const getDatabaseDiagnostics = asyncHandler(async (req: Request, res: Response) => {
  try {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      tables: {
        users: 0,
        exams: 0,
        questions: 0,
        subjects: 0,
        studentExams: 0,
        studentAnswers: 0
      },
      errors: {
        recent: dbErrorLogger.getFailedOperations().slice(-10),
        summary: dbErrorLogger.getPerformanceSummary()
      }
    }

    // Count records in each table
    const [
      usersCount,
      examsCount,
      questionsCount,
      subjectsCount,
      studentExamsCount,
      studentAnswersCount
    ] = await Promise.all([
      prisma.user.count(),
      prisma.exam.count(),
      prisma.question.count(),
      prisma.subject.count(),
      prisma.studentExam.count(),
      prisma.studentAnswer.count()
    ])

    diagnostics.tables = {
      users: usersCount,
      exams: examsCount,
      questions: questionsCount,
      subjects: subjectsCount,
      studentExams: studentExamsCount,
      studentAnswers: studentAnswersCount
    }

    logger.info('✅ [DIAGNOSTICS] Database diagnostics retrieved', {
      tables: diagnostics.tables
    })

    res.json({
      success: true,
      data: diagnostics
    })
  } catch (error: any) {
    logger.error('❌ [DIAGNOSTICS] Failed to retrieve database diagnostics', {
      error: error.message
    })

    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve database diagnostics',
        details: error.message
      }
    })
  }
})

// ==========================================
// GET DATABASE LOGS
// ==========================================
// GET /api/health/logs
export const getDatabaseLogs = asyncHandler(async (req: Request, res: Response) => {
  try {
    const logs = dbErrorLogger.getLogs()
    const failedLogs = dbErrorLogger.getFailedOperations()
    const summary = dbErrorLogger.getPerformanceSummary()

    res.json({
      success: true,
      data: {
        summary,
        totalLogs: logs.length,
        failedOperations: failedLogs.length,
        recentLogs: logs.slice(-20),
        failedLogs: failedLogs.slice(-10)
      }
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve database logs',
        details: error.message
      }
    })
  }
})
