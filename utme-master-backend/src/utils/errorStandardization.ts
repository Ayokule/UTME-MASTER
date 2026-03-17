// ==========================================
// ERROR STANDARDIZATION UTILITY
// ==========================================
// This utility helps standardize error handling across the application
// It provides helper functions to convert generic errors to custom errors

import { 
  AppError, 
  BadRequestError, 
  UnauthorizedError, 
  ForbiddenError, 
  NotFoundError, 
  ConflictError, 
  ValidationError, 
  InternalServerError 
} from './errors'
import { logger } from './logger'

// ==========================================
// AUTHENTICATION ERROR HELPERS
// ==========================================

export function throwUnauthorized(message?: string): never {
  throw new UnauthorizedError(message || 'Authentication required')
}

export function throwForbidden(message?: string): never {
  throw new ForbiddenError(message || 'Access forbidden - Insufficient permissions')
}

export function ensureAuthenticated(user: any, message?: string): void {
  if (!user) {
    throwUnauthorized(message)
  }
}

export function ensureRole(user: any, allowedRoles: string[], message?: string): void {
  if (!user) {
    throwUnauthorized('Authentication required')
  }
  
  if (!allowedRoles.includes(user.role)) {
    throwForbidden(message || `Access forbidden - Requires one of: ${allowedRoles.join(', ')}`)
  }
}

// ==========================================
// VALIDATION ERROR HELPERS
// ==========================================

export function throwBadRequest(message: string, details?: any): never {
  throw new BadRequestError(message, details)
}

export function throwValidationError(message: string, details?: any): never {
  throw new ValidationError(message, details)
}

export function validateRequired(value: any, fieldName: string): void {
  if (value === undefined || value === null || value === '') {
    throwBadRequest(`${fieldName} is required`)
  }
}

export function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throwBadRequest('Invalid email format')
  }
}

export function validateRange(value: number, min: number, max: number, fieldName: string): void {
  if (value < min || value > max) {
    throwBadRequest(`${fieldName} must be between ${min} and ${max}`)
  }
}

// ==========================================
// RESOURCE ERROR HELPERS
// ==========================================

export function throwNotFound(resource: string, identifier?: string): never {
  const message = identifier 
    ? `${resource} with identifier '${identifier}' not found`
    : `${resource} not found`
  throw new NotFoundError(message)
}

export function throwConflict(message: string, details?: any): never {
  throw new ConflictError(message, details)
}

export function ensureExists<T>(resource: T | null | undefined, resourceName: string, identifier?: string): T {
  if (!resource) {
    throwNotFound(resourceName, identifier)
  }
  return resource
}

// ==========================================
// SERVICE ERROR HELPERS
// ==========================================

export function throwServiceError(message: string, originalError?: Error): never {
  if (originalError) {
    logger.error('Service error:', originalError)
  }
  throw new InternalServerError(message)
}

export function wrapServiceCall<T>(
  operation: () => Promise<T>,
  errorMessage: string
): Promise<T> {
  return operation().catch((error) => {
    logger.error(`Service operation failed: ${errorMessage}`, error)
    throw new InternalServerError(errorMessage)
  })
}

// ==========================================
// ERROR CONVERSION HELPERS
// ==========================================

export function standardizeError(error: Error, context?: string): AppError {
  // If already a custom error, return as is
  if (error instanceof AppError) {
    return error
  }

  // Log the original error for debugging
  logger.error(`Converting generic error to AppError${context ? ` (${context})` : ''}:`, error)

  // Convert common error patterns
  const message = error.message.toLowerCase()

  // Authentication errors
  if (message.includes('not authenticated') || message.includes('authentication required')) {
    return new UnauthorizedError(error.message)
  }

  if (message.includes('access forbidden') || message.includes('insufficient permissions')) {
    return new ForbiddenError(error.message)
  }

  // Validation errors
  if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
    return new BadRequestError(error.message)
  }

  // Not found errors
  if (message.includes('not found') || message.includes('does not exist')) {
    return new NotFoundError(error.message)
  }

  // Conflict errors
  if (message.includes('already exists') || message.includes('duplicate') || message.includes('conflict')) {
    return new ConflictError(error.message)
  }

  // Default to internal server error
  return new InternalServerError(
    process.env.NODE_ENV === 'development' 
      ? error.message 
      : 'An unexpected error occurred'
  )
}

// ==========================================
// ASYNC OPERATION WRAPPER
// ==========================================

export async function safeAsync<T>(
  operation: () => Promise<T>,
  context?: string
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    throw standardizeError(error as Error, context)
  }
}

// ==========================================
// CONTROLLER ERROR WRAPPER
// ==========================================

export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: string
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args)
    } catch (error) {
      throw standardizeError(error as Error, context)
    }
  }
}

// ==========================================
// COMMON ERROR MESSAGES
// ==========================================

export const ErrorMessages = {
  // Authentication
  NOT_AUTHENTICATED: 'Authentication required',
  INVALID_CREDENTIALS: 'Invalid email or password',
  TOKEN_EXPIRED: 'Authentication token has expired',
  ACCESS_FORBIDDEN: 'Access forbidden - Insufficient permissions',
  
  // Validation
  REQUIRED_FIELD: (field: string) => `${field} is required`,
  INVALID_FORMAT: (field: string) => `${field} has invalid format`,
  INVALID_RANGE: (field: string, min: number, max: number) => 
    `${field} must be between ${min} and ${max}`,
  
  // Resources
  NOT_FOUND: (resource: string) => `${resource} not found`,
  ALREADY_EXISTS: (resource: string) => `${resource} already exists`,
  
  // Operations
  OPERATION_FAILED: (operation: string) => `${operation} failed`,
  SERVICE_UNAVAILABLE: (service: string) => `${service} is currently unavailable`,
  
  // Generic
  INTERNAL_ERROR: 'An unexpected error occurred',
  BAD_REQUEST: 'Invalid request data'
} as const

// ==========================================
// USAGE EXAMPLES
// ==========================================

/*
// In controllers:
import { ensureAuthenticated, ensureExists, throwBadRequest } from '../utils/errorStandardization'

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  ensureAuthenticated(req.user)
  
  const user = await prisma.user.findUnique({
    where: { id: req.params.id }
  })
  
  ensureExists(user, 'User', req.params.id)
  
  res.json({ success: true, user })
})

// In services:
import { wrapServiceCall, throwServiceError } from '../utils/errorStandardization'

export async function createUser(data: CreateUserData) {
  return wrapServiceCall(
    () => prisma.user.create({ data }),
    'Failed to create user'
  )
}

// Converting existing generic errors:
// Before:
throw new Error('User not authenticated')

// After:
throwUnauthorized()
// or
ensureAuthenticated(req.user)
*/