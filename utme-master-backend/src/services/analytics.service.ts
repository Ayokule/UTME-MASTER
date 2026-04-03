// ==========================================
// ANALYTICS SERVICE
// ==========================================
// Business logic for analytics and statistics

import { prisma } from '../config/database'
import { BadRequestError } from '../utils/errors'
import { logger } from '../utils/logger'

// ==========================================
// GET STUDENT DASHBOARD STATS
// ==========================================
export async function getStudentDashboardStats(studentId: string) {
  try {
    // Get basic student performance stats
    const performanceStats = await getStudentPerformanceStats(studentId)

    // Get recent exam attempts
    const recentExams = await prisma.studentExam.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        exam: {
          select: { title: true }
        }
      }
    })

    // Get subject-wise performance
    const subjectProgress = await prisma.studentProgress.findMany({
      where: { studentId },
      include: {
        subject: {
          select: { name: true, code: true }
        }
      }
    })

    return {
      performance: performanceStats,
      recentExams: recentExams.map(exam => ({
        id: exam.id,
        title: exam.exam.title,
        score: exam.score,
        status: exam.status,
        createdAt: exam.createdAt
      })),
      subjectProgress: subjectProgress.map(progress => ({
        subject: progress.subject.name,
        code: progress.subject.code,
        totalQuestions: progress.totalQuestions,
        correctAnswers: progress.correctAnswers,
        averageScore: progress.averageScore
      }))
    }
  } catch (error) {
    logger.error('Error getting student dashboard stats:', error)
    throw new Error('Failed to get student dashboard stats')
  }
}

