// ==========================================
// EXAM CONTROLLER - FIXED VERSION
// ==========================================
// HTTP request handlers for exam endpoints
// All response formats standardized and bugs fixed

import { Request, Response } from 'express'
import * as examService from '../services/exam.service'
import { logger } from '../utils/logger'

// ==========================================
// START EXAM
// ==========================================
export async function startExam(req: Request, res: Response): Promise<void> {
  try {
    const { examId } = req.params
    const studentId = (req as any).user?.id

    if (!studentId) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      })
      return
    }

    const result = await examService.startExam(examId, studentId)
    logger.info(`Exam started: ${examId} by student ${studentId}`)

    res.json({
      success: true,
      data: result
    })
  } catch (error: any) {
    logger.error('Failed to start exam:', error)

    if (error.code === 'NOT_FOUND') {
      res.status(404).json({
        success: false,
        error: { code: 'EXAM_NOT_FOUND', message: error.message }
      })
      return
    }

    if (error.code === 'FORBIDDEN') {
      res.status(403).json({
        success: false,
        error: { code: 'NOT_ELIGIBLE', message: error.message }
      })
      return
    }

    res.status(400).json({
      success: false,
      error: { code: 'START_EXAM_FAILED', message: error.message }
    })
  }
}

// ==========================================
// RESUME EXAM - FIXED
// ==========================================
export async function resumeExam(req: Request, res: Response): Promise<void> {
  try {
    const { studentExamId } = req.params
    const studentId = (req as any).user?.id

    if (!studentId) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      })
      return
    }

    const result = await examService.resumeExam(studentExamId, studentId)
    logger.info(`Exam resumed: ${studentExamId}`)

    res.json({
      success: true,
      data: result
    })
  } catch (error: any) {
    logger.error('Failed to resume exam:', error)

    if (error.code === 'NOT_FOUND') {
      res.status(404).json({
        success: false,
        error: { code: 'EXAM_NOT_FOUND', message: error.message }
      })
      return
    }

    if (error.code === 'FORBIDDEN') {
      res.status(403).json({
        success: false,
        error: { code: 'ACCESS_DENIED', message: error.message }
      })
      return
    }

    // FIXED: Better handling of already submitted exams
    if (error.code === 'BAD_REQUEST' && error.message.includes('submitted')) {
      res.status(400).json({
        success: false,
        error: { code: 'EXAM_ALREADY_SUBMITTED', message: error.message }
      })
      return
    }

    res.status(400).json({
      success: false,
      error: { code: 'RESUME_EXAM_FAILED', message: error.message }
    })
  }
}

// ==========================================
// SAVE ANSWER - FIXED
// ==========================================
export async function saveAnswer(req: Request, res: Response): Promise<void> {
  try {
    const { studentExamId } = req.params
    const { questionId, answer, timeSpent } = req.body
    const studentId = (req as any).user?.id

    if (!studentId) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      })
      return
    }

    // FIXED: Better validation of required fields
    if (!questionId) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_REQUEST', message: 'Question ID is required' }
      })
      return
    }

    if (answer === undefined || answer === null) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_REQUEST', message: 'Answer is required' }
      })
      return
    }

    const result = await examService.saveAnswer(
      studentExamId,
      studentId,
      questionId,
      answer,
      timeSpent || 0
    )

    logger.debug(`Answer saved: ${studentExamId} - ${questionId}`)

    res.json({
      success: true,
      data: result
    })
  } catch (error: any) {
    logger.error('Failed to save answer:', error)

    if (error.code === 'NOT_FOUND') {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: error.message }
      })
      return
    }

    if (error.code === 'FORBIDDEN') {
      res.status(403).json({
        success: false,
        error: { code: 'ACCESS_DENIED', message: error.message }
      })
      return
    }

    if (error.code === 'BAD_REQUEST') {
      res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: error.message }
      })
      return
    }

    res.status(500).json({
      success: false,
      error: { code: 'SAVE_ANSWER_FAILED', message: 'Failed to save answer' }
    })
  }
}

