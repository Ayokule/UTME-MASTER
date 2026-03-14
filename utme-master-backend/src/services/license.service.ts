// ==========================================
// LICENSE SERVICE - Phase 5
// ==========================================
// This handles all license-related logic:
// - Generate license keys
// - Validate licenses
// - Activate/deactivate
// - Check hardware fingerprints
// - Manage trials
// - Feature gating
//
// ALL WITH BEGINNER-FRIENDLY COMMENTS!

import { prisma } from '../config/database'
import { BadRequestError, ForbiddenError, NotFoundError } from '../utils/errors'
import { logger } from '../utils/logger'
import crypto from 'crypto'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

// ==========================================
// LICENSE TIER LIMITS
// ==========================================
const TIER_LIMITS = {
  TRIAL: {
    maxStudents: 50,
    maxQuestions: 500,
    durationDays: 30,
    features: {
      whiteLabel: false,
      customLogo: false,
      exportReports: false,
      advancedAnalytics: false,
      bulkImport: true,
      apiAccess: false,
      multipleAdmins: false,
      prioritySupport: false
    }
  },
  BASIC: {
    maxStudents: 200,
    maxQuestions: 5000,
    durationDays: null, // No expiry for paid licenses
    features: {
      whiteLabel: false,
      customLogo: false,
      exportReports: true,
      advancedAnalytics: false,
      bulkImport: true,
      apiAccess: false,
      multipleAdmins: false,
      prioritySupport: false
    }
  },
  PREMIUM: {
    maxStudents: -1, // Unlimited
    maxQuestions: 10000,
    durationDays: null, // No expiry for paid licenses
    features: {
      whiteLabel: false,
      customLogo: false,
      exportReports: true,
      advancedAnalytics: true,
      bulkImport: true,
      apiAccess: false,
      multipleAdmins: true,
      prioritySupport: true
    }
  },
  ENTERPRISE: {
    maxStudents: -1, // Unlimited
    maxQuestions: -1, // Unlimited
    durationDays: null, // No expiry for paid licenses
    features: {
      whiteLabel: true,
      customLogo: true,
      exportReports: true,
      advancedAnalytics: true,
      bulkImport: true,
      apiAccess: true,
      multipleAdmins: true,
      prioritySupport: true
    }
  }
}

// ==========================================
// GENERATE LICENSE KEY
// ==========================================
// Creates a new license key in format: UTME-XXXX-XXXX-XXXX-XXXX

export function generateLicenseKey(): string {
  // Characters to use (alphanumeric, excluding ambiguous ones)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  
  // Generate 4 random segments
  const segments: string[] = []
  
  for (let i = 0; i < 4; i++) {
    let segment = ''
    for (let j = 0; j < 4; j++) {
      const randomIndex = crypto.randomInt(0, chars.length)
      segment += chars[randomIndex]
    }
    segments.push(segment)
  }
  
  // Format: UTME-XXXX-XXXX-XXXX-XXXX
  return `UTME-${segments.join('-')}`
}

// ==========================================
// GET HARDWARE FINGERPRINT
// ==========================================
// Generates unique fingerprint for this computer

export async function getHardwareFingerprint(): Promise<{
  fingerprint: string
  cpuId: string
  motherboardSerial: string
  macAddress: string
}> {
  try {
    // Get CPU ID
    const { stdout: cpuOutput } = await execAsync('wmic cpu get processorid')
    const cpuId = cpuOutput.split('\n')[1]?.trim() || 'UNKNOWN_CPU'
    
    // Get Motherboard Serial
    const { stdout: mbOutput } = await execAsync('wmic baseboard get serialnumber')
    const motherboardSerial = mbOutput.split('\n')[1]?.trim() || 'UNKNOWN_MB'
    
    // Get MAC Address
    const { stdout: macOutput } = await execAsync('getmac')
    const macMatch = macOutput.match(/([0-9A-F]{2}-){5}[0-9A-F]{2}/i)
    const macAddress = macMatch ? macMatch[0] : 'UNKNOWN_MAC'
    
    // Combine and hash
    const combined = `${cpuId}|${motherboardSerial}|${macAddress}`
    const fingerprint = crypto.createHash('sha256').update(combined).digest('hex')
    
    logger.info('Hardware fingerprint generated')
    
    return {
      fingerprint,
      cpuId,
      motherboardSerial,
      macAddress
    }
    
  } catch (error) {
    logger.error('Error getting hardware fingerprint:', error)
    throw new Error('Failed to get hardware fingerprint')
  }
}

