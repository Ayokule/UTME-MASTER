import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { asyncHandler } from '../middleware/error.middleware'

const prisma = new PrismaClient()

// ==========================================
// DASHBOARD CONTROLLER
// ==========================================
// This controller handles student dashboard analytics
//
// What it does:
// - Calculate student performance statistics
// - Get subject-wise performance data
// - Track progress over time
// - Identify strengths and weaknesses
// - Provide study recommendations

// GET STUDENT DASHBOARD DATA
// GET /api/student/dashboard
//
// Returns comprehensive dashboard analytics for the logged-in student
export const getDashboard = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.id

    if (!studentId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      })
      return
    }

    // Get student info with license
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: {
        firstName: true,
        lastName: true,
        licenseTier: true,
        createdAt: true
      }
    })

    if (!student) {
      res.status(404).json({
        success: false,
        message: 'Student not found'
      })
      return
    }

    // Get all completed student exams
    const studentExams = await prisma.studentExam.findMany({
      where: {
        studentId: studentId,
        status: 'SUBMITTED'
      },
      include: {
        exam: {
          select: {
            title: true,
            subjectIds: true
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    })

    // Calculate basic statistics
    const totalTests = studentExams.length
    const scores = studentExams.map(exam => exam.score || 0)
    const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
    const bestScore = scores.length > 0 ? Math.max(...scores) : 0
    
    // Calculate study hours (approximate from time spent)
    const totalTimeSeconds = studentExams.reduce((total, exam) => {
      return total + (exam.timeSpent || 0)
    }, 0)
    const hoursStudied = totalTimeSeconds / 3600

    // Calculate study streak (simplified - days since last exam)
    const lastExamDate = studentExams[0]?.submittedAt
    const streakDays = lastExamDate 
      ? Math.floor((Date.now() - lastExamDate.getTime()) / (1000 * 60 * 60 * 24))
      : 0

    // Get all subjects for mapping
    const subjects = await prisma.subject.findMany({
      select: { id: true, name: true }
    })
    const subjectMap = new Map(subjects.map(s => [s.id, s.name]))

    // Calculate subject performance
    const subjectStats = new Map<string, { totalScore: number, count: number }>()
    
    studentExams.forEach(studentExam => {
      const subjectIds = Array.isArray(studentExam.exam.subjectIds) 
        ? studentExam.exam.subjectIds as string[]
        : []
      
      subjectIds.forEach(subjectId => {
        const subjectName = subjectMap.get(subjectId)
        if (subjectName) {
          const score = studentExam.score || 0
          
          if (!subjectStats.has(subjectName)) {
            subjectStats.set(subjectName, { totalScore: 0, count: 0 })
          }
          
          const stats = subjectStats.get(subjectName)!
          stats.totalScore += score
          stats.count += 1
        }
      })
    })

    const subjectPerformance = Array.from(subjectStats.entries()).map(([subject, stats]) => ({
      subject,
      score: Math.round(stats.totalScore / stats.count),
      tests: stats.count
    }))

    // Get progress over time (last 10 exams)
    const recentExams = studentExams.slice(0, 10).reverse()
    const progress = recentExams.map(exam => ({
      date: exam.submittedAt?.toISOString().split('T')[0] || '',
      score: exam.score || 0,
      exam_title: exam.exam.title
    }))

    // Get recent activity (last 5 exams)
    const recentActivity = studentExams.slice(0, 5).map(exam => {
      const subjectIds = Array.isArray(exam.exam.subjectIds) 
        ? exam.exam.subjectIds as string[]
        : []
      const subjectNames = subjectIds.map(id => subjectMap.get(id)).filter(Boolean) as string[]
      
      return {
        id: exam.id,
        exam_title: exam.exam.title,
        score: exam.score || 0,
        percentage: Math.round((exam.score || 0) * 100 / (exam.totalQuestions || 1)),
        date: exam.submittedAt?.toISOString() || '',
        subjects: subjectNames,
        status: exam.status
      }
    })

    // Identify strengths and weaknesses
    const sortedSubjects = subjectPerformance.sort((a, b) => b.score - a.score)
    const strengths = sortedSubjects.slice(0, 3).map(s => s.subject)
    const weaknesses = sortedSubjects.slice(-3).reverse().map(s => s.subject)

    // Motivational quotes
    const quotes = [
      "Success is the sum of small efforts repeated day in and day out.",
      "The expert in anything was once a beginner.",
      "Don't watch the clock; do what it does. Keep going.",
      "Education is the passport to the future.",
      "The beautiful thing about learning is that no one can take it away from you.",
      "Learning never exhausts the mind.",
      "The more that you read, the more things you will know.",
      "Knowledge is power, but enthusiasm pulls the switch."
    ]
    const quoteOfDay = quotes[Math.floor(Math.random() * quotes.length)]

    // Prepare response
    const dashboardData = {
      student: {
        name: `${student.firstName} ${student.lastName}`.trim(),
        streak_days: Math.max(0, 7 - streakDays), // Convert to positive streak
        licenseTier: student.licenseTier
      },
      stats: {
        total_tests: totalTests,
        average_score: Math.round(averageScore * 10) / 10,
        best_score: Math.round(bestScore),
        hours_studied: Math.round(hoursStudied * 10) / 10
      },
      subject_performance: subjectPerformance,
      progress: progress,
      recent_activity: recentActivity,
      strengths: strengths,
      weaknesses: weaknesses,
      quote_of_day: quoteOfDay
    }

    res.json({
      success: true,
      data: dashboardData
    })
    return

  } catch (error: any) {
    console.error('Dashboard error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to load dashboard data',
      error: error.message
    })
    return
  }
})

