// ==========================================
// MAIN SERVER FILE
// ==========================================
// This is the entry point of our backend application
// When you run "npm run dev", this file starts running
//
// What this file does:
// 1. Imports all necessary libraries
// 2. Sets up Express server
// 3. Configures middleware (security, logging, etc.)
// 4. Defines API routes
// 5. Starts listening for requests
// 6. Handles graceful shutdown

// ==========================================
// IMPORTS (Libraries and Files)
// ==========================================

// Load environment variables from .env file
// This must be first, before other imports that use process.env
import dotenv from 'dotenv'
dotenv.config()

// Core Express framework
import express, { Application, Request, Response, } from 'express'

// HTTP server for WebSocket integration
import { createServer } from 'http'

// CORS: Allows frontend to connect from different domain
// Without this, browser blocks requests from localhost:5173 to localhost:3000
import cors from 'cors'

// Helmet: Security middleware that sets HTTP headers
// Protects against common web vulnerabilities
import helmet from 'helmet'

// Morgan: HTTP request logger
// Shows each request in console (GET /api/users 200 15ms)
import morgan from 'morgan'

// Rate limiting: Prevents abuse (too many requests)
import rateLimit from 'express-rate-limit'

// Our custom logger (uses Winston)
import { logger } from './utils/logger'

// Our error handler middleware
import { errorHandler } from './middleware/error.middleware'

// Security middleware
import { 
  generalRateLimit, 
  speedLimiter, 
  securityHeaders,
  inputSanitization,
  sqlInjectionProtection
} from './middleware/security.middleware'

// Import routes (API endpoints)
import authRoutes from './routes/auth.routes'
import questionRoutes from './routes/question.routes'
import subjectRoutes from './routes/subject.routes'
import examRoutes from './routes/exam.routes'
import uploadRoutes from './routes/upload.routes'
import analyticsRoutes from './routes/analytics.routes'
import importRoutes from './routes/import.routes'
import exportRoutes from './routes/export.routes'
import licenseRoutes from './routes/license.routes'
import dashboardRoutes from './routes/dashboard.routes'
import studentDashboardRoutes from './routes/student-dashboard.routes'
import resultsRoutes from './routes/results.routes'
import errorRoutes from './routes/error.routes'
import adminRoutes from './routes/admin.routes'
import settingsRoutes from './routes/settings.routes'
import emailRoutes from './routes/email.routes'
import progressRoutes from './routes/progress.routes'
import healthRoutes from './routes/health.routes'
import notificationRoutes from './routes/notification.routes'


// Database connection
import { prisma } from './config/database'

// Scheduler service
import { startScheduler, stopScheduler } from './services/scheduler.service'

// WebSocket service
import webSocketService from './services/websocket.service'

// ==========================================
// CREATE EXPRESS APPLICATION
// ==========================================
// Think of app as our restaurant
// It receives orders (requests) and serves food (responses)
const app: Application = express()

// Create HTTP server for WebSocket integration
const server = createServer(app)

// Get port from environment or use 3000
// process.env.PORT comes from .env file
// || 3000 means: if PORT not set, use 3000
const PORT = process.env.PORT || 3000

// ==========================================
// SECURITY MIDDLEWARE
// ==========================================
// These run on EVERY request to protect our API

// Security headers
app.use(securityHeaders)

// Helmet: Sets security HTTP headers
// Prevents common attacks like XSS, clickjacking, etc.
app.use(helmet())

// CORS: Allow frontend to connect
// By default, browsers block cross-origin requests
// This allows requests from our frontend (localhost:5173)
app.use(cors({
  // Which domain can access our API
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  
  // Allow credentials (cookies, authorization headers)
  credentials: true,
  
  // Which HTTP methods are allowed
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  
  // Which headers frontend can send
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
}))

// ==========================================
// PARSING MIDDLEWARE
// ==========================================
// These parse incoming data into usable format

// Parse JSON bodies
// When frontend sends: { "email": "test@example.com" }
// This converts it to JavaScript object we can use
app.use(express.json({ 
  limit: '10mb'  // Maximum size of JSON payload
}))

