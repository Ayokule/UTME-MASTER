import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Service to compile detailed exam results for a student.
 * This function is designed to be reusable for both API responses and PDF generation.
 *
 * @param studentExamId - The ID of the student's exam attempt
 * @param userId - The ID of the user requesting the results, for authorization
 * @returns A detailed results object or null if not found
 */
export const compileResultsData = async (studentExamId: string, userId: string) => {
  // Get student exam with all related data
  const studentExam = await prisma.studentExam.findUnique({
    where: {
      id: studentExamId,
      studentId: userId // Ensure user can only see their own results
    },
    include: {
      student: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        }
      },
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
    return null
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
    percentage: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0
  }))

  // Prepare questions for review
  const questions = studentExam.answers.map((answer, index) => ({
    id: answer.question.id,
    questionNumber: index + 1,
    questionText: answer.question.questionText,
    options: answer.question.options as any,
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

    const improvement = previousAttempts.length > 0 && previousAttempts[0].score
      ? Math.round(((studentExam.score || 0) - (previousAttempts[0].score)) / (previousAttempts[0].score) * 100)
      : 0

    const predictedScore = studentExam.totalQuestions > 0 ? Math.round((studentExam.score || 0) / (studentExam.totalQuestions * 4) * 400) : 0

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
      topicBreakdown: []
    }
  }

  const totalPossibleScore = studentExam.totalQuestions * 4;
  const percentage = totalPossibleScore > 0 ? Math.round(((studentExam.score || 0) / totalPossibleScore) * 100) : 0;

  return {
    student: {
      firstName: studentExam.student.firstName,
      lastName: studentExam.student.lastName,
      email: studentExam.student.email,
    },
    exam: {
      id: studentExam.exam.id,
      title: studentExam.exam.title,
      duration: studentExam.exam.duration,
      totalQuestions: studentExam.exam.totalQuestions,
      description: studentExam.exam.description
    },
    score: {
      total: studentExam.score || 0,
      max: totalPossibleScore,
      percentage: percentage,
      grade: getGrade(percentage),
      passed: percentage >= 50,
      timeTaken: studentExam.timeSpent
    },
    subjects,
    questions,
    analytics,
    canRetake: studentExam.exam.allowRetake || false,
    attemptNumber: 1, // Would need to calculate actual attempt number
    submittedAt: studentExam.submittedAt?.toISOString() || new Date().toISOString()
  }
}
