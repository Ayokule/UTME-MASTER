// ==========================================
// SETTINGS ROUTES
// ==========================================
// HTTP routes for system settings management

import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware'
import { requireRole } from '../middleware/role.middleware'
import * as settingsController from '../controllers/settings.controller'

const router = Router()

// ==========================================
// MIDDLEWARE
// ==========================================
// All settings routes require admin authentication
router.use(authenticate)
router.use(requireRole(['ADMIN']))

// ==========================================
// ROUTES
// ==========================================

// GET /api/admin/settings - Get current system settings
router.get('/', settingsController.getSystemSettings)

// PUT /api/admin/settings - Update system settings
router.put('/', settingsController.updateSystemSettings)

// POST /api/admin/settings/reset - Reset to default settings
router.post('/reset', settingsController.resetSystemSettings)

// POST /api/admin/settings/test-email - Test email configuration
router.post('/test-email', settingsController.testEmailConfiguration)

export default router