// ==========================================
// SUBMIT EXAM
// ==========================================
export async function submitExam(req: Request, res: Response): Promise<void> {
  try {
    const { studentExamId } = req.params
    const { autoSubmit } = req.body
    const studentId = (req as any).user?.id

    if (!studentId) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      })
      return
    }

    const result = await examService.submitExam(studentExamId, studentId, autoSubmit || false)
    logger.info(`Exam submitted: ${studentExamId}`)

    res.json({
      success: true,
      data: result
    })
  } catch (error: any) {
    logger.error('Failed to submit exam:', error)

    if (error.code === 'NOT_FOUND') {
      res.status(404).json({
        success: false,
        error: { code: 'EXAM_NOT_FOUND', message: error.message }
      })
      return
    }

    if (error.code === 'FORBIDDEN') {
      res.status(403).json({
        success: false,
        error: { code: 'ACCESS_DENIED', message: error.message }
      })
      return
    }

    if (error.code === 'BAD_REQUEST') {
      res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: error.message }
      })
      return
    }

    res.status(500).json({
      success: false,
      error: { code: 'SUBMIT_EXAM_FAILED', message: 'Failed to submit exam' }
    })
  }
}

// ==========================================
// GET EXAM RESULTS
// ==========================================
export async function getExamResults(req: Request, res: Response): Promise<void> {
  try {
    const { studentExamId } = req.params
    const studentId = (req as any).user?.id

    if (!studentId) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      })
      return
    }

    const result = await examService.getExamResults(studentExamId, studentId)
    logger.info(`Results retrieved: ${studentExamId}`)

    res.json({
      success: true,
      data: result
    })
  } catch (error: any) {
    logger.error('Failed to get exam results:', error)

    if (error.code === 'NOT_FOUND') {
      res.status(404).json({
        success: false,
        error: { code: 'RESULTS_NOT_FOUND', message: error.message }
      })
      return
    }

    if (error.code === 'FORBIDDEN') {
      res.status(403).json({
        success: false,
        error: { code: 'ACCESS_DENIED', message: error.message }
      })
      return
    }

    res.status(400).json({
      success: false,
      error: { code: 'GET_RESULTS_FAILED', message: error.message }
    })
  }
}

// ==========================================
// GET EXAM RESULT PDF - NEW (Not Implemented)
// ==========================================
export async function getExamResultAsPdf(req: Request, res: Response): Promise<void> {
  try {
    const { studentExamId } = req.params;
    const studentId = (req as any).user?.id;

    if (!studentId) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      });
      return;
    }

    // As per the analysis, PDF generation is not implemented in the service layer.
    // This endpoint is a placeholder to satisfy the frontend's API contract.
    logger.warn(`PDF generation not implemented for studentExamId: ${studentExamId}.`);
    res.status(501).json({
        success: false,
        error: {
            code: 'NOT_IMPLEMENTED',
            message: 'PDF export functionality is not yet available.'
        }
    });

  } catch (error: any) {
    logger.error('Error in getExamResultAsPdf placeholder:', error);
    res.status(500).json({
      success: false,
      error: { code: 'PDF_GENERATION_FAILED', message: 'An unexpected error occurred.' }
    });
  }
}

