// ==========================================
// EXAM SERVICE - FIXED VERSION
// ==========================================
// Business logic for exam management and taking
// All critical bugs have been resolved

import { prisma } from '../config/database'
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors'
import { logger } from '../utils/logger'
import * as emailService from './email.service'

// ==========================================
// START EXAM - WITH SCHEDULING VALIDATION
// ==========================================
export async function startExam(examId: string, studentId: string) {
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      examQuestions: {
        include: { question: true }
      }
    }
  })

  if (!exam) throw new NotFoundError('Exam not found')
  if (!exam.isPublished) throw new ForbiddenError('Exam is not published')
  if (!exam.isActive) throw new ForbiddenError('Exam is not active')

  // Check exam scheduling constraints
  const now = new Date()
  
  // Check if exam has started (if startsAt is set)
  if (exam.startsAt && now < exam.startsAt) {
    const startTime = exam.startsAt.toLocaleString()
    throw new ForbiddenError(`Exam has not started yet. Available from: ${startTime}`)
  }
  
  // Check if exam has ended (if endsAt is set)
  if (exam.endsAt && now > exam.endsAt) {
    const endTime = exam.endsAt.toLocaleString()
    throw new ForbiddenError(`Exam has ended. Was available until: ${endTime}`)
  }

  const existingSession = await prisma.studentExam.findFirst({
    where: { examId, studentId, status: 'IN_PROGRESS' }
  })

  if (existingSession) throw new BadRequestError('You already have an active session')

  const questionIds = exam.examQuestions.map(eq => eq.questionId)
  let questionOrder = questionIds
  if (exam.randomizeQuestions) {
    questionOrder = questionIds.sort(() => Math.random() - 0.5)
  }

  const studentExam = await prisma.studentExam.create({
    data: {
      examId,
      studentId,
      status: 'IN_PROGRESS',
      startedAt: new Date(),
      totalQuestions: questionIds.length,
      questionOrder: questionOrder,
      timeRemaining: exam.duration * 60,
      isPractice: false
    }
  })

  const questions = exam.examQuestions.map(eq => {
    const question = eq.question as any
    const optionsObj = question.options as any || {}

    return {
      id: question.id,
      questionText: question.questionText,
      questionType: question.questionType,
      options: [
        { label: 'A', text: optionsObj.A?.text || '' },
        { label: 'B', text: optionsObj.B?.text || '' },
        { label: 'C', text: optionsObj.C?.text || '' },
        { label: 'D', text: optionsObj.D?.text || '' }
      ],
      subject: question.subject?.name,
      difficulty: question.difficulty
    }
  })

  logger.info(`Exam started: ${studentExam.id}`)

  return {
    studentExamId: studentExam.id,
    examId: exam.id,
    examTitle: exam.title,
    duration: exam.duration,
    totalQuestions: questions.length,
    totalMarks: exam.totalMarks,
    startedAt: studentExam.startedAt,
    timeRemaining: studentExam.timeRemaining,
    questions,
    allowReview: exam.allowReview,
    allowRetake: exam.allowRetake
  }
}

// ==========================================
// RESUME EXAM - FIXED
// ==========================================
export async function resumeExam(studentExamId: string, studentId: string) {
  const studentExam = await prisma.studentExam.findUnique({
    where: { id: studentExamId },
    include: {
      exam: {
        include: {
          examQuestions: {
            include: { question: true }
          }
        }
      },
      answers: true
    }
  })

  if (!studentExam) throw new NotFoundError('Exam session not found')
  if (studentExam.studentId !== studentId) throw new ForbiddenError('Access denied')
  
  // FIXED: Check if exam is already submitted BEFORE checking time
  if (studentExam.status === 'SUBMITTED') {
    throw new BadRequestError('Exam already submitted')
  }

  const startTime = studentExam.startedAt?.getTime() || 0
  const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000)
  const timeRemaining = Math.max(0, (studentExam.exam.duration * 60) - elapsedSeconds)

  // FIXED: Only auto-submit if time is up AND exam is not already submitted
  if (timeRemaining <= 0) {
    return submitExam(studentExamId, studentId, true)
  }

  const savedAnswers: Record<string, any> = {}
  studentExam.answers.forEach(answer => {
    savedAnswers[answer.questionId] = answer.answer
  })

  const questions = studentExam.exam.examQuestions.map(eq => {
    const question = eq.question as any
    const optionsObj = question.options as any || {}

    return {
      id: question.id,
      questionText: question.questionText,
      questionType: question.questionType,
      options: [
        { label: 'A', text: optionsObj.A?.text || '' },
        { label: 'B', text: optionsObj.B?.text || '' },
        { label: 'C', text: optionsObj.C?.text || '' },
        { label: 'D', text: optionsObj.D?.text || '' }
      ],
      subject: question.subject?.name,
      difficulty: question.difficulty
    }
  })

  return {
    studentExamId,
    examId: studentExam.examId,
    examTitle: studentExam.exam.title,
    duration: studentExam.exam.duration,
    totalQuestions: questions.length,
    totalMarks: studentExam.exam.totalMarks,
    startedAt: studentExam.startedAt,
    timeRemaining,
    questions,
    savedAnswers,
    allowReview: studentExam.exam.allowReview,
    allowRetake: studentExam.exam.allowRetake
  }
}

