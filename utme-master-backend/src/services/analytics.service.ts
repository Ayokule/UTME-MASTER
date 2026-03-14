// ==========================================
// ANALYTICS SERVICE - Phase 4
// ==========================================
// This handles all analytics and statistics:
// - Student performance tracking
// - Subject-wise analysis
// - Time-based trends
// - Comparison with peers
// - Progress tracking
// - Admin dashboard stats
//
// ALL WITH BEGINNER-FRIENDLY COMMENTS!

import { prisma } from '../config/database'
import { NotFoundError } from '../utils/errors'
import { logger } from '../utils/logger'

// ==========================================
// GET STUDENT DASHBOARD STATS
// ==========================================
// Overview statistics for a student's dashboard
//
// Returns:
// - Total exams taken
// - Average score
// - Best subject
// - Worst subject
// - Recent performance trend

export async function getStudentDashboardStats(studentId: string) {
  logger.info(`Fetching dashboard stats for student ${studentId}`)
  
  // ==========================================
  // STEP 1: Get all completed exams
  // ==========================================
  const completedExams = await prisma.studentExam.findMany({
    where: {
      studentId: studentId,
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
    orderBy: { submittedAt: 'desc' }
  })
  
  if (completedExams.length === 0) {
    return {
      totalExams: 0,
      averageScore: 0,
      averagePercentage: 0,
      totalQuestions: 0,
      totalCorrect: 0,
      totalWrong: 0,
      passRate: 0,
      recentExams: [],
      subjectPerformance: [],
      performanceTrend: []
    }
  }
  
  // ==========================================
  // STEP 2: Calculate overall statistics
  // ==========================================
  const totalExams = completedExams.length
  const totalScore = completedExams.reduce((sum, exam) => sum + exam.score, 0)
  const totalPossibleMarks = completedExams.reduce((sum, exam) => sum + exam.exam.totalMarks, 0)
  const averageScore = totalScore / totalExams
  const averagePercentage = (totalScore / totalPossibleMarks) * 100
  
  const totalQuestions = completedExams.reduce((sum, exam) => sum + exam.totalQuestions, 0)
  const totalCorrect = completedExams.reduce((sum, exam) => sum + exam.correctAnswers, 0)
  const totalWrong = completedExams.reduce((sum, exam) => sum + exam.wrongAnswers, 0)
  
  const passedExams = completedExams.filter(exam => exam.passed).length
  const passRate = (passedExams / totalExams) * 100
  
  // ==========================================
  // STEP 3: Calculate subject-wise performance
  // ==========================================
  const subjectStats = new Map<string, {
    name: string,
    total: number,
    correct: number,
    wrong: number
  }>()
  
  for (const exam of completedExams) {
    for (const answer of exam.answers) {
      const subject = answer.question.subject
      
      if (!subjectStats.has(subject.id)) {
        subjectStats.set(subject.id, {
          name: subject.name,
          total: 0,
          correct: 0,
          wrong: 0
        })
      }
      
      const stats = subjectStats.get(subject.id)!
      stats.total++
      if (answer.isCorrect === true) stats.correct++
      if (answer.isCorrect === false) stats.wrong++
    }
  }
  
  const subjectPerformance = Array.from(subjectStats.values()).map(stats => ({
    subject: stats.name,
    total: stats.total,
    correct: stats.correct,
    wrong: stats.wrong,
    accuracy: ((stats.correct / stats.total) * 100).toFixed(1),
    percentage: parseFloat(((stats.correct / stats.total) * 100).toFixed(1))
  })).sort((a, b) => b.percentage - a.percentage)
  
  // Best and worst subjects
  const bestSubject = subjectPerformance[0]
  const worstSubject = subjectPerformance[subjectPerformance.length - 1]
  
  // ==========================================
  // STEP 4: Calculate performance trend (last 10 exams)
  // ==========================================
  const recentExams = completedExams.slice(0, 10).reverse()
  const performanceTrend = recentExams.map((exam, index) => ({
    examNumber: index + 1,
    examTitle: exam.exam.title,
    score: exam.score,
    totalMarks: exam.exam.totalMarks,
    percentage: ((exam.score / exam.exam.totalMarks) * 100).toFixed(1),
    date: exam.submittedAt,
    passed: exam.passed
  }))
  
  // ==========================================
  // STEP 5: Recent exam history
  // ==========================================
  const recentExamHistory = completedExams.slice(0, 5).map(exam => ({
    id: exam.id,
    examTitle: exam.exam.title,
    score: exam.score,
    totalMarks: exam.exam.totalMarks,
    percentage: ((exam.score / exam.exam.totalMarks) * 100).toFixed(1),
    grade: exam.grade,
    passed: exam.passed,
    submittedAt: exam.submittedAt,
    timeSpent: exam.timeSpent
  }))
  
  // ==========================================
  // STEP 6: Calculate strength and weakness
  // ==========================================
  // Strength: Subject with highest accuracy
  // Weakness: Subject with lowest accuracy
  
  return {
    totalExams,
    averageScore: Math.round(averageScore),
    averagePercentage: averagePercentage.toFixed(1),
    totalQuestions,
    totalCorrect,
    totalWrong,
    accuracy: ((totalCorrect / totalQuestions) * 100).toFixed(1),
    passRate: passRate.toFixed(1),
    bestSubject: bestSubject?.subject || 'N/A',
    worstSubject: worstSubject?.subject || 'N/A',
    recentExams: recentExamHistory,
    subjectPerformance,
    performanceTrend,
    strengths: subjectPerformance.filter(s => parseFloat(s.accuracy) >= 80),
    weaknesses: subjectPerformance.filter(s => parseFloat(s.accuracy) < 60)
  }
}

// ==========================================
// GET DETAILED SUBJECT ANALYSIS
// ==========================================
// Deep dive into a specific subject's performance

export async function getSubjectAnalysis(studentId: string, subjectId: string) {
  logger.info(`Fetching subject analysis for student ${studentId}, subject ${subjectId}`)
  
  // Get subject details
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    include: { topics: true }
  })
  
  if (!subject) {
    throw new NotFoundError('Subject not found')
  }
  
  // Get all answers for this subject
  const answers = await prisma.studentAnswer.findMany({
    where: {
      studentExam: {
        studentId: studentId,
        status: 'SUBMITTED'
      },
      question: {
        subjectId: subjectId
      }
    },
    include: {
      question: {
        include: {
          topic: true
        }
      },
      studentExam: {
        include: {
          exam: true
        }
      }
    }
  })
  
  if (answers.length === 0) {
    return {
      subject: subject.name,
      totalQuestions: 0,
      correct: 0,
      wrong: 0,
      accuracy: 0,
      topicBreakdown: [],
      difficultyBreakdown: [],
      recentPerformance: []
    }
  }
  
  // Overall stats
  const totalQuestions = answers.length
  const correct = answers.filter(a => a.isCorrect === true).length
  const wrong = answers.filter(a => a.isCorrect === false).length
  const accuracy = (correct / totalQuestions) * 100
  
  // Topic breakdown
  const topicStats = new Map<string, any>()
  
  for (const answer of answers) {
    const topicName = answer.question.topic?.name || 'General'
    
    if (!topicStats.has(topicName)) {
      topicStats.set(topicName, {
        topic: topicName,
        total: 0,
        correct: 0,
        wrong: 0
      })
    }
    
    const stats = topicStats.get(topicName)!
    stats.total++
    if (answer.isCorrect === true) stats.correct++
    if (answer.isCorrect === false) stats.wrong++
  }
  
  const topicBreakdown = Array.from(topicStats.values()).map(stats => ({
    ...stats,
    accuracy: ((stats.correct / stats.total) * 100).toFixed(1)
  })).sort((a, b) => parseFloat(b.accuracy) - parseFloat(a.accuracy))
  
  // Difficulty breakdown
  const difficultyStats = new Map<string, any>()
  
  for (const answer of answers) {
    const difficulty = answer.question.difficulty
    
    if (!difficultyStats.has(difficulty)) {
      difficultyStats.set(difficulty, {
        difficulty,
        total: 0,
        correct: 0,
        wrong: 0
      })
    }
    
    const stats = difficultyStats.get(difficulty)!
    stats.total++
    if (answer.isCorrect === true) stats.correct++
    if (answer.isCorrect === false) stats.wrong++
  }
  
  const difficultyBreakdown = Array.from(difficultyStats.values()).map(stats => ({
    ...stats,
    accuracy: ((stats.correct / stats.total) * 100).toFixed(1)
  }))
  
  // Recent performance (last 10 answers)
  const recentAnswers = answers.slice(-10).map(answer => ({
    question: answer.question.questionText.substring(0, 100) + '...',
    isCorrect: answer.isCorrect,
    difficulty: answer.question.difficulty,
    topic: answer.question.topic?.name,
    answeredAt: answer.answeredAt
  }))
  
  return {
    subject: subject.name,
    totalQuestions,
    correct,
    wrong,
    accuracy: accuracy.toFixed(1),
    topicBreakdown,
    difficultyBreakdown,
    recentPerformance: recentAnswers,
    strongTopics: topicBreakdown.filter(t => parseFloat(t.accuracy) >= 80),
    weakTopics: topicBreakdown.filter(t => parseFloat(t.accuracy) < 60)
  }
}

