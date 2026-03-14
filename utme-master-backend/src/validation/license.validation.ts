// ==========================================
// LICENSE VALIDATION SCHEMAS - Phase 5
// ==========================================
// Zod schemas for validating license requests

import { z } from 'zod'

// ==========================================
// CREATE LICENSE SCHEMA
// ==========================================
export const createLicenseSchema = z.object({
  tier: z.enum(['TRIAL', 'BASIC', 'PREMIUM', 'ENTERPRISE']),
  organizationName: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  maxStudents: z.number().int().positive().optional(),
  maxQuestions: z.number().int().positive().optional()
})

// ==========================================
// ACTIVATE LICENSE SCHEMA
// ==========================================
export const activateLicenseSchema = z.object({
  licenseKey: z.string()
    .regex(/^UTME-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/, {
      message: 'Invalid license key format. Expected: UTME-XXXX-XXXX-XXXX-XXXX'
    })
})

// ==========================================
// UPDATE LICENSE SCHEMA
// ==========================================
export const updateLicenseSchema = z.object({
  status: z.enum(['ACTIVE', 'EXPIRED', 'SUSPENDED', 'REVOKED']).optional(),
  tier: z.enum(['TRIAL', 'BASIC', 'PREMIUM', 'ENTERPRISE']).optional(),
  maxStudents: z.number().int().positive().optional(),
  maxQuestions: z.number().int().positive().optional(),
  expiryDate: z.string().optional(),
  notes: z.string().optional()
})
