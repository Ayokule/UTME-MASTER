// ==========================================
// STUDENT DASHBOARD SERVICE
// ==========================================
// Separate dashboards for Official Exams and Practice Tests

import { prisma } from '../config/database'
import { logger } from '../utils/logger'

// ==========================================
// GET OFFICIAL EXAMS DASHBOARD
// ==========================================
export async function getOfficialExamsDashboard(studentId: string) {
  try {
    // Get all official exams (not practice)
    const officialExams = await prisma.studentExam.findMany({
      where: {
        studentId,
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

    // Calculate statistics
    const totalExams = officialExams.length
    const scores = officialExams.map(exam => exam.score || 0)
    const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
    const bestScore = scores.length > 0 ? Math.max(...scores) : 0
    const worstScore = scores.length > 0 ? Math.min(...scores) : 0

    // Calculate pass rate
    const passedExams = officialExams.filter(exam => exam.passed).length
    const passRate = totalExams > 0 ? (passedExams / totalExams) * 100 : 0

    // Get all subjects for mapping
    const subjects = await prisma.subject.findMany({
      select: { id: true, name: true }
    })
    const subjectMap = new Map(subjects.map(s => [s.id, s.name]))

    // Calculate subject performance
    const subjectStats = new Map<string, { totalScore: number; count: number }>()

    officialExams.forEach(studentExam => {
      const subjectIds = Array.isArray(studentExam.exam.subjectIds)
        ? (studentExam.exam.subjectIds as string[])
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
    const recentExams = officialExams.slice(0, 10).reverse()
    const progress = recentExams.map(exam => ({
      date: exam.submittedAt?.toISOString().split('T')[0] || '',
      score: exam.score || 0,
      exam_title: exam.exam.title
    }))

    // Get recent activity (last 5 exams)
    const recentActivity = officialExams.slice(0, 5).map(exam => {
      const subjectIds = Array.isArray(exam.exam.subjectIds)
        ? (exam.exam.subjectIds as string[])
        : []
      const subjectNames = subjectIds.map(id => subjectMap.get(id)).filter(Boolean) as string[]

      return {
        id: exam.id,
        exam_title: exam.exam.title,
        score: exam.score || 0,
        percentage: Math.round((exam.score || 0) * 100 / (exam.totalQuestions || 1)),
        date: exam.submittedAt?.toISOString() || '',
        subjects: subjectNames,
        status: exam.status,
        grade: exam.grade
      }
    })

    // Identify strengths and weaknesses
    const sortedSubjects = subjectPerformance.sort((a, b) => b.score - a.score)
    const strengths = sortedSubjects.slice(0, 3).map(s => s.subject)
    const weaknesses = sortedSubjects.slice(-3).reverse().map(s => s.subject)

    logger.info(`Official exams dashboard loaded for student ${studentId}`)

    return {
      type: 'official_exams',
      stats: {
        total_exams: totalExams,
        average_score: Math.round(averageScore * 10) / 10,
        best_score: Math.round(bestScore),
        worst_score: Math.round(worstScore),
        pass_rate: Math.round(passRate),
        passed_exams: passedExams
      },
      subject_performance: subjectPerformance,
      progress,
      recent_activity: recentActivity,
      strengths,
      weaknesses
    }
  } catch (error) {
    logger.error('Error loading official exams dashboard:', error)
    throw error
  }
}

// ==========================================
// GET PRACTICE TESTS DASHBOARD
// ==========================================
export async function getPracticeTestsDashboard(studentId: string) {
  try {
    // Get all practice tests
    const practiceTests = await prisma.studentExam.findMany({
      where: {
        studentId,
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

    // Calculate statistics
    const totalTests = practiceTests.length
    const scores = practiceTests.map(test => test.score || 0)
    const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
    const bestScore = scores.length > 0 ? Math.max(...scores) : 0
    const worstScore = scores.length > 0 ? Math.min(...scores) : 0

    // Calculate improvement trend
    let improvementTrend = 0
    if (practiceTests.length >= 2) {
      const recentScores = scores.slice(0, 5)
      const olderScores = scores.slice(5, 10)
      if (olderScores.length > 0) {
        const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length
        const olderAvg = olderScores.reduce((a, b) => a + b, 0) / olderScores.length
        improvementTrend = Math.round(((recentAvg - olderAvg) / olderAvg) * 100)
      }
    }

    // Get all subjects for mapping
    const subjects = await prisma.subject.findMany({
      select: { id: true, name: true }
    })
    const subjectMap = new Map(subjects.map(s => [s.id, s.name]))

    // Calculate subject performance
    const subjectStats = new Map<string, { totalScore: number; count: number }>()

    practiceTests.forEach(studentTest => {
      const subjectIds = Array.isArray(studentTest.exam.subjectIds)
        ? (studentTest.exam.subjectIds as string[])
        : []

      subjectIds.forEach(subjectId => {
        const subjectName = subjectMap.get(subjectId)
        if (subjectName) {
          const score = studentTest.score || 0

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

    // Get progress over time (last 10 tests)
    const recentTests = practiceTests.slice(0, 10).reverse()
    const progress = recentTests.map(test => ({
      date: test.submittedAt?.toISOString().split('T')[0] || '',
      score: test.score || 0,
      test_title: test.exam.title
    }))

    // Get recent activity (last 5 tests)
    const recentActivity = practiceTests.slice(0, 5).map(test => {
      const subjectIds = Array.isArray(test.exam.subjectIds)
        ? (test.exam.subjectIds as string[])
        : []
      const subjectNames = subjectIds.map(id => subjectMap.get(id)).filter(Boolean) as string[]

      return {
        id: test.id,
        test_title: test.exam.title,
        score: test.score || 0,
        percentage: Math.round((test.score || 0) * 100 / (test.totalQuestions || 1)),
        date: test.submittedAt?.toISOString() || '',
        subjects: subjectNames,
        status: test.status,
        time_spent: test.timeSpent
      }
    })

    // Identify weak areas
    const sortedSubjects = subjectPerformance.sort((a, b) => b.score - a.score)
    const strongAreas = sortedSubjects.slice(0, 3).map(s => s.subject)
    const weakAreas = sortedSubjects.slice(-3).reverse().map(s => s.subject)

    logger.info(`Practice tests dashboard loaded for student ${studentId}`)

    return {
      type: 'practice_tests',
      stats: {
        total_tests: totalTests,
        average_score: Math.round(averageScore * 10) / 10,
        best_score: Math.round(bestScore),
        worst_score: Math.round(worstScore),
        improvement_trend: improvementTrend
      },
      subject_performance: subjectPerformance,
      progress,
      recent_activity: recentActivity,
      strong_areas: strongAreas,
      weak_areas: weakAreas
    }
  } catch (error) {
    logger.error('Error loading practice tests dashboard:', error)
    throw error
  }
}
