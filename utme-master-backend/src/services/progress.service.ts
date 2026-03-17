// ==========================================
// PROGRESS SERVICE
// ==========================================
// Student progress tracking and analytics service

import { prisma } from '../config/database'
import { NotFoundError, BadRequestError } from '../utils/errors'
import { logger } from '../utils/logger'

// ==========================================
// INTERFACES
// ==========================================

export interface ProgressSummary {
  totalExamsTaken: number
  totalQuestionsAnswered: number
  overallAccuracy: number
  averageScore: number
  totalTimeSpent: number
  improvementRate: number
  currentLevel: string
  nextLevelProgress: number
}

export interface SubjectProgress {
  subjectId: string
  subjectName: string
  totalQuestions: number
  correctAnswers: number
  wrongAnswers: number
  averageScore: number
  accuracy: number
  timeSpent: number
  lastPracticeDate: string
  improvement: number
  trend: 'up' | 'down' | 'stable'
  weakTopics: string[]
  strongTopics: string[]
}

export interface PerformanceTrend {
  date: string
  score: number
  accuracy: number
  timeSpent: number
  subject: string
}

export interface StudyStreak {
  currentStreak: number
  longestStreak: number
  lastStudyDate: string
  totalStudyDays: number
}

// ==========================================
// PROGRESS SUMMARY
// ==========================================

export async function getProgressSummary(
  studentId: string, 
  timeRange: '7d' | '30d' | '90d' | 'all' = '30d'
): Promise<ProgressSummary> {
  const dateFilter = getDateFilter(timeRange)
  
  // Get student exam data
  const studentExams = await prisma.studentExam.findMany({
    where: {
      studentId,
      status: 'SUBMITTED',
      ...(dateFilter && { submittedAt: { gte: dateFilter } })
    },
    include: {
      answers: true,
      exam: {
        select: { title: true, totalMarks: true }
      }
    }
  })

  if (studentExams.length === 0) {
    return {
      totalExamsTaken: 0,
      totalQuestionsAnswered: 0,
      overallAccuracy: 0,
      averageScore: 0,
      totalTimeSpent: 0,
      improvementRate: 0,
      currentLevel: 'Beginner',
      nextLevelProgress: 0
    }
  }

  const totalExamsTaken = studentExams.length
  const totalQuestionsAnswered = studentExams.reduce((sum, exam) => sum + exam.answeredQuestions, 0)
  const totalCorrectAnswers = studentExams.reduce((sum, exam) => sum + exam.correctAnswers, 0)
  const overallAccuracy = totalQuestionsAnswered > 0 ? (totalCorrectAnswers / totalQuestionsAnswered) * 100 : 0
  const averageScore = studentExams.reduce((sum, exam) => sum + exam.score, 0) / totalExamsTaken
  const totalTimeSpent = studentExams.reduce((sum, exam) => sum + (exam.timeSpent || 0), 0)

  // Calculate improvement rate (compare with previous period)
  const previousPeriodFilter = getPreviousPeriodFilter(timeRange)
  const previousExams = await prisma.studentExam.findMany({
    where: {
      studentId,
      status: 'SUBMITTED',
      ...(previousPeriodFilter && { 
        submittedAt: { 
          gte: previousPeriodFilter.start, 
          lt: previousPeriodFilter.end 
        } 
      })
    }
  })

  let improvementRate = 0
  if (previousExams.length > 0) {
    const previousAverage = previousExams.reduce((sum, exam) => sum + exam.score, 0) / previousExams.length
    improvementRate = previousAverage > 0 ? ((averageScore - previousAverage) / previousAverage) * 100 : 0
  }

  // Determine current level and progress
  const { currentLevel, nextLevelProgress } = calculateLevel(overallAccuracy, averageScore)

  return {
    totalExamsTaken,
    totalQuestionsAnswered,
    overallAccuracy: Math.round(overallAccuracy * 100) / 100,
    averageScore: Math.round(averageScore * 100) / 100,
    totalTimeSpent,
    improvementRate: Math.round(improvementRate * 100) / 100,
    currentLevel,
    nextLevelProgress
  }
}

