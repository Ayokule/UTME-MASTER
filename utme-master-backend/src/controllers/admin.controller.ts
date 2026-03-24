// ==========================================
// ADMIN CONTROLLER
// ==========================================
// HTTP handlers for admin operations

import { Request, Response } from 'express'
import { asyncHandler } from '../middleware/error.middleware'
import * as adminService from '../services/admin.service'

// ==========================================
// CREATE ADMIN ACCOUNT (Initial Setup)
// ==========================================
export const createAdminAccount = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, firstName, lastName, secretKey } = req.body
  
  // Check secret key for security (optional) - skip check if no secret key provided
  if (secretKey && secretKey !== process.env.ADMIN_CREATION_SECRET) {
    return res.status(403).json({
      success: false,
      error: { message: 'Invalid secret key' }
    })
  }
  
  const result = await adminService.createAdminAccount({
    email,
    password,
    firstName,
    lastName
  })
  
  return res.status(201).json({
    success: true,
    message: 'Admin account created successfully',
    data: result
  })
})

// ==========================================
// GET DASHBOARD DATA
// ==========================================
export const getDashboardData = asyncHandler(async (req: Request, res: Response) => {
  const data = await adminService.getDashboardData()
  
  res.json({
    success: true,
    data
  })
})

// ==========================================
// GET ALL USERS
// ==========================================
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 20, role, licenseTier, search } = req.query
  
  const users = await adminService.getAllUsers({
    page: Number(page),
    limit: Number(limit),
    role: role as string,
    licenseTier: licenseTier as string,
    search: search as string
  })
  
  res.json({
    success: true,
    data: users
  })
})

// ==========================================
// GET USER BY ID
// ==========================================
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const user = await adminService.getUserById(id)
  res.json({ success: true, data: { user } })
})

// ==========================================
// UPDATE USER INFO
// ==========================================
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const user = await adminService.updateUser(id, req.body)
  res.json({ success: true, message: 'User updated successfully', data: { user } })
})

// ==========================================
// RESET USER PASSWORD (Admin sets new password)
// ==========================================
export const resetUserPassword = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const { password } = req.body
  if (!password || password.length < 6) {
    res.status(400).json({ success: false, error: { message: 'Password must be at least 6 characters' } })
    return
  }
  await adminService.resetUserPassword(id, password)
  res.json({ success: true, message: 'Password reset successfully' })
})

// ==========================================
// TOGGLE USER ACTIVE STATUS
// ==========================================
export const toggleUserActive = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const user = await adminService.toggleUserActive(id)
  res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, data: { user } })
})

// ==========================================
// UPDATE USER ROLE
// ==========================================
export const updateUserRole = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const { role } = req.body
  
  const user = await adminService.updateUserRole(id, role)
  
  res.json({
    success: true,
    message: 'User role updated successfully',
    data: { user }
  })
})

// ==========================================
// UPDATE USER LICENSE
// ==========================================
export const updateUserLicense = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const { licenseTier, expiresAt } = req.body
  
  const user = await adminService.updateUserLicense(id, licenseTier, expiresAt)
  
  res.json({
    success: true,
    message: 'User license updated successfully',
    data: { user }
  })
})

// ==========================================
// DELETE USER
// ==========================================
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  
  await adminService.deleteUser(id)
  
  res.json({
    success: true,
    message: 'User deleted successfully'
  })
})

// ==========================================
// GET ALL LICENSES
// ==========================================
export const getAllLicenses = asyncHandler(async (req: Request, res: Response) => {
  const licenses = await adminService.getAllLicenses()
  
  res.json({
    success: true,
    data: { licenses }
  })
})

// ==========================================
// CREATE LICENSE
// ==========================================
export const createLicense = asyncHandler(async (req: Request, res: Response) => {
  const license = await adminService.createLicense(req.body)
  
  res.status(201).json({
    success: true,
    message: 'License created successfully',
    data: { license }
  })
})

// ==========================================
// UPDATE LICENSE
// ==========================================
export const updateLicense = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  
  const license = await adminService.updateLicense(id, req.body)
  
  res.json({
    success: true,
    message: 'License updated successfully',
    data: { license }
  })
})