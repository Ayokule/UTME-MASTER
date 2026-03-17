// ==========================================
// AUTHENTICATION ROUTES
// ==========================================
// This file defines API endpoints for authentication
//
// What are routes?
// - Connect URLs to controller functions
// - Define which HTTP method (GET, POST, PUT, DELETE)
// - Add middleware (validation, authentication)
//
// Think of routes like a menu in a restaurant:
// - Menu shows what you can order (available endpoints)
// - Each item has a name (URL path)
// - Each item has ingredients (middleware)
// - Each item is prepared by chef (controller)

import { Router } from 'express'
import * as authController from '../controllers/auth.controller'
import { authenticate } from '../middleware/auth.middleware'
import { validateBody } from '../middleware/validation.middleware'
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema
} from '../validation/auth.validation'
import {
  authRateLimit,
  passwordResetRateLimit,
  bruteForceProtection,
  inputSanitization,
  sqlInjectionProtection,
  emailValidation,
  passwordValidation,
  nameValidation,
  handleValidationErrors
} from '../middleware/security.middleware'

// Create router
// Router is like a mini Express app for specific routes
const router = Router()

// ==========================================
// PUBLIC ROUTES (No authentication required)
// ==========================================

// REGISTER NEW USER
// POST /api/auth/register
// Body: { email, password, firstName, lastName, phone? }
//
// Middleware chain:
// 1. authRateLimit - Limit registration attempts
// 2. inputSanitization - Clean input data
// 3. sqlInjectionProtection - Prevent SQL injection
// 4. emailValidation - Validate email format
// 5. passwordValidation - Validate password strength
// 6. nameValidation - Validate name fields
// 7. handleValidationErrors - Handle validation failures
// 8. authController.register - Handle registration

router.post(
  '/register',
  authRateLimit,
  inputSanitization,
  sqlInjectionProtection,
  emailValidation,
  passwordValidation,
  nameValidation('firstName'),
  nameValidation('lastName'),
  handleValidationErrors,
  authController.register
)

// LOGIN USER
// POST /api/auth/login
// Body: { email, password }
//
// Middleware chain:
// 1. authRateLimit - Limit login attempts
// 2. bruteForceProtection - Prevent brute force attacks
// 3. inputSanitization - Clean input data
// 4. sqlInjectionProtection - Prevent SQL injection
// 5. emailValidation - Validate email format
// 6. handleValidationErrors - Handle validation failures
// 7. authController.login - Handle login

router.post(
  '/login',
  authRateLimit,
  bruteForceProtection,
  inputSanitization,
  sqlInjectionProtection,
  emailValidation,
  handleValidationErrors,
  authController.login
)

// REFRESH ACCESS TOKEN
// POST /api/auth/refresh
// Body: { refreshToken }
//
// Use this when access token expires
// Returns new access token

router.post(
  '/refresh',
  validateBody(refreshTokenSchema),
  authController.refreshToken
)

// REQUEST PASSWORD RESET
// POST /api/auth/forgot-password
// Body: { email }
//
// Sends password reset email if email exists

router.post(
  '/forgot-password',
  passwordResetRateLimit,
  inputSanitization,
  sqlInjectionProtection,
  emailValidation,
  handleValidationErrors,
  authController.requestPasswordReset
)

// RESET PASSWORD WITH TOKEN
// POST /api/auth/reset-password
// Body: { token, newPassword }
//
// Resets password using token from email

router.post(
  '/reset-password',
  authRateLimit,
  inputSanitization,
  sqlInjectionProtection,
  passwordValidation,
  handleValidationErrors,
  authController.resetPassword
)

// ==========================================
// PROTECTED ROUTES (Authentication required)
// ==========================================
// These routes need 'authenticate' middleware
// User must send valid JWT token in Authorization header
//
// Header format:
// Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// GET CURRENT USER
// GET /api/auth/me
//
// Middleware chain:
// 1. authenticate - Verify token and attach user to req.user
// 2. authController.getCurrentUser - Get user data

router.get(
  '/me',
  authenticate,  // Check if user is logged in
  authController.getCurrentUser
)

// UPDATE PROFILE
// PUT /api/auth/profile
// Body: { firstName?, lastName?, phone? }
//
// Middleware chain:
// 1. authenticate - Verify token
// 2. authController.updateProfile - Update profile

router.put(
  '/profile',
  authenticate,
  authController.updateProfile
)

// CHANGE PASSWORD
// POST /api/auth/change-password
// Body: { currentPassword, newPassword, confirmPassword }
//
// Middleware chain:
// 1. authenticate - Verify token
// 2. inputSanitization - Clean input data
// 3. passwordValidation - Validate new password
// 4. handleValidationErrors - Handle validation failures
// 5. authController.changePassword - Change password

router.post(
  '/change-password',
  authenticate,
  inputSanitization,
  passwordValidation,
  handleValidationErrors,
  authController.changePassword
)

// LOGOUT
// POST /api/auth/logout
//
// Note: With JWT, logout is handled on client side
// Client just deletes the tokens
// This endpoint is optional, just for logging

router.post(
  '/logout',
  authenticate,
  authController.logout
)

// ==========================================
// EXPORT ROUTER
// ==========================================
// This router is imported in server.ts
// and mounted at /api/auth
//
// So these routes become:
// POST /api/auth/register
// POST /api/auth/login
// POST /api/auth/refresh
// GET  /api/auth/me
// PUT  /api/auth/profile
// POST /api/auth/change-password
// POST /api/auth/logout

export default router

// ==========================================
// HOW TO USE THESE ENDPOINTS
// ==========================================
//
// 1. REGISTER:
//    POST http://localhost:3000/api/auth/register
//    Body: {
//      "email": "student@test.com",
//      "password": "Password123",
//      "firstName": "Test",
//      "lastName": "Student"
//    }
//    Response: { user, accessToken, refreshToken }
//
// 2. LOGIN:
//    POST http://localhost:3000/api/auth/login
//    Body: {
//      "email": "student@test.com",
//      "password": "Password123"
//    }
//    Response: { user, accessToken, refreshToken }
//
// 3. GET PROFILE (need token):
//    GET http://localhost:3000/api/auth/me
//    Headers: { "Authorization": "Bearer <accessToken>" }
//    Response: { user: {...} }
//
// 4. UPDATE PROFILE (need token):
//    PUT http://localhost:3000/api/auth/profile
//    Headers: { "Authorization": "Bearer <accessToken>" }
//    Body: { "firstName": "Updated Name" }
//    Response: { user: {...} }
//
// 5. CHANGE PASSWORD (need token):
//    POST http://localhost:3000/api/auth/change-password
//    Headers: { "Authorization": "Bearer <accessToken>" }
//    Body: {
//      "currentPassword": "Password123",
//      "newPassword": "NewPassword456",
//      "confirmPassword": "NewPassword456"
//    }
//    Response: { message: "Password changed successfully" }
//
// 6. LOGOUT (need token):
//    POST http://localhost:3000/api/auth/logout
//    Headers: { "Authorization": "Bearer <accessToken>" }
//    Response: { message: "Logged out successfully" }