// ==========================================
// GET ADMIN DASHBOARD STATS
// ==========================================
// System-wide statistics for admin dashboard

export async function getAdminDashboardStats() {
  logger.info('Fetching admin dashboard stats')
  
  // ==========================================
  // STEP 1: User statistics
  // ==========================================
  const totalUsers = await prisma.user.count()
  const totalStudents = await prisma.user.count({ where: { role: 'STUDENT' } })
  const totalTeachers = await prisma.user.count({ where: { role: 'TEACHER' } })
  const activeStudents = await prisma.user.count({
    where: {
      role: 'STUDENT',
      lastLogin: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
      }
    }
  })
  
  // ==========================================
  // STEP 2: Question bank statistics
  // ==========================================
  const totalQuestions = await prisma.question.count()
  const activeQuestions = await prisma.question.count({ where: { isActive: true } })
  
  const questionsBySubject = await prisma.subject.findMany({
    include: {
      _count: {
        select: { questions: true }
      }
    }
  })
  
  const subjectDistribution = questionsBySubject.map(subject => ({
    subject: subject.name,
    count: subject._count.questions
  }))
  
  // ==========================================
  // STEP 3: Exam statistics
  // ==========================================
  const totalExams = await prisma.exam.count()
  const publishedExams = await prisma.exam.count({ where: { isPublished: true } })
  const totalAttempts = await prisma.studentExam.count()
  const completedAttempts = await prisma.studentExam.count({ where: { status: 'SUBMITTED' } })
  const inProgressAttempts = await prisma.studentExam.count({ where: { status: 'IN_PROGRESS' } })
  
  // Average score across all exams
  const allCompletedExams = await prisma.studentExam.findMany({
    where: { status: 'SUBMITTED' },
    include: { exam: true }
  })
  
  let averageScore = 0
  if (allCompletedExams.length > 0) {
    const totalPercentage = allCompletedExams.reduce((sum, exam) => {
      return sum + (exam.score / exam.exam.totalMarks) * 100
    }, 0)
    averageScore = totalPercentage / allCompletedExams.length
  }
  
  const passRate = allCompletedExams.length > 0
    ? (allCompletedExams.filter(e => e.passed).length / allCompletedExams.length) * 100
    : 0
  
  // ==========================================
  // STEP 4: Recent activity
  // ==========================================
  const recentExams = await prisma.studentExam.findMany({
    where: { status: 'SUBMITTED' },
    include: {
      student: { select: { firstName: true, lastName: true } },
      exam: { select: { title: true, totalMarks: true } }
    },
    orderBy: { submittedAt: 'desc' },
    take: 10
  })
  
  const recentActivity = recentExams.map(exam => ({
    studentName: `${exam.student.firstName} ${exam.student.lastName}`,
    examTitle: exam.exam.title,
    score: exam.score,
    percentage: ((exam.score / exam.exam.totalMarks) * 100).toFixed(1),
    passed: exam.passed,
    submittedAt: exam.submittedAt
  }))
  
  // ==========================================
  // STEP 5: Performance trends (last 30 days)
  // ==========================================
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  
  const examsLast30Days = await prisma.studentExam.groupBy({
    by: ['submittedAt'],
    where: {
      status: 'SUBMITTED',
      submittedAt: { gte: thirtyDaysAgo }
    },
    _count: true
  })
  
  // ==========================================
  // STEP 6: Top performers
  // ==========================================
  const studentStats = await prisma.studentExam.groupBy({
    by: ['studentId'],
    where: { status: 'SUBMITTED' },
    _avg: { score: true },
    _count: true,
    having: {
      score: {
        _avg: { gt: 0 }
      }
    },
    orderBy: {
      _avg: {
        score: 'desc'
      }
    },
    take: 10
  })
  
  const topPerformers = await Promise.all(
    studentStats.map(async (stat) => {
      const student = await prisma.user.findUnique({
        where: { id: stat.studentId },
        select: { firstName: true, lastName: true, email: true }
      })
      
      return {
        name: `${student?.firstName} ${student?.lastName}`,
        email: student?.email,
        averageScore: stat._avg.score?.toFixed(1) || '0',
        totalExams: stat._count
      }
    })
  )
  
  return {
    users: {
      total: totalUsers,
      students: totalStudents,
      teachers: totalTeachers,
      activeStudents
    },
    questions: {
      total: totalQuestions,
      active: activeQuestions,
      subjectDistribution
    },
    exams: {
      total: totalExams,
      published: publishedExams,
      totalAttempts,
      completed: completedAttempts,
      inProgress: inProgressAttempts
    },
    performance: {
      averageScore: averageScore.toFixed(1),
      passRate: passRate.toFixed(1)
    },
    recentActivity,
    topPerformers
  }
}

