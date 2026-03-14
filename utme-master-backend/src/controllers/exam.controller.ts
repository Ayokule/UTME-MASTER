// ==========================================
// EXAM CONTROLLER - Phase 3
// ==========================================
// HTTP handlers for exam endpoints

import { Request, Response } from 'express'
import * as examService from '../services/exam.service'
import { asyncHandler } from '../middleware/error.middleware'
import { prisma } from '../config/database'

// ==========================================
// CREATE EXAM (Admin/Teacher)
// ==========================================
// POST /api/exams
export const createExam = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id
  
  const exam = await examService.createExam(req.body, userId)
  
  res.status(201).json({
    success: true,
    message: 'Exam created successfully',
    data: { exam }
  })
})

// ==========================================
// GET ALL EXAMS
// ==========================================
// GET /api/exams
export const getAllExams = asyncHandler(async (req: Request, res: Response) => {
  // For students: only published exams
  // For admin/teacher: all exams
  
  const user = (req as any).user
  const isStudent = user.role === 'STUDENT'
  
  const where: any = { isActive: true }
  
  if (isStudent) {
    where.isPublished = true
    // Also check scheduling
    where.OR = [
      { startsAt: null },
      { startsAt: { lte: new Date() } }
    ]
  }
  
  const exams = await prisma.exam.findMany({
    where,
    include: {
      _count: {
        select: {
          examQuestions: true,
          studentExams: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
  
  res.json({
    success: true,
    data: { exams }
  })
})

// ==========================================
// START EXAM (Student)
// ==========================================
// POST /api/exams/:id/start
export const startExam = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const studentId = (req as any).user.id
  
  const examData = await examService.startExam(id, studentId)
  
  res.json({
    success: true,
    data: examData
  })
})
// ==========================================
// START PRACTICE EXAM (Student)
// ==========================================
// POST /api/exams/practice/start
// Generate and start a practice exam based on subject and type
export const startPracticeExam = asyncHandler(async (req: Request, res: Response) => {
  const studentId = (req as any).user.id
  const { subject, examType, difficulty, questionCount, duration } = req.body

  console.log('Practice exam request:', {
    studentId,
    subject,
    examType,
    difficulty,
    questionCount,
    duration
  })

  try {
    const examData = await examService.startPracticeExam({
      studentId,
      subject,
      examType: examType || 'practice',
      difficulty,
      questionCount: questionCount || 40,
      duration: duration || 60
    })

    console.log('Practice exam created successfully:', examData.studentExamId)

    res.json({
      success: true,
      data: examData
    })
  } catch (error: any) {
    console.error('Practice exam creation failed:', error)
    throw error
  }
})
// ==========================================
// RESUME EXAM (Student)
// ==========================================
// GET /api/exams/resume/:studentExamId
export const resumeExam = asyncHandler(async (req: Request, res: Response) => {
  const { studentExamId } = req.params
  const studentId = (req as any).user.id

  const examData = await examService.resumeExam(studentExamId, studentId)

  res.json({
    success: true,
    data: examData
  })
})

// ==========================================
// SUBMIT ANSWER
// ==========================================
// POST /api/exams/:studentExamId/answers
export const submitAnswer = asyncHandler(async (req: Request, res: Response) => {
  const { studentExamId } = req.params
  const { questionId, answer, timeSpent } = req.body
  
  const result = await examService.submitAnswer(
    studentExamId,
    questionId,
    answer,
    timeSpent || 0
  )
  
  res.json({
    success: true,
    data: result
  })
})

// ==========================================
// SUBMIT EXAM
// ==========================================
// POST /api/exams/:studentExamId/submit
export const submitExam = asyncHandler(async (req: Request, res: Response) => {
  const { studentExamId } = req.params
  const { autoSubmit } = req.body
  
  const results = await examService.submitExam(studentExamId, autoSubmit || false)
  
  res.json({
    success: true,
    message: 'Exam submitted successfully',
    data: results
  })
})

// ==========================================
// GET RESULTS
// ==========================================
// GET /api/exams/results/:studentExamId
export const getResults = asyncHandler(async (req: Request, res: Response) => {
  const { studentExamId } = req.params
  const userId = (req as any).user.id
  
  const studentExam = await prisma.studentExam.findUnique({
    where: { id: studentExamId },
    include: { exam: true }
  })
  
  if (!studentExam) {
    return res.status(404).json({
      success: false,
      error: { message: 'Exam attempt not found' }
    })
  }
  
  // Verify access
  if (studentExam.studentId !== userId) {
    return res.status(403).json({
      success: false,
      error: { message: 'Access denied' }
    })
  }
  
  return res.json({
    success: true,
    data: {
      studentExamId: studentExam.id,
      examTitle: studentExam.exam.title,
      totalQuestions: studentExam.totalQuestions,
      answeredQuestions: studentExam.answeredQuestions,
      correctAnswers: studentExam.correctAnswers,
      wrongAnswers: studentExam.wrongAnswers,
      score: studentExam.score,
      totalMarks: studentExam.exam.totalMarks,
      scorePercentage: ((studentExam.score / studentExam.exam.totalMarks) * 100).toFixed(2),
      passed: studentExam.passed,
      grade: studentExam.grade,
      passMarks: studentExam.exam.passMarks,
      autoSubmitted: studentExam.autoSubmitted,
      submittedAt: studentExam.submittedAt
    }
  })
})

// ==========================================
// GET REVIEW QUESTIONS
// ==========================================
// GET /api/exams/results/:studentExamId/review
export const getReviewQuestions = asyncHandler(async (req: Request, res: Response) => {
  const { studentExamId } = req.params
  const userId = (req as any).user.id
  
  const studentExam = await prisma.studentExam.findUnique({
    where: { id: studentExamId },
    include: {
      exam: true,
      answers: {
        include: {
          question: {
            include: {
              subject: true
            }
          }
        }
      }
    }
  })
  
  if (!studentExam) {
    return res.status(404).json({
      success: false,
      error: { message: 'Exam not found' }
    })
  }
  
  if (studentExam.studentId !== userId) {
    return res.status(403).json({
      success: false,
      error: { message: 'Access denied' }
    })
  }
  
  if (!studentExam.exam.allowReview) {
    return res.status(403).json({
      success: false,
      error: { message: 'Review not allowed for this exam' }
    })
  }
  
  const questions = studentExam.answers.map(answer => ({
    id: answer.question.id,
    questionText: answer.question.questionText,
    subject: answer.question.subject.name,
    options: answer.question.options,
    studentAnswer: answer.answer,
    isCorrect: answer.isCorrect,
    explanation: answer.question.explanation
  }))
  
  return res.json({
    success: true,
    data: { questions }
  })
})
