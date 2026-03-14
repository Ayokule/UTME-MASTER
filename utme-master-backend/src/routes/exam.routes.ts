// ==========================================
// EXAM ROUTES - Phase 3
// ==========================================
// API endpoints for exam system

import { Router } from 'express'
import * as examController from '../controllers/exam.controller'
import { authenticate, authorizeRole } from '../middleware/auth.middleware'
import { validateBody } from '../middleware/validation.middleware'
import { 
  createExamSchema, 
  submitAnswerSchema,
  startPracticeExamSchema 
} from '../validation/exam.validation'

const router = Router()

// ==========================================
// ADMIN/TEACHER ROUTES
// ==========================================

// CREATE EXAM
// POST /api/exams
router.post(
  '/',
  authenticate,
  authorizeRole(['ADMIN', 'TEACHER']),
  validateBody(createExamSchema),
  examController.createExam
)

// GET ALL EXAMS
// GET /api/exams
router.get(
  '/',
  authenticate,
  examController.getAllExams
)

// ==========================================
// STUDENT ROUTES
// ==========================================

// START PRACTICE EXAM (must come before /:id/start)
// POST /api/exams/practice/start
router.post(
  '/practice/start',
  authenticate,
  authorizeRole(['STUDENT']),
  validateBody(startPracticeExamSchema),
  examController.startPracticeExam
)

// RESUME EXAM
// GET /api/exams/resume/:studentExamId
router.get(
  '/resume/:studentExamId',
  authenticate,
  authorizeRole(['STUDENT']),
  examController.resumeExam
)

// START EXAM
// POST /api/exams/:id/start
router.post(
  '/:id/start',
  authenticate,
  authorizeRole(['STUDENT']),
  examController.startExam
)

// SUBMIT ANSWER
// POST /api/exams/:studentExamId/answers
router.post(
  '/:studentExamId/answers',
  authenticate,
  authorizeRole(['STUDENT']),
  validateBody(submitAnswerSchema),
  examController.submitAnswer
)

// SUBMIT EXAM
// POST /api/exams/:studentExamId/submit
router.post(
  '/:studentExamId/submit',
  authenticate,
  authorizeRole(['STUDENT']),
  examController.submitExam
)

// GET RESULTS
// GET /api/exams/results/:studentExamId
router.get(
  '/results/:studentExamId',
  authenticate,
  examController.getResults
)

// GET REVIEW QUESTIONS
// GET /api/exams/results/:studentExamId/review
router.get(
  '/results/:studentExamId/review',
  authenticate,
  examController.getReviewQuestions
)

export default router

// ==========================================
// ENDPOINT SUMMARY
// ==========================================
//
// Admin/Teacher:
// POST   /api/exams                          - Create exam
// GET    /api/exams                          - List all exams
//
// Student:
// POST   /api/exams/:id/start                - Start exam
// POST   /api/exams/:studentExamId/answers   - Submit answer
// POST   /api/exams/:studentExamId/submit    - Submit exam
// GET    /api/exams/results/:studentExamId   - Get results
// GET    /api/exams/results/:studentExamId/review - Review answers