// ==========================================
// RETAKE EXAM - FIXED: Now uses examId as per frontend call
// ==========================================
export async function retakeExam(req: Request, res: Response): Promise<void> {
  try {
    // FIXED: Changed to use examId from params to match frontend API call
    const { examId } = req.params
    const studentId = (req as any).user?.id

    if (!studentId) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      })
      return
    }

    // To bridge the frontend sending examId and the service expecting studentExamId,
    // we find the last submitted attempt for this exam.
    const lastAttempt = await (req as any).prisma.studentExam.findFirst({
      where: {
        examId: examId,
        studentId: studentId,
        status: 'SUBMITTED'
      },
      orderBy: {
        submittedAt: 'desc'
      },
      select: { id: true }
    })

    if (!lastAttempt) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NO_PREVIOUS_ATTEMPT',
          message: 'Cannot retake an exam that has not been completed before.'
        }
      })
      return
    }

    const result = await examService.retakeExam(lastAttempt.id, studentId)
    logger.info(
      `Exam retake initiated for studentExamId: ${lastAttempt.id} (from examId: ${examId})`
    )

    res.json({
      success: true,
      data: result
    })
  } catch (error: any) {
    logger.error('Failed to retake exam:', error)

    if (error.code === 'NOT_FOUND') {
      res.status(404).json({
        success: false,
        error: { code: 'EXAM_NOT_FOUND', message: error.message }
      })
      return
    }

    if (error.code === 'FORBIDDEN') {
      res.status(403).json({
        success: false,
        error: { code: 'RETAKE_NOT_ALLOWED', message: error.message }
      })
      return
    }

    res.status(400).json({
      success: false,
      error: { code: 'RETAKE_FAILED', message: error.message }
    })
  }
}

// ==========================================
// CREATE EXAM (Admin)
// ==========================================
export async function createExam(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      })
      return
    }

    const result = await examService.createExam(req.body, userId)
    logger.info(`Exam created: ${result.id}`)

    res.status(201).json({
      success: true,
      data: result
    })
  } catch (error: any) {
    logger.error('Failed to create exam:', error)

    if (error.code === 'FORBIDDEN') {
      res.status(403).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: error.message }
      })
      return
    }

    res.status(400).json({
      success: false,
      error: { code: 'CREATE_EXAM_FAILED', message: error.message }
    })
  }
}

// ==========================================
// GET EXAM STATISTICS (Admin)
// ==========================================
export async function getExamStatistics(req: Request, res: Response): Promise<void> {
  try {
    const { examId } = req.params
    const userId = (req as any).user?.id

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      })
      return
    }

    const result = await examService.getExamStatistics(examId)
    logger.info(`Statistics retrieved for exam: ${examId}`)

    res.json({
      success: true,
      data: result
    })
  } catch (error: any) {
    logger.error('Failed to get exam statistics:', error)

    if (error.code === 'NOT_FOUND') {
      res.status(404).json({
        success: false,
        error: { code: 'EXAM_NOT_FOUND', message: error.message }
      })
      return
    }

    res.status(400).json({
      success: false,
      error: { code: 'GET_STATISTICS_FAILED', message: error.message }
    })
  }
}

// ==========================================
// GET ALL EXAMS (Student)
// ==========================================
export async function getAllExams(req: Request, res: Response): Promise<void> {
  try {
    const studentId = (req as any).user?.id

    if (!studentId) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      })
      return
    }

    const exams = await (req as any).prisma.exam.findMany({
      where: { isPublished: true, isActive: true },
      select: {
        id: true,
        title: true,
        description: true,
        duration: true,
        totalQuestions: true,
        totalMarks: true,
        passMarks: true,
        allowReview: true,
        allowRetake: true,
        createdAt: true
      }
    })

    logger.info(`Exams retrieved for student ${studentId}`)

    res.json({
      success: true,
      data: { exams }
    })
  } catch (error: any) {
    logger.error('Failed to get exams:', error)
    res.status(400).json({
      success: false,
      error: { code: 'GET_EXAMS_FAILED', message: error.message }
    })
  }
}

