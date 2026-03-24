// ==========================================
// RESPONSE HELPER
// ==========================================
// Centralized helper for consistent API responses

import { Response } from 'express'

export interface SuccessResponse<T = any> {
  success: true
  data?: T
  message?: string
}

export interface ErrorResponse {
  success: false
  error: {
    message: string
    code?: string
    details?: any
  }
}

export interface PaginatedResponse<T> {
  success: true
  data: T
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// ==========================================
// SUCCESS RESPONSE HELPERS
// ==========================================

export const success = <T>(res: Response, data: T, message?: string, statusCode: number = 200): Response => {
  return res.status(statusCode).json({
    success: true,
    data,
    message
  })
}

export const successWithPagination = <T>(
  res: Response,
  data: T,
  pagination: { page: number; limit: number; total: number; pages: number },
  message?: string
): Response => {
  return res.status(200).json({
    success: true,
    data,
    pagination,
    message
  })
}

// ==========================================
// ERROR RESPONSE HELPERS
// ==========================================

export const badRequest = (res: Response, message: string, code: string = 'BAD_REQUEST', details?: any): Response => {
  return res.status(400).json({
    success: false,
    error: { message, code, details }
  })
}

export const unauthorized = (res: Response, message: string = 'Authentication required', code: string = 'UNAUTHORIZED'): Response => {
  return res.status(401).json({
    success: false,
    error: { message, code }
  })
}

export const forbidden = (res: Response, message: string = 'Access forbidden', code: string = 'FORBIDDEN'): Response => {
  return res.status(403).json({
    success: false,
    error: { message, code }
  })
}

export const notFound = (res: Response, message: string = 'Resource not found', code: string = 'NOT_FOUND'): Response => {
  return res.status(404).json({
    success: false,
    error: { message, code }
  })
}

export const conflict = (res: Response, message: string = 'Resource already exists', code: string = 'CONFLICT'): Response => {
  return res.status(409).json({
    success: false,
    error: { message, code }
  })
}

export const serverError = (res: Response, message: string = 'Internal server error', code: string = 'INTERNAL_ERROR'): Response => {
  return res.status(500).json({
    success: false,
    error: { message, code }
  })
}

// ==========================================
// USAGE EXAMPLES
// ==========================================
//
// // Success response
// success(res, { user }, 'User created successfully')
//
// // Success with pagination
// successWithPagination(res, { users }, { page: 1, limit: 20, total: 100, pages: 5 })
//
// // Error responses
// badRequest(res, 'Invalid email format', 'INVALID_EMAIL')
// unauthorized(res, 'Token expired', 'TOKEN_EXPIRED')
// notFound(res, 'User not found', 'USER_NOT_FOUND')
// serverError(res, 'Database connection failed')
