// ==========================================
// VALIDATION MIDDLEWARE
// ==========================================
// This file validates incoming request data using Zod
//
// What is validation?
// - Checking if data is in correct format
// - Example: Email must be valid, password must be 8+ characters
//
// What is Zod?
// - TypeScript-first validation library
// - Define schemas (rules) for your data
// - Automatic TypeScript types
//
// Why validate?
// - Prevent bad data from entering database
// - Catch errors early
// - Improve security
// - Better error messages

import { Request, Response, NextFunction } from 'express'
import { AnyZodObject, ZodError, ZodEffects } from 'zod'
import { ValidationError } from '../utils/errors'
import { logger } from '../utils/logger'

// ==========================================
// VALIDATE MIDDLEWARE FACTORY
// ==========================================
// Creates a middleware that validates request data
//
// Usage:
//   const validateBody = validate(registerSchema)
//   router.post('/register', validateBody, register)

export function validate(schema: AnyZodObject | ZodEffects<any>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request data against schema
      // This checks req.body, req.query, and req.params
      await schema.parseAsync({
        body: req.body,      // POST/PUT data
        query: req.query,    // URL parameters (?page=1&limit=10)
        params: req.params   // Route parameters (/users/:id)
      })
      
      // Validation passed, continue to next middleware
      next()
    } catch (error) {
      // Validation failed
      if (error instanceof ZodError) {
        // Format error messages nicely
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),   // Which field (e.g., 'body.email')
          message: err.message,         // Error message
          code: err.code               // Error code
        }))
        
        logger.warn('Validation failed:', formattedErrors)
        
        // Throw validation error
        next(new ValidationError('Validation failed', formattedErrors))
      } else {
        // Unexpected error
        next(error)
      }
    }
  }
}

// ==========================================
// VALIDATE BODY ONLY
// ==========================================
// Simpler version that only validates request body
// Most common use case
//
// Usage:
//   router.post('/register', validateBody(registerSchema), register)

export function validateBody(schema: AnyZodObject | ZodEffects<any>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate only req.body
      await schema.parseAsync(req.body)
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
        
        next(new ValidationError('Validation failed', formattedErrors))
      } else {
        next(error)
      }
    }
  }
}

// ==========================================
// VALIDATE QUERY PARAMS
// ==========================================
// Validate URL query parameters
//
// Usage:
//   router.get('/questions', validateQuery(questionFilterSchema), getQuestions)

export function validateQuery(schema: AnyZodObject | ZodEffects<any>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate only req.query
      await schema.parseAsync(req.query)
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
        
        next(new ValidationError('Invalid query parameters', formattedErrors))
      } else {
        next(error)
      }
    }
  }
}

// ==========================================
// VALIDATE ROUTE PARAMS
// ==========================================
// Validate route parameters (e.g., /users/:id)
//
// Usage:
//   router.get('/users/:id', validateParams(userIdSchema), getUser)

export function validateParams(schema: AnyZodObject | ZodEffects<any>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate only req.params
      await schema.parseAsync(req.params)
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
        
        next(new ValidationError('Invalid route parameters', formattedErrors))
      } else {
        next(error)
      }
    }
  }
}

// ==========================================
// EXAMPLE SCHEMAS
// ==========================================
// Create these in a separate file (e.g., auth.validation.ts)

// Example 1: Register schema
// import { z } from 'zod'
//
// export const registerSchema = z.object({
//   email: z.string().email('Invalid email format'),
//   password: z.string().min(8, 'Password must be at least 8 characters'),
//   firstName: z.string().min(2, 'First name must be at least 2 characters'),
//   lastName: z.string().min(2, 'Last name must be at least 2 characters'),
//   phone: z.string().optional()
// })

// Example 2: Login schema
// export const loginSchema = z.object({
//   email: z.string().email('Invalid email format'),
//   password: z.string().min(1, 'Password is required')
// })

// Example 3: Query params schema
// export const paginationSchema = z.object({
//   page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
//   limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional()
// })

// Example 4: Route params schema
// export const userIdSchema = z.object({
//   id: z.string().uuid('Invalid user ID format')
// })

// ==========================================
// EXAMPLE USAGE IN ROUTES
// ==========================================
//
// import { validateBody, validateQuery, validateParams } from '../middleware/validation.middleware'
// import { registerSchema, loginSchema, paginationSchema } from '../validation/auth.validation'
//
// // Validate registration data
// router.post('/register', validateBody(registerSchema), register)
//
// // Validate login data
// router.post('/login', validateBody(loginSchema), login)
//
// // Validate query parameters
// router.get('/users', validateQuery(paginationSchema), getUsers)
//
// // Validate route parameters
// router.get('/users/:id', validateParams(userIdSchema), getUser)
//
// // Multiple validations
// router.put('/users/:id',
//   validateParams(userIdSchema),
//   validateBody(updateUserSchema),
//   updateUser
// )

// ==========================================
// ERROR RESPONSE FORMAT
// ==========================================
// When validation fails, client receives:
//
// {
//   success: false,
//   error: {
//     message: 'Validation failed',
//     code: 'VALIDATION_ERROR',
//     details: [
//       {
//         field: 'email',
//         message: 'Invalid email format',
//         code: 'invalid_string'
//       },
//       {
//         field: 'password',
//         message: 'Password must be at least 8 characters',
//         code: 'too_small'
//       }
//     ]
//   }
// }
