// ==========================================
// AUTHENTICATION MIDDLEWARE
// ==========================================
// This file verifies user identity using JWT tokens
//
// What this middleware does:
// 1. Checks if request has Authorization header
// 2. Extracts JWT token from header
// 3. Verifies token is valid
// 4. Finds user in database
// 5. Attaches user to request object
// 6. Allows request to continue
//
// How to use:
// - Add to protected routes (routes that need login)
// - Example: router.get('/profile', authenticate, getProfile)
//
// Request flow:
// Client → Send request with token → authenticate middleware → route handler

import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken, JWTPayload } from '../config/jwt'
import { prisma } from '../config/database'
import { UnauthorizedError, ForbiddenError } from '../utils/errors'
import { logger } from '../utils/logger'

// ==========================================
// EXTEND EXPRESS REQUEST TYPE
// ==========================================
// Add 'user' property to Express Request
// This lets us access req.user in route handlers

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email: string
        role: string
        licenseTier: string
      }
    }
  }
}

// ==========================================
// AUTHENTICATE MIDDLEWARE
// ==========================================
// Verify user is logged in

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    // ==========================================
    // STEP 1: Get token from Authorization header
    // ==========================================
    // Header format: "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    
    const authHeader = req.headers.authorization
    
    // Check if Authorization header exists
    if (!authHeader) {
      throw new UnauthorizedError('No authorization header provided')
    }
    
    // Check if header starts with "Bearer "
    if (!authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Invalid authorization header format. Use: Bearer <token>')
    }
    
    // Extract token (remove "Bearer " prefix)
    // "Bearer eyJhbG..." → "eyJhbG..."
    const token = authHeader.substring(7)
    
    if (!token) {
      throw new UnauthorizedError('No token provided')
    }
    
    // ==========================================
    // STEP 2: Verify token
    // ==========================================
    // Check if token is valid and not expired
    
    let payload: JWTPayload
    try {
      payload = verifyAccessToken(token)
    } catch (error) {
      // Token invalid or expired
      if (error instanceof Error) {
        throw new UnauthorizedError(error.message)
      }
      throw new UnauthorizedError('Invalid token')
    }
    
    // ==========================================
    // STEP 3: Find user in database
    // ==========================================
    // Make sure user still exists and is active
    
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        licenseTier: true,
        isActive: true,
        licenseExpiresAt: true
      }
    })
    
    // User not found
    if (!user) {
      throw new UnauthorizedError('User not found')
    }
    
    // User account is deactivated
    if (!user.isActive) {
      throw new UnauthorizedError('Account is deactivated')
    }
    
    // Check if license expired (for premium users)
    if (user.licenseExpiresAt && new Date(user.licenseExpiresAt) < new Date()) {
      // License expired, downgrade to TRIAL
      await prisma.user.update({
        where: { id: user.id },
        data: {
          licenseTier: 'TRIAL',
          licenseExpiresAt: null
        }
      })
      
      logger.info(`License expired for user ${user.id}, downgraded to TRIAL`)
    }
    
    // ==========================================
    // STEP 4: Attach user to request
    // ==========================================
    // Now route handlers can access req.user
    
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      licenseTier: user.licenseTier
    }
    
    // Log successful authentication (debug only)
    logger.debug(`User ${user.email} authenticated successfully`)
    
    // ==========================================
    // STEP 5: Continue to next middleware/route handler
    // ==========================================
    next()
    
  } catch (error) {
    // Pass error to error handler middleware
    next(error)
  }
}

// ==========================================
// AUTHORIZE ROLE MIDDLEWARE
// ==========================================
// Check if user has required role
// Use after authenticate middleware
//
// Example: 
//   router.delete('/users/:id', authenticate, authorizeRole(['ADMIN']), deleteUser)

export function authorizeRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        throw new UnauthorizedError('Not authenticated')
      }
      
      // Check if user's role is in allowed roles
      if (!allowedRoles.includes(req.user.role)) {
        throw new ForbiddenError(
          `Access denied. Required role: ${allowedRoles.join(' or ')}`
        )
      }
      
      // User has required role, continue
      next()
    } catch (error) {
      next(error)
    }
  }
}

// Example usage:
// router.get('/admin/users', authenticate, authorizeRole(['ADMIN']), getUsers)
// router.post('/questions', authenticate, authorizeRole(['TEACHER', 'ADMIN']), createQuestion)

// ==========================================
// AUTHORIZE LICENSE TIER MIDDLEWARE
// ==========================================
// Check if user has required license tier
// Use for premium features
//
// Example:
//   router.get('/analytics', authenticate, authorizeLicense(['PREMIUM', 'ENTERPRISE']), getAnalytics)

export function authorizeLicense(allowedTiers: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        throw new UnauthorizedError('Not authenticated')
      }
      
      // Check if user's license tier is in allowed tiers
      if (!allowedTiers.includes(req.user.licenseTier)) {
        throw new ForbiddenError(
          `This feature requires ${allowedTiers.join(' or ')} license`
        )
      }
      
      // User has required license, continue
      next()
    } catch (error) {
      next(error)
    }
  }
}

// Example usage:
// router.get('/past-questions', authenticate, authorizeLicense(['PREMIUM', 'ENTERPRISE']), getPastQuestions)

// ==========================================
// OPTIONAL AUTHENTICATION MIDDLEWARE
// ==========================================
// Same as authenticate, but doesn't throw error if no token
// Useful for routes that work with or without login
//
// Example: Public question list (shows more if logged in)

export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Try to authenticate
    const authHeader = req.headers.authorization
    
    // No token? That's okay, just continue
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next()
    }
    
    const token = authHeader.substring(7)
    
    if (!token) {
      return next()
    }
    
    // Verify token
    let payload: JWTPayload
    try {
      payload = verifyAccessToken(token)
    } catch (error) {
      // Invalid token, but that's okay, just continue without user
      return next()
    }
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        licenseTier: true,
        isActive: true
      }
    })
    
    // Attach user if found and active
    if (user && user.isActive) {
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        licenseTier: user.licenseTier
      }
    }
    
    next()
  } catch (error) {
    // Don't throw error, just continue
    next()
  }
}

// ==========================================
// EXAMPLE USAGE IN ROUTES
// ==========================================
//
// import { authenticate, authorizeRole, authorizeLicense } from '../middleware/auth.middleware'
//
// // Public route (no auth needed)
// router.get('/questions', getQuestions)
//
// // Protected route (login required)
// router.get('/profile', authenticate, getProfile)
//
// // Admin only route
// router.delete('/users/:id', authenticate, authorizeRole(['ADMIN']), deleteUser)
//
// // Teacher or Admin can create questions
// router.post('/questions', authenticate, authorizeRole(['TEACHER', 'ADMIN']), createQuestion)
//
// // Premium feature
// router.get('/analytics', authenticate, authorizeLicense(['PREMIUM', 'ENTERPRISE']), getAnalytics)
//
// // Optional auth (works with or without login)
// router.get('/questions', optionalAuth, getQuestions)
// // In controller: if (req.user) { show more data } else { show basic data }