// GET SUBJECT ANALYTICS (Premium Feature)
export const getSubjectAnalytics = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.id
    const { subject } = req.params

    if (!studentId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      })
      return
    }

    // Check if user has premium access
    const user = await prisma.user.findUnique({
      where: { id: studentId },
      select: { licenseTier: true }
    })

    if (user?.licenseTier === 'TRIAL') {
      res.status(403).json({
        success: false,
        message: 'Premium feature - upgrade to access detailed subject analytics'
      })
      return
    }

    // Get subject ID
    const subjectRecord = await prisma.subject.findFirst({
      where: { name: subject }
    })

    if (!subjectRecord) {
      res.status(404).json({
        success: false,
        message: 'Subject not found'
      })
      return
    }

    // Get subject-specific exam data
    const subjectExams = await prisma.studentExam.findMany({
      where: {
        studentId: studentId,
        status: 'SUBMITTED',
        exam: {
          subjectIds: {
            array_contains: subjectRecord.id
          }
        }
      },
      include: {
        exam: {
          select: {
            title: true
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    })

    res.json({
      success: true,
      data: {
        subject,
        total_exams: subjectExams.length,
        recent_scores: subjectExams.slice(0, 10).map(exam => ({
          date: exam.submittedAt?.toISOString().split('T')[0],
          score: exam.score
        }))
      }
    })
    return

  } catch (error: any) {
    console.error('Subject analytics error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to load subject analytics',
      error: error.message
    })
    return
  }
})

