// ==========================================
// CUSTOM ERROR CLASSES
// ==========================================
// This file defines custom error types for our application
//
// Why custom errors?
// - Make error handling consistent
// - Automatically set correct HTTP status codes
// - Include useful error information
// - Better error messages for debugging
//
// Instead of:
//   throw new Error('User not found')  // Generic, no status code
//
// We use:
//   throw new NotFoundError('User not found')  // 404 status code included

// ==========================================
// BASE APPLICATION ERROR
// ==========================================
// All our custom errors extend this class
// This is the parent class that others inherit from

export class AppError extends Error {
  // HTTP status code (404, 401, 500, etc.)
  public statusCode: number
  
  // Is this error our fault or user's fault?
  public isOperational: boolean
  
  // Error code for frontend to identify error type
  public code: string
  
  // Additional details (optional)
  public details?: any
  
  constructor(
    message: string,           // Error message
    statusCode: number = 500,  // HTTP status code
    code: string = 'ERROR',    // Error code
    isOperational: boolean = true  // Is this a known error?
  ) {
    // Call parent Error constructor
    super(message)
    
    // Set properties
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.code = code
    
    // Maintain proper stack trace (for debugging)
    Error.captureStackTrace(this, this.constructor)
    
    // Set the name to the class name
    this.name = this.constructor.name
  }
}

// ==========================================
// 400 BAD REQUEST
// ==========================================
// Use when user sends invalid data
// Example: Missing required field, invalid email format

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request', details?: any) {
    super(message, 400, 'BAD_REQUEST')
    this.details = details
  }
}

// Example usage:
// throw new BadRequestError('Email is required')
// throw new BadRequestError('Invalid data', { field: 'email', issue: 'Invalid format' })

// ==========================================
// 401 UNAUTHORIZED
// ==========================================
// Use when user is not logged in
// Example: No token provided, invalid token

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized - Please login') {
    super(message, 401, 'UNAUTHORIZED')
  }
}

// Example usage:
// throw new UnauthorizedError()
// throw new UnauthorizedError('Invalid credentials')

// ==========================================
// 403 FORBIDDEN
// ==========================================
// Use when user is logged in but doesn't have permission
// Example: Student trying to access admin route

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access forbidden - Insufficient permissions') {
    super(message, 403, 'FORBIDDEN')
  }
}

// Example usage:
// throw new ForbiddenError('Only admins can access this route')

// ==========================================
// 404 NOT FOUND
// ==========================================
// Use when requested resource doesn't exist
// Example: User not found, question not found

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND')
  }
}

// Example usage:
// throw new NotFoundError('User not found')
// throw new NotFoundError('Question with id 123 not found')

// ==========================================
// 409 CONFLICT
// ==========================================
// Use when there's a conflict
// Example: Email already exists, duplicate entry

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409, 'CONFLICT')
  }
}

// Example usage:
// throw new ConflictError('Email already registered')
// throw new ConflictError('License key already activated')

// ==========================================
// 422 VALIDATION ERROR
// ==========================================
// Use when data validation fails
// Example: Zod validation errors

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: any) {
    super(message, 422, 'VALIDATION_ERROR')
    this.details = details
  }
}

// Example usage:
// throw new ValidationError('Validation failed', {
//   email: 'Invalid email format',
//   password: 'Must be at least 8 characters'
// })

// ==========================================
// 500 INTERNAL SERVER ERROR
// ==========================================
// Use when something unexpected happens
// Example: Database connection failed, file system error

export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error', isOperational: boolean = false) {
    super(message, 500, 'INTERNAL_ERROR', isOperational)
  }
}

// Example usage:
// throw new InternalServerError('Database connection failed')

// ==========================================
// 503 SERVICE UNAVAILABLE
// ==========================================
// Use when service is temporarily down
// Example: Database maintenance, external API down

export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Service temporarily unavailable') {
    super(message, 503, 'SERVICE_UNAVAILABLE')
  }
}

// Example usage:
// throw new ServiceUnavailableError('Database is under maintenance')

// ==========================================
// HELPER FUNCTION: CHECK IF ERROR IS OPERATIONAL
// ==========================================
// Determine if error is expected (operational) or unexpected (bug)
//
// Operational errors (expected):
// - User entered wrong password
// - Email already exists
// - Resource not found
//
// Non-operational errors (bugs):
// - Database crashed
// - Out of memory
// - Undefined variable

export function isOperationalError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.isOperational
  }
  return false
}

// ==========================================
// EXAMPLE USAGE IN CONTROLLER
// ==========================================
//
// import { NotFoundError, UnauthorizedError } from '../utils/errors'
//
// async function login(req, res) {
//   const user = await prisma.user.findUnique({
//     where: { email: req.body.email }
//   })
//   
//   // If user doesn't exist, throw NotFoundError
//   if (!user) {
//     throw new NotFoundError('User not found')
//   }
//   
//   // If password wrong, throw UnauthorizedError
//   const validPassword = await bcrypt.compare(req.body.password, user.passwordHash)
//   if (!validPassword) {
//     throw new UnauthorizedError('Invalid password')
//   }
//   
//   // Success! Return token
//   const token = generateAccessToken({ userId: user.id, ... })
//   res.json({ token })
// }
//
// The error middleware will catch these errors and send proper response:
// {
//   success: false,
//   error: {
//     message: 'User not found',
//     code: 'NOT_FOUND'
//   }
// }
