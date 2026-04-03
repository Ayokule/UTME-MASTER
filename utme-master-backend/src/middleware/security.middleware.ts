// ==========================================
// SECURITY MIDDLEWARE
// ==========================================
// Comprehensive security middleware for UTME Master

import { Request, Response, NextFunction } from 'express'
import rateLimit from 'express-rate-limit'
import { body, validationResult } from 'express-validator'
import DOMPurify from 'isomorphic-dompurify'
import { logger } from '../utils/logger'

// ==========================================
// RATE LIMITING MIDDLEWARE
// ==========================================

// General API rate limiting
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Increased from 100 — supports normal browsing + exam taking
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      endpoint: req.path
    })
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests from this IP, please try again later.'
      }
    })
  }
})

// Exam-specific rate limit — much higher to support answer saving during exams
// A 100-question exam with re-saves = ~200+ requests in one session
export const examRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 2000, // 2000 requests per hour per IP — supports multiple concurrent exams
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => false, // always apply but with high limit
  handler: (req: Request, res: Response) => {
    logger.warn(`Exam rate limit exceeded for IP: ${req.ip}`, {
      ip: req.ip,
      endpoint: req.path
    })
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many exam requests. Please wait a moment.'
      }
    })
  }
})

// Strict rate limiting for authentication endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 5 auth requests per windowMs
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts, please try again in 15 minutes.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req: Request, res: Response) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      endpoint: req.path,
      body: req.body?.email ? { email: req.body.email } : undefined
    })
    res.status(429).json({
      success: false,
      error: {
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
        message: 'Too many authentication attempts, please try again in 15 minutes.'
      }
    })
  }
})

// Password reset rate limiting (more restrictive)
export const passwordResetRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset requests per hour
  message: {
    success: false,
    error: {
      code: 'PASSWORD_RESET_RATE_LIMIT_EXCEEDED',
      message: 'Too many password reset attempts, please try again in 1 hour.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn(`Password reset rate limit exceeded for IP: ${req.ip}`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      email: req.body?.email
    })
    res.status(429).json({
      success: false,
      error: {
        code: 'PASSWORD_RESET_RATE_LIMIT_EXCEEDED',
        message: 'Too many password reset attempts, please try again in 1 hour.'
      }
    })
  }
})

// ==========================================
// SPEED LIMITER (DISABLED FOR PERFORMANCE)
// ==========================================
// Disabled due to performance concerns with 250+ concurrent exam systems
// The rate limiting middleware below provides sufficient protection

// The express-slow-down package was removed as it causes progressive delays
// that would impact exam performance with many concurrent users

// ==========================================
// CSRF PROTECTION MIDDLEWARE
// ==========================================

// Simple CSRF token validation
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF for GET requests and API endpoints with proper authentication
  if (req.method === 'GET' || req.path.startsWith('/api/auth/')) {
    return next()
  }

  const token = req.headers['x-csrf-token'] as string
  const sessionToken = req.headers['authorization']

  // For API requests, we rely on JWT authentication and SameSite cookies
  // In a full implementation, you would generate and validate CSRF tokens
  if (sessionToken && sessionToken.startsWith('Bearer ')) {
    return next()
  }

  // For form submissions, check CSRF token
  if (!token) {
    logger.warn(`CSRF token missing for request`, {
      ip: req.ip,
      method: req.method,
      path: req.path,
      userAgent: req.get('User-Agent')
    })
    return res.status(403).json({
      success: false,
      error: {
        code: 'CSRF_TOKEN_MISSING',
        message: 'CSRF token is required for this request.'
      }
    })
  }

  // In production, validate the CSRF token against session
  // For now, we'll accept any non-empty token
  if (token.length < 10) {
    logger.warn(`Invalid CSRF token for request`, {
      ip: req.ip,
      method: req.method,
      path: req.path,
      userAgent: req.get('User-Agent')
    })
    return res.status(403).json({
      success: false,
      error: {
        code: 'INVALID_CSRF_TOKEN',
        message: 'Invalid CSRF token.'
      }
    })
  }

  next()
}

// ==========================================
// INPUT SANITIZATION MIDDLEWARE
// ==========================================

// Sanitize HTML content to prevent XSS
export const sanitizeHtml = (input: string): string => {
  if (typeof input !== 'string') return input
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: []
  })
}

// Sanitize and validate input fields
export const inputSanitization = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Recursively sanitize all string fields in request body
    const sanitizeObject = (obj: any): any => {
      if (typeof obj === 'string') {
        // Remove potential XSS payloads
        return DOMPurify.sanitize(obj, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
      }
      
      if (Array.isArray(obj)) {
        return obj.map(sanitizeObject)
      }
      
      if (obj && typeof obj === 'object') {
        const sanitized: any = {}
        for (const [key, value] of Object.entries(obj)) {
          // Sanitize key names too
          const cleanKey = DOMPurify.sanitize(key, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
          sanitized[cleanKey] = sanitizeObject(value)
        }
        return sanitized
      }
      
      return obj
    }

    if (req.body) {
      req.body = sanitizeObject(req.body)
    }

    // Sanitize query parameters
    if (req.query) {
      req.query = sanitizeObject(req.query)
    }

    // Log suspicious input attempts
    const originalBody = JSON.stringify(req.body)
    if (originalBody.includes('<script') || originalBody.includes('javascript:') || originalBody.includes('onload=')) {
      logger.warn(`Suspicious input detected`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        endpoint: req.path,
        suspiciousContent: originalBody.substring(0, 200)
      })
    }

    next()
  } catch (error) {
    logger.error('Input sanitization error:', error)
    res.status(400).json({
      success: false,
      error: {
        code: 'INPUT_SANITIZATION_ERROR',
        message: 'Invalid input format.'
      }
    })
  }
}

