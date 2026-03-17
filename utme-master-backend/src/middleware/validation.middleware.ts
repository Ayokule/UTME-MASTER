// ==========================================
// VALIDATION MIDDLEWARE - ENHANCED VERSION
// ==========================================
// Improved error handling and validation

import { Request, Response, NextFunction } from 'express'
import { AnyZodObject, ZodError, ZodEffects } from 'zod'
import { ValidationError } from '../utils/errors'
import { logger } from '../utils/logger'

export function validate(schema: AnyZodObject | ZodEffects<any>) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      })
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
        
        logger.warn('Validation failed:', formattedErrors)
        next(new ValidationError('Validation failed', formattedErrors))
      } else {
        next(error)
      }
    }
  }
}

export function validateBody(schema: AnyZodObject | ZodEffects<any>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body)
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
        
        logger.warn('Body validation failed:', {
          url: req.url,
          method: req.method,
          body: req.body,
          errors: formattedErrors
        })
        
        next(new ValidationError('Validation failed', formattedErrors))
      } else {
        next(error)
      }
    }
  }
}

export function validateQuery(schema: AnyZodObject | ZodEffects<any>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
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