// ==========================================
// START PRACTICE EXAM - FIXED & STANDARDIZED
// ==========================================
export async function startPracticeExam(req: Request, res: Response): Promise<void> {
  try {
    const studentId = (req as any).user?.id
    const { subject, examType, difficulty, questionCount, duration } = req.body

    if (!studentId) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      })
      return
    }

    if (!subject || !examType) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_REQUEST', message: 'Missing subject or examType' }
      })
      return
    }

    // Get questions for practice exam
    const questionsRaw = await (req as any).prisma.question.findMany({
      where: {
        subject: { name: subject },
        examType,
        ...(difficulty && difficulty !== 'all' && { difficulty }),
        isActive: true
      },
      take: questionCount || 40,
      include: {
        subject: { select: { name: true } }
      }
    })

    if (questionsRaw.length === 0) {
      res.status(404).json({
        success: false,
        error: { code: 'NO_QUESTIONS', message: 'No questions found for this criteria' }
      })
      return
    }

    // FIXED: Normalize questions to match startExam format exactly
    const questions = questionsRaw.map((q: any) => {
      const optionsObj = q.options as any || {}
      return {
        id: q.id,
        questionText: q.questionText,
        questionType: q.questionType,
        options: [
          { label: 'A', text: optionsObj.A?.text || '' },
          { label: 'B', text: optionsObj.B?.text || '' },
          { label: 'C', text: optionsObj.C?.text || '' },
          { label: 'D', text: optionsObj.D?.text || '' }
        ],
        subject: q.subject?.name || subject,
        difficulty: q.difficulty
      }
    })

    // Create practice exam session
    const durationSeconds = (duration || 60) * 60
    const studentExam = await (req as any).prisma.studentExam.create({
      data: {
        examId: 'practice',
        studentId,
        status: 'IN_PROGRESS',
        startedAt: new Date(),
        totalQuestions: questions.length,
        questionOrder: questions.map((q: any) => q.id),
        timeRemaining: durationSeconds,
        isPractice: true
      }
    })

    logger.info(`Practice exam started: ${studentExam.id}`)

    // FIXED: Return response matching startExam format EXACTLY
    res.json({
      success: true,
      data: {
        studentExamId: studentExam.id,
        examId: 'practice',
        examTitle: `${subject} Practice Exam`,
        duration: duration || 60,
        totalQuestions: questions.length,
        totalMarks: questions.length,  // Each question = 1 mark
        startedAt: studentExam.startedAt,
        timeRemaining: durationSeconds,
        questions,
        allowReview: true,
        allowRetake: true
      }
    })
  } catch (error: any) {
    logger.error('Failed to start practice exam:', error)
    res.status(400).json({
      success: false,
      error: { code: 'START_PRACTICE_FAILED', message: error.message }
    })
  }
}

// ==========================================
// SUBMIT ANSWER (Alternative endpoint)
// ==========================================
export async function submitAnswer(req: Request, res: Response): Promise<void> {
  // This is an alias for saveAnswer to maintain compatibility
  return saveAnswer(req, res)
}

// ==========================================
// GET RESULTS (Alternative endpoint)
// ==========================================
export async function getResults(req: Request, res: Response): Promise<void> {
  // This is an alias for getExamResults to maintain compatibility
  return getExamResults(req, res)
}

// ==========================================
// GET REVIEW QUESTIONS - ENHANCED
// ==========================================
export async function getDetailedReviewQuestions(req: Request, res: Response): Promise<void> {
  try {
    const { studentExamId } = req.params
    const studentId = (req as any).user?.id

    if (!studentId) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      })
      return
    }

    const result = await examService.getDetailedReviewQuestions(studentExamId, studentId)
    logger.info(`Detailed review questions retrieved: ${studentExamId}`)

    res.json({
      success: true,
      data: result
    })
  } catch (error: any) {
    logger.error('Failed to get detailed review questions:', error)
    res.status(400).json({
      success: false,
      error: { code: 'GET_REVIEW_FAILED', message: error.message }
    })
  }
}

// ==========================================
// GET QUESTION PERFORMANCE ANALYSIS
// ==========================================
export async function getQuestionPerformanceAnalysis(req: Request, res: Response): Promise<void> {
  try {
    const { studentExamId } = req.params
    const studentId = (req as any).user?.id

    if (!studentId) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      })
      return
    }

    const analysis = await examService.getQuestionPerformanceAnalysis(studentExamId, studentId)
    logger.info(`Performance analysis retrieved: ${studentExamId}`)

    res.json({
      success: true,
      data: { analysis }
    })
  } catch (error: any) {
    logger.error('Failed to get performance analysis:', error)
    res.status(400).json({
      success: false,
      error: { code: 'GET_ANALYSIS_FAILED', message: error.message }
    })
  }
}

