// ==========================================
// DATABASE CONFIGURATION
// ==========================================
// This file sets up our connection to PostgreSQL database
// 
// What is Prisma?
// - Prisma is an ORM (Object-Relational Mapping)
// - It lets us talk to database using JavaScript instead of SQL
// - It's like a translator between JavaScript and SQL
//
// Example without Prisma (SQL):
//   SELECT * FROM users WHERE email = 'test@example.com'
//
// With Prisma (JavaScript):
//   prisma.user.findMany({ where: { email: 'test@example.com' } })
//
// Much easier and safer!

// Import PrismaClient class from Prisma library
import { PrismaClient } from '@prisma/client'

// Import our logger for database logs
import { logger } from '../utils/logger'

// ==========================================
// CREATE PRISMA CLIENT INSTANCE
// ==========================================
// PrismaClient is the main class we use to interact with database
// We create ONE instance and reuse it everywhere
// Creating multiple instances would waste memory and slow down app

// Singleton pattern: Only create one instance
// This prevents creating multiple database connections
let prisma: PrismaClient

// Check if we're in development or production
if (process.env.NODE_ENV === 'production') {
  // PRODUCTION: Create one instance
  prisma = new PrismaClient({
    // Log only errors in production
    log: ['error'],
  })
} else {
  // DEVELOPMENT: Create instance with detailed logging
  
  // Check if global already has prisma instance
  // This prevents creating new instance on hot reload
  // (When you save file, server restarts but keeps global variables)
  const globalWithPrisma = global as typeof globalThis & {
    prisma: PrismaClient
  }
  
  if (!globalWithPrisma.prisma) {
    // Create new instance with detailed logging
    globalWithPrisma.prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    })
  }
  
  prisma = globalWithPrisma.prisma
}

// ==========================================
// DATABASE HEALTH CHECK FUNCTION
// ==========================================
// Test if database connection is working
// Useful for debugging and health checks

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    // Try to execute a simple query
    // $queryRaw executes raw SQL
    await prisma.$queryRaw`SELECT 1`
    
    logger.info('✅ Database connection is healthy')
    return true
  } catch (error) {
    logger.error('❌ Database connection failed:', error)
    return false
  }
}

// ==========================================
// DISCONNECT FUNCTION
// ==========================================
// Properly close database connection
// Call this when shutting down server

export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect()
    logger.info('Database disconnected')
  } catch (error) {
    logger.error('Error disconnecting database:', error)
  }
}

// ==========================================
// EXPORT PRISMA CLIENT
// ==========================================
// Other files can import this to use database
// Example: import { prisma } from './config/database'

export { prisma }

// ==========================================
// HOW TO USE PRISMA CLIENT
// ==========================================
// Example queries:
//
// 1. Find all users:
//    const users = await prisma.user.findMany()
//
// 2. Find one user by email:
//    const user = await prisma.user.findUnique({
//      where: { email: 'test@example.com' }
//    })
//
// 3. Create new user:
//    const user = await prisma.user.create({
//      data: {
//        email: 'test@example.com',
//        passwordHash: 'hashed_password',
//        firstName: 'John',
//        lastName: 'Doe',
//        role: 'STUDENT'
//      }
//    })
//
// 4. Update user:
//    const user = await prisma.user.update({
//      where: { id: 'user_id' },
//      data: { firstName: 'Jane' }
//    })
//
// 5. Delete user:
//    await prisma.user.delete({
//      where: { id: 'user_id' }
//    })
//
// 6. Count users:
//    const count = await prisma.user.count()
//
// 7. Complex query with relationships:
//    const userWithExams = await prisma.user.findUnique({
//      where: { id: 'user_id' },
//      include: {
//        studentExams: true  // Include related exam attempts
//      }
//    })
