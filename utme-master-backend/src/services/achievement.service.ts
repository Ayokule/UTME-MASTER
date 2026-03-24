// ==========================================
// ACHIEVEMENT SERVICE
// ==========================================
// Student achievement and badge system

import { prisma } from '../config/database'
import { logger } from '../utils/logger'

// ==========================================
// ACHIEVEMENT DEFINITIONS
// ==========================================
const ACHIEVEMENTS = [
  {
    id: 'first-exam',
    title: 'First Exam',
    description: 'Complete your first practice exam',
    icon: 'check',
    points: 10,
    condition: (stats: any) => stats.totalExams >= 1
  },
  {
    id: 'study-streak-3',
    title: '3-Day Streak',
    description: 'Study for 3 consecutive days',
    icon: 'zap',
    points: 25,
    condition: (stats: any) => stats.streakDays >= 3
  },
  {
    id: 'study-streak-7',
    title: '7-Day Streak',
    description: 'Study for 7 consecutive days',
    icon: 'zap',
    points: 50,
    condition: (stats: any) => stats.streakDays >= 7
  },
  {
    id: 'high-achiever',
    title: 'High Achiever',
    description: 'Score above 90% in any exam',
    icon: 'trophy',
    points: 100,
    condition: (stats: any) => stats.bestScore >= 90
  },
  {
    id: 'time-master',
    title: 'Time Master',
    description: 'Complete 10 exams under time limit',
    icon: 'clock',
    points: 75,
    condition: (stats: any) => stats.underTimeExams >= 10
  },
  {
    id: 'perfect-score',
    title: 'Perfect Score',
    description: 'Achieve 100% in any exam',
    icon: 'star',
    points: 200,
    condition: (stats: any) => stats.perfectScores >= 1
  },
  {
    id: 'subject-master-math',
    title: 'Mathematics Master',
    description: 'Score 85%+ in Mathematics',
    icon: 'book',
    points: 150,
    condition: (stats: any) => stats.mathScore >= 85
  },
  {
    id: 'subject-master-english',
    title: 'English Master',
    description: 'Score 85%+ in English',
    icon: 'book',
    points: 150,
    condition: (stats: any) => stats.englishScore >= 85
  },
  {
    id: 'all-round',
    title: 'All-Round Student',
    description: 'Score 70%+ in all subjects',
    icon: 'target',
    points: 300,
    condition: (stats: any) => stats.allSubjects70Plus
  },
  {
    id: 'exam-50',
    title: '50 Exams Completed',
    description: 'Complete 50 exams',
    icon: 'medal',
    points: 500,
    condition: (stats: any) => stats.totalExams >= 50
  }
]

// ==========================================
// GET STUDENT ACHIEVEMENTS
// ==========================================
export async function getStudentAchievements(studentId: string) {
  try {
    // Get student stats
    const stats = await getStudentStats(studentId)
    
    // Check each achievement
    const unlockedAchievements = ACHIEVEMENTS.filter(achievement => 
      achievement.condition(stats)
    )
    
    // Get all achievements with unlock status
    const achievements = ACHIEVEMENTS.map(achievement => ({
      ...achievement,
      unlocked: unlockedAchievements.some(a => a.id === achievement.id)
    }))
    
    // Calculate total points
    const totalPoints = unlockedAchievements.reduce((sum, a) => sum + a.points, 0)
    
    // Get progress toward next achievement
    const nextAchievement = ACHIEVEMENTS.find(a => !unlockedAchievements.some(ua => ua.id === a.id))
    
    return {
      achievements,
      totalPoints,
      nextAchievement,
      stats
    }
  } catch (error) {
    logger.error('Error getting student achievements:', error)
    throw new Error('Failed to get student achievements')
  }
}

// ==========================================
// GET STUDENT STATS FOR ACHIEVEMENTS
// ==========================================
async function getStudentStats(studentId: string) {
  try {
    // Get all completed exams
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

    // Calculate stats
    const totalExams = studentExams.length
    const bestScore = studentExams.reduce((max, exam) => 
      Math.max(max, (exam.score / exam.totalScore) * 100), 0
    )
    const perfectScores = studentExams.filter(exam => 
      (exam.score / exam.totalScore) * 100 === 100
    ).length
    
    // Calculate subject scores
    const subjectScores = new Map<string, number>()
    studentExams.forEach(exam => {
      exam.answers.forEach(answer => {
        const subjectName = answer.question.subject.name
        if (!subjectScores.has(subjectName)) {
          subjectScores.set(subjectName, 0)
        }
        const current = subjectScores.get(subjectName)!
        subjectScores.set(subjectName, current + (answer.isCorrect ? 1 : 0))
      })
    })
    
    // Get subject totals
    const subjectTotals = new Map<string, number>()
    studentExams.forEach(exam => {
      exam.answers.forEach(answer => {
        const subjectName = answer.question.subject.name
        subjectTotals.set(subjectName, (subjectTotals.get(subjectName) || 0) + 1)
      })
    })
    
    // Calculate subject percentages
    const subjectPercentages = new Map<string, number>()
    subjectScores.forEach((correct, subject) => {
      const total = subjectTotals.get(subject) || 0
      subjectPercentages.set(subject, (correct / total) * 100)
    })
    
    // Check all-round condition
    const allSubjects70Plus = Array.from(subjectPercentages.values())
      .every(score => score >= 70)
    
    // Calculate streak (simplified - would need more complex logic in production)
    const streakDays = Math.min(totalExams, 14) // Simplified
    
    // Calculate under time exams (simplified)
    const underTimeExams = Math.floor(totalExams * 0.7) // Simplified
    
    return {
      totalExams,
      bestScore,
      perfectScores,
      mathScore: subjectPercentages.get('Mathematics') || 0,
      englishScore: subjectPercentages.get('English') || 0,
      allSubjects70Plus,
      streakDays,
      underTimeExams
    }
  } catch (error) {
    logger.error('Error getting student stats:', error)
    throw new Error('Failed to get student stats')
  }
}

// ==========================================
// GET ACHIEVEMENT BY ID
// ==========================================
export async function getAchievementById(achievementId: string) {
  const achievement = ACHIEVEMENTS.find(a => a.id === achievementId)
  if (!achievement) {
    throw new Error('Achievement not found')
  }
  return achievement
}

// ==========================================
// GET ACHIEVEMENT LEADERBOARD
// ==========================================
export async function getAchievementLeaderboard(limit: number = 10) {
  try {
    // Get all students with achievements
    const students = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        isActive: true
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        studentExams: {
          where: {
            status: 'SUBMITTED'
          },
          select: {
            score: true,
            totalScore: true
          }
        }
      }
    })

    // Calculate points for each student
    const leaderboard = students
      .map(student => {
        const totalExams = student.studentExams.length
        const bestScore = student.studentExams.reduce((max, exam) => 
          Math.max(max, (exam.score / exam.totalScore) * 100), 0
        )
        
        // Calculate points based on achievements
        let points = 0
        if (totalExams >= 1) points += 10
        if (totalExams >= 10) points += 75
        if (totalExams >= 50) points += 500
        if (bestScore >= 90) points += 100
        if (bestScore >= 100) points += 200
        
        return {
          studentId: student.id,
          name: `${student.firstName} ${student.lastName}`,
          totalExams,
          bestScore: Math.round(bestScore),
          points
        }
      })
      .sort((a, b) => b.points - a.points)
      .slice(0, limit)

    return leaderboard
  } catch (error) {
    logger.error('Error getting achievement leaderboard:', error)
    throw new Error('Failed to get achievement leaderboard')
  }
}
