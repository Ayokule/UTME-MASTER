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