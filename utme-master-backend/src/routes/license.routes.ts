// ==========================================
// LICENSE ROUTES - Phase 5
// ==========================================
// API endpoints for license system

import { Router } from 'express'
import * as licenseController from '../controllers/license.controller'
import { authenticate, authorizeRole } from '../middleware/auth.middleware'
import { validateBody } from '../middleware/validation.middleware'
import {
  createLicenseSchema,
  activateLicenseSchema,
  updateLicenseSchema
} from '../validation/license.validation'

const router = Router()

// ==========================================
// PUBLIC / SETUP ROUTES
// ==========================================

// ACTIVATE LICENSE (First-time setup)
// POST /api/license/activate
router.post(
  '/activate',
  validateBody(activateLicenseSchema),
  licenseController.activateLicense
)

// VALIDATE LICENSE (Check if valid)
// GET /api/license/validate
router.get(
  '/validate',
  licenseController.validateLicense
)

// ==========================================
// AUTHENTICATED ROUTES
// ==========================================

// GET LICENSE INFO (Current system)
// GET /api/license/info
router.get(
  '/info',
  authenticate,
  licenseController.getLicenseInfo
)

// CHECK FEATURE ACCESS
// GET /api/license/features/:feature
router.get(
  '/features/:feature',
  authenticate,
  licenseController.checkFeature
)

// ==========================================
// ADMIN ONLY ROUTES
// ==========================================

// CREATE LICENSE
// POST /api/license/create
router.post(
  '/create',
  authenticate,
  authorizeRole(['ADMIN']),
  validateBody(createLicenseSchema),
  licenseController.createLicense
)

// GET ALL LICENSES
// GET /api/license/all
router.get(
  '/all',
  authenticate,
  authorizeRole(['ADMIN']),
  licenseController.getAllLicenses
)

// GET LICENSE DETAILS
// GET /api/license/:id
router.get(
  '/:id',
  authenticate,
  authorizeRole(['ADMIN']),
  licenseController.getLicenseDetails
)

// UPDATE LICENSE
// PUT /api/license/:id
router.put(
  '/:id',
  authenticate,
  authorizeRole(['ADMIN']),
  validateBody(updateLicenseSchema),
  licenseController.updateLicense
)

// DEACTIVATE LICENSE
// POST /api/license/deactivate
router.post(
  '/deactivate',
  authenticate,
  authorizeRole(['ADMIN']),
  licenseController.deactivateLicense
)

export default router

// ==========================================
// ENDPOINT SUMMARY
// ==========================================
//
// Public/Setup:
// POST   /api/license/activate          - Activate license key
// GET    /api/license/validate          - Validate current license
//
// Authenticated:
// GET    /api/license/info              - Get license info
// GET    /api/license/features/:feature - Check feature access
//
// Admin Only:
// POST   /api/license/create            - Create new license
// GET    /api/license/all               - List all licenses
// GET    /api/license/:id               - Get license details
// PUT    /api/license/:id               - Update license
// POST   /api/license/deactivate        - Deactivate license
