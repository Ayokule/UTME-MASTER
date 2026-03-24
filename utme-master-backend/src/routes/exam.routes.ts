// ==========================================
// EXAM ROUTES
// ==========================================
// IMPORTANT: Static routes MUST come before dynamic /:id routes
// to prevent Express matching "available", "results", etc. as :id

import { Router } from 'express'
import * as examController from '../controllers/exam.controller'
import { authenticate, authorizeRole } from '../middleware/auth.middleware'
import { validateBody } from '../middleware/validation.middleware'
import {
  createExamSchema,
  submitAnswerSchema,
  startPracticeExamSchema
} from '../validation/exam.validation'
import { prisma } from '../config/database'

const router = Router()

router.use((req: any, res, next) => {
  req.prisma = prisma
  next()
})

// ==========================================
// STATIC ROUTES FIRST (no :param segments that could conflict)
// ==========================================

// GET /api/exams
router.get('/', authenticate, examController.getAllExams)

// POST /api/exams
router.post('/', authenticate, authorizeRole(['ADMIN', 'TEACHER']), validateBody(createExamSchema), examController.createExam)

// GET /api/exams/available
router.get('/available', authenticate, authorizeRole(['STUDENT', 'ADMIN', 'TEACHER']), examController.getAvailableExams)

// GET /api/exams/scheduled
router.get('/scheduled', authenticate, authorizeRole(['ADMIN', 'TEACHER']), examController.getScheduledExams)

// POST /api/exams/practice/start
router.post('/practice/start', authenticate, authorizeRole(['STUDENT']), validateBody(startPracticeExamSchema), examController.startPracticeExam)

// POST /api/exams/process-scheduling
router.post('/process-scheduling', examController.processExamScheduling)

// GET /api/exams/flagged-questions — admin/teacher view all flagged questions
router.get('/flagged-questions', authenticate, authorizeRole(['ADMIN', 'TEACHER']), examController.getFlaggedQuestions)

// PATCH /api/exams/flagged-questions/:flagId — update status (REVIEWED / DISMISSED)
router.patch('/flagged-questions/:flagId', authenticate, authorizeRole(['ADMIN', 'TEACHER']), examController.updateFlaggedQuestionStatus)

// ==========================================
// PREFIXED PARAM ROUTES (static prefix + param — safe ordering)
// ==========================================

// GET /api/exams/resume/:studentExamId
router.get('/resume/:studentExamId', authenticate, authorizeRole(['STUDENT']), examController.resumeExam)

// GET /api/exams/results/:studentExamId
router.get('/results/:studentExamId', authenticate, examController.getResults)

// GET /api/exams/results/:studentExamId/review
router.get('/results/:studentExamId/review', authenticate, examController.getDetailedReviewQuestions)

// GET /api/exams/results/:studentExamId/analysis
router.get('/results/:studentExamId/analysis', authenticate, examController.getQuestionPerformanceAnalysis)

// ==========================================
// DYNAMIC /:id ROUTES
// ==========================================

// PUT /api/exams/:id
router.put('/:id', authenticate, authorizeRole(['ADMIN', 'TEACHER']), examController.updateExam)

// DELETE /api/exams/:id
router.delete('/:id', authenticate, authorizeRole(['ADMIN']), examController.deleteExam)

// PUT /api/exams/:id/questions
router.put('/:id/questions', authenticate, authorizeRole(['ADMIN', 'TEACHER']), examController.assignQuestions)

// GET /api/exams/:id/questions
router.get('/:id/questions', authenticate, authorizeRole(['ADMIN', 'TEACHER']), examController.getExamQuestions)

// GET /api/exams/:id/statistics
router.get('/:id/statistics', authenticate, authorizeRole(['ADMIN', 'TEACHER']), examController.getExamStatistics)

// GET /api/exams/:examId/availability
router.get('/:examId/availability', authenticate, examController.checkExamAvailability)

// POST /api/exams/:id/start
router.post('/:id/start', authenticate, authorizeRole(['STUDENT']), examController.startExam)

// POST /api/exams/:studentExamId/answers
router.post('/:studentExamId/answers', authenticate, authorizeRole(['STUDENT']), validateBody(submitAnswerSchema), examController.submitAnswer)

// POST /api/exams/:studentExamId/submit
router.post('/:studentExamId/submit', authenticate, authorizeRole(['STUDENT']), examController.submitExam)

// POST /api/exams/:examId/retake
router.post('/:examId/retake', authenticate, authorizeRole(['STUDENT']), examController.retakeExam)

// POST /api/exams/:studentExamId/flag-questions  — notify admin/teacher of flagged questions
router.post('/:studentExamId/flag-questions', authenticate, authorizeRole(['STUDENT']), examController.reportFlaggedQuestions)

// PUT /api/exams/:examId/schedule
router.put('/:examId/schedule', authenticate, authorizeRole(['ADMIN', 'TEACHER']), examController.scheduleExam)

export default router
