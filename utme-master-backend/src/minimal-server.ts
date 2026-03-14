// Minimal server to test basic functionality
import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import { logger } from './utils/logger'
import { prisma } from './config/database'
import { errorHandler } from './middleware/error.middleware'

// Import only working routes
import authRoutes from './routes/auth.routes'
import subjectRoutes from './routes/subject.routes'
import questionRoutes from './routes/question.routes'

const app = express()
const PORT = process.env.PORT || 3000

// Basic middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'UTME Master API (Minimal) is running',
    timestamp: new Date().toISOString()
  })
})

// Working routes only
const API_PREFIX = '/api'
app.use(`${API_PREFIX}/auth`, authRoutes)
app.use(`${API_PREFIX}/subjects`, subjectRoutes)
app.use(`${API_PREFIX}/questions`, questionRoutes)

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'UTME Master API (Minimal Version)',
    version: '1.0.0-minimal',
    availableEndpoints: {
      health: '/health',
      auth: `${API_PREFIX}/auth`,
      subjects: `${API_PREFIX}/subjects`,
      questions: `${API_PREFIX}/questions`
    }
  })
})

// Error handling
app.use(errorHandler)

// Start server
async function startMinimalServer() {
  try {
    await prisma.$connect()
    logger.info('✅ Database connected successfully')
    
    app.listen(PORT, () => {
      logger.info(`🚀 Minimal Server running on port ${PORT}`)
      logger.info(`📍 API: http://localhost:${PORT}${API_PREFIX}`)
      logger.info(`🏥 Health: http://localhost:${PORT}/health`)
    })
  } catch (error) {
    logger.error('❌ Failed to start minimal server:', error)
    process.exit(1)
  }
}

startMinimalServer()

export default app