// ==========================================
// EXAM SCHEDULING ENDPOINTS
// ==========================================

// GET AVAILABLE EXAMS (with scheduling)
export async function getAvailableExams(req: Request, res: Response): Promise<void> {
  try {
    const studentId = (req as any).user?.id

    if (!studentId) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      })
      return
    }

    const exams = await examService.getAvailableExams(studentId)
    logger.info(`Available exams retrieved for student ${studentId}`)

    res.json({
      success: true,
      data: { exams }
    })
  } catch (error: any) {
    logger.error('Failed to get available exams:', error)
    res.status(400).json({
      success: false,
      error: { code: 'GET_AVAILABLE_EXAMS_FAILED', message: error.message }
    })
  }
}

// SCHEDULE EXAM (Admin)
export async function scheduleExam(req: Request, res: Response): Promise<void> {
  try {
    const { examId } = req.params
    const userId = (req as any).user?.id
    const { startsAt, endsAt, autoActivate, autoDeactivate } = req.body

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      })
      return
    }

    // Check admin role
    const user = (req as any).user
    if (!['ADMIN', 'TEACHER'].includes(user.role)) {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Admin or teacher role required' }
      })
      return
    }

    const scheduleData = {
      startsAt: startsAt ? new Date(startsAt) : undefined,
      endsAt: endsAt ? new Date(endsAt) : undefined,
      autoActivate,
      autoDeactivate
    }

    const result = await examService.scheduleExam(examId, scheduleData, userId)
    logger.info(`Exam scheduled: ${examId} by user ${userId}`)

    res.json({
      success: true,
      data: result
    })
  } catch (error: any) {
    logger.error('Failed to schedule exam:', error)

    if (error.code === 'NOT_FOUND') {
      res.status(404).json({
        success: false,
        error: { code: 'EXAM_NOT_FOUND', message: error.message }
      })
      return
    }

    if (error.code === 'BAD_REQUEST') {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_SCHEDULE', message: error.message }
      })
      return
    }

    res.status(400).json({
      success: false,
      error: { code: 'SCHEDULE_EXAM_FAILED', message: error.message }
    })
  }
}

// GET SCHEDULED EXAMS (Admin)
export async function getScheduledExams(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      })
      return
    }

    // Check admin role
    const user = (req as any).user
    if (!['ADMIN', 'TEACHER'].includes(user.role)) {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Admin or teacher role required' }
      })
      return
    }

    const exams = await examService.getScheduledExams()
    logger.info(`Scheduled exams retrieved by user ${userId}`)

    res.json({
      success: true,
      data: { exams }
    })
  } catch (error: any) {
    logger.error('Failed to get scheduled exams:', error)
    res.status(400).json({
      success: false,
      error: { code: 'GET_SCHEDULED_EXAMS_FAILED', message: error.message }
    })
  }
}

// CHECK EXAM AVAILABILITY
export async function checkExamAvailability(req: Request, res: Response): Promise<void> {
  try {
    const { examId } = req.params

    const availability = await examService.isExamAvailable(examId)
    logger.info(`Exam availability checked: ${examId}`)

    res.json({
      success: true,
      data: availability
    })
  } catch (error: any) {
    logger.error('Failed to check exam availability:', error)
    res.status(400).json({
      success: false,
      error: { code: 'CHECK_AVAILABILITY_FAILED', message: error.message }
    })
  }
}

// PROCESS EXAM SCHEDULING (Internal/Cron)
export async function processExamScheduling(req: Request, res: Response): Promise<void> {
  try {
    const result = await examService.processExamScheduling()
    logger.info('Exam scheduling processed', result)

    res.json({
      success: true,
      data: result
    })
  } catch (error: any) {
    logger.error('Failed to process exam scheduling:', error)
    res.status(500).json({
      success: false,
      error: { code: 'PROCESS_SCHEDULING_FAILED', message: error.message }
    })
  }
}