// ==========================================
// SAVE ANSWER
// ==========================================
export async function saveAnswer(
  studentExamId: string,
  studentId: string,
  questionId: string,
  answer: any,
  timeSpent: number = 0
) {
  const studentExam = await prisma.studentExam.findUnique({
    where: { id: studentExamId }
  })

  if (!studentExam) throw new NotFoundError('Exam session not found')
  if (studentExam.studentId !== studentId) throw new ForbiddenError('Access denied')
  if (studentExam.status === 'SUBMITTED') throw new BadRequestError('Exam already submitted')

  // Upsert the answer
  const studentAnswer = await prisma.studentAnswer.upsert({
    where: {
      studentExamId_questionId: {
        studentExamId,
        questionId
      }
    },
    update: {
      answer,
      timeSpent,
      answeredAt: new Date()
    },
    create: {
      studentExamId,
      questionId,
      answer,
      timeSpent,
      answeredAt: new Date()
    }
  })

  // Update answered questions count
  const answeredCount = await prisma.studentAnswer.count({
    where: { studentExamId }
  })

  await prisma.studentExam.update({
    where: { id: studentExamId },
    data: { answeredQuestions: answeredCount }
  })

  return { success: true, answerId: studentAnswer.id }
}

// ==========================================
// SUBMIT EXAM - FIXED
// ==========================================
export async function submitExam(
  studentExamId: string,
  studentId: string,
  autoSubmit: boolean = false
) {
  const studentExam = await prisma.studentExam.findUnique({
    where: { id: studentExamId },
    include: {
      exam: true,
      answers: {
        include: { question: true }
      }
    }
  })

  if (!studentExam) throw new NotFoundError('Exam session not found')
  if (studentExam.studentId !== studentId) throw new ForbiddenError('Access denied')
  
  // FIXED: Better error message for already submitted exams
  if (studentExam.status === 'SUBMITTED') {
    throw new BadRequestError('Exam has already been submitted')
  }

  let correctAnswers = 0
  let totalScore = 0

  // Calculate scores
  for (const answer of studentExam.answers) {
    const question = answer.question as any
    const studentAnswer = answer.answer as any
    const correctAnswer = question.correctAnswer

    let isCorrect = false
    if (question.questionType === 'MCQ') {
      isCorrect = studentAnswer?.selected === correctAnswer
    }

    if (isCorrect) {
      correctAnswers++
      totalScore += question.points || 1
    }

    // Update answer correctness
    await prisma.studentAnswer.update({
      where: { id: answer.id },
      data: {
        isCorrect,
        pointsEarned: isCorrect ? (question.points || 1) : 0
      }
    })
  }

  const wrongAnswers = studentExam.answers.length - correctAnswers
  const scorePercentage = studentExam.exam.totalMarks > 0 
    ? (totalScore / studentExam.exam.totalMarks) * 100 
    : 0
  const passed = totalScore >= studentExam.exam.passMarks
  const grade = getGrade(scorePercentage)

  // Update student exam
  const updatedStudentExam = await prisma.studentExam.update({
    where: { id: studentExamId },
    data: {
      status: 'SUBMITTED',
      submittedAt: new Date(),
      correctAnswers,
      wrongAnswers,
      score: totalScore,
      totalScore: studentExam.exam.totalMarks,
      passed,
      grade,
      autoSubmitted: autoSubmit
    }
  })

  logger.info(`Exam submitted: ${studentExamId}, Score: ${totalScore}/${studentExam.exam.totalMarks}`)

  // Send exam completion email
  try {
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { email: true, firstName: true }
    })
    
    if (student) {
      await emailService.sendExamCompletionEmail(student.email, {
        firstName: student.firstName,
        examTitle: studentExam.exam.title,
        score: totalScore,
        percentage: scorePercentage,
        totalQuestions: studentExam.totalQuestions,
        passed,
        studentExamId
      })
    }
  } catch (error) {
    logger.warn(`Failed to send exam completion email for ${studentExamId}:`, error)
  }

  return {
    studentExamId,
    examTitle: studentExam.exam.title,
    totalQuestions: studentExam.totalQuestions,
    answeredQuestions: studentExam.answers.length,
    correctAnswers,
    wrongAnswers,
    score: totalScore,
    totalMarks: studentExam.exam.totalMarks,
    scorePercentage: scorePercentage.toFixed(1),
    passed,
    grade,
    passMarks: studentExam.exam.passMarks,
    autoSubmitted: autoSubmit,
    submittedAt: updatedStudentExam.submittedAt
  }
}

