// ==========================================
// JWT (JSON WEB TOKEN) CONFIGURATION
// ==========================================
// This file handles creating and verifying JWT tokens
//
// What is JWT?
// - JWT is a way to keep users logged in
// - It's like a digital badge that proves identity
// - When user logs in, we give them a token
// - They send this token with each request
// - We verify the token to know who they are
//
// Why JWT instead of sessions?
// - Stateless (server doesn't store anything)
// - Works well with multiple servers
// - Can be used by mobile apps
// - More scalable

// Import JWT library
import jwt from 'jsonwebtoken'

// Import our logger
import { logger } from '../utils/logger'
import { throwServiceError } from '../utils/errorStandardization'
import { UnauthorizedError, BadRequestError } from '../utils/errors'

// ==========================================
// JWT CONFIGURATION
// ==========================================

// Get JWT secret from environment
// This is like a password for signing tokens
// NEVER share this or commit it to git!
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Warn if using default secret (insecure!)
if (JWT_SECRET === 'your-secret-key') {
  logger.warn('⚠️ WARNING: Using default JWT secret! Set JWT_SECRET in .env')
}

// Token expiration time
// Examples: '1h' = 1 hour, '7d' = 7 days, '30d' = 30 days
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

// Refresh token secret (different from access token)
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret'
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d'

// ==========================================
// JWT PAYLOAD INTERFACE
// ==========================================
// This defines what data we store in the token
// Keep it small! Tokens are sent with every request

export interface JWTPayload {
  userId: string       // User's unique ID
  email: string        // User's email
  role: string         // User's role (STUDENT, TEACHER, ADMIN)
  licenseTier: string  // User's license tier (TRIAL, BASIC, PREMIUM, ENTERPRISE)
}

// ==========================================
// GENERATE ACCESS TOKEN
// ==========================================
// Create a JWT token for user authentication
//
// How it works:
// 1. Take user data (userId, email, role)
// 2. Sign it with our secret key
// 3. Return the token string
// 4. User stores this and sends with each request

export function generateAccessToken(payload: JWTPayload): string {
  try {
    const tokenPayload = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      licenseTier: payload.licenseTier,
    }
    
    const token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'utme-master',
      audience: 'utme-users',
    } as jwt.SignOptions)
    
    logger.debug(`Generated access token for user ${payload.userId}`)
    return token
  } catch (error) {
    logger.error('Error generating access token:', error)
    throwServiceError('Failed to generate access token')
  }
}

// ==========================================
// GENERATE REFRESH TOKEN
// ==========================================
// Create a long-lived token for refreshing access tokens
// 
// Why refresh tokens?
// - Access tokens expire quickly (7 days)
// - Refresh tokens last longer (30 days)
// - When access token expires, use refresh token to get new one
// - If refresh token is stolen, user must login again after 30 days

export function generateRefreshToken(payload: JWTPayload): string {
  try {
    const tokenPayload = {
      userId: payload.userId,
      type: 'refresh',
    }
    
    const token = jwt.sign(tokenPayload, JWT_REFRESH_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
      issuer: 'utme-master',
      audience: 'utme-users',
    } as jwt.SignOptions)
    
    logger.debug(`Generated refresh token for user ${payload.userId}`)
    return token
  } catch (error) {
    logger.error('Error generating refresh token:', error)
    throwServiceError('Failed to generate refresh token')
  }
}

// ==========================================
// VERIFY ACCESS TOKEN
// ==========================================
// Check if token is valid and extract user data
//
// How it works:
// 1. Take token string from request header
// 2. Verify signature (was it signed by us?)
// 3. Check if expired
// 4. Extract and return user data
// 5. Throw error if anything wrong

export function verifyAccessToken(token: string): JWTPayload {
  try {
    // Verify and decode token
    // jwt.verify(token, secret, options)
    const decoded = jwt.verify(
      token,
      JWT_SECRET,
      {
        issuer: 'utme-master',
        audience: 'utme-users',
      }
    ) as jwt.JwtPayload
    
    // Extract user data from token
    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      licenseTier: decoded.licenseTier,
    }
  } catch (error) {
    // Handle different error types
    if (error instanceof jwt.TokenExpiredError) {
      logger.warn('Token expired')
      throw new UnauthorizedError('Token has expired')
    } else if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Invalid token')
      throw new UnauthorizedError('Invalid token')
    } else {
      logger.error('Error verifying token:', error)
      throw new UnauthorizedError('Token verification failed')
    }
  }
}

// ==========================================
// VERIFY REFRESH TOKEN
// ==========================================
// Verify refresh token (used to get new access token)

export function verifyRefreshToken(token: string): { userId: string } {
  try {
    const decoded = jwt.verify(
      token,
      JWT_REFRESH_SECRET,
      {
        issuer: 'utme-master',
        audience: 'utme-users',
      }
    ) as jwt.JwtPayload
    
    // Check if it's a refresh token
    if (decoded.type !== 'refresh') {
      throw new BadRequestError('Not a refresh token')
    }
    
    return {
      userId: decoded.userId,
    }
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      logger.warn('Refresh token expired')
      throw new UnauthorizedError('Refresh token has expired')
    } else if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Invalid refresh token')
      throw new UnauthorizedError('Invalid refresh token')
    } else {
      logger.error('Error verifying refresh token:', error)
      throw new UnauthorizedError('Refresh token verification failed')
    }
  }
}

// ==========================================
// DECODE TOKEN (without verification)
// ==========================================
// Extract data from token WITHOUT verifying signature
// Useful for debugging or when you just want to see what's inside
// WARNING: Don't use for authentication! Always verify first!

export function decodeToken(token: string): jwt.JwtPayload | null {
  try {
    // Decode without verifying
    // This just reads the token but doesn't check if it's valid
    const decoded = jwt.decode(token) as jwt.JwtPayload
    return decoded
  } catch (error) {
    logger.error('Error decoding token:', error)
    return null
  }
}

// ==========================================
// EXAMPLE USAGE
// ==========================================
//
// 1. User logs in:
//    const token = generateAccessToken({
//      userId: '123',
//      email: 'user@example.com',
//      role: 'STUDENT',
//      licenseTier: 'TRIAL'
//    })
//    // Send token to user
//
// 2. User sends request with token:
//    Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
//
// 3. Server verifies token:
//    const userData = verifyAccessToken(token)
//    // Now we know who the user is!
//    console.log(userData.userId)  // '123'
//    console.log(userData.email)   // 'user@example.com'
//
// 4. Token expires? Use refresh token:
//    const newToken = generateAccessToken(userData)
//    // Send new token to user

// ==========================================
// EXPORT FUNCTIONS
// ==========================================
export {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRES_IN,
}