// Parse URL-encoded bodies (form data)
// When form submits: email=test@example.com&password=123
// This parses it into an object
app.use(express.urlencoded({ 
  extended: true,  // Allow rich objects
  limit: '10mb'
}))

// ==========================================
// LOGGING MIDDLEWARE
// ==========================================
// Log every HTTP request

// Morgan: HTTP request logger
// Shows: GET /api/users 200 15ms
// Format: :method :url :status :response-time ms
if (process.env.NODE_ENV === 'development') {
  // In development, show detailed logs
  app.use(morgan('dev'))
} else {
  // In production, show minimal logs
  app.use(morgan('combined'))
}

// ==========================================
// RATE LIMITING
// ==========================================
// Prevent abuse: limit requests per IP address
// If someone sends 100+ requests in 15 minutes, block them

// Apply general rate limiting to all routes
app.use(generalRateLimit)

// Apply speed limiting (progressive delays)
app.use(speedLimiter)

// ==========================================
// INPUT SECURITY
// ==========================================
// Protect against malicious input

// Input sanitization and SQL injection protection
app.use(inputSanitization)
app.use(sqlInjectionProtection)

// ==========================================
// HEALTH CHECK ENDPOINT
// ==========================================
// Simple endpoint to check if server is running
// Useful for monitoring and debugging

app.get('/health', (_: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: 'UTME Master API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()  // How long server has been running (seconds)
  })
})

// ==========================================
// API ROUTES
// ==========================================
// Define all API endpoints
// All routes are prefixed with /api

const API_PREFIX = process.env.API_PREFIX || '/api'

// Authentication routes: /api/auth/*
app.use(`${API_PREFIX}/auth`, authRoutes)

// Question routes: /api/questions/*
app.use(`${API_PREFIX}/questions`, questionRoutes)

// Subject routes: /api/subjects/*
app.use(`${API_PREFIX}/subjects`, subjectRoutes)

// Exam routes: /api/exams/* 
 app.use(`${API_PREFIX}/exams`, examRoutes)

// Upload routes: /api/upload/*
app.use(`${API_PREFIX}/upload`, uploadRoutes)

// Analytics routes: /api/analytics/*
app.use(`${API_PREFIX}/analytics`, analyticsRoutes)

// Import routes: /api/import/*
app.use(`${API_PREFIX}/import`, importRoutes)

// Export routes: /api/export/*
app.use(`${API_PREFIX}/export`, exportRoutes)

// License routes: /api/license/*
app.use(`${API_PREFIX}/license`, licenseRoutes)

// Dashboard routes: /api/student/*
app.use(`${API_PREFIX}/student`, dashboardRoutes)

// Student Dashboard routes: /api/student/dashboard/*
app.use(`${API_PREFIX}/student/dashboard`, studentDashboardRoutes)

// Results routes: /api/student/results/*
app.use(`${API_PREFIX}/student/results`, resultsRoutes)

// Error routes: /api/errors/*
app.use(`${API_PREFIX}/errors`, errorRoutes)

// Admin routes: /api/admin/*
app.use(`${API_PREFIX}/admin`, adminRoutes)

// Settings routes: /api/admin/settings/*
app.use(`${API_PREFIX}/admin/settings`, settingsRoutes)

// Email routes: /api/email/*
app.use(`${API_PREFIX}/email`, emailRoutes)

// Progress routes: /api/student/progress/*
app.use(`${API_PREFIX}/student/progress`, progressRoutes)

// Health check routes: /api/health/*
app.use(`${API_PREFIX}/health`, healthRoutes)

// Notification routes: /api/notifications/*
app.use(`${API_PREFIX}/notifications`, notificationRoutes)

// ==========================================
// ROOT ROUTE
// ==========================================
// When someone visits: http://localhost:3000/
app.get('/', (_: Request, res: Response) => {
  res.json({
    message: 'Welcome to UTME Master API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: `${API_PREFIX}/auth`,
      docs: '/api-docs'  // TODO: Add API documentation
    }
  })
})