// ==========================================
// GET PERFORMANCE COMPARISON
// ==========================================
// Compare student's performance with class average

export async function getPerformanceComparison(studentId: string) {
  logger.info(`Fetching performance comparison for student ${studentId}`)
  
  // Get student's stats
  const studentExams = await prisma.studentExam.findMany({
    where: {
      studentId: studentId,
      status: 'SUBMITTED'
    },
    include: { exam: true }
  })
  
  if (studentExams.length === 0) {
    return {
      studentAverage: 0,
      classAverage: 0,
      percentile: 0,
      comparison: 'No data available'
    }
  }
  
  // Calculate student average
  const studentTotal = studentExams.reduce((sum, exam) => {
    return sum + (exam.score / exam.exam.totalMarks) * 100
  }, 0)
  const studentAverage = studentTotal / studentExams.length
  
  // Calculate class average (all students)
  const allExams = await prisma.studentExam.findMany({
    where: { status: 'SUBMITTED' },
    include: { exam: true }
  })
  
  const classTotal = allExams.reduce((sum, exam) => {
    return sum + (exam.score / exam.exam.totalMarks) * 100
  }, 0)
  const classAverage = allExams.length > 0 ? classTotal / allExams.length : 0
  
  // Calculate percentile
  // How many students have lower average than this student?
  const studentAverages = await prisma.studentExam.groupBy({
    by: ['studentId'],
    where: { status: 'SUBMITTED' },
    _avg: { score: true }
  })
  
  const lowerCount = studentAverages.filter(stat => {
    const avg = stat._avg.score || 0
    return avg < (studentTotal / studentExams.length)
  }).length
  
  const percentile = (lowerCount / studentAverages.length) * 100
  
  // Comparison message
  let comparison = ''
  const diff = studentAverage - classAverage
  if (diff > 10) {
    comparison = 'Excellent! You are performing significantly above class average.'
  } else if (diff > 0) {
    comparison = 'Good! You are performing above class average.'
  } else if (diff > -10) {
    comparison = 'You are performing close to class average.'
  } else {
    comparison = 'You can improve! Focus on your weak areas.'
  }
  
  return {
    studentAverage: studentAverage.toFixed(1),
    classAverage: classAverage.toFixed(1),
    percentile: percentile.toFixed(0),
    comparison,
    difference: diff.toFixed(1)
  }
}

