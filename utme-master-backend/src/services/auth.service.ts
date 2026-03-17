// ==========================================
// AUTHENTICATION SERVICE
// ==========================================

import * as bcrypt from 'bcryptjs'
import { prisma } from '../config/database'
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../config/jwt'
import { ConflictError, UnauthorizedError, NotFoundError } from '../utils/errors'
import { logger } from '../utils/logger'
import type { RegisterInput, LoginInput } from '../validation/auth.validation'
import { randomUUID } from 'crypto'
import * as emailService from './email.service'
import { throwServiceError } from '../utils/errorStandardization'

// ==========================================
// REGISTER NEW USER
// ==========================================
export async function registerUser(data: RegisterInput) {
  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: data.email },
        ...(data.phone ? [{ phone: data.phone }] : [])
      ]
    }
  })
  
  if (existingUser) {
    if (existingUser.email === data.email) {
      throw new ConflictError('Email already registered')
    }
    if (existingUser.phone === data.phone) {
      throw new ConflictError('Phone number already registered')
    }
  }
  
  // Hash password
  const passwordHash = await bcrypt.hash(data.password, 10)
  
  // Create user
  const user = await prisma.user.create({
    data: {
      id: randomUUID(),
      email: data.email,
      phone: data.phone || undefined,
      password: passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role || 'STUDENT',
      licenseTier: 'TRIAL',
      isActive: true
    },
    select: {
      id: true,
      email: true,
      phone: true,
      firstName: true,
      lastName: true,
      role: true,
      licenseTier: true,
      createdAt: true
    }
  })
  
  logger.info(`New user registered: ${user.email}`)
  
  // Send welcome email
  try {
    await emailService.sendWelcomeEmail(user.email, {
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    })
  } catch (error) {
    logger.warn(`Failed to send welcome email to ${user.email}:`, error)
  }
  
  // Generate tokens
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    licenseTier: user.licenseTier
  })
  
  const refreshToken = generateRefreshToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    licenseTier: user.licenseTier
  })
  
  return {
    user,
    accessToken,
    refreshToken
  }
}

// ==========================================
// LOGIN USER
// ==========================================
export async function loginUser(data: LoginInput) {
  // Find user by email or phone
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: data.email },
        { phone: data.email }
      ]
    }
  })
  
  if (!user) {
    throw new UnauthorizedError('Invalid email or password')
  }
  
  if (!user.isActive) {
    throw new UnauthorizedError('Account is deactivated. Contact support.')
  }
  
  // Verify password
  const isValidPassword = await bcrypt.compare(data.password, user.password)
  
  if (!isValidPassword) {
    logger.warn(`Failed login attempt for user: ${user.email}`)
    throw new UnauthorizedError('Invalid email or password')
  }
  
  logger.info(`User logged in: ${user.email}`)
  
  // Generate tokens
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    licenseTier: user.licenseTier
  })
  
  const refreshToken = generateRefreshToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    licenseTier: user.licenseTier
  })
  
  // Return user without password
  const { password, ...userWithoutPassword } = user
  
  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken
  }
}

// ==========================================
// REFRESH ACCESS TOKEN
// ==========================================
export async function refreshAccessToken(refreshToken: string) {
  let payload: { userId: string }
  try {
    payload = verifyRefreshToken(refreshToken)
  } catch (error) {
    throw new UnauthorizedError('Invalid refresh token')
  }
  
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      role: true,
      licenseTier: true,
      isActive: true
    }
  })
  
  if (!user) {
    throw new NotFoundError('User not found')
  }
  
  if (!user.isActive) {
    throw new UnauthorizedError('Account is deactivated')
  }
  
  const newAccessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    licenseTier: user.licenseTier
  })
  
  logger.debug(`Access token refreshed for user: ${user.email}`)
  
  return {
    accessToken: newAccessToken
  }
}

// ==========================================
// GET CURRENT USER
// ==========================================
export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      phone: true,
      firstName: true,
      lastName: true,
      role: true,
      licenseTier: true,
      licenseExpiresAt: true,
      isActive: true,
      createdAt: true,
      updatedAt: true
    }
  })
  
  if (!user) {
    throw new NotFoundError('User not found')
  }
  
  return user
}

// ==========================================
// UPDATE PROFILE
// ==========================================
export async function updateProfile(
  userId: string,
  data: {
    firstName?: string
    lastName?: string
    phone?: string
  }
) {
  // Check if phone is already used by another user
  if (data.phone) {
    const existingUser = await prisma.user.findFirst({
      where: {
        phone: data.phone,
        NOT: { id: userId }
      }
    })
    
    if (existingUser) {
      throw new ConflictError('Phone number already in use')
    }
  }
  
  // Update user
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.firstName && { firstName: data.firstName }),
      ...(data.lastName && { lastName: data.lastName }),
      ...(data.phone && { phone: data.phone })
    },
    select: {
      id: true,
      email: true,
      phone: true,
      firstName: true,
      lastName: true,
      role: true,
      licenseTier: true
    }
  })
  
  logger.info(`Profile updated for user: ${user.email}`)
  
  return user
}

// ==========================================
// CHANGE PASSWORD
// ==========================================
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  // Get user with password
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })
  
  if (!user) {
    throw new NotFoundError('User not found')
  }
  
  // Verify current password
  const isValidPassword = await bcrypt.compare(currentPassword, user.password)
  
  if (!isValidPassword) {
    throw new UnauthorizedError('Current password is incorrect')
  }
  
  // Hash new password
  const newPasswordHash = await bcrypt.hash(newPassword, 10)
  
  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: { password: newPasswordHash }
  })
  
  logger.info(`Password changed for user: ${user.email}`)
  
  return { message: 'Password changed successfully' }
}

// ==========================================
// REQUEST PASSWORD RESET
// ==========================================
export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({
    where: { email }
  })
  
  if (!user) {
    // Don't reveal if email exists or not for security
    return { message: 'If the email exists, a reset link has been sent' }
  }
  
  // Generate reset token (expires in 1 hour)
  const resetToken = randomUUID()
  const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
  
  // Save reset token to database
  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken,
      resetTokenExpires
    }
  })
  
  // Send password reset email
  try {
    await emailService.sendPasswordResetEmail(user.email, {
      firstName: user.firstName,
      resetToken
    })
    logger.info(`Password reset email sent to: ${user.email}`)
  } catch (error) {
    logger.error(`Failed to send password reset email to ${user.email}:`, error)
    throwServiceError('Failed to send password reset email')
  }
  
  return { message: 'If the email exists, a reset link has been sent' }
}

// ==========================================
// RESET PASSWORD WITH TOKEN
// ==========================================
export async function resetPassword(token: string, newPassword: string) {
  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpires: {
        gt: new Date() // Token not expired
      }
    }
  })
  
  if (!user) {
    throw new UnauthorizedError('Invalid or expired reset token')
  }
  
  // Hash new password
  const newPasswordHash = await bcrypt.hash(newPassword, 10)
  
  // Update password and clear reset token
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: newPasswordHash,
      resetToken: null,
      resetTokenExpires: null
    }
  })
  
  logger.info(`Password reset completed for user: ${user.email}`)
  
  return { message: 'Password reset successfully' }
}