// ==========================================
// 404 HANDLER
// ==========================================
// Catch all undefined routes
// This runs if no route matches the request

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      path: req.path,
      method: req.method
    }
  })
})

// ==========================================
// ERROR HANDLING MIDDLEWARE
// ==========================================
// These must be LAST, after all routes

// Import error handlers
import { 
  errorLoggerMiddleware, 
  notFoundMiddleware, 
  validationErrorHandler,
  databaseErrorHandler 
} from './middleware/errorLogger.middleware'

// 404 Not Found handler
app.use(notFoundMiddleware)

// Validation error handler
app.use(validationErrorHandler)

// Database error handler
app.use(databaseErrorHandler)

// Global error handler
app.use(errorLoggerMiddleware)

// Fallback error handler
app.use(errorHandler)

// ==========================================
// START SERVER
// ==========================================
// Begin listening for HTTP requests

// Start function (async because we connect to database)
async function startServer() {
  try {
    // Test database connection
    // Try to connect to PostgreSQL
    await prisma.$connect()
    logger.info('✅ Database connected successfully')
    
    // Initialize WebSocket service
    webSocketService.initialize(server)
    logger.info('✅ WebSocket service initialized')
    
    // Start listening for HTTP requests
    server.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`)
      logger.info(`📍 API: http://localhost:${PORT}${API_PREFIX}`)
      logger.info(`🏥 Health: http://localhost:${PORT}/health`)
      logger.info(`🌍 Environment: ${process.env.NODE_ENV}`)
      
      // Log which CORS origin is allowed
      logger.info(`🔗 CORS origin: ${process.env.CORS_ORIGIN}`)
      
      // Start scheduler service
      startScheduler()
      logger.info(`⏰ Scheduler service started`)
    })
  } catch (error) {
    // If database connection fails, log error and exit
    logger.error('❌ Failed to start server:', error)
    process.exit(1)  // Exit with error code
  }
}
// Start the server
startServer()

// ==========================================
// GRACEFUL SHUTDOWN
// ==========================================
// Handle shutdown signals (Ctrl+C, kill command)
// Close database connections cleanly before exiting

// Handle SIGTERM signal (kill command)
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...')
  
  // Stop scheduler
  stopScheduler()
  logger.info('Scheduler stopped')
  
  // Disconnect from database
  await prisma.$disconnect()
  logger.info('Database disconnected')
  
  // Exit process
  process.exit(0)
})

// Handle SIGINT signal (Ctrl+C)
process.on('SIGINT', async () => {
  logger.info('\nSIGINT received, shutting down gracefully...')
  
  // Stop scheduler
  stopScheduler()
  logger.info('Scheduler stopped')
  
  // Disconnect from database
  await prisma.$disconnect()
  logger.info('Database disconnected')
  
  // Exit process
  process.exit(0)
})

// Handle uncaught exceptions
// These are errors that weren't caught by try/catch
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error)
  
  // Exit process (let PM2 or systemd restart it)
  process.exit(1)
})

// Handle unhandled promise rejections
// These are promises that failed but weren't caught
process.on('unhandledRejection', (reason: any) => {
  logger.error('Unhandled Rejection:', reason)
  
  // Exit process
  process.exit(1)
})

// Export app for testing
export default app

// ==========================================
// SUMMARY
// ==========================================
// This file does:
// 1. ✅ Load environment variables
// 2. ✅ Create Express app
// 3. ✅ Add security (helmet, cors, rate limiting)
// 4. ✅ Add logging (morgan)
// 5. ✅ Parse JSON and form data
// 6. ✅ Define routes
// 7. ✅ Handle errors
// 8. ✅ Connect to database
// 9. ✅ Start listening on port 3000
// 10. ✅ Handle graceful shutdown
//
// Request Flow:
// 1. Client sends request → http://localhost:3000/api/auth/login
// 2. Server receives request
// 3. Middleware runs (helmet, cors, logging, rate limit)
// 4. Body parser converts JSON to object
// 5. Router finds matching route (/api/auth/login)
// 6. Route handler (controller) processes request
// 7. Response sent back to client
// 8. Request logged
