import { Router } from 'express'
import * as resultsController from '../controllers/results.controller'
import { authenticate } from '../middleware/auth.middleware'

const router = Router()

// GET EXAM RESULTS
// GET /api/student/results/:studentExamId
router.get(
  '/:studentExamId',
  authenticate,
  resultsController.getExamResults
)

// SHARE RESULTS
// POST /api/student/results/:studentExamId/share
router.post(
  '/:studentExamId/share',
  authenticate,
  resultsController.shareResults
)

// DOWNLOAD RESULTS PDF
// GET /api/student/results/:studentExamId/pdf
router.get(
  '/:studentExamId/pdf',
  authenticate,
  resultsController.downloadResultsPDF
)

// RETAKE EXAM (separate route)
// POST /api/exams/:examId/retake
router.post(
  '/retake/:examId',
  authenticate,
  resultsController.retakeExam
)

export default router