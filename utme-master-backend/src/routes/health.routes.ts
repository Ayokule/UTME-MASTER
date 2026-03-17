// ==========================================
// HEALTH CHECK ROUTES
// ==========================================
// Monitor system and database health

import { Router } from 'express'
import * as healthController from '../controllers/health.controller'

const router = Router()

// ==========================================
// HEALTH CHECK ENDPOINTS
// ==========================================

// GET SYSTEM HEALTH
// GET /api/health
// Returns: System status, database connection, memory usage
router.get('/', healthController.getSystemHealth)

// GET DATABASE DIAGNOSTICS
// GET /api/health/database
// Returns: Table record counts, error summary
router.get('/database', healthController.getDatabaseDiagnostics)

// GET DATABASE LOGS
// GET /api/health/logs
// Returns: Operation logs, failed operations, performance summary
router.get('/logs', healthController.getDatabaseLogs)

export default router