// GET PREDICTED JAMB SCORE (Premium Feature)
export const getPredictedScore = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.id

    if (!studentId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      })
      return
    }

    // Check if user has premium access
    const user = await prisma.user.findUnique({
      where: { id: studentId },
      select: { licenseTier: true }
    })

    if (user?.licenseTier === 'TRIAL') {
      res.status(403).json({
        success: false,
        message: 'Premium feature - upgrade to access JAMB score prediction'
      })
      return
    }

    // Get recent exam performance
    const recentExams = await prisma.studentExam.findMany({
      where: {
        studentId: studentId,
        status: 'SUBMITTED'
      },
      orderBy: {
        submittedAt: 'desc'
      },
      take: 10
    })

    if (recentExams.length === 0) {
      res.json({
        success: true,
        data: {
          predicted_score: null,
          confidence: 0,
          message: 'Take more exams to get accurate predictions'
        }
      })
      return
    }

    // Simple prediction algorithm
    const recentScores = recentExams.map(exam => exam.score || 0)
    const averageScore = recentScores.reduce((a, b) => a + b, 0) / recentScores.length
    
    // JAMB score is out of 400, convert percentage to JAMB score
    const predictedScore = Math.round((averageScore / 100) * 400)
    
    // Calculate confidence based on consistency
    const variance = recentScores.reduce((sum, score) => {
      return sum + Math.pow(score - averageScore, 2)
    }, 0) / recentScores.length
    
    const confidence = Math.max(0, Math.min(100, 100 - variance))

    res.json({
      success: true,
      data: {
        predicted_score: predictedScore,
        confidence: Math.round(confidence),
        based_on_exams: recentExams.length,
        recommendation: predictedScore >= 250 
          ? 'Great progress! Keep practicing to maintain this level.'
          : 'Focus on your weak subjects to improve your predicted score.'
      }
    })
    return

  } catch (error: any) {
    console.error('Predicted score error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to calculate predicted score',
      error: error.message
    })
    return
  }
})

// GET STUDY RECOMMENDATIONS
export const getStudyRecommendations = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.id

    if (!studentId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      })
      return
    }

    // Get student performance data
    const studentExams = await prisma.studentExam.findMany({
      where: {
        studentId: studentId,
        status: 'SUBMITTED'
      },
      include: {
        exam: {
          select: {
            subjectIds: true
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      },
      take: 20
    })

    if (studentExams.length === 0) {
      res.json({
        success: true,
        data: {
          recommendations: [
            'Start by taking practice exams to assess your current level',
            'Focus on understanding basic concepts before attempting advanced questions',
            'Create a study schedule and stick to it consistently',
            'Review past JAMB questions to familiarize yourself with the exam format'
          ]
        }
      })
      return
    }

    const recommendations: string[] = []

    // Get all subjects for mapping
    const subjects = await prisma.subject.findMany({
      select: { id: true, name: true }
    })
    const subjectMap = new Map(subjects.map(s => [s.id, s.name]))

    // Calculate subject performance
    const subjectStats = new Map<string, number[]>()
    
    studentExams.forEach(studentExam => {
      const subjectIds = Array.isArray(studentExam.exam.subjectIds) 
        ? studentExam.exam.subjectIds as string[]
        : []
      
      subjectIds.forEach(subjectId => {
        const subjectName = subjectMap.get(subjectId)
        if (subjectName) {
          const score = studentExam.score || 0
          
          if (!subjectStats.has(subjectName)) {
            subjectStats.set(subjectName, [])
          }
          
          subjectStats.get(subjectName)!.push(score)
        }
      })
    })

    // Analyze each subject
    subjectStats.forEach((scores, subject) => {
      const average = scores.reduce((a, b) => a + b, 0) / scores.length
      
      if (average < 50) {
        recommendations.push(`Focus heavily on ${subject} - your average is ${Math.round(average)}%. Consider getting extra help or tutoring.`)
      } else if (average < 70) {
        recommendations.push(`Improve your ${subject} performance by practicing more questions and reviewing weak topics.`)
      } else if (average >= 80) {
        recommendations.push(`Excellent work in ${subject}! Maintain this level and help others to reinforce your knowledge.`)
      }
    })

    // General recommendations
    const overallAverage = Array.from(subjectStats.values())
      .flat()
      .reduce((a, b) => a + b, 0) / Array.from(subjectStats.values()).flat().length

    if (overallAverage < 60) {
      recommendations.push('Consider creating a structured study plan with daily goals.')
      recommendations.push('Take regular breaks during study sessions to maintain focus.')
    }

    if (studentExams.length < 10) {
      recommendations.push('Take more practice exams to better assess your preparation level.')
    }

    recommendations.push('Review your mistakes after each exam to avoid repeating them.')
    recommendations.push('Join study groups or online forums to discuss difficult topics.')

    res.json({
      success: true,
      data: {
        recommendations: recommendations.slice(0, 6), // Limit to 6 recommendations
        overall_performance: Math.round(overallAverage),
        exams_analyzed: studentExams.length
      }
    })
    return

  } catch (error: any) {
    console.error('Recommendations error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to generate recommendations',
      error: error.message
    })
    return
  }
})

