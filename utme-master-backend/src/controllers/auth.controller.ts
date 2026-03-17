// ==========================================
// AUTHENTICATION CONTROLLER - FIXED VERSION
// ==========================================
// This file handles HTTP requests for authentication
// Unused imports removed, clean and error-free

import { Request, Response } from 'express'
import * as authService from '../services/auth.service'
import { asyncHandler } from '../middleware/error.middleware'
import { logger } from '../utils/logger'
import { ensureAuthenticated } from '../utils/errorStandardization'

// ==========================================
// REGISTER NEW USER
// ==========================================
export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.registerUser(req.body)
  
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
export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.loginUser(req.body)
  
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
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body
  
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
export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  ensureAuthenticated(req.user)
  
  const user = await authService.getCurrentUser(req.user.id)
  
  res.status(200).json({
    success: true,
    data: { user }
  })
})

// ==========================================
// UPDATE PROFILE
// ==========================================
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  ensureAuthenticated(req.user)
  
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
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  ensureAuthenticated(req.user)
  
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
export const logout = asyncHandler(async (req: Request, res: Response) => {
  if (req.user) {
    logger.info(`User logged out: ${req.user.email}`)
  }
  
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  })
})

// ==========================================
// REQUEST PASSWORD RESET
// ==========================================
export const requestPasswordReset = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body
  
  if (!email) {
    return res.status(400).json({
      success: false,
      error: { message: 'Email is required' }
    })
  }
  
  const result = await authService.requestPasswordReset(email)
  
  res.status(200).json({
    success: true,
    message: result.message
  })
})

// ==========================================
// RESET PASSWORD
// ==========================================
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body
  
  if (!token || !newPassword) {
    return res.status(400).json({
      success: false,
      error: { message: 'Token and new password are required' }
    })
  }
  
  const result = await authService.resetPassword(token, newPassword)
  
  res.status(200).json({
    success: true,
    message: result.message
  })
})