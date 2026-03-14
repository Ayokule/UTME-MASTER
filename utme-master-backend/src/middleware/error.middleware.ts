// ==========================================
// ERROR HANDLING MIDDLEWARE
// ==========================================
// This file handles all errors in the application
//
// What is middleware?
// - Functions that run between request and response
// - Can modify request/response or stop the flow
// - Think of them like security checkpoints at airport
//
// Error middleware is special:
// - Has 4 parameters: (error, req, res, next)
// - Runs when any error is thrown
// - Sends error response to client
//
// Request flow:
// 1. Client sends request
// 2. Route handler runs
// 3. If error occurs → Error middleware catches it
// 4. Error middleware sends error response to client

import { Request, Response, NextFunction } from 'express'
import { AppError, isOperationalError } from '../utils/errors'
import { logger } from '../utils/logger'
import { Prisma } from '@prisma/client'
import { ZodError } from 'zod'

// ==========================================
// MAIN ERROR HANDLER
// ==========================================
// This catches ALL errors in the application

export function errorHandler(
  error: Error,           // The error that occurred
  req: Request,           // The HTTP request
  res: Response,          // The HTTP response
  next: NextFunction      // Next middleware (not used in error handlers)
) {
  // Log the error
  logger.error('Error occurred:', error)
  
  // Check what type of error it is
  // Different errors need different responses
  
  // ==========================================
  // 1. OUR CUSTOM ERRORS (AppError)
  // ==========================================
  // These are errors we throw intentionally
  // Example: throw new NotFoundError('User not found')
  
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        message: error.message,
        code: error.code,
        ...(error.details && { details: error.details })
      }
    })
  }
  
  // ==========================================
  // 2. ZOD VALIDATION ERRORS
  // ==========================================
  // These occur when request data doesn't match schema
  // Zod is our validation library
  
  if (error instanceof ZodError) {
    // Format Zod errors nicely
    const formattedErrors = error.errors.map(err => ({
      field: err.path.join('.'),  // Which field had error (e.g., 'email')
      message: err.message        // What's wrong (e.g., 'Invalid email')
    }))
    
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: formattedErrors
      }
    })
  }
  
  // ==========================================
  // 3. PRISMA ERRORS
  // ==========================================
  // These occur when database operations fail
  
  // PRISMA UNIQUE CONSTRAINT ERROR
  // Example: Trying to create user with existing email
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002 = Unique constraint violation
    if (error.code === 'P2002') {
      // Extract which field caused the error
      const field = (error.meta?.target as string[])?.join(', ') || 'field'
      
      return res.status(409).json({
        success: false,
        error: {
          message: `${field} already exists`,
          code: 'DUPLICATE_ERROR',
          details: { field }
        }
      })
    }
    
    // P2025 = Record not found
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Record not found',
          code: 'NOT_FOUND'
        }
      })
    }
    
    // Other Prisma errors
    return res.status(400).json({
      success: false,
      error: {
        message: 'Database operation failed',
        code: 'DATABASE_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    })
  }
  
  // PRISMA VALIDATION ERROR
  // Example: Invalid data type
  if (error instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Invalid data provided',
        code: 'VALIDATION_ERROR'
      }
    })
  }
  
  // ==========================================
  // 4. JWT ERRORS
  // ==========================================
  // These occur when JWT token is invalid
  
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      }
    })
  }
  
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Token has expired',
        code: 'TOKEN_EXPIRED'
      }
    })
  }
  
  // ==========================================
  // 5. SYNTAX ERRORS
  // ==========================================
  // These occur when JSON is malformed
  
  if (error instanceof SyntaxError && 'body' in error) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Invalid JSON in request body',
        code: 'INVALID_JSON'
      }
    })
  }
  
  // ==========================================
  // 6. UNKNOWN ERRORS (Catch-all)
  // ==========================================
  // These are unexpected errors (bugs!)
  // We log them and send generic error to client
  
  // Determine if error is operational or a bug
  const operational = isOperationalError(error)
  
  // Log with appropriate level
  if (!operational) {
    // This is a bug! Log full details
    logger.error('UNEXPECTED ERROR:', {
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      ip: req.ip
    })
  }
  
  // Send generic error to client
  // Don't expose internal error details to client (security!)
  return res.status(500).json({
    success: false,
    error: {
      message: process.env.NODE_ENV === 'development'
        ? error.message  // Show actual error in development
        : 'An unexpected error occurred',  // Generic message in production
      code: 'INTERNAL_ERROR',
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack  // Show stack trace only in development
      })
    }
  })
}

// ==========================================
// NOT FOUND HANDLER
// ==========================================
// Catches requests to routes that don't exist
// This runs BEFORE error handler
// Example: GET /api/nonexistent → 404 Not Found

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.method} ${req.path} not found`,
      code: 'ROUTE_NOT_FOUND'
    }
  })
}

// ==========================================
// ASYNC ERROR WRAPPER
// ==========================================
// Utility to catch errors in async route handlers
// Without this, you need try/catch in every route
//
// Instead of:
//   async function handler(req, res) {
//     try {
//       const users = await prisma.user.findMany()
//       res.json(users)
//     } catch (error) {
//       next(error)
//     }
//   }
//
// You can do:
//   const handler = asyncHandler(async (req, res) => {
//     const users = await prisma.user.findMany()
//     res.json(users)
//   })

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Execute the function and catch any errors
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

// ==========================================
// EXAMPLE USAGE
// ==========================================
//
// In server.ts:
//   app.use(errorHandler)  // Add as last middleware
//
// In route:
//   router.get('/users/:id', asyncHandler(async (req, res) => {
//     const user = await prisma.user.findUnique({
//       where: { id: req.params.id }
//     })
//     
//     if (!user) {
//       throw new NotFoundError('User not found')  // errorHandler catches this
//     }
//     
//     res.json(user)
//   }))
//
// Error response sent to client:
//   {
//     success: false,
//     error: {
//       message: 'User not found',
//       code: 'NOT_FOUND'
//     }
//   }