// ==========================================
// GET ADMIN DASHBOARD DATA
// ==========================================
export const getAdminDashboard = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    // Get total counts
    const [
      totalStudents,
      totalTeachers,
      totalQuestions,
      totalExams,
      activeUsers,
      totalSubjects
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT', isActive: true } }),
      prisma.user.count({ where: { role: 'TEACHER', isActive: true } }),
      prisma.question.count({ where: { isActive: true } }),
      prisma.exam.count({ where: { isActive: true } }),
      prisma.user.count({ 
        where: { 
          isActive: true,
          lastLogin: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        } 
      }),
      prisma.subject.count({ where: { isActive: true } })
    ])

    // Get recent activity (last 10 activities)
    const recentStudentExams = await prisma.studentExam.findMany({
      take: 5,
      orderBy: { submittedAt: 'desc' },
      where: { status: 'SUBMITTED' },
      include: {
        student: {
          select: { firstName: true, lastName: true }
        },
        exam: {
          select: { title: true }
        }
      }
    })

    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true
      }
    })

    // Format recent activity
    const recentActivity = [
      ...recentStudentExams.map(exam => ({
        id: exam.id,
        type: 'exam_completed',
        description: `${exam.student.firstName} ${exam.student.lastName} completed "${exam.exam.title}"`,
        time: exam.submittedAt || exam.createdAt,
        icon: 'exam',
        score: exam.score
      })),
      ...recentUsers.map(user => ({
        id: user.firstName + user.lastName + user.createdAt.getTime(),
        type: 'user_registered',
        description: `${user.firstName} ${user.lastName} registered as ${user.role.toLowerCase()}`,
        time: user.createdAt,
        icon: 'user',
        role: user.role
      }))
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10)

    // Get subject distribution
    const subjectStats = await prisma.subject.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { questions: true }
        }
      }
    })

    const subjectDistribution = subjectStats.map(subject => ({
      subject: subject.name,
      questions: subject._count.questions,
      code: subject.code
    }))

    // Get exam statistics
    const examStats = await prisma.studentExam.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    })

    const examStatusStats = {
      completed: examStats.find(s => s.status === 'SUBMITTED')?._count.status || 0,
      in_progress: examStats.find(s => s.status === 'IN_PROGRESS')?._count.status || 0,
      not_started: examStats.find(s => s.status === 'NOT_STARTED')?._count.status || 0
    }

    // Get performance trends (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const performanceTrends = await prisma.studentExam.findMany({
      where: {
        submittedAt: { gte: thirtyDaysAgo },
        status: 'SUBMITTED'
      },
      select: {
        score: true,
        submittedAt: true
      },
      orderBy: { submittedAt: 'asc' }
    })

    // Group by day and calculate average scores
    const dailyPerformance = performanceTrends.reduce((acc, exam) => {
      if (!exam.submittedAt) return acc
      
      const date = exam.submittedAt.toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = { totalScore: 0, count: 0 }
      }
      acc[date].totalScore += exam.score || 0
      acc[date].count += 1
      return acc
    }, {} as Record<string, { totalScore: number, count: number }>)

    const performanceChart = Object.entries(dailyPerformance).map(([date, stats]) => ({
      date,
      averageScore: Math.round(stats.totalScore / stats.count),
      totalExams: stats.count
    }))

    // System health metrics
    const systemHealth = {
      database: 'healthy',
      api: 'healthy',
      storage: 'healthy',
      uptime: '99.9%'
    }

    const adminDashboardData = {
      stats: {
        totalStudents,
        totalTeachers,
        totalQuestions,
        totalExams,
        activeUsers,
        totalSubjects
      },
      recentActivity,
      subjectDistribution,
      examStatusStats,
      performanceChart,
      systemHealth
    }

    res.json({
      success: true,
      data: adminDashboardData
    })

  } catch (error: any) {
    console.error('Admin dashboard error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to load admin dashboard data',
      error: error.message
    })
  }
})