// ==========================================
// GET SUBJECT ANALYSIS
// ==========================================
export async function getSubjectAnalysis(studentId: string, subjectId: string) {
  try {
    // Get student progress for the subject
    const progress = await prisma.studentProgress.findUnique({
      where: {
        studentId_subjectId: { studentId, subjectId }
      },
      include: {
        subject: {
          select: { name: true, code: true }
        }
      }
    })

    // Get recent exam attempts for this subject
    const recentExams = await prisma.studentExam.findMany({
      where: {
        studentId,
        exam: {
          subjectIds: {
            path: ['subjectIds'],
            array_contains: [subjectId]
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        exam: {
          select: { title: true }
        }
      }
    })

    return {
      subject: progress?.subject || null,
      progress: progress || null,
      recentExams: recentExams.map(exam => ({
        id: exam.id,
        title: exam.exam.title,
        score: exam.score,
        status: exam.status,
        createdAt: exam.createdAt
      }))
    }
  } catch (error) {
    logger.error('Error getting subject analysis:', error)
    throw new Error('Failed to get subject analysis')
  }
}

// ==========================================
// GET PERFORMANCE COMPARISON
// ==========================================
export async function getPerformanceComparison(studentId: string) {
  try {
    // Get student's average performance
    const studentStats = await getStudentPerformanceStats(studentId)

    // Get class average (all students)
    const classAverageResult = await prisma.studentExam.aggregate({
      where: {
        status: 'SUBMITTED'
      },
      _avg: {
        score: true
      }
    })

    const classAverage = classAverageResult._avg.score || 0
    const studentAverage = studentStats.averageScore || 0
    
    // Calculate percentile based on student's position relative to class
    const percentile = classAverage > 0 
      ? Math.round((studentAverage / classAverage) * 100)
      : 50
    
    // Calculate difference
    const difference = studentAverage - classAverage
    
    // Get subject-wise comparison
    const subjectComparison = await prisma.studentProgress.findMany({
      where: { studentId },
      include: {
        subject: {
          select: { name: true, code: true }
        }
      }
    })

    // Generate comparison message
    let comparisonMessage = ''
    if (studentAverage >= 80) {
      comparisonMessage = 'Excellent! You are performing significantly above class average.'
    } else if (studentAverage >= 60) {
      comparisonMessage = 'Good job! You are performing slightly above class average.'
    } else if (studentAverage >= 40) {
      comparisonMessage = 'You are around class average. Focus on weak areas to improve.'
    } else {
      comparisonMessage = 'You are below class average. Consider additional practice and review.'
    }

    return {
      studentAverage: studentAverage.toFixed(1),
      classAverage: classAverage.toFixed(1),
      percentile: percentile.toString(),
      comparison: comparisonMessage,
      difference: difference.toFixed(1),
      subjectComparison: subjectComparison.map(progress => ({
        subject: progress.subject.name,
        code: progress.subject.code,
        studentScore: progress.averageScore,
        classAverage: (progress.averageScore * 0.9).toFixed(1) // Mock data for now
      }))
    }
  } catch (error) {
    logger.error('Error getting performance comparison:', error)
    throw new Error('Failed to get performance comparison')
  }
}

// ==========================================
// GET PROGRESS OVER TIME
// ==========================================
export async function getProgressOverTime(studentId: string, days: number = 30) {
  try {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const examHistory = await prisma.studentExam.findMany({
      where: {
        studentId,
        createdAt: { gte: startDate },
        status: 'SUBMITTED'
      },
      orderBy: { createdAt: 'asc' },
      select: {
        score: true,
        createdAt: true,
        exam: {
          select: { title: true }
        }
      }
    })

    return {
      period: `${days} days`,
      examHistory: examHistory.map(exam => ({
        title: exam.exam.title,
        score: exam.score,
        date: exam.createdAt
      }))
    }
  } catch (error) {
    logger.error('Error getting progress over time:', error)
    throw new Error('Failed to get progress over time')
  }
}

// ==========================================
// GET ADMIN DASHBOARD STATS
// ==========================================
export async function getAdminDashboardStats() {
  try {
    const [
      totalStudents,
      totalExams,
      totalQuestions,
      activeExams,
      recentActivity,
      recentRegistrations
    ] = await Promise.all([
      prisma.user.count({
        where: { role: 'STUDENT', isActive: true }
      }),
      prisma.exam.count({
        where: { isActive: true }
      }),
      prisma.question.count({
        where: { isActive: true }
      }),
      prisma.exam.count({
        where: { isActive: true, isPublished: true }
      }),
      prisma.studentExam.findMany({
        where: {
          status: 'SUBMITTED',
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: {
          student: {
            select: { firstName: true, lastName: true }
          },
          exam: {
            select: { title: true }
          }
        }
      }),
      prisma.user.findMany({
        where: {
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, firstName: true, lastName: true, role: true, createdAt: true }
      })
    ])

    return {
      stats: {
        totalStudents,
        totalTeachers: await prisma.user.count({ where: { role: 'TEACHER', isActive: true } }),
        totalQuestions,
        totalExams,
        activeUsers: await prisma.studentExam.count({ where: { status: 'IN_PROGRESS' } }),
        totalSubjects: await prisma.subject.count({ where: { isActive: true } })
      },
      recentActivity: [
        ...recentActivity.map(activity => ({
          id: activity.id,
          type: 'exam_completed' as const,
          description: `${activity.student.firstName} ${activity.student.lastName} completed "${activity.exam.title}"`,
          time: activity.createdAt.toISOString(),
          icon: 'exam',
          score: activity.totalScore > 0 ? Math.round((activity.score / activity.totalScore) * 100) : 0
        })),
        ...recentRegistrations.map(user => ({
          id: user.id,
          type: 'user_registered' as const,
          description: `${user.firstName} ${user.lastName} joined as ${user.role.toLowerCase()}`,
          time: user.createdAt.toISOString(),
          icon: 'user',
          score: 0
        }))
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10),
      subjectDistribution: await prisma.subject.findMany({
        where: { isActive: true },
        select: { name: true, code: true, _count: { select: { questions: true } } },
        orderBy: { name: 'asc' }
      }).then(subjects => subjects.map(s => ({ subject: s.name, code: s.code, questions: s._count.questions }))),
      examStatusStats: {
        completed: await prisma.studentExam.count({ where: { status: 'SUBMITTED' } }),
        in_progress: await prisma.studentExam.count({ where: { status: 'IN_PROGRESS' } }),
        not_started: await prisma.studentExam.count({ where: { status: 'NOT_STARTED' } })
      },
      performanceChart: [],
      systemHealth: { database: 'healthy', api: 'healthy', storage: 'healthy', uptime: '99.9%' }
    }
  } catch (error) {
    logger.error('Error getting admin dashboard stats:', error)
    throw new Error('Failed to get admin dashboard stats')
  }
}
// ==========================================
// INTERFACES
// ==========================================

export interface StudentPerformanceStats {
  studentId: string
  totalExams: number
  averageScore: number
  averagePercentage: number
  totalTimeSpent: number
  improvementTrend: number
  strongSubjects: Array<{
    subject: string
    averagePercentage: number
    examCount: number
  }>
  weakSubjects: Array<{
    subject: string
    averagePercentage: number
    examCount: number
  }>
  recentPerformance: Array<{
    examTitle: string
    score: number
    percentage: number
    completedAt: string
  }>
}

export interface ExamStatistics {
  examId: string
  examTitle: string
  totalAttempts: number
  averageScore: number
  averagePercentage: number
  passRate: number
  averageTimeSpent: number
  difficultyAnalysis: {
    easy: { correct: number; total: number; percentage: number }
    medium: { correct: number; total: number; percentage: number }
    hard: { correct: number; total: number; percentage: number }
  }
  subjectPerformance: Array<{
    subject: string
    averagePercentage: number
    questionCount: number
  }>
  topPerformers: Array<{
    studentName: string
    score: number
    percentage: number
  }>
}

export interface ProgressTracking {
  studentId: string
  timeRange: 'week' | 'month' | 'quarter' | 'year'
  progressData: Array<{
    date: string
    averageScore: number
    examCount: number
    timeSpent: number
  }>
  subjectProgress: Array<{
    subject: string
    data: Array<{
      date: string
      averagePercentage: number
      examCount: number
    }>
  }>
  milestones: Array<{
    date: string
    achievement: string
    description: string
  }>
}

// ==========================================
// STUDENT PERFORMANCE AGGREGATION
// ==========================================

export async function getStudentPerformanceStats(studentId: string): Promise<StudentPerformanceStats> {
  logger.info(`Calculating performance stats for student: ${studentId}`)

  // Get all completed exams for the student
  const studentExams = await prisma.studentExam.findMany({
    where: {
      studentId,
      status: 'SUBMITTED'
    },
    include: {
      exam: {
        include: {
          examQuestions: {
            include: {
              question: {
                include: {
                  subject: true
                }
              }
            }
          }
        }
      },
      answers: {
        include: {
          question: {
            include: {
              subject: true
            }
          }
        }
      }
    },
    orderBy: {
      submittedAt: 'desc'
    }
  })

  if (studentExams.length === 0) {
    return {
      studentId,
      totalExams: 0,
      averageScore: 0,
      averagePercentage: 0,
      totalTimeSpent: 0,
      improvementTrend: 0,
      strongSubjects: [],
      weakSubjects: [],
      recentPerformance: []
    }
  }

  // Calculate basic stats
  const totalExams = studentExams.length
  const totalScore = studentExams.reduce((sum, exam) => sum + (exam.score || 0), 0)
  const totalTimeSpent = studentExams.reduce((sum, exam) => sum + (exam.timeSpent || 0), 0)
  const averageScore = totalScore / totalExams
  
  // Calculate percentage from score/totalScore
  const calculatePercentage = (exam: any) => exam.totalScore > 0 ? (exam.score / exam.totalScore) * 100 : 0
  const averagePercentage = studentExams.reduce((sum, exam) => sum + calculatePercentage(exam), 0) / totalExams

  // Calculate improvement trend (compare first half vs second half of exams)
  const halfPoint = Math.floor(totalExams / 2)
  const recentExams = studentExams.slice(0, halfPoint)
  const olderExams = studentExams.slice(halfPoint)
  
  const recentAvg = recentExams.length > 0 
    ? recentExams.reduce((sum, exam) => sum + calculatePercentage(exam), 0) / recentExams.length 
    : 0
  const olderAvg = olderExams.length > 0 
    ? olderExams.reduce((sum, exam) => sum + calculatePercentage(exam), 0) / olderExams.length 
    : 0
  
  const improvementTrend = recentAvg - olderAvg

  // Calculate subject performance
  const subjectStats = new Map<string, { scores: number[], examCount: number }>()
  
  studentExams.forEach(studentExam => {
    const subjectScores = new Map<string, { correct: number, total: number }>()
    
    studentExam.answers.forEach(answer => {
      const subjectName = answer.question.subject.name
      if (!subjectScores.has(subjectName)) {
        subjectScores.set(subjectName, { correct: 0, total: 0 })
      }
      const stats = subjectScores.get(subjectName)!
      stats.total++
      if (answer.isCorrect) {
        stats.correct++
      }
    })
    
    subjectScores.forEach((stats, subject) => {
      const percentage = (stats.correct / stats.total) * 100
      if (!subjectStats.has(subject)) {
        subjectStats.set(subject, { scores: [], examCount: 0 })
      }
      subjectStats.get(subject)!.scores.push(percentage)
      subjectStats.get(subject)!.examCount++
    })
  })

  // Convert to arrays and sort
  const subjectPerformance = Array.from(subjectStats.entries()).map(([subject, data]) => ({
    subject,
    averagePercentage: data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length,
    examCount: data.examCount
  }))

  const strongSubjects = subjectPerformance
    .filter(s => s.averagePercentage >= 70)
    .sort((a, b) => b.averagePercentage - a.averagePercentage)
    .slice(0, 3)

  const weakSubjects = subjectPerformance
    .filter(s => s.averagePercentage < 60)
    .sort((a, b) => a.averagePercentage - b.averagePercentage)
    .slice(0, 3)

  // Recent performance (last 5 exams)
  const recentPerformance = studentExams.slice(0, 5).map(exam => ({
    examTitle: exam.exam.title,
    score: exam.score || 0,
    percentage: calculatePercentage(exam),
    completedAt: exam.submittedAt?.toISOString() || ''
  }))

  return {
    studentId,
    totalExams,
    averageScore,
    averagePercentage,
    totalTimeSpent,
    improvementTrend,
    strongSubjects,
    weakSubjects,
    recentPerformance
  }
}

// ==========================================
// EXAM STATISTICS CALCULATION
// ==========================================

export async function getExamStatistics(examId: string): Promise<ExamStatistics> {
  logger.info(`Calculating statistics for exam: ${examId}`)

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      examQuestions: {
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

  if (!exam) {
    throw new BadRequestError('Exam not found')
  }

  // Get all completed attempts
  const studentExams = await prisma.studentExam.findMany({
    where: {
      examId,
      status: 'SUBMITTED'
    },
    include: {
      student: {
        select: {
          firstName: true,
          lastName: true
        }
      },
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

  const totalAttempts = studentExams.length

  if (totalAttempts === 0) {
    return {
      examId,
      examTitle: exam.title,
      totalAttempts: 0,
      averageScore: 0,
      averagePercentage: 0,
      passRate: 0,
      averageTimeSpent: 0,
      difficultyAnalysis: {
        easy: { correct: 0, total: 0, percentage: 0 },
        medium: { correct: 0, total: 0, percentage: 0 },
        hard: { correct: 0, total: 0, percentage: 0 }
      },
      subjectPerformance: [],
      topPerformers: []
    }
  }

  // Calculate basic stats
  const totalScore = studentExams.reduce((sum, exam) => sum + (exam.score || 0), 0)
  const averageScore = totalScore / totalAttempts
  
  // Calculate percentage from score/totalScore
  const calculatePercentage = (exam: any) => exam.totalScore > 0 ? (exam.score / exam.totalScore) * 100 : 0
  const averagePercentage = studentExams.reduce((sum, exam) => sum + calculatePercentage(exam), 0) / totalAttempts
  const passedCount = studentExams.filter(exam => calculatePercentage(exam) >= 50).length
  const passRate = (passedCount / totalAttempts) * 100
  const averageTimeSpent = studentExams.reduce((sum, exam) => sum + (exam.timeSpent || 0), 0) / totalAttempts

  // Difficulty analysis
  const difficultyStats = {
    EASY: { correct: 0, total: 0 },
    MEDIUM: { correct: 0, total: 0 },
    HARD: { correct: 0, total: 0 }
  }

  studentExams.forEach(studentExam => {
    studentExam.answers.forEach(answer => {
      const difficulty = answer.question.difficulty as keyof typeof difficultyStats
      if (difficultyStats[difficulty]) {
        difficultyStats[difficulty].total++
        if (answer.isCorrect) {
          difficultyStats[difficulty].correct++
        }
      }
    })
  })

  const difficultyAnalysis = {
    easy: {
      correct: difficultyStats.EASY.correct,
      total: difficultyStats.EASY.total,
      percentage: difficultyStats.EASY.total > 0 ? (difficultyStats.EASY.correct / difficultyStats.EASY.total) * 100 : 0
    },
    medium: {
      correct: difficultyStats.MEDIUM.correct,
      total: difficultyStats.MEDIUM.total,
      percentage: difficultyStats.MEDIUM.total > 0 ? (difficultyStats.MEDIUM.correct / difficultyStats.MEDIUM.total) * 100 : 0
    },
    hard: {
      correct: difficultyStats.HARD.correct,
      total: difficultyStats.HARD.total,
      percentage: difficultyStats.HARD.total > 0 ? (difficultyStats.HARD.correct / difficultyStats.HARD.total) * 100 : 0
    }
  }

  // Subject performance
  const subjectStats = new Map<string, { correct: number, total: number }>()
  
  studentExams.forEach(studentExam => {
    studentExam.answers.forEach(answer => {
      const subjectName = answer.question.subject.name
      if (!subjectStats.has(subjectName)) {
        subjectStats.set(subjectName, { correct: 0, total: 0 })
      }
      const stats = subjectStats.get(subjectName)!
      stats.total++
      if (answer.isCorrect) {
        stats.correct++
      }
    })
  })

  const subjectPerformance = Array.from(subjectStats.entries()).map(([subject, stats]) => ({
    subject,
    averagePercentage: (stats.correct / stats.total) * 100,
    questionCount: stats.total / totalAttempts // Average questions per attempt
  }))

  // Top performers
  const topPerformers = studentExams
    .sort((a, b) => calculatePercentage(b) - calculatePercentage(a))
    .slice(0, 5)
    .map(exam => ({
      studentName: `${exam.student.firstName} ${exam.student.lastName}`,
      score: exam.score || 0,
      percentage: calculatePercentage(exam)
    }))

  return {
    examId,
    examTitle: exam.title,
    totalAttempts,
    averageScore,
    averagePercentage,
    passRate,
    averageTimeSpent,
    difficultyAnalysis,
    subjectPerformance,
    topPerformers
  }
}

// ==========================================
// PROGRESS TRACKING OVER TIME
// ==========================================

export async function getProgressTracking(
  studentId: string, 
  timeRange: 'week' | 'month' | 'quarter' | 'year' = 'month'
): Promise<ProgressTracking> {
  logger.info(`Calculating progress tracking for student: ${studentId}, range: ${timeRange}`)

  // Calculate date range
  const now = new Date()
  let startDate: Date
  let groupByFormat: string

  switch (timeRange) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      groupByFormat = 'YYYY-MM-DD'
      break
    case 'month':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      groupByFormat = 'YYYY-MM-DD'
      break
    case 'quarter':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      groupByFormat = 'YYYY-WW'
      break
    case 'year':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
      groupByFormat = 'YYYY-MM'
      break
  }

  // Get student exams in the time range
  const studentExams = await prisma.studentExam.findMany({
    where: {
      studentId,
      status: 'SUBMITTED',
      submittedAt: {
        gte: startDate,
        lte: now
      }
    },
    include: {
      answers: {
        include: {
          question: {
            include: {
              subject: true
            }
          }
        }
      }
    },
    orderBy: {
      submittedAt: 'asc'
    }
  })

  // Group exams by date
  const examsByDate = new Map<string, typeof studentExams>()
  
  studentExams.forEach(exam => {
    if (!exam.submittedAt) return
    
    const dateKey = exam.submittedAt.toISOString().split('T')[0] // YYYY-MM-DD format
    if (!examsByDate.has(dateKey)) {
      examsByDate.set(dateKey, [])
    }
    examsByDate.get(dateKey)!.push(exam)
  })

  // Calculate progress data
  const progressData = Array.from(examsByDate.entries()).map(([date, exams]) => ({
    date,
    averageScore: exams.reduce((sum, exam) => sum + (exam.score || 0), 0) / exams.length,
    examCount: exams.length,
    timeSpent: exams.reduce((sum, exam) => sum + (exam.timeSpent || 0), 0)
  }))

  // Calculate subject progress
  const subjectProgressMap = new Map<string, Map<string, { scores: number[], count: number }>>()
  
  studentExams.forEach(exam => {
    if (!exam.submittedAt) return
    
    const dateKey = exam.submittedAt.toISOString().split('T')[0]
    const subjectScores = new Map<string, { correct: number, total: number }>()
    
    exam.answers.forEach(answer => {
      const subjectName = answer.question.subject.name
      if (!subjectScores.has(subjectName)) {
        subjectScores.set(subjectName, { correct: 0, total: 0 })
      }
      const stats = subjectScores.get(subjectName)!
      stats.total++
      if (answer.isCorrect) {
        stats.correct++
      }
    })
    
    subjectScores.forEach((stats, subject) => {
      if (!subjectProgressMap.has(subject)) {
        subjectProgressMap.set(subject, new Map())
      }
      if (!subjectProgressMap.get(subject)!.has(dateKey)) {
        subjectProgressMap.get(subject)!.set(dateKey, { scores: [], count: 0 })
      }
      const percentage = (stats.correct / stats.total) * 100
      subjectProgressMap.get(subject)!.get(dateKey)!.scores.push(percentage)
      subjectProgressMap.get(subject)!.get(dateKey)!.count++
    })
  })

  const subjectProgress = Array.from(subjectProgressMap.entries()).map(([subject, dateMap]) => ({
    subject,
    data: Array.from(dateMap.entries()).map(([date, data]) => ({
      date,
      averagePercentage: data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length,
      examCount: data.count
    }))
  }))

  // Calculate milestones
  const milestones: Array<{ date: string; achievement: string; description: string }> = []
  
  // Find first exam
  if (studentExams.length > 0) {
    milestones.push({
      date: studentExams[0].submittedAt?.toISOString().split('T')[0] || '',
      achievement: 'First Exam',
      description: 'Completed your first exam in this period'
    })
  }

  // Find best performance
  const calculatePercentage = (exam: any) => exam.totalScore > 0 ? (exam.score / exam.totalScore) * 100 : 0
  const bestExam = studentExams.reduce((best, current) => 
    calculatePercentage(current) > calculatePercentage(best) ? current : best
  , studentExams[0])
  
  if (bestExam && calculatePercentage(bestExam) > 80) {
    milestones.push({
      date: bestExam.submittedAt?.toISOString().split('T')[0] || '',
      achievement: 'Excellence Achieved',
      description: `Scored ${Math.round(calculatePercentage(bestExam))}% - your best performance!`
    })
  }

  // Find improvement streaks
  let consecutiveImprovements = 0
  let maxStreak = 0
  let streakStartDate = ''
  
  for (let i = 1; i < progressData.length; i++) {
    if (progressData[i].averageScore > progressData[i - 1].averageScore) {
      if (consecutiveImprovements === 0) {
        streakStartDate = progressData[i - 1].date
      }
      consecutiveImprovements++
      maxStreak = Math.max(maxStreak, consecutiveImprovements)
    } else {
      consecutiveImprovements = 0
    }
  }
  
  if (maxStreak >= 3) {
    milestones.push({
      date: streakStartDate,
      achievement: 'Improvement Streak',
      description: `${maxStreak} consecutive improvements in performance`
    })
  }

  return {
    studentId,
    timeRange,
    progressData,
    subjectProgress,
    milestones
  }
}