// ==========================================
// ADMIN SERVICE
// ==========================================
// Business logic for admin operations

import * as bcrypt from 'bcryptjs'
import { prisma } from '../config/database'
import { ConflictError, NotFoundError } from '../utils/errors'
import { logger } from '../utils/logger'
import { randomUUID } from 'crypto'

// ==========================================
// CREATE ADMIN ACCOUNT
// ==========================================
export async function createAdminAccount(data: {
  email: string
  password: string
  firstName: string
  lastName: string
}) {
  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: data.email }
  })
  
  if (existingAdmin) {
    throw new ConflictError('Admin account already exists')
  }
  
  // Hash password
  const passwordHash = await bcrypt.hash(data.password, 10)
  
  // Create admin user
  const admin = await prisma.user.create({
    data: {
      id: randomUUID(),
      email: data.email,
      password: passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      role: 'ADMIN',
      licenseTier: 'ENTERPRISE',
      isActive: true
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      licenseTier: true,
      createdAt: true
    }
  })
  
  logger.info(`Admin account created: ${admin.email}`)
  
  return admin
}

// ==========================================
// GET DASHBOARD DATA
// ==========================================
export async function getDashboardData() {
  const [
    totalUsers,
    totalStudents,
    totalTeachers,
    totalAdmins,
    totalQuestions,
    totalExams,
    totalLicenses,
    recentUsers
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.user.count({ where: { role: 'TEACHER' } }),
    prisma.user.count({ where: { role: 'ADMIN' } }),
    prisma.question.count({ where: { isActive: true } }),
    prisma.exam.count({ where: { isActive: true } }),
    prisma.license.count(),
    prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        licenseTier: true,
        createdAt: true
      }
    })
  ])
  
  // License tier distribution
  const licenseTiers = await prisma.user.groupBy({
    by: ['licenseTier'],
    _count: { licenseTier: true }
  })
  
  return {
    stats: {
      totalUsers,
      totalStudents,
      totalTeachers,
      totalAdmins,
      totalQuestions,
      totalExams,
      totalLicenses
    },
    licenseTiers: licenseTiers.map(tier => ({
      tier: tier.licenseTier,
      count: tier._count.licenseTier
    })),
    recentUsers
  }
}

// ==========================================
// GET USER BY ID
// ==========================================
export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, email: true, firstName: true, lastName: true,
      role: true, phone: true, licenseTier: true, licenseExpiresAt: true,
      isActive: true, lastLogin: true, createdAt: true, updatedAt: true,
      _count: { select: { studentExams: true } }
    }
  })
  if (!user) throw new NotFoundError('User not found')
  return user
}

// ==========================================
// UPDATE USER INFO
// ==========================================
export async function updateUser(userId: string, data: {
  firstName?: string; lastName?: string; email?: string; phone?: string; role?: string
}) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new NotFoundError('User not found')

  if (data.email && data.email !== user.email) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } })
    if (existing) throw new ConflictError('Email already in use')
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.firstName && { firstName: data.firstName }),
      ...(data.lastName && { lastName: data.lastName }),
      ...(data.email && { email: data.email }),
      ...(data.phone !== undefined && { phone: data.phone || null }),
      ...(data.role && { role: data.role as any }),
    },
    select: {
      id: true, email: true, firstName: true, lastName: true,
      role: true, phone: true, licenseTier: true, isActive: true
    }
  })
  logger.info(`User updated by admin: ${updated.email}`)
  return updated
}

// ==========================================
// RESET USER PASSWORD
// ==========================================
export async function resetUserPassword(userId: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new NotFoundError('User not found')
  const hashed = await bcrypt.hash(newPassword, 10)
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } })
  logger.info(`Password reset by admin for user: ${user.email}`)
}

// ==========================================
// TOGGLE USER ACTIVE
// ==========================================
export async function toggleUserActive(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new NotFoundError('User not found')
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { isActive: !user.isActive },
    select: { id: true, email: true, isActive: true, firstName: true, lastName: true }
  })
  logger.info(`User ${updated.isActive ? 'activated' : 'deactivated'}: ${updated.email}`)
  return updated
}

// ==========================================
// GET ALL USERS
// ==========================================
export async function getAllUsers(params: {
  page: number
  limit: number
  role?: string
  licenseTier?: string
  search?: string
}) {
  const { page, limit, role, licenseTier, search } = params
  const skip = (page - 1) * limit
  
  const where: any = {}
  
  if (role) {
    where.role = role
  }
  
  if (licenseTier) {
    where.licenseTier = licenseTier
  }
  
  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } }
    ]
  }
  
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        licenseTier: true,
        isActive: true,
        lastLogin: true,
        createdAt: true
      }
    }),
    prisma.user.count({ where })
  ])
  
  return {
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  }
}

// ==========================================
// UPDATE USER ROLE
// ==========================================
export async function updateUserRole(userId: string, role: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })
  
  if (!user) {
    throw new NotFoundError('User not found')
  }
  
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role: role as any },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      licenseTier: true
    }
  })
  
  logger.info(`User role updated: ${user.email} -> ${role}`)
  
  return updatedUser
}

// ==========================================
// UPDATE USER LICENSE
// ==========================================
export async function updateUserLicense(
  userId: string, 
  licenseTier: string, 
  expiresAt?: string
) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })
  
  if (!user) {
    throw new NotFoundError('User not found')
  }
  
  const updateData: any = {
    licenseTier: licenseTier as any
  }
  
  if (expiresAt) {
    updateData.licenseExpiresAt = new Date(expiresAt)
  }
  
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      licenseTier: true,
      licenseExpiresAt: true
    }
  })
  
  logger.info(`User license updated: ${user.email} -> ${licenseTier}`)
  
  return updatedUser
}

// ==========================================
// DELETE USER
// ==========================================
export async function deleteUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })
  
  if (!user) {
    throw new NotFoundError('User not found')
  }
  
  // Don't allow deleting the last admin
  if (user.role === 'ADMIN') {
    const adminCount = await prisma.user.count({
      where: { role: 'ADMIN' }
    })
    
    if (adminCount <= 1) {
      throw new ConflictError('Cannot delete the last admin account')
    }
  }
  
  await prisma.user.delete({
    where: { id: userId }
  })
  
  logger.info(`User deleted: ${user.email}`)
}

// ==========================================
// GET ALL LICENSES
// ==========================================
export async function getAllLicenses() {
  return await prisma.license.findMany({
    orderBy: { createdAt: 'desc' }
  })
}

// ==========================================
// CREATE LICENSE
// ==========================================
export async function createLicense(data: any) {
  const license = await prisma.license.create({
    data: {
      id: randomUUID(),
      licenseKey: `UTME-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      ...data
    }
  })
  
  logger.info(`License created: ${license.licenseKey}`)
  
  return license
}

// ==========================================
// UPDATE LICENSE
// ==========================================
export async function updateLicense(licenseId: string, data: any) {
  const license = await prisma.license.findUnique({
    where: { id: licenseId }
  })
  
  if (!license) {
    throw new NotFoundError('License not found')
  }
  
  const updatedLicense = await prisma.license.update({
    where: { id: licenseId },
    data
  })
  
  logger.info(`License updated: ${license.licenseKey}`)
  
  return updatedLicense
}