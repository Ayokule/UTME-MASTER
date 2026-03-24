// ==========================================
// AUTHENTICATION VALIDATION SCHEMAS
// ==========================================
// This file defines validation rules for authentication endpoints
// Uses Zod library to validate request data
//
// What is a schema?
// - A set of rules that data must follow
// - Like a checklist for your data
//
// Example:
//   registerSchema says: email must be valid, password must be 8+ chars, etc.

import { z } from 'zod'

// ==========================================
// REGISTER SCHEMA
// ==========================================
// Validates user registration data
// POST /api/auth/register

export const registerSchema = z.object({
  // EMAIL
  // Must be a valid email format (contains @ and domain)
  email: z
    .string({
      required_error: 'Email is required',  // If missing
      invalid_type_error: 'Email must be a string'  // If wrong type
    })
    .email('Invalid email format')  // Must be valid email
    .toLowerCase()  // Convert to lowercase (user@Example.com → user@example.com)
    .trim(),  // Remove whitespace from start/end
  
  // PASSWORD
  // Must be at least 8 characters
  // Must contain uppercase, lowercase, and number
  password: z
    .string({
      required_error: 'Password is required'
    })
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(/^(?=.*[a-z])/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/^(?=.*[A-Z])/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/^(?=.*\d)/, { message: 'Password must contain at least one number' }),
  
  // FIRST NAME
  // Minimum 2 characters, maximum 50
  firstName: z
    .string({
      required_error: 'First name is required'
    })
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .trim(),
  
  // LAST NAME
  // Minimum 2 characters, maximum 50
  lastName: z
    .string({
      required_error: 'Last name is required'
    })
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .trim(),
  
  // ROLE (Optional, defaults to STUDENT)
  // Can be STUDENT or TEACHER
  role: z
    .enum(['STUDENT', 'TEACHER'], {
      message: 'Role must be either STUDENT or TEACHER'
    })
    .optional()
    .default('STUDENT'),
  
  // PHONE (Optional)
  // If provided, must be valid format
  phone: z
    .string()
    .regex(/^[0-9]{10,15}$/, 'Phone must be 10-15 digits')  // Only numbers, 10-15 length
    .optional()  // Not required
    .or(z.literal(''))  // Allow empty string
})

// TypeScript type inferred from schema
// Use this in controllers for type safety
export type RegisterInput = z.infer<typeof registerSchema>

// ==========================================
// LOGIN SCHEMA
// ==========================================
// Validates user login data
// POST /api/auth/login

export const loginSchema = z.object({
  // EMAIL OR PHONE
  // Can login with either email or phone
  email: z
    .string({
      required_error: 'Email or phone is required'
    })
    .trim()
    .toLowerCase(),  // Convert to lowercase for consistency
  
  // PASSWORD
  // Just check it exists, don't validate format (already in database)
  password: z
    .string({
      required_error: 'Password is required'
    })
    .min(1, 'Password is required')  // Must not be empty
})

// TypeScript type
export type LoginInput = z.infer<typeof loginSchema>

// ==========================================
// REFRESH TOKEN SCHEMA
// ==========================================
// Validates refresh token request
// POST /api/auth/refresh

export const refreshTokenSchema = z.object({
  // REFRESH TOKEN
  // The long-lived token used to get new access token
  refreshToken: z
    .string({
      required_error: 'Refresh token is required'
    })
    .min(1, 'Refresh token is required')
})

// TypeScript type
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>

// ==========================================
// CHANGE PASSWORD SCHEMA
// ==========================================
// Validates password change request
// POST /api/auth/change-password

export const changePasswordSchema = z.object({
  // CURRENT PASSWORD
  // Must provide current password for security
  currentPassword: z
    .string({
      required_error: 'Current password is required'
    })
    .min(1, 'Current password is required'),
  
  // NEW PASSWORD
  // Same rules as registration
  newPassword: z
    .string({
      required_error: 'New password is required'
    })
    .min(8, 'New password must be at least 8 characters')
    .max(100, 'New password must be less than 100 characters'),
  
  // CONFIRM PASSWORD
  // Must match new password
  confirmPassword: z
    .string({
      required_error: 'Confirm password is required'
    })
})
  // Custom validation: check if passwords match
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']  // Show error on confirmPassword field
  })
  // Check that new password is different from current
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword']
  })

// TypeScript type
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>

// ==========================================
// FORGOT PASSWORD SCHEMA
// ==========================================
// Validates forgot password request
// POST /api/auth/forgot-password

export const forgotPasswordSchema = z.object({
  // EMAIL
  // Send reset link to this email
  email: z
    .string({
      required_error: 'Email is required'
    })
    .email('Invalid email format')
    .toLowerCase()
    .trim()
})

// TypeScript type
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

// ==========================================
// RESET PASSWORD SCHEMA
// ==========================================
// Validates password reset request
// POST /api/auth/reset-password

export const resetPasswordSchema = z.object({
  // RESET TOKEN
  // Token sent via email
  token: z
    .string({
      required_error: 'Reset token is required'
    })
    .min(1, 'Reset token is required'),
  
  // NEW PASSWORD
  newPassword: z
    .string({
      required_error: 'New password is required'
    })
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters'),
  
  // CONFIRM PASSWORD
  confirmPassword: z
    .string({
      required_error: 'Confirm password is required'
    })
})
  // Check if passwords match
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  })

// TypeScript type
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

// ==========================================
// EXAMPLE VALIDATION ERRORS
// ==========================================
// When validation fails, Zod returns detailed errors:
//
// Request:
// {
//   email: 'invalid-email',
//   password: 'short',
//   firstName: 'J',
//   lastName: 'D'
// }
//
// Validation errors:
// [
//   { field: 'email', message: 'Invalid email format' },
//   { field: 'password', message: 'Password must be at least 8 characters' },
//   { field: 'firstName', message: 'First name must be at least 2 characters' },
//   { field: 'lastName', message: 'Last name must be at least 2 characters' }
// ]
//
// These are automatically formatted by validation.middleware.ts
