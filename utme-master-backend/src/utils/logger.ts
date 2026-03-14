// ==========================================
// LOGGER UTILITY (Winston)
// ==========================================
// This file sets up logging for our application
//
// What is logging?
// - Recording what happens in your app
// - Like a diary for your application
// - Helps debug problems and track activity
//
// Why Winston?
// - Professional logging library
// - Can log to console, files, databases
// - Different log levels (error, warn, info, debug)
// - Beautiful colored output
//
// Log Levels (from most to least severe):
// - error: Something went wrong (database crash, etc.)
// - warn: Something unusual but not broken
// - info: Normal operations (server started, user logged in)
// - debug: Detailed info for debugging

// Import Winston library
import * as winston from 'winston'

// ==========================================
// LOG LEVELS
// ==========================================
// Define what each level means

const levels = {
  error: 0,   // Most important (always log)
  warn: 1,    // Warnings
  info: 2,    // General info
  debug: 3,   // Detailed debugging (only in development)
}

// Colors for each level (makes logs easier to read)
const colors = {
  error: 'red',      // Errors in red
  warn: 'yellow',    // Warnings in yellow
  info: 'green',     // Info in green
  debug: 'blue',     // Debug in blue
}

// Tell Winston about our custom colors
winston.addColors(colors)

// ==========================================
// LOG FORMAT
// ==========================================
// How logs should look

// Custom format that adds timestamp and colors
const logFormat = winston.format.combine(
  // Add timestamp
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  
  // Add colors (only in terminal)
  winston.format.colorize({ all: true }),
  
  // Custom format for each log line
  winston.format.printf((info) => {
    // info.timestamp = when it happened
    // info.level = error/warn/info/debug
    // info.message = the actual message
    
    // Format: [2024-01-15 10:30:45] INFO: Server started
    return `[${info.timestamp}] ${info.level}: ${info.message}`
  })
)

// ==========================================
// CREATE LOGGER
// ==========================================
// Set up Winston with our configuration

export const logger = winston.createLogger({
  // Use our custom levels
  levels,
  
  // What level to log?
  // In development: log everything (debug and above)
  // In production: log only important stuff (info and above)
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  
  // Use our custom format
  format: logFormat,
  
  // Where to output logs?
  transports: [
    // 1. Console (terminal output)
    // Always log to console in development
    // In production, log errors to console
    new winston.transports.Console({
      format: logFormat,
    }),
    
    // 2. File (save logs to files)
    // Only in production
    ...(process.env.NODE_ENV === 'production' ? [
      // All logs go to combined.log
      new winston.transports.File({
        filename: 'logs/combined.log',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()  // Save as JSON for easy parsing
        ),
      }),
      
      // Errors go to error.log
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',  // Only errors
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        ),
      }),
    ] : []),
  ],
  
  // Don't exit on error
  exitOnError: false,
})

// ==========================================
// HELPER FUNCTIONS
// ==========================================
// Convenient ways to log

// Log error (red)
// Example: logger.error('Database connection failed')
export function logError(message: string, error?: any) {
  if (error) {
    logger.error(`${message}: ${error.message || error}`)
    if (error.stack) {
      logger.debug(error.stack)  // Full stack trace in debug mode
    }
  } else {
    logger.error(message)
  }
}

// Log warning (yellow)
// Example: logger.warn('User not found')
export function logWarn(message: string) {
  logger.warn(message)
}

// Log info (green)
// Example: logger.info('User logged in successfully')
export function logInfo(message: string) {
  logger.info(message)
}

// Log debug (blue)
// Example: logger.debug('Processing request...')
export function logDebug(message: string) {
  logger.debug(message)
}

// ==========================================
// HTTP REQUEST LOGGER
// ==========================================
// Special function to log HTTP requests
// Example: logRequest('POST', '/api/auth/login', 200, 45)

export function logRequest(
  method: string,
  path: string,
  statusCode: number,
  responseTime: number
) {
  const message = `${method} ${path} ${statusCode} - ${responseTime}ms`
  
  // Color based on status code
  if (statusCode >= 500) {
    logger.error(message)  // Server errors (red)
  } else if (statusCode >= 400) {
    logger.warn(message)   // Client errors (yellow)
  } else {
    logger.info(message)   // Success (green)
  }
}

// ==========================================
// DATABASE QUERY LOGGER
// ==========================================
// Log database queries (only in debug mode)

export function logQuery(query: string, duration: number) {
  logger.debug(`DB Query: ${query} (${duration}ms)`)
}

// ==========================================
// EXAMPLE USAGE
// ==========================================
//
// import { logger } from './utils/logger'
//
// logger.info('Server started on port 3000')
// logger.debug('Processing user registration...')
// logger.warn('User tried to access admin route')
// logger.error('Failed to connect to database')
//
// With helper functions:
// logError('Database error', error)
// logRequest('POST', '/api/auth/login', 200, 45)

// Export logger as default
export default logger
