import { Router, Request, Response } from 'express'
import { logger } from '../utils/logger'

const router = Router()

/**
 * Log Frontend Errors
 * POST /api/errors/log
 * 
 * Receives error logs from frontend and logs them to backend
 */
router.post('/log', (req: Request, res: Response) => {
  try {
    const { message, stack, componentStack, timestamp, url, userAgent } = req.body

    // Log the error
    logger.error('Frontend Error', {
      message,
      stack,
      componentStack,
      timestamp,
      url,
      userAgent,
      userId: req.user?.id
    })

    // Send response
    res.json({
      success: true,
      message: 'Error logged successfully',
      errorId: `ERR-${Date.now()}`
    })
  } catch (error: any) {
    logger.error('Failed to log frontend error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to log error'
    })
  }
})

/**
 * Get Error Statistics
 * GET /api/errors/stats
 * 
 * Returns error statistics (admin only)
 */
router.get('/stats', (req: Request, res: Response) => {
  try {
    // This would query error logs from database
    // For now, return mock data
    res.json({
      success: true,
      data: {
        totalErrors: 0,
        errorsByType: {},
        recentErrors: [],
        errorTrend: []
      }
    })
  } catch (error: any) {
    logger.error('Failed to get error stats:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get error statistics'
    })
  }
})

export default router