// ==========================================
// SUBJECT PROGRESS
// ==========================================

export async function getSubjectProgress(
  studentId: string,
  timeRange: '7d' | '30d' | '90d' | 'all' = '30d'
): Promise<SubjectProgress[]> {
  const dateFilter = getDateFilter(timeRange)
  
  // Get student progress data
  const progressData = await prisma.studentProgress.findMany({
    where: {
      studentId,
      ...(dateFilter && { updatedAt: { gte: dateFilter } })
    },
    include: {
      subject: {
        select: { name: true }
      }
    }
  })

  // Get detailed exam data for trend analysis
  const studentExams = await prisma.studentExam.findMany({
    where: {
      studentId,
      status: 'SUBMITTED',
      ...(dateFilter && { submittedAt: { gte: dateFilter } })
    },
    include: {
      answers: {
        include: {
          question: {
            select: { subjectId: true, topicId: true, difficulty: true }
          }
        }
      }
    }
  })

  const subjectProgress: SubjectProgress[] = []

  for (const progress of progressData) {
    const subjectExams = studentExams.filter(exam => 
      exam.answers.some(answer => answer.question.subjectId === progress.subjectId)
    )

    // Calculate subject-specific metrics
    const subjectAnswers = studentExams.flatMap(exam => 
      exam.answers.filter(answer => answer.question.subjectId === progress.subjectId)
    )

    const totalQuestions = subjectAnswers.length
    const correctAnswers = subjectAnswers.filter(answer => answer.isCorrect).length
    const wrongAnswers = totalQuestions - correctAnswers
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0

    // Calculate time spent (estimate based on exam duration)
    const timeSpent = subjectExams.reduce((sum, exam) => {
      const subjectQuestionCount = exam.answers.filter(
        answer => answer.question.subjectId === progress.subjectId
      ).length
      const examTimePerQuestion = exam.timeSpent ? exam.timeSpent / exam.answeredQuestions : 0
      return sum + (subjectQuestionCount * examTimePerQuestion)
    }, 0)

    // Calculate improvement trend
    const { improvement, trend } = await calculateSubjectTrend(studentId, progress.subjectId, timeRange)

    // Get topic analysis
    const { weakTopics, strongTopics } = analyzeTopics(subjectAnswers)

    subjectProgress.push({
      subjectId: progress.subjectId,
      subjectName: progress.subject.name,
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      averageScore: progress.averageScore,
      accuracy: Math.round(accuracy * 100) / 100,
      timeSpent: Math.round(timeSpent),
      lastPracticeDate: progress.lastPracticeDate?.toISOString() || new Date().toISOString(),
      improvement: Math.round(improvement * 100) / 100,
      trend,
      weakTopics,
      strongTopics
    })
  }

  return subjectProgress.sort((a, b) => b.accuracy - a.accuracy)
}

// ==========================================
// PERFORMANCE TRENDS
// ==========================================

