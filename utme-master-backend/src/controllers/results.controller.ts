import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ==========================================
// RESULTS CONTROLLER
// ==========================================
// This controller handles exam results and analytics

// GET EXAM RESULTS
// GET /api/student/results/:studentExamId
export const getExamResults = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentExamId } = req.params
    const userId = req.user?.id

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      })
      return
    }

    // Get student exam with all related data
    const studentExam = await prisma.studentExam.findUnique({
      where: { 
        id: studentExamId,
        studentId: userId // Ensure user can only see their own results
      },
      include: {
        exam: {
          select: {
            id: true,
            title: true,
            duration: true,
            totalQuestions: true,
            description: true,
            allowRetake: true
          }
        },
        answers: {
          include: {
            question: {
              include: {
                subject: true,
                topic: true
              }
            }
          }
        }
      }
    })

    if (!studentExam) {
      res.status(404).json({
        success: false,
        message: 'Exam results not found'
      })
      return
    }

    // Calculate grade based on percentage
    const getGrade = (percentage: number): string => {
      if (percentage >= 80) return 'A'
      if (percentage >= 70) return 'B'
      if (percentage >= 60) return 'C'
      if (percentage >= 50) return 'D'
      return 'F'
    }

    // Calculate subject breakdown
    const subjectStats = new Map<string, {
      correct: number
      total: number
      score: number
      maxScore: number
    }>()

    studentExam.answers.forEach(answer => {
      const subjectName = answer.question.subject.name
      if (!subjectStats.has(subjectName)) {
        subjectStats.set(subjectName, {
          correct: 0,
          total: 0,
          score: 0,
          maxScore: 0
        })
      }
      
      const stats = subjectStats.get(subjectName)!
      stats.total += 1
      stats.maxScore += 4 // Assuming 4 marks per question
      
      if (answer.isCorrect) {
        stats.correct += 1
        stats.score += 4
      }
    })

    const subjects = Array.from(subjectStats.entries()).map(([name, stats]) => ({
      name,
      score: stats.score,
      max: stats.maxScore,
      correct: stats.correct,
      total: stats.total,
      percentage: Math.round((stats.correct / stats.total) * 100)
    }))

    // Prepare questions for review
    const questions = studentExam.answers.map((answer, index) => ({
      id: answer.question.id,
      questionNumber: index + 1,
      questionText: answer.question.questionText,
      options: Array.isArray(answer.question.options) 
        ? answer.question.options as any[]
        : [
            { label: 'A', text: answer.question.optionA || '' },
            { label: 'B', text: answer.question.optionB || '' },
            { label: 'C', text: answer.question.optionC || '' },
            { label: 'D', text: answer.question.optionD || '' }
          ],
      selectedAnswer: typeof answer.answer === 'object' && answer.answer 
        ? (answer.answer as any).selected 
        : null,
      correctAnswer: answer.question.correctAnswer || 'A',
      isCorrect: answer.isCorrect || false,
      explanation: answer.question.explanation,
      subject: answer.question.subject.name,
      difficulty: answer.question.difficulty,
      pointsEarned: answer.pointsEarned,
      timeSpent: answer.timeSpent
    }))

    // Get user's license tier for analytics
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { licenseTier: true }
    })

    // Premium analytics (only for non-trial users)
    let analytics = undefined
    if (user?.licenseTier !== 'TRIAL') {
      // Get previous attempts for improvement calculation
      const previousAttempts = await prisma.studentExam.findMany({
        where: {
          studentId: userId,
          examId: studentExam.examId,
          status: 'SUBMITTED',
          id: { not: studentExamId }
        },
        orderBy: { submittedAt: 'desc' },
        take: 1
      })

      const improvement = previousAttempts.length > 0 
        ? Math.round(((studentExam.score || 0) - (previousAttempts[0].score || 0)) / (previousAttempts[0].score || 1) * 100)
        : 0

      // Simple JAMB score prediction (can be enhanced with ML)
      const predictedScore = Math.round((studentExam.score || 0) / (studentExam.totalQuestions * 4) * 400)

      // Mock ranking (in real implementation, calculate from all users)
      const rankingPercentile = Math.max(10, Math.min(90, Math.round((studentExam.score || 0) / 4)))

      analytics = {
        improvement,
        predictedScore,
        rankingPercentile,
        strengthsChart: subjects
          .filter(s => s.percentage >= 70)
          .map(s => ({ subject: s.name, accuracy: s.percentage })),
        weaknessesChart: subjects
          .filter(s => s.percentage < 60)
          .map(s => ({ subject: s.name, accuracy: s.percentage })),
        topicBreakdown: [] // Would need topic-level analysis
      }
    }

    const results = {
      exam: {
        id: studentExam.exam.id,
        title: studentExam.exam.title,
        duration: studentExam.exam.duration,
        totalQuestions: studentExam.exam.totalQuestions,
        description: studentExam.exam.description
      },
      score: {
        total: studentExam.score || 0,
        max: studentExam.totalQuestions * 4,
        percentage: Math.round(((studentExam.score || 0) / (studentExam.totalQuestions * 4)) * 100),
        grade: getGrade(((studentExam.score || 0) / (studentExam.totalQuestions * 4)) * 100),
        passed: (studentExam.score || 0) >= (studentExam.totalQuestions * 4 * 0.5), // 50% pass mark
        timeTaken: studentExam.timeSpent
      },
      subjects,
      questions,
      analytics,
      canRetake: studentExam.exam.allowRetake || false,
      attemptNumber: 1, // Would need to calculate actual attempt number
      submittedAt: studentExam.submittedAt?.toISOString() || new Date().toISOString()
    }

    res.json({
      success: true,
      data: results
    })
    return

  } catch (error: any) {
    console.error('Get results error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to load exam results',
      error: error.message
    })
    return
  }
}

