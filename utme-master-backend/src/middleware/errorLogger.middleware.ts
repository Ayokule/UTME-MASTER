import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'
import { AppError } from '../utils/errors'

/**
 * Error Logging Middleware
 * Logs all errors that occur in the application
 * Provides detailed error information for debugging
 */

export interface ErrorResponse {
  success: false
  message: string
  error?: string
  code?: string
  statusCode: number
  timestamp: string
  path: string
  method: string
}

/**
 * Error logging middleware
 * Logs errors with full context
 */
export const errorLoggerMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || err.status || 500
  const message = err.message || 'Internal Server Error'
  const code = err.code || 'INTERNAL_ERROR'

  // Build error response
  const errorResponse: ErrorResponse = {
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    code,
    statusCode,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  }

  // Log error based on status code
  if (statusCode >= 500) {
    logger.error(`[${statusCode}] ${req.method} ${req.path}`, {
      message,
      code,
      stack: err.stack,
      body: req.body,
      query: req.query,
      params: req.params,
      user: req.user?.id
    })
  } else if (statusCode >= 400) {
    logger.warn(`[${statusCode}] ${req.method} ${req.path}`, {
      message,
      code,
      user: req.user?.id
    })
  }

  // Send error response
  res.status(statusCode).json(errorResponse)
}

/**
 * 404 Not Found middleware
 * Handles routes that don't exist
 */
export const notFoundMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(
    `Route not found: ${req.method} ${req.path}`,
    404,
    'ROUTE_NOT_FOUND'
  )

  logger.warn(`[404] Route not found: ${req.method} ${req.path}`, {
    path: req.path,
    method: req.method,
    query: req.query,
    user: req.user?.id
  })

  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.path}`,
    code: 'ROUTE_NOT_FOUND',
    statusCode: 404,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    availableRoutes: {
      auth: '/api/auth',
      questions: '/api/questions',
      exams: '/api/exams',
      results: '/api/student/results',
      dashboard: '/api/student/dashboard',
      analytics: '/api/analytics',
      subjects: '/api/subjects',
      license: '/api/license'
    }
  })
}

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

/**
 * Validation error handler
 * Handles validation errors from Zod or other validators
 */
export const validationErrorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  if (err.name === 'ZodError') {
    logger.warn(`[422] Validation error: ${req.method} ${req.path}`, {
      errors: err.errors,
      body: req.body
    })

    res.status(422).json({
      success: false,
      message: 'Validation error',
      code: 'VALIDATION_ERROR',
      statusCode: 422,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
      errors: err.errors.map((e: any) => ({
        field: e.path.join('.'),
        message: e.message
      }))
    })
    return
  }

  next(err)
}

/**
 * Database error handler
 * Handles Prisma and database errors
 */
export const databaseErrorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  if (err.code === 'P2002') {
    // Unique constraint violation
    logger.warn(`[409] Unique constraint violation: ${req.method} ${req.path}`, {
      target: err.meta?.target,
      user: req.user?.id
    })

    res.status(409).json({
      success: false,
      message: 'This record already exists',
      code: 'UNIQUE_CONSTRAINT_VIOLATION',
      statusCode: 409,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method
    })
    return
  }

  if (err.code === 'P2025') {
    // Record not found
    logger.warn(`[404] Record not found: ${req.method} ${req.path}`, {
      user: req.user?.id
    })

    res.status(404).json({
      success: false,
      message: 'Record not found',
      code: 'RECORD_NOT_FOUND',
      statusCode: 404,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method
    })
    return
  }

  if (err.code === 'ECONNREFUSED') {
    // Database connection refused
    logger.error(`[503] Database connection refused: ${req.method} ${req.path}`, {
      error: err.message,
      user: req.user?.id
    })

    res.status(503).json({
      success: false,
      message: 'Database connection failed. Please ensure PostgreSQL is running.',
      code: 'DATABASE_CONNECTION_ERROR',
      statusCode: 503,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
      hint: 'Run: net start postgresql-x64-15'
    })
    return
  }

  next(err)
}