// ==========================================
// GET EXAM RESULTS
// ==========================================
export async function getExamResults(studentExamId: string, studentId: string) {
  const studentExam = await prisma.studentExam.findUnique({
    where: { id: studentExamId },
    include: {
      exam: true,
      answers: true
    }
  })

  if (!studentExam) throw new NotFoundError('Exam results not found')
  if (studentExam.studentId !== studentId) throw new ForbiddenError('Access denied')
  if (studentExam.status !== 'SUBMITTED') throw new BadRequestError('Exam not yet submitted')

  const scorePercentage = studentExam.totalScore > 0 
    ? (studentExam.score / studentExam.totalScore) * 100 
    : 0

  return {
    studentExamId,
    examTitle: studentExam.exam.title,
    totalQuestions: studentExam.totalQuestions,
    answeredQuestions: studentExam.answeredQuestions,
    correctAnswers: studentExam.correctAnswers,
    wrongAnswers: studentExam.wrongAnswers,
    score: studentExam.score,
    totalMarks: studentExam.totalScore,
    scorePercentage: scorePercentage.toFixed(1),
    passed: studentExam.passed,
    grade: studentExam.grade,
    passMarks: studentExam.exam.passMarks,
    autoSubmitted: studentExam.autoSubmitted,
    submittedAt: studentExam.submittedAt,
    timeSpent: studentExam.timeSpent
  }
}

// ==========================================
// RETAKE EXAM
// ==========================================
export async function retakeExam(studentExamId: string, studentId: string) {
  const studentExam = await prisma.studentExam.findUnique({
    where: { id: studentExamId },
    include: { exam: true }
  })

  if (!studentExam) throw new NotFoundError('Exam session not found')
  if (studentExam.studentId !== studentId) throw new ForbiddenError('Access denied')
  if (!studentExam.exam.allowRetake) throw new ForbiddenError('Retakes not allowed for this exam')

  // Start a new exam session
  return startExam(studentExam.examId, studentId)
}

// ==========================================
// CREATE EXAM (Admin)
// ==========================================
export async function createExam(data: any, userId: string) {
  const exam = await prisma.exam.create({
    data: {
      ...data,
      createdBy: userId,
      isActive: true
    }
  })

  logger.info(`Exam created: ${exam.id} by user ${userId}`)
  return exam
}