// ==========================================
// CREATE LICENSE
// ==========================================
// Admin creates a new license

export async function createLicense(data: {
  tier: string
  organizationName?: string
  contactEmail?: string
  contactPhone?: string
  maxStudents?: number
  maxQuestions?: number
}) {
  logger.info(`Creating ${data.tier} license`)
  
  // Generate unique license key
  let licenseKey: string
  let isUnique = false
  
  while (!isUnique) {
    licenseKey = generateLicenseKey()
    const existing = await prisma.license.findUnique({
      where: { licenseKey }
    })
    if (!existing) isUnique = true
  }
  
  // Get tier limits
  const tierLimits = TIER_LIMITS[data.tier as keyof typeof TIER_LIMITS]
  
  if (!tierLimits) {
    throw new BadRequestError('Invalid license tier')
  }
  
  // Set trial dates if TRIAL tier
  const trialStartDate = data.tier === 'TRIAL' ? new Date() : null
  const trialEndDate = data.tier === 'TRIAL' && tierLimits.durationDays
    ? new Date(Date.now() + tierLimits.durationDays * 24 * 60 * 60 * 1000)
    : null
  
  // Create license
  const license = await prisma.license.create({
    data: {
      licenseKey: licenseKey!,
      tier: data.tier as any,
      status: 'ACTIVE',
      organizationName: data.organizationName,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      maxStudents: data.maxStudents || tierLimits.maxStudents,
      maxQuestions: data.maxQuestions || tierLimits.maxQuestions,
      features: tierLimits.features,
      trialStartDate,
      trialEndDate,
      isActivated: false
    }
  })
  
  logger.info(`License created: ${license.licenseKey}`)
  
  return {
    licenseKey: license.licenseKey,
    tier: license.tier,
    maxStudents: license.maxStudents,
    maxQuestions: license.maxQuestions,
    trialEndDate: license.trialEndDate,
    features: license.features
  }
}

// ==========================================
// ACTIVATE LICENSE
// ==========================================
// User activates license on their computer

