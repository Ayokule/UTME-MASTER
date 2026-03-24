// ==========================================
// DATA MANAGEMENT ROUTES
// ==========================================

import { Router } from 'express'
import { authenticate, authorizeRole } from '../middleware/auth.middleware'
import * as dmController from '../controllers/dataManagement.controller'

const router = Router()

// All routes require ADMIN or TEACHER
router.use(authenticate, authorizeRole(['ADMIN', 'TEACHER']))

// Data health report
router.get('/health', dmController.getHealthReport)

// Duplicate detection
router.get('/duplicates', dmController.getDuplicates)
router.post('/duplicates/remove', authorizeRole(['ADMIN']), dmController.removeDuplicates)

// Exam question management
router.get('/exams/:examId/questions', dmController.getExamQuestions)
router.post('/exams/:examId/questions/assign', dmController.assignQuestionsToExam)
router.delete('/exams/:examId/questions/remove', dmController.removeQuestionsFromExam)

// Audit logs (admin only)
router.get('/audit-logs', authorizeRole(['ADMIN']), dmController.getAuditLogs)

// Import history
router.get('/imports', dmController.getImportHistory)

export default router