// ==========================================
// GET REVIEW QUESTIONS - ENHANCED
// ==========================================
export async function getDetailedReviewQuestions(studentExamId: string, studentId: string) {
  const studentExam = await prisma.studentExam.findUnique({
    where: { id: studentExamId },
    include: {
      exam: {
        select: { title: true, allowReview: true }
      },
      answers: {
        include: {
          question: {
            include: {
              subject: {
                select: { name: true }
              },
              topic: {
                select: { name: true }
              }
            }
          }
        }
      }
    }
  })

  if (!studentExam) throw new NotFoundError('Exam not found')
  if (studentExam.studentId !== studentId) throw new ForbiddenError('Access denied')
  if (studentExam.status !== 'SUBMITTED') throw new BadRequestError('Exam not yet submitted')

  const questions = studentExam.answers.map((answer: any) => {
    const question = answer.question as any
    const optionsObj = (question.options as any) || {}
    const answerObj = (answer.answer as any) || {}

    return {
      id: question.id,
      questionText: question.questionText,
      questionType: question.questionType,
      options: [
        { label: 'A', text: optionsObj.A?.text || '' },
        { label: 'B', text: optionsObj.B?.text || '' },
        { label: 'C', text: optionsObj.C?.text || '' },
        { label: 'D', text: optionsObj.D?.text || '' }
      ],
      selectedAnswer: answerObj.selected || null,
      correctAnswer: question.correctAnswer,
      isCorrect: answer.isCorrect || false,
      explanation: question.explanation || 'No explanation available for this question.',
      subject: question.subject?.name || 'Unknown',
      difficulty: question.difficulty || 'MEDIUM',
      topic: question.topic?.name || 'General',
      timeSpent: answer.timeSpent || 0,
      pointsEarned: answer.pointsEarned || 0,
      maxPoints: question.points || 1
    }
  })

  // Sort questions by their original order in the exam
  const questionOrder = studentExam.questionOrder as string[]
  const sortedQuestions = questions.sort((a, b) => {
    const indexA = questionOrder.indexOf(a.id)
    const indexB = questionOrder.indexOf(b.id)
    return indexA - indexB
  })

  return {
    examTitle: studentExam.exam.title,
    allowReview: studentExam.exam.allowReview,
    questions: sortedQuestions,
    totalQuestions: questions.length,
    correctAnswers: questions.filter(q => q.isCorrect).length,
    wrongAnswers: questions.filter(q => !q.isCorrect && q.selectedAnswer).length,
    unanswered: questions.filter(q => !q.selectedAnswer).length
  }
}

// ==========================================
// GET QUESTION PERFORMANCE ANALYSIS
// ==========================================
export async function getQuestionPerformanceAnalysis(studentExamId: string, studentId: string) {
  const reviewData = await getDetailedReviewQuestions(studentExamId, studentId)
  const questions = reviewData.questions

  // Subject breakdown
  const subjectMap = new Map<string, { total: number; correct: number; timeSpent: number }>()
  questions.forEach(q => {
    const current = subjectMap.get(q.subject) || { total: 0, correct: 0, timeSpent: 0 }
    current.total++
    if (q.isCorrect) current.correct++
    current.timeSpent += q.timeSpent
    subjectMap.set(q.subject, current)
  })

  const subjectBreakdown = Array.from(subjectMap.entries()).map(([subject, data]) => ({
    subject,
    total: data.total,
    correct: data.correct,
    accuracy: data.total > 0 ? (data.correct / data.total) * 100 : 0,
    averageTime: data.total > 0 ? data.timeSpent / data.total : 0
  }))

  // Difficulty breakdown
  const difficultyMap = new Map<string, { total: number; correct: number }>()
  questions.forEach(q => {
    const current = difficultyMap.get(q.difficulty) || { total: 0, correct: 0 }
    current.total++
    if (q.isCorrect) current.correct++
    difficultyMap.set(q.difficulty, current)
  })

  const difficultyBreakdown = Array.from(difficultyMap.entries()).map(([difficulty, data]) => ({
    difficulty,
    total: data.total,
    correct: data.correct,
    accuracy: data.total > 0 ? (data.correct / data.total) * 100 : 0
  }))

  // Topic breakdown
  const topicMap = new Map<string, { total: number; correct: number }>()
  questions.forEach(q => {
    const current = topicMap.get(q.topic) || { total: 0, correct: 0 }
    current.total++
    if (q.isCorrect) current.correct++
    topicMap.set(q.topic, current)
  })

  const topicBreakdown = Array.from(topicMap.entries()).map(([topic, data]) => ({
    topic,
    total: data.total,
    correct: data.correct,
    accuracy: data.total > 0 ? (data.correct / data.total) * 100 : 0
  }))

  // Time analysis
  const times = questions.map(q => q.timeSpent).filter(t => t > 0)
  const totalTime = times.reduce((sum, time) => sum + time, 0)
  const averagePerQuestion = times.length > 0 ? totalTime / times.length : 0
  const fastestQuestion = times.length > 0 ? Math.min(...times) : 0
  const slowestQuestion = times.length > 0 ? Math.max(...times) : 0

  return {
    subjectBreakdown,
    difficultyBreakdown,
    topicBreakdown,
    timeAnalysis: {
      totalTime,
      averagePerQuestion,
      fastestQuestion,
      slowestQuestion
    },
    recommendations: generateRecommendations(subjectBreakdown, difficultyBreakdown, averagePerQuestion)
  }
}