export async function activateLicense(
  licenseKey: string,
  ipAddress?: string
) {
  logger.info(`Activating license: ${licenseKey}`)
  
  // Find license
  const license = await prisma.license.findUnique({
    where: { licenseKey }
  })
  
  if (!license) {
    throw new NotFoundError('License key not found')
  }
  
  // Check status
  if (license.status !== 'ACTIVE') {
    throw new ForbiddenError(`License is ${license.status.toLowerCase()}`)
  }
  
  // Get hardware info
  const hardware = await getHardwareFingerprint()
  
  // Check if already activated on different computer
  if (license.isActivated && license.hardwareFingerprint) {
    if (license.hardwareFingerprint !== hardware.fingerprint) {
      // Log failed attempt
      await prisma.licenseActivation.create({
        data: {
          licenseId: license.id,
          hardwareFingerprint: hardware.fingerprint,
          cpuId: hardware.cpuId,
          motherboardSerial: hardware.motherboardSerial,
          macAddress: hardware.macAddress,
          ipAddress,
          success: false,
          errorMessage: 'License already activated on different computer',
          action: 'ACTIVATE'
        }
      })
      
      throw new ForbiddenError(
        'This license is already activated on another computer. ' +
        'Please deactivate it first or contact support for license transfer.'
      )
    }
  }
  
  // Get computer info
  let computerName = 'UNKNOWN'
  let osVersion = 'UNKNOWN'
  
  try {
    const { stdout: nameOutput } = await execAsync('hostname')
    computerName = nameOutput.trim()
    
    const { stdout: osOutput } = await execAsync('wmic os get caption')
    osVersion = osOutput.split('\n')[1]?.trim() || 'UNKNOWN'
  } catch (error) {
    logger.warn('Could not get computer info')
  }
  
  // Activate license
  const updatedLicense = await prisma.license.update({
    where: { id: license.id },
    data: {
      isActivated: true,
      activatedAt: new Date(),
      hardwareFingerprint: hardware.fingerprint
    }
  })
  
  // Log successful activation
  await prisma.licenseActivation.create({
    data: {
      licenseId: license.id,
      hardwareFingerprint: hardware.fingerprint,
      cpuId: hardware.cpuId,
      motherboardSerial: hardware.motherboardSerial,
      macAddress: hardware.macAddress,
      computerName,
      osVersion,
      ipAddress,
      success: true,
      action: 'ACTIVATE'
    }
  })
  
  logger.info(`License activated successfully: ${licenseKey}`)
  
  return {
    success: true,
    message: 'License activated successfully',
    license: {
      tier: updatedLicense.tier,
      maxStudents: updatedLicense.maxStudents,
      maxQuestions: updatedLicense.maxQuestions,
      features: updatedLicense.features,
      trialEndDate: updatedLicense.trialEndDate,
      expiryDate: updatedLicense.expiryDate
    }
  }
}

// ==========================================
// VALIDATE LICENSE
// ==========================================
// Check if current license is valid

export async function validateLicense(licenseKey?: string) {
  // If no license key provided, check if any license is activated
  if (!licenseKey) {
    const activatedLicense = await prisma.license.findFirst({
      where: {
        isActivated: true,
        status: 'ACTIVE'
      }
    })
    
    if (!activatedLicense) {
      return {
        valid: false,
        reason: 'No active license found',
        tier: 'TRIAL' as const
      }
    }
    
    licenseKey = activatedLicense.licenseKey
  }
  
  // Find license
  const license = await prisma.license.findUnique({
    where: { licenseKey }
  })
  
  if (!license) {
    return {
      valid: false,
      reason: 'License not found',
      tier: 'TRIAL' as const
    }
  }
  
  // Check status
  if (license.status !== 'ACTIVE') {
    return {
      valid: false,
      reason: `License is ${license.status.toLowerCase()}`,
      tier: license.tier
    }
  }
  
  // Check hardware fingerprint
  if (license.isActivated && license.hardwareFingerprint) {
    const currentHardware = await getHardwareFingerprint()
    
    if (license.hardwareFingerprint !== currentHardware.fingerprint) {
      return {
        valid: false,
        reason: 'Hardware mismatch - license activated on different computer',
        tier: license.tier
      }
    }
  }
  
  // Check trial expiry
  if (license.tier === 'TRIAL' && license.trialEndDate) {
    if (new Date() > license.trialEndDate) {
      // Auto-expire trial
      await prisma.license.update({
        where: { id: license.id },
        data: { status: 'EXPIRED' }
      })
      
      return {
        valid: false,
        reason: 'Trial period expired',
        tier: license.tier,
        trialEndDate: license.trialEndDate
      }
    }
  }
  
  // Check subscription expiry
  if (license.expiryDate) {
    if (new Date() > license.expiryDate) {
      await prisma.license.update({
        where: { id: license.id },
        data: { status: 'EXPIRED' }
      })
      
      return {
        valid: false,
        reason: 'Subscription expired',
        tier: license.tier,
        expiryDate: license.expiryDate
      }
    }
  }
  
  // Check usage limits
  const warnings: string[] = []
  
  if (license.maxStudents > 0 && license.currentStudents >= license.maxStudents) {
    warnings.push(`Student limit reached (${license.maxStudents})`)
  }
  
  if (license.maxQuestions > 0 && license.currentQuestions >= license.maxQuestions) {
    warnings.push(`Question limit reached (${license.maxQuestions})`)
  }
  
  // License is valid!
  return {
    valid: true,
    tier: license.tier,
    features: license.features,
    maxStudents: license.maxStudents,
    maxQuestions: license.maxQuestions,
    currentStudents: license.currentStudents,
    currentQuestions: license.currentQuestions,
    trialEndDate: license.trialEndDate,
    expiryDate: license.expiryDate,
    warnings: warnings.length > 0 ? warnings : undefined
  }
}

