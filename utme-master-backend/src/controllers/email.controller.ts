// ==========================================
// EMAIL CONTROLLER
// ==========================================
// HTTP handlers for email operations

import { Request, Response } from 'express'
import { asyncHandler } from '../middleware/error.middleware'
import * as emailService from '../services/email.service'
import { logger } from '../utils/logger'

// ==========================================
// TEST EMAIL CONFIGURATION
// ==========================================
// POST /api/email/test
// Requires admin authentication
export const testEmailConfiguration = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: { message: 'Access denied. Admin role required.' }
    })
  }

  const { testEmail } = req.body
  
  if (!testEmail) {
    return res.status(400).json({
      success: false,
      error: { message: 'Test email address is required' }
    })
  }

  const success = await emailService.testEmailConfiguration(testEmail)
  
  if (success) {
    logger.info(`Email configuration test successful. Test sent to: ${testEmail}`)
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

// ==========================================
// SEND WELCOME EMAIL
// ==========================================
// POST /api/email/welcome
// Requires admin authentication
export const sendWelcomeEmail = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || !['ADMIN', 'TEACHER'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: { message: 'Access denied. Admin or teacher role required.' }
    })
  }

  const { userEmail, userData } = req.body
  
  if (!userEmail || !userData) {
    return res.status(400).json({
      success: false,
      error: { message: 'User email and data are required' }
    })
  }

  const success = await emailService.sendWelcomeEmail(userEmail, userData)
  
  if (success) {
    res.json({
      success: true,
      message: 'Welcome email sent successfully'
    })
  } else {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to send welcome email' }
    })
  }
})

// ==========================================
// SEND BULK EMAILS
// ==========================================
// POST /api/email/bulk
// Requires admin authentication
export const sendBulkEmails = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: { message: 'Access denied. Admin role required.' }
    })
  }

  const { emails } = req.body
  
  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    return res.status(400).json({
      success: false,
      error: { message: 'Emails array is required and must not be empty' }
    })
  }

  if (emails.length > 100) {
    return res.status(400).json({
      success: false,
      error: { message: 'Cannot send more than 100 emails at once' }
    })
  }

  const results = await emailService.sendBulkEmails(emails)
  
  logger.info(`Bulk email operation completed: ${results.successful} successful, ${results.failed} failed`)
  
  res.json({
    success: true,
    message: `Bulk email completed: ${results.successful} successful, ${results.failed} failed`,
    data: results
  })
})

// ==========================================
// SEND CUSTOM EMAIL
// ==========================================
// POST /api/email/send
// Requires admin authentication
export const sendCustomEmail = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || !['ADMIN', 'TEACHER'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: { message: 'Access denied. Admin or teacher role required.' }
    })
  }

  const { to, subject, html, text } = req.body
  
  if (!to || !subject || (!html && !text)) {
    return res.status(400).json({
      success: false,
      error: { message: 'Recipient, subject, and content (html or text) are required' }
    })
  }

  const success = await emailService.sendEmail({
    to,
    subject,
    html,
    text
  })
  
  if (success) {
    res.json({
      success: true,
      message: 'Email sent successfully'
    })
  } else {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to send email' }
    })
  }
})