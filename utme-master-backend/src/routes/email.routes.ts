// ==========================================
// EMAIL ROUTES
// ==========================================
// HTTP routes for email operations

import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware'
import * as emailController from '../controllers/email.controller'

const router = Router()

// ==========================================
// MIDDLEWARE
// ==========================================
// All email routes require authentication
router.use(authenticate)

// ==========================================
// ROUTES
// ==========================================

// POST /api/email/test - Test email configuration
router.post('/test', emailController.testEmailConfiguration)

// POST /api/email/welcome - Send welcome email
router.post('/welcome', emailController.sendWelcomeEmail)

// POST /api/email/bulk - Send bulk emails
router.post('/bulk', emailController.sendBulkEmails)

// POST /api/email/send - Send custom email
router.post('/send', emailController.sendCustomEmail)

export default router