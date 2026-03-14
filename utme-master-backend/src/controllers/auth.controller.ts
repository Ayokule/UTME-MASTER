// ==========================================
// AUTHENTICATION CONTROLLER
// ==========================================
// This file handles HTTP requests for authentication
//
// What is a controller?
// - Receives HTTP requests from routes
// - Validates request data
// - Calls service layer (business logic)
// - Sends HTTP response back to client
//
// Think of it like a waiter in a restaurant:
// - Takes orders (requests) from customers
// - Tells kitchen (service) what to make
// - Brings food (response) back to customers
//
// Controller does NOT contain business logic!
// It just handles HTTP stuff (request/response)
// Business logic is in services

import { Request, Response, NextFunction } from 'express'
import * as authService from '../services/auth.service'
import { asyncHandler } from '../middleware/error.middleware'
import { logger } from '../utils/logger'

// ==========================================
// REGISTER NEW USER
// ==========================================
// POST /api/auth/register
//
// Request body:
// {
//   email: string,
//   password: string,
//   firstName: string,
//   lastName: string,
//   phone?: string
// }
//
// Response:
// {
//   success: true,
//   data: {
//     user: { ... },
//     accessToken: "eyJhbGc...",
//     refreshToken: "eyJhbGc..."
//   }
// }

export const register = asyncHandler(async (req: Request, res: Response) => {
  // Call service to register user
  // Service does all the work (check duplicate, hash password, create user, etc.)
  const result = await authService.registerUser(req.body)
  
  // Send success response with token field (not accessToken)
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: result.user,
      token: result.accessToken,
      refreshToken: result.refreshToken
    }
  })
})

// ==========================================
// LOGIN USER
// ==========================================
// POST /api/auth/login
//
// Request body:
// {
//   email: string,    // Email or phone number
//   password: string
// }
//
// Response:
// {
//   success: true,
//   data: {
//     user: { ... },
//     accessToken: "eyJhbGc...",
//     refreshToken: "eyJhbGc..."
//   }
// }

export const login = asyncHandler(async (req: Request, res: Response) => {
  // Call service to login user
  const result = await authService.loginUser(req.body)
  
  // Send success response with token field (not accessToken)
  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: result.user,
      token: result.accessToken,
      refreshToken: result.refreshToken
    }
  })
})

// ==========================================
// REFRESH TOKEN
// ==========================================
// POST /api/auth/refresh
//
// Request body:
// {
//   refreshToken: string
// }
//
// Response:
// {
//   success: true,
//   data: {
//     accessToken: "eyJhbGc..."
//   }
// }

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body
  
  // Get new access token
  const result = await authService.refreshAccessToken(refreshToken)
  
  res.status(200).json({
    success: true,
    message: 'Token refreshed successfully',
    data: result
  })
})

// ==========================================
// GET CURRENT USER
// ==========================================
// GET /api/auth/me
// Requires authentication (user must be logged in)
//
// Response:
// {
//   success: true,
//   data: { user: {...} }
// }

export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  // req.user is set by authenticate middleware
  // It contains: { id, email, role, licenseTier }
  
  if (!req.user) {
    throw new Error('User not authenticated')
  }
  
  // Get full user data from database
  const user = await authService.getCurrentUser(req.user.id)
  
  res.status(200).json({
    success: true,
    data: { user }
  })
})

// ==========================================
// UPDATE PROFILE
// ==========================================
// PUT /api/auth/profile
// Requires authentication
//
// Request body:
// {
//   firstName?: string,
//   lastName?: string,
//   phone?: string
// }

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new Error('User not authenticated')
  }
  
  const user = await authService.updateProfile(req.user.id, req.body)
  
  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: { user }
  })
})

// ==========================================
// CHANGE PASSWORD
// ==========================================
// POST /api/auth/change-password
// Requires authentication
//
// Request body:
// {
//   currentPassword: string,
//   newPassword: string,
//   confirmPassword: string
// }

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new Error('User not authenticated')
  }
  
  const { currentPassword, newPassword } = req.body
  
  await authService.changePassword(req.user.id, currentPassword, newPassword)
  
  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  })
})

// ==========================================
// LOGOUT
// ==========================================
// POST /api/auth/logout
// Requires authentication
//
// Note: With JWT, logout is handled on client side
// Client just deletes the tokens
// Server doesn't need to do anything

export const logout = asyncHandler(async (req: Request, res: Response) => {
  // Log the logout (optional, for analytics)
  if (req.user) {
    logger.info(`User logged out: ${req.user.email}`)
  }
  
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  })
})

// ==========================================
// HOW CONTROLLERS WORK
// ==========================================
//
// Request flow:
// 1. Client sends HTTP request
//    POST /api/auth/register
//    Body: { email: "test@example.com", password: "password123", ... }
//
// 2. Express receives request
//
// 3. Middleware runs (CORS, body parser, validation)
//
// 4. Route handler calls controller
//    router.post('/register', validateBody(registerSchema), register)
//
// 5. Controller calls service
//    const result = await authService.registerUser(req.body)
//
// 6. Service does business logic
//    - Check if user exists
//    - Hash password
//    - Create user in database
//    - Generate tokens
//
// 7. Service returns result to controller
//
// 8. Controller sends HTTP response
//    res.status(201).json({ success: true, data: result })
//
// 9. Client receives response
//    { success: true, data: { user: {...}, accessToken: "...", refreshToken: "..." } }