// ==========================================
// DEACTIVATE LICENSE
// ==========================================
// Remove hardware binding (for transfer)

export async function deactivateLicense(licenseKey: string) {
  logger.info(`Deactivating license: ${licenseKey}`)
  
  const license = await prisma.license.findUnique({
    where: { licenseKey }
  })
  
  if (!license) {
    throw new NotFoundError('License not found')
  }
  
  if (!license.isActivated) {
    throw new BadRequestError('License is not activated')
  }
  
  // Get current hardware for logging
  const hardware = await getHardwareFingerprint()
  
  // Deactivate
  await prisma.license.update({
    where: { id: license.id },
    data: {
      isActivated: false,
      hardwareFingerprint: null
    }
  })
  
  // Log deactivation
  await prisma.licenseActivation.create({
    data: {
      licenseId: license.id,
      hardwareFingerprint: hardware.fingerprint,
      cpuId: hardware.cpuId,
      motherboardSerial: hardware.motherboardSerial,
      macAddress: hardware.macAddress,
      success: true,
      action: 'DEACTIVATE'
    }
  })
  
  logger.info(`License deactivated: ${licenseKey}`)
  
  return {
    success: true,
    message: 'License deactivated successfully'
  }
}

// ==========================================
// UPDATE USAGE
// ==========================================
// Update current student/question count

export async function updateUsage(licenseKey: string, type: 'students' | 'questions', delta: number) {
  const license = await prisma.license.findUnique({
    where: { licenseKey }
  })
  
  if (!license) return
  
  const field = type === 'students' ? 'currentStudents' : 'currentQuestions'
  const newValue = Math.max(0, (license[field] || 0) + delta)
  
  await prisma.license.update({
    where: { id: license.id },
    data: { [field]: newValue }
  })
}

// ==========================================
// CHECK FEATURE ACCESS
// ==========================================
// Check if feature is enabled for current license

export async function checkFeatureAccess(feature: string): Promise<boolean> {
  const validation = await validateLicense()
  
  if (!validation.valid) return false
  if (!validation.features) return false
  
  return (validation.features as any)[feature] === true
}

// ==========================================
// GET LICENSE INFO
// ==========================================
// Get current license information

export async function getLicenseInfo() {
  const activatedLicense = await prisma.license.findFirst({
    where: {
      isActivated: true
    },
    include: {
      licenseActivations: {
        orderBy: { createdAt: 'desc' },
        take: 5
      }
    }
  })
  
  if (!activatedLicense) {
    return {
      hasLicense: false,
      tier: 'TRIAL' as const,
      message: 'No license activated'
    }
  }
  
  const validation = await validateLicense(activatedLicense.licenseKey)
  
  return {
    hasLicense: true,
    valid: validation.valid,
    licenseKey: activatedLicense.licenseKey,
    tier: activatedLicense.tier,
    status: activatedLicense.status,
    organizationName: activatedLicense.organizationName,
    features: activatedLicense.features,
    maxStudents: activatedLicense.maxStudents,
    maxQuestions: activatedLicense.maxQuestions,
    currentStudents: activatedLicense.currentStudents,
    currentQuestions: activatedLicense.currentQuestions,
    trialEndDate: activatedLicense.trialEndDate,
    expiryDate: activatedLicense.expiryDate,
    activatedAt: activatedLicense.activatedAt,
    warnings: validation.warnings,
    recentActivations: activatedLicense.licenseActivations
  }
}