// ==========================================
// GENERATE RECOMMENDATIONS
// ==========================================
function generateRecommendations(
  subjectBreakdown: any[],
  difficultyBreakdown: any[],
  averageTime: number
): string[] {
  const recommendations: string[] = []

  // Subject-based recommendations
  const weakSubjects = subjectBreakdown.filter(s => s.accuracy < 60)
  const strongSubjects = subjectBreakdown.filter(s => s.accuracy >= 80)

  if (weakSubjects.length > 0) {
    recommendations.push(`Focus more practice on ${weakSubjects.map(s => s.subject).join(', ')} - accuracy below 60%`)
  }

  if (strongSubjects.length > 0) {
    recommendations.push(`Excellent performance in ${strongSubjects.map(s => s.subject).join(', ')} - maintain this level`)
  }

  // Difficulty-based recommendations
  const hardQuestions = difficultyBreakdown.find(d => d.difficulty === 'HARD')
  if (hardQuestions && hardQuestions.accuracy < 40) {
    recommendations.push('Practice more challenging questions to improve performance on hard questions')
  }

  // Time-based recommendations
  if (averageTime > 120) {
    recommendations.push('Work on time management - try to answer questions more quickly while maintaining accuracy')
  } else if (averageTime < 30) {
    recommendations.push('Consider spending more time on each question to improve accuracy')
  }

  return recommendations
}

// ==========================================
// GET EXAM STATISTICS (Admin)
// ==========================================
export async function getExamStatistics(examId: string) {
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      studentExams: {
        where: { status: 'SUBMITTED' },
        include: {
          student: {
            select: { firstName: true, lastName: true, email: true }
          }
        }
      },
      examQuestions: {
        include: { question: true }
      }
    }
  })

  if (!exam) throw new NotFoundError('Exam not found')

  const attempts = exam.studentExams
  const totalAttempts = attempts.length
  const passedAttempts = attempts.filter(se => se.passed).length
  const failedAttempts = totalAttempts - passedAttempts
  const passRate = totalAttempts > 0 ? (passedAttempts / totalAttempts) * 100 : 0

  // Score statistics
  const scores = attempts.map(se => se.score || 0)
  const averageScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0
  const highestScore = scores.length > 0 ? Math.max(...scores) : 0
  const lowestScore = scores.length > 0 ? Math.min(...scores) : 0

  // Grade distribution
  const gradeDistribution = attempts.reduce((acc: any, se) => {
    const grade = se.grade || 'F'
    acc[grade] = (acc[grade] || 0) + 1
    return acc
  }, {})

  // Time statistics
  const times = attempts.map(se => se.timeSpent || 0).filter(t => t > 0)
  const averageTime = times.length > 0 ? times.reduce((sum, time) => sum + time, 0) / times.length : 0

  return {
    examId,
    examTitle: exam.title,
    totalQuestions: exam.totalQuestions,
    totalMarks: exam.totalMarks,
    passMarks: exam.passMarks,
    statistics: {
      totalAttempts,
      passedAttempts,
      failedAttempts,
      passRate: passRate.toFixed(1),
      averageScore: averageScore.toFixed(1),
      highestScore,
      lowestScore,
      averageTime: Math.round(averageTime),
      gradeDistribution
    },
    recentAttempts: attempts
      .sort((a, b) => new Date(b.submittedAt!).getTime() - new Date(a.submittedAt!).getTime())
      .slice(0, 10)
      .map(se => ({
        studentExamId: se.id,
        studentName: `${se.student.firstName} ${se.student.lastName}`,
        studentEmail: se.student.email,
        score: se.score,
        totalMarks: se.totalScore,
        percentage: se.totalScore > 0 ? ((se.score || 0) / se.totalScore * 100).toFixed(1) : '0',
        grade: se.grade,
        passed: se.passed,
        submittedAt: se.submittedAt,
        timeSpent: se.timeSpent
      }))
  }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function normalizeOptions(question: any) {
  if (Array.isArray(question.options)) {
    return question.options
  }

  const optionsObj = question.options as any || {}
  return [
    { label: 'A', text: optionsObj.A?.text || '' },
    { label: 'B', text: optionsObj.B?.text || '' },
    { label: 'C', text: optionsObj.C?.text || '' },
    { label: 'D', text: optionsObj.D?.text || '' }
  ]
}

