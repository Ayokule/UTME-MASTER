// ==========================================
// SETTINGS CONTROLLER
// ==========================================
// HTTP handlers for system settings operations

import { Request, Response } from 'express'
import { asyncHandler } from '../middleware/error.middleware'
import * as settingsService from '../services/settings.service'
import * as emailService from '../services/email.service'
import { logger } from '../utils/logger'
import { ensureAuthenticated } from '../utils/errorStandardization'

// ==========================================
// GET SYSTEM SETTINGS
// ==========================================
// GET /api/admin/settings
// Requires admin authentication
export const getSystemSettings = asyncHandler(async (req: Request, res: Response) => {
  const settings = await settingsService.getSystemSettings()
  
  res.json({
    success: true,
    data: { settings }
  })
})

// ==========================================
// UPDATE SYSTEM SETTINGS
// ==========================================
// PUT /api/admin/settings
// Requires admin authentication
export const updateSystemSettings = asyncHandler(async (req: Request, res: Response) => {
  ensureAuthenticated(req.user)
  
  const settings = await settingsService.updateSystemSettings(req.body, req.user.id)
  
  logger.info(`System settings updated by admin: ${req.user.email}`)
  
  res.json({
    success: true,
    message: 'System settings updated successfully',
    data: { settings }
  })
})

// ==========================================
// RESET SYSTEM SETTINGS
// ==========================================
// POST /api/admin/settings/reset
// Requires admin authentication
export const resetSystemSettings = asyncHandler(async (req: Request, res: Response) => {
  ensureAuthenticated(req.user)
  
  const settings = await settingsService.resetToDefaultSettings(req.user.id)
  
  logger.info(`System settings reset to defaults by admin: ${req.user.email}`)
  
  res.json({
    success: true,
    message: 'System settings reset to defaults successfully',
    data: { settings }
  })
})

// ==========================================
// TEST EMAIL CONFIGURATION
// ==========================================
// POST /api/admin/settings/test-email
// Requires admin authentication
export const testEmailConfiguration = asyncHandler(async (req: Request, res: Response) => {
  ensureAuthenticated(req.user)
  
  const { testEmail } = req.body
  
  if (!testEmail) {
    return res.status(400).json({
      success: false,
      error: { message: 'Test email address is required' }
    })
  }

  const success = await emailService.testEmailConfiguration(testEmail)
  
  logger.info(`Email configuration test requested by admin: ${req.user.email}`)
  
  if (success) {
    res.json({
      success: true,
      message: 'Test email sent successfully'
    })
  } else {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to send test email. Check SMTP configuration.' }
    })
  }
})