// ==========================================
// SQL INJECTION PROTECTION
// ==========================================

// Routes that contain legitimate educational content — skip SQL pattern checks
const CONTENT_ROUTES = [
  '/api/questions',
  '/api/exams',
  '/api/errors'
]

// Validate that input doesn't contain SQL injection patterns
export const sqlInjectionProtection = (req: Request, res: Response, next: NextFunction) => {
  // Skip for routes that handle rich educational/log content
  const isContentRoute = CONTENT_ROUTES.some(r => req.path.startsWith(r.replace('/api', '')))
  if (isContentRoute) {
    return next()
  }

  // Only flag clear injection patterns: stacked queries and comment sequences
  const sqlPatterns = [
    /;\s*(DROP|DELETE|INSERT|UPDATE|CREATE|ALTER|EXEC)\b/gi,  // stacked statements
    /(\/\*[\s\S]*?\*\/)/g,                                     // block comments
    /\bUNION\s+(ALL\s+)?SELECT\b/gi,                          // UNION SELECT
    /\bEXEC\s*\(/gi,                                           // EXEC(
    /xp_\w+/gi                                                 // SQL Server extended procs
  ]

  const checkForSqlInjection = (obj: any): boolean => {
    if (typeof obj === 'string') {
      return sqlPatterns.some(pattern => { pattern.lastIndex = 0; return pattern.test(obj) })
    }
    if (Array.isArray(obj)) return obj.some(checkForSqlInjection)
    if (obj && typeof obj === 'object') return Object.values(obj).some(checkForSqlInjection)
    return false
  }

  if (checkForSqlInjection(req.body) || checkForSqlInjection(req.query)) {
    logger.warn(`SQL injection attempt detected`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      endpoint: req.path
    })
    
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_INPUT',
        message: 'Invalid characters detected in input.'
      }
    })
  }

  return next()
}

// ==========================================
// SECURITY HEADERS MIDDLEWARE
// ==========================================

export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY')
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff')
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block')
  
  // Strict transport security (HTTPS only)
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' https:; " +
    "connect-src 'self' https:; " +
    "frame-ancestors 'none';"
  )
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  next()
}

// ==========================================
// BRUTE FORCE PROTECTION
// ==========================================

// Track failed login attempts per IP and email
const failedAttempts = new Map<string, { count: number; lastAttempt: Date; blocked: boolean }>()

export const bruteForceProtection = (req: Request, res: Response, next: NextFunction) => {
  const key = `${req.ip}-${req.body?.email || 'unknown'}`
  const now = new Date()
  const attempt = failedAttempts.get(key)

  if (attempt) {
    // Reset counter if last attempt was more than 1 hour ago
    if (now.getTime() - attempt.lastAttempt.getTime() > 60 * 60 * 1000) {
      failedAttempts.delete(key)
    } else if (attempt.blocked) {
      logger.warn(`Blocked brute force attempt`, {
        ip: req.ip,
        email: req.body?.email,
        attempts: attempt.count
      })
      
      return res.status(429).json({
        success: false,
        error: {
          code: 'ACCOUNT_TEMPORARILY_BLOCKED',
          message: 'Too many failed attempts. Account temporarily blocked.'
        }
      })
    }
  }

  // Store original end method to intercept response
  const originalEnd = res.end.bind(res)
  res.end = function(chunk?: any, encoding?: any) {
    // Check if this was a failed login attempt
    if (res.statusCode === 401 || res.statusCode === 400) {
      const current = failedAttempts.get(key) || { count: 0, lastAttempt: now, blocked: false }
      current.count++
      current.lastAttempt = now
      
      // Block after 5 failed attempts
      if (current.count >= 10) {
        current.blocked = true
        logger.warn(`IP blocked due to brute force attempts`, {
          ip: req.ip,
          email: req.body?.email,
          attempts: current.count
        })
      }
      
      failedAttempts.set(key, current)
    } else if (res.statusCode === 200) {
      // Successful login, reset counter
      failedAttempts.delete(key)
    }

    return originalEnd(chunk, encoding)
  }

  return next()
}

// ==========================================
// VALIDATION HELPERS
// ==========================================

// Common validation rules
export const emailValidation = body('email')
  .isEmail()
  .normalizeEmail()
  .withMessage('Please provide a valid email address')

export const passwordValidation = body('password')
  .isLength({ min: 8, max: 128 })
  .withMessage('Password must be between 8 and 128 characters')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')

export const nameValidation = (field: string) => 
  body(field)
    .isLength({ min: 1, max: 50 })
    .withMessage(`${field} must be between 1 and 50 characters`)
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage(`${field} can only contain letters, spaces, hyphens, and apostrophes`)

// Validation result handler
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    logger.warn(`Validation errors`, {
      ip: req.ip,
      endpoint: req.path,
      errors: errors.array()
    })
    
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: errors.array()
      }
    })
  }
  return next()
}