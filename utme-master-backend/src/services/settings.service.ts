// ==========================================
// SETTINGS SERVICE
// ==========================================
// Business logic for system settings management

import { prisma } from '../config/database'
import { BadRequestError, NotFoundError } from '../utils/errors'
import { logger } from '../utils/logger'

// ==========================================
// INTERFACES
// ==========================================

export interface SystemSettingsData {
  // General Settings
  siteName?: string
  siteDescription?: string
  maintenanceMode?: boolean
  maxUploadSize?: number
  sessionTimeout?: number
  timezone?: string
  
  // Security Settings
  enableTwoFactor?: boolean
  passwordMinLength?: number
  passwordExpiry?: number
  maxLoginAttempts?: number
  lockoutDuration?: number
  enableAuditLog?: boolean
  
  // Email Settings
  enableNotifications?: boolean
  smtpHost?: string
  smtpPort?: number
  smtpUsername?: string
  smtpPassword?: string
  fromEmail?: string
}

// ==========================================
// GET SYSTEM SETTINGS
// ==========================================
export async function getSystemSettings() {
  logger.info('Fetching system settings')
  
  // Get the first (and only) settings record
  let settings = await prisma.systemSettings.findFirst({
    include: {
      updatedByUser: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      }
    }
  })
  
  // If no settings exist, create default settings
  if (!settings) {
    logger.info('No system settings found, creating default settings')
    
    // Find first admin user to set as creator
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })
    
    if (!adminUser) {
      throw new BadRequestError('No admin user found to create default settings')
    }
    
    settings = await prisma.systemSettings.create({
      data: {
        updatedBy: adminUser.id
      },
      include: {
        updatedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })
  }
  
  return settings
}

// ==========================================
// UPDATE SYSTEM SETTINGS
// ==========================================
export async function updateSystemSettings(data: SystemSettingsData, userId: string) {
  logger.info(`Updating system settings by user: ${userId}`)
  
  // Validate user is admin
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })
  
  if (!user || user.role !== 'ADMIN') {
    throw new BadRequestError('Only administrators can update system settings')
  }
  
  // Validate settings data
  validateSettingsData(data)
  
  // Get existing settings or create if none exist
  let existingSettings = await prisma.systemSettings.findFirst()
  
  if (existingSettings) {
    // Update existing settings
    const updatedSettings = await prisma.systemSettings.update({
      where: { id: existingSettings.id },
      data: {
        ...data,
        updatedBy: userId
      },
      include: {
        updatedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })
    
    logger.info('System settings updated successfully')
    return updatedSettings
  } else {
    // Create new settings
    const newSettings = await prisma.systemSettings.create({
      data: {
        ...data,
        updatedBy: userId
      },
      include: {
        updatedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })
    
    logger.info('System settings created successfully')
    return newSettings
  }
}

// ==========================================
// RESET TO DEFAULT SETTINGS
// ==========================================
export async function resetToDefaultSettings(userId: string) {
  logger.info(`Resetting system settings to defaults by user: ${userId}`)
  
  // Validate user is admin
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })
  
  if (!user || user.role !== 'ADMIN') {
    throw new BadRequestError('Only administrators can reset system settings')
  }
  
  // Get existing settings
  const existingSettings = await prisma.systemSettings.findFirst()
  
  if (existingSettings) {
    // Update to defaults
    const resetSettings = await prisma.systemSettings.update({
      where: { id: existingSettings.id },
      data: {
        // General Settings
        siteName: 'UTME Master',
        siteDescription: 'Professional UTME Examination System',
        maintenanceMode: false,
        maxUploadSize: 5,
        sessionTimeout: 30,
        timezone: 'Africa/Lagos',
        
        // Security Settings
        enableTwoFactor: true,
        passwordMinLength: 8,
        passwordExpiry: 90,
        maxLoginAttempts: 5,
        lockoutDuration: 15,
        enableAuditLog: true,
        
        // Email Settings
        enableNotifications: true,
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
        smtpUsername: '',
        smtpPassword: '',
        fromEmail: 'noreply@utmemaster.com',
        
        updatedBy: userId
      },
      include: {
        updatedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })
    
    logger.info('System settings reset to defaults')
    return resetSettings
  } else {
    // Create default settings
    return await updateSystemSettings({}, userId)
  }
}

// ==========================================
// VALIDATION HELPERS
// ==========================================

function validateSettingsData(data: SystemSettingsData) {
  // Validate upload size
  if (data.maxUploadSize !== undefined) {
    if (data.maxUploadSize < 1 || data.maxUploadSize > 100) {
      throw new BadRequestError('Max upload size must be between 1 and 100 MB')
    }
  }
  
  // Validate session timeout
  if (data.sessionTimeout !== undefined) {
    if (data.sessionTimeout < 5 || data.sessionTimeout > 480) {
      throw new BadRequestError('Session timeout must be between 5 and 480 minutes')
    }
  }
  
  // Validate password min length
  if (data.passwordMinLength !== undefined) {
    if (data.passwordMinLength < 6 || data.passwordMinLength > 20) {
      throw new BadRequestError('Password min length must be between 6 and 20')
    }
  }
  
  // Validate max login attempts
  if (data.maxLoginAttempts !== undefined) {
    if (data.maxLoginAttempts < 3 || data.maxLoginAttempts > 10) {
      throw new BadRequestError('Max login attempts must be between 3 and 10')
    }
  }
  
  // Validate SMTP port
  if (data.smtpPort !== undefined) {
    if (data.smtpPort < 1 || data.smtpPort > 65535) {
      throw new BadRequestError('SMTP port must be between 1 and 65535')
    }
  }
  
  // Validate email format
  if (data.fromEmail !== undefined && data.fromEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.fromEmail)) {
      throw new BadRequestError('Invalid email format for fromEmail')
    }
  }
}