// RETAKE EXAM
// POST /api/exams/:examId/retake
export const retakeExam = async (req: Request, res: Response): Promise<void> => {
  try {
    const { examId } = req.params
    const userId = req.user?.id

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      })
      return
    }

    // Check if exam exists and allows retakes
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: { 
        id: true, 
        allowRetake: true, 
        isActive: true, 
        isPublished: true 
      }
    })

    if (!exam) {
      res.status(404).json({
        success: false,
        message: 'Exam not found'
      })
      return
    }

    if (!exam.allowRetake) {
      res.status(403).json({
        success: false,
        message: 'Retakes are not allowed for this exam'
      })
      return
    }

    if (!exam.isActive || !exam.isPublished) {
      res.status(403).json({
        success: false,
        message: 'Exam is not available'
      })
      return
    }

    // Create new student exam attempt
    const newStudentExam = await prisma.studentExam.create({
      data: {
        examId: examId,
        studentId: userId,
        status: 'NOT_STARTED',
        totalQuestions: 0, // Will be updated when exam starts
        questionOrder: []
      }
    })

    res.json({
      success: true,
      data: {
        studentExamId: newStudentExam.id,
        message: 'New exam attempt created successfully'
      }
    })
    return

  } catch (error: any) {
    console.error('Retake exam error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create retake attempt',
      error: error.message
    })
    return
  }
}

// SHARE RESULTS
// POST /api/student/results/:studentExamId/share
export const shareResults = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentExamId } = req.params
    const { platform } = req.body
    const userId = req.user?.id

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      })
      return
    }

    // Verify ownership
    const studentExam = await prisma.studentExam.findUnique({
      where: { 
        id: studentExamId,
        studentId: userId 
      },
      include: {
        exam: { select: { title: true } }
      }
    })

    if (!studentExam) {
      res.status(404).json({
        success: false,
        message: 'Exam results not found'
      })
      return
    }

    // Log the share action (for analytics)
    console.log(`User ${userId} shared results for exam ${studentExam.examId} on ${platform}`)

    res.json({
      success: true,
      data: {
        message: 'Results shared successfully',
        shareUrl: `${process.env.FRONTEND_URL}/student/results/${studentExamId}`
      }
    })
    return

  } catch (error: any) {
    console.error('Share results error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to share results',
      error: error.message
    })
    return
  }
}

// DOWNLOAD RESULTS PDF
// GET /api/student/results/:studentExamId/pdf
export const downloadResultsPDF = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentExamId } = req.params
    const userId = req.user?.id

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      })
      return
    }

    // Verify ownership
    const studentExam = await prisma.studentExam.findUnique({
      where: { 
        id: studentExamId,
        studentId: userId 
      },
      include: {
        exam: { select: { title: true } },
        student: { select: { firstName: true, lastName: true } }
      }
    })

    if (!studentExam) {
      res.status(404).json({
        success: false,
        message: 'Exam results not found'
      })
      return
    }

    // In a real implementation, you would generate a PDF here
    // For now, we'll return a success message
    res.json({
      success: true,
      data: {
        message: 'PDF generation started',
        downloadUrl: `/downloads/results-${studentExamId}.pdf`
      }
    })
    return

  } catch (error: any) {
    console.error('Download PDF error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to generate PDF',
      error: error.message
    })
    return
  }
}