// ==========================================
// ADMIN ROUTES
// ==========================================
// Routes for admin-specific operations

import { Router } from 'express'
import * as adminController from '../controllers/admin.controller'
import { authenticate, authorizeRole } from '../middleware/auth.middleware'
import { validateBody } from '../middleware/validation.middleware'
import { createAdminSchema } from '../validation/admin.validation'

const router = Router()

// Create admin account (only for initial setup)
router.post('/create-admin', 
  validateBody(createAdminSchema),
  adminController.createAdminAccount
)

// All other admin routes require authentication and admin/teacher role
router.use(authenticate)
router.use(authorizeRole(['ADMIN', 'TEACHER']))

// Admin dashboard data
router.get('/dashboard', adminController.getDashboardData)

// User management
router.get('/users', adminController.getAllUsers)
router.get('/users/:id', adminController.getUserById)
router.put('/users/:id', adminController.updateUser)
router.put('/users/:id/role', adminController.updateUserRole)
router.put('/users/:id/license', adminController.updateUserLicense)
router.put('/users/:id/password', adminController.resetUserPassword)
router.put('/users/:id/toggle-active', adminController.toggleUserActive)
router.delete('/users/:id', adminController.deleteUser)

// License management
router.get('/licenses', adminController.getAllLicenses)
router.post('/licenses', adminController.createLicense)
router.put('/licenses/:id', adminController.updateLicense)

export default router