export async function getPerformanceTrends(
  studentId: string,
  timeRange: '7d' | '30d' | '90d' | 'all' = '30d'
): Promise<PerformanceTrend[]> {
  const dateFilter = getDateFilter(timeRange)
  
  const studentExams = await prisma.studentExam.findMany({
    where: {
      studentId,
      status: 'SUBMITTED',
      ...(dateFilter && { submittedAt: { gte: dateFilter } })
    },
    include: {
      exam: {
        select: { title: true }
      },
      answers: {
        include: {
          question: {
            include: {
              subject: {
                select: { name: true }
              }
            }
          }
        }
      }
    },
    orderBy: { submittedAt: 'asc' }
  })

  const trends: PerformanceTrend[] = []

  for (const exam of studentExams) {
    const accuracy = exam.answeredQuestions > 0 ? (exam.correctAnswers / exam.answeredQuestions) * 100 : 0
    const avgTimePerQuestion = exam.timeSpent ? exam.timeSpent / exam.answeredQuestions : 0
    
    // Determine primary subject for this exam
    const subjectCounts = exam.answers.reduce((acc, answer) => {
      const subjectName = answer.question.subject?.name || 'Unknown'
      acc[subjectName] = (acc[subjectName] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const primarySubject = Object.entries(subjectCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Mixed'

    trends.push({
      date: exam.submittedAt?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      score: exam.score,
      accuracy: Math.round(accuracy * 100) / 100,
      timeSpent: Math.round(avgTimePerQuestion),
      subject: primarySubject
    })
  }

  return trends
}

// ==========================================
// STUDY STREAK
// ==========================================

export async function getStudyStreak(studentId: string): Promise<StudyStreak> {
  const studentExams = await prisma.studentExam.findMany({
    where: {
      studentId,
      status: 'SUBMITTED'
    },
    select: {
      submittedAt: true
    },
    orderBy: { submittedAt: 'desc' }
  })

  if (studentExams.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastStudyDate: new Date().toISOString(),
      totalStudyDays: 0
    }
  }

  // Get unique study dates
  const studyDates = [...new Set(
    studentExams
      .filter(exam => exam.submittedAt)
      .map(exam => exam.submittedAt!.toISOString().split('T')[0])
  )].sort()

  const totalStudyDays = studyDates.length
  const lastStudyDate = studyDates[studyDates.length - 1]

  // Calculate current streak
  let currentStreak = 0
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  
  // Check if studied today or yesterday
  if (studyDates.includes(today) || studyDates.includes(yesterday)) {
    let checkDate = studyDates.includes(today) ? today : yesterday
    let dateIndex = studyDates.indexOf(checkDate)
    
    while (dateIndex >= 0) {
      const currentDate = new Date(studyDates[dateIndex])
      const expectedDate = new Date(checkDate)
      
      if (currentDate.getTime() === expectedDate.getTime()) {
        currentStreak++
        expectedDate.setDate(expectedDate.getDate() - 1)
        checkDate = expectedDate.toISOString().split('T')[0]
        dateIndex--
      } else {
        break
      }
    }
  }

  // Calculate longest streak
  let longestStreak = 0
  let tempStreak = 1
  
  for (let i = 1; i < studyDates.length; i++) {
    const prevDate = new Date(studyDates[i - 1])
    const currDate = new Date(studyDates[i])
    const dayDiff = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
    
    if (dayDiff === 1) {
      tempStreak++
    } else {
      longestStreak = Math.max(longestStreak, tempStreak)
      tempStreak = 1
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak)

  return {
    currentStreak,
    longestStreak,
    lastStudyDate,
    totalStudyDays
  }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function getDateFilter(timeRange: string): Date | null {
  const now = new Date()
  switch (timeRange) {
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    case '90d':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    default:
      return null
  }
}

function getPreviousPeriodFilter(timeRange: string): { start: Date; end: Date } | null {
  const now = new Date()
  switch (timeRange) {
    case '7d':
      return {
        start: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
        end: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      }
    case '30d':
      return {
        start: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
        end: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      }
    case '90d':
      return {
        start: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
        end: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      }
    default:
      return null
  }
}

function calculateLevel(accuracy: number, averageScore: number): { currentLevel: string; nextLevelProgress: number } {
  const combinedScore = (accuracy + averageScore) / 2
  
  if (combinedScore >= 90) {
    return { currentLevel: 'Expert', nextLevelProgress: 100 }
  } else if (combinedScore >= 75) {
    return { currentLevel: 'Advanced', nextLevelProgress: ((combinedScore - 75) / 15) * 100 }
  } else if (combinedScore >= 60) {
    return { currentLevel: 'Intermediate', nextLevelProgress: ((combinedScore - 60) / 15) * 100 }
  } else if (combinedScore >= 40) {
    return { currentLevel: 'Beginner', nextLevelProgress: ((combinedScore - 40) / 20) * 100 }
  } else {
    return { currentLevel: 'Novice', nextLevelProgress: (combinedScore / 40) * 100 }
  }
}

async function calculateSubjectTrend(
  studentId: string, 
  subjectId: string, 
  timeRange: string
): Promise<{ improvement: number; trend: 'up' | 'down' | 'stable' }> {
  const currentPeriod = getDateFilter(timeRange)
  const previousPeriod = getPreviousPeriodFilter(timeRange)
  
  if (!currentPeriod || !previousPeriod) {
    return { improvement: 0, trend: 'stable' }
  }

  // Get current period performance
  const currentProgress = await prisma.studentProgress.findFirst({
    where: {
      studentId,
      subjectId,
      updatedAt: { gte: currentPeriod }
    }
  })

  // Get previous period performance
  const previousProgress = await prisma.studentProgress.findFirst({
    where: {
      studentId,
      subjectId,
      updatedAt: { gte: previousPeriod.start, lt: previousPeriod.end }
    }
  })

  if (!currentProgress || !previousProgress) {
    return { improvement: 0, trend: 'stable' }
  }

  const improvement = currentProgress.averageScore - previousProgress.averageScore
  const trend = improvement > 2 ? 'up' : improvement < -2 ? 'down' : 'stable'

  return { improvement, trend }
}

function analyzeTopics(answers: any[]): { weakTopics: string[]; strongTopics: string[] } {
  const topicPerformance = answers.reduce((acc, answer) => {
    const topicId = answer.question.topicId || 'General'
    if (!acc[topicId]) {
      acc[topicId] = { correct: 0, total: 0 }
    }
    acc[topicId].total++
    if (answer.isCorrect) {
      acc[topicId].correct++
    }
    return acc
  }, {} as Record<string, { correct: number; total: number }>)

  const topics = Object.entries(topicPerformance).map(([topicId, performance]) => ({
    topicId,
    accuracy: performance.total > 0 ? (performance.correct / performance.total) * 100 : 0,
    total: performance.total
  }))

  // Filter topics with sufficient data (at least 3 questions)
  const significantTopics = topics.filter(topic => topic.total >= 3)

  const weakTopics = significantTopics
    .filter(topic => topic.accuracy < 60)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3)
    .map(topic => topic.topicId)

  const strongTopics = significantTopics
    .filter(topic => topic.accuracy >= 80)
    .sort((a, b) => b.accuracy - a.accuracy)
    .slice(0, 3)
    .map(topic => topic.topicId)

  return { weakTopics, strongTopics }
}

// ==========================================
// UPDATE PROGRESS
// ==========================================

export async function updateStudentProgress(
  studentId: string,
  subjectId: string,
  questionsAnswered: number,
  correctAnswers: number,
  timeSpent: number
): Promise<void> {
  try {
    const accuracy = questionsAnswered > 0 ? (correctAnswers / questionsAnswered) * 100 : 0
    
    await prisma.studentProgress.upsert({
      where: {
        studentId_subjectId: {
          studentId,
          subjectId
        }
      },
      update: {
        totalQuestions: { increment: questionsAnswered },
        correctAnswers: { increment: correctAnswers },
        wrongAnswers: { increment: questionsAnswered - correctAnswers },
        averageScore: accuracy,
        lastPracticeDate: new Date(),
        updatedAt: new Date()
      },
      create: {
        studentId,
        subjectId,
        totalQuestions: questionsAnswered,
        correctAnswers,
        wrongAnswers: questionsAnswered - correctAnswers,
        averageScore: accuracy,
        lastPracticeDate: new Date()
      }
    })

    logger.info(`Progress updated for student ${studentId}, subject ${subjectId}`)
  } catch (error) {
    logger.error('Failed to update student progress:', error)
    throw error
  }
}