// ==========================================
// GET PROGRESS OVER TIME
// ==========================================
// Track student's improvement over time

export async function getProgressOverTime(studentId: string, days: number = 30) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  
  const exams = await prisma.studentExam.findMany({
    where: {
      studentId: studentId,
      status: 'SUBMITTED',
      submittedAt: { gte: startDate }
    },
    include: { exam: true },
    orderBy: { submittedAt: 'asc' }
  })
  
  const progressData = exams.map((exam, index) => ({
    examNumber: index + 1,
    examTitle: exam.exam.title,
    score: exam.score,
    percentage: ((exam.score / exam.exam.totalMarks) * 100).toFixed(1),
    date: exam.submittedAt,
    passed: exam.passed
  }))
  
  // Calculate trend (improving, stable, declining)
  let trend = 'STABLE'
  if (progressData.length >= 3) {
    const firstThird = progressData.slice(0, Math.floor(progressData.length / 3))
    const lastThird = progressData.slice(-Math.floor(progressData.length / 3))
    
    const firstAvg = firstThird.reduce((sum, p) => sum + parseFloat(p.percentage), 0) / firstThird.length
    const lastAvg = lastThird.reduce((sum, p) => sum + parseFloat(p.percentage), 0) / lastThird.length
    
    if (lastAvg > firstAvg + 5) trend = 'IMPROVING'
    if (lastAvg < firstAvg - 5) trend = 'DECLINING'
  }
  
  return {
    period: `Last ${days} days`,
    totalExams: exams.length,
    progressData,
    trend
  }
}