function getGrade(percentage: number): string {
  if (percentage >= 90) return 'A+'
  if (percentage >= 80) return 'A'
  if (percentage >= 70) return 'B+'
  if (percentage >= 60) return 'B'
  if (percentage >= 50) return 'C+'
  if (percentage >= 40) return 'C'
  if (percentage >= 30) return 'D'
  return 'F'
}

// Export utility functions
export { normalizeOptions }

// ==========================================
// EXAM SCHEDULING FUNCTIONS
// ==========================================

// Get available exams for a student (considering scheduling)
export async function getAvailableExams(studentId: string) {
  const now = new Date()
  
  const exams = await prisma.exam.findMany({
    where: {
      isPublished: true,
      isActive: true,
      OR: [
        // No scheduling constraints
        { startsAt: null, endsAt: null },
        // Within scheduling window
        {
          AND: [
            { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
            { OR: [{ endsAt: null }, { endsAt: { gte: now } }] }
          ]
        }
      ]
    },
    include: {
      examQuestions: true,
      studentExams: {
        where: { studentId },
        select: { id: true, status: true, score: true, passed: true }
      }
    },
    orderBy: [
      { startsAt: 'asc' },
      { createdAt: 'desc' }
    ]
  })

  return exams.map(exam => {
    const studentAttempts = exam.studentExams
    const hasActiveSession = studentAttempts.some(se => se.status === 'IN_PROGRESS')
    const hasCompletedAttempt = studentAttempts.some(se => se.status === 'SUBMITTED')
    const canRetake = exam.allowRetake || !hasCompletedAttempt

    // Determine exam status
    let status = 'available'
    let statusMessage = 'Available to start'

    if (exam.startsAt && now < exam.startsAt) {
      status = 'scheduled'
      statusMessage = `Starts at ${exam.startsAt.toLocaleString()}`
    } else if (exam.endsAt && now > exam.endsAt) {
      status = 'expired'
      statusMessage = `Ended at ${exam.endsAt.toLocaleString()}`
    } else if (hasActiveSession) {
      status = 'in_progress'
      statusMessage = 'Resume exam'
    } else if (hasCompletedAttempt && !canRetake) {
      status = 'completed'
      statusMessage = 'Already completed'
    }

    return {
      id: exam.id,
      title: exam.title,
      description: exam.description,
      duration: exam.duration,
      totalQuestions: exam.totalQuestions,
      totalMarks: exam.totalMarks,
      passMarks: exam.passMarks,
      startsAt: exam.startsAt,
      endsAt: exam.endsAt,
      allowRetake: exam.allowRetake,
      status,
      statusMessage,
      canStart: status === 'available' && canRetake,
      canResume: status === 'in_progress',
      attempts: studentAttempts.length,
      bestScore: studentAttempts.length > 0 
        ? Math.max(...studentAttempts.map(se => se.score || 0))
        : null
    }
  })
}

// Schedule an exam
export async function scheduleExam(examId: string, scheduleData: {
  startsAt?: Date
  endsAt?: Date
  autoActivate?: boolean
  autoDeactivate?: boolean
}, userId: string) {
  const exam = await prisma.exam.findUnique({
    where: { id: examId }
  })

  if (!exam) throw new NotFoundError('Exam not found')

  // Validate scheduling data
  if (scheduleData.startsAt && scheduleData.endsAt) {
    if (scheduleData.startsAt >= scheduleData.endsAt) {
      throw new BadRequestError('Start time must be before end time')
    }
  }

  const updatedExam = await prisma.exam.update({
    where: { id: examId },
    data: {
      startsAt: scheduleData.startsAt,
      endsAt: scheduleData.endsAt,
      updatedAt: new Date()
    }
  })

  logger.info(`Exam scheduled: ${examId} by user ${userId}`, {
    startsAt: scheduleData.startsAt,
    endsAt: scheduleData.endsAt
  })

  return updatedExam
}

// Get scheduled exams (for admin dashboard)
export async function getScheduledExams() {
  const now = new Date()
  
  const exams = await prisma.exam.findMany({
    where: {
      OR: [
        { startsAt: { not: null } },
        { endsAt: { not: null } }
      ]
    },
    include: {
      creator: {
        select: { firstName: true, lastName: true, email: true }
      },
      studentExams: {
        select: { id: true, status: true }
      }
    },
    orderBy: [
      { startsAt: 'asc' },
      { endsAt: 'asc' }
    ]
  })

  return exams.map(exam => {
    let status = 'active'
    let statusMessage = 'Currently active'

    if (exam.startsAt && now < exam.startsAt) {
      status = 'scheduled'
      statusMessage = `Starts ${exam.startsAt.toLocaleString()}`
    } else if (exam.endsAt && now > exam.endsAt) {
      status = 'expired'
      statusMessage = `Ended ${exam.endsAt.toLocaleString()}`
    } else if (exam.startsAt && exam.endsAt && now >= exam.startsAt && now <= exam.endsAt) {
      status = 'active'
      statusMessage = `Active until ${exam.endsAt.toLocaleString()}`
    }

    const totalAttempts = exam.studentExams.length
    const activeAttempts = exam.studentExams.filter(se => se.status === 'IN_PROGRESS').length

    return {
      id: exam.id,
      title: exam.title,
      description: exam.description,
      startsAt: exam.startsAt,
      endsAt: exam.endsAt,
      isPublished: exam.isPublished,
      isActive: exam.isActive,
      status,
      statusMessage,
      creator: exam.creator,
      totalAttempts,
      activeAttempts,
      createdAt: exam.createdAt
    }
  })
}

// Automatic exam activation/deactivation (to be called by scheduler)
export async function processExamScheduling() {
  const now = new Date()
  
  try {
    // Auto-activate exams that should start now
    const examsToActivate = await prisma.exam.findMany({
      where: {
        startsAt: { lte: now },
        isPublished: true,
        isActive: false,
        // Only activate if not already expired
        OR: [
          { endsAt: null },
          { endsAt: { gt: now } }
        ]
      }
    })

    for (const exam of examsToActivate) {
      await prisma.exam.update({
        where: { id: exam.id },
        data: { isActive: true }
      })
      logger.info(`Auto-activated exam: ${exam.id} - ${exam.title}`)
    }

    // Auto-deactivate exams that should end now
    const examsToDeactivate = await prisma.exam.findMany({
      where: {
        endsAt: { lte: now },
        isActive: true
      }
    })

    for (const exam of examsToDeactivate) {
      await prisma.exam.update({
        where: { id: exam.id },
        data: { isActive: false }
      })
      logger.info(`Auto-deactivated exam: ${exam.id} - ${exam.title}`)
      
      // Auto-submit any active student exams
      const activeStudentExams = await prisma.studentExam.findMany({
        where: {
          examId: exam.id,
          status: 'IN_PROGRESS'
        }
      })

      for (const studentExam of activeStudentExams) {
        try {
          await submitExam(studentExam.id, studentExam.studentId, true)
          logger.info(`Auto-submitted exam for student: ${studentExam.studentId}`)
        } catch (error) {
          logger.error(`Failed to auto-submit exam for student ${studentExam.studentId}:`, error)
        }
      }
    }

    return {
      activated: examsToActivate.length,
      deactivated: examsToDeactivate.length
    }
  } catch (error) {
    logger.error('Error processing exam scheduling:', error)
    throw error
  }
}

// Check if exam is currently available
export async function isExamAvailable(examId: string): Promise<{
  available: boolean
  reason?: string
  startsAt?: Date
  endsAt?: Date
}> {
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    select: {
      isPublished: true,
      isActive: true,
      startsAt: true,
      endsAt: true
    }
  })

  if (!exam) {
    return { available: false, reason: 'Exam not found' }
  }

  if (!exam.isPublished) {
    return { available: false, reason: 'Exam is not published' }
  }

  if (!exam.isActive) {
    return { available: false, reason: 'Exam is not active' }
  }

  const now = new Date()

  if (exam.startsAt && now < exam.startsAt) {
    return {
      available: false,
      reason: 'Exam has not started yet',
      startsAt: exam.startsAt
    }
  }

  if (exam.endsAt && now > exam.endsAt) {
    return {
      available: false,
      reason: 'Exam has ended',
      endsAt: exam.endsAt
    }
  }

  return { available: true }
}