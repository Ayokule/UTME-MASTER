// ==========================================
// LICENSE CONTROLLER - Phase 5
// ==========================================
// HTTP handlers for license endpoints

import { Request, Response } from 'express'
import * as licenseService from '../services/license.service'
import { asyncHandler } from '../middleware/error.middleware'
import { prisma } from '../config/database'

// ==========================================
// CREATE LICENSE (Admin Only)
// ==========================================
// POST /api/license/create
export const createLicense = asyncHandler(async (req: Request, res: Response) => {
  const {
    tier,
    organizationName,
    contactEmail,
    contactPhone,
    maxStudents,
    maxQuestions
  } = req.body
  
  const license = await licenseService.createLicense({
    tier,
    organizationName,
    contactEmail,
    contactPhone,
    maxStudents,
    maxQuestions
  })
  
  res.status(201).json({
    success: true,
    message: 'License created successfully',
    data: license
  })
})

// ==========================================
// ACTIVATE LICENSE
// ==========================================
// POST /api/license/activate
export const activateLicense = asyncHandler(async (req: Request, res: Response) => {
  const { licenseKey } = req.body
  const ipAddress = req.ip || req.socket.remoteAddress
  
  const result = await licenseService.activateLicense(licenseKey, ipAddress)
  
  res.json({
    success: true,
    data: result
  })
})

// ==========================================
// VALIDATE LICENSE
// ==========================================
// GET /api/license/validate
export const validateLicense = asyncHandler(async (req: Request, res: Response) => {
  const { licenseKey } = req.query
  
  const validation = await licenseService.validateLicense(licenseKey as string)
  
  res.json({
    success: true,
    data: validation
  })
})

// ==========================================
// DEACTIVATE LICENSE (Admin Only)
// ==========================================
// POST /api/license/deactivate
export const deactivateLicense = asyncHandler(async (req: Request, res: Response) => {
  const { licenseKey } = req.body
  
  const result = await licenseService.deactivateLicense(licenseKey)
  
  res.json({
    success: true,
    data: result
  })
})

// ==========================================
// GET LICENSE INFO
// ==========================================
// GET /api/license/info
export const getLicenseInfo = asyncHandler(async (req: Request, res: Response) => {
  const info = await licenseService.getLicenseInfo()
  
  res.json({
    success: true,
    data: info
  })
})

// ==========================================
// CHECK FEATURE ACCESS
// ==========================================
// GET /api/license/features/:feature
export const checkFeature = asyncHandler(async (req: Request, res: Response) => {
  const { feature } = req.params
  
  const hasAccess = await licenseService.checkFeatureAccess(feature)
  
  res.json({
    success: true,
    data: {
      feature,
      hasAccess
    }
  })
})

// ==========================================
// GET ALL LICENSES (Admin Only)
// ==========================================
// GET /api/license/all
export const getAllLicenses = asyncHandler(async (req: Request, res: Response) => {
  const licenses = await prisma.license.findMany({
    include: {
      _count: {
        select: { activations: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
  
  return res.json({
    success: true,
    data: { licenses }
  })
})

// ==========================================
// GET LICENSE DETAILS (Admin Only)
// ==========================================
// GET /api/license/:id
export const getLicenseDetails = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  
  const license = await prisma.license.findUnique({
    where: { id },
    include: {
      activations: {
        orderBy: { createdAt: 'desc' }
      }
    }
  })
  
  if (!license) {
    return res.status(404).json({
      success: false,
      error: { message: 'License not found' }
    })
  }
  
  return res.json({
    success: true,
    data: { license }
  })
})

// ==========================================
// UPDATE LICENSE (Admin Only)
// ==========================================
// PUT /api/license/:id
export const updateLicense = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const {
    status,
    tier,
    maxStudents,
    maxQuestions,
    expiryDate,
    notes
  } = req.body
  
  const license = await prisma.license.update({
    where: { id },
    data: {
      status,
      tier,
      maxStudents,
      maxQuestions,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      notes
    }
  })
  
  return res.json({
    success: true,
    message: 'License updated successfully',
    data: { license }
  })
})
