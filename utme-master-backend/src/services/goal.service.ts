// ==========================================
// GOAL SERVICE
// ==========================================
// Student goal tracking and progress

import { prisma } from '../config/database'
import { logger } from '../utils/logger'

// ==========================================
// CREATE STUDENT GOAL
// ==========================================
export async function createStudentGoal(studentId: string, goalData: {
  title: string
  description?: string
  targetType: 'score' | 'exams' | 'time' | 'subjects'
  targetValue: number
  deadline?: Date
  subjectId?: string
}) {
  try {
    const goal = await prisma.studentGoal.create({
      data: {
        studentId,
        title: goalData.title,
        description: goalData.description,
        targetType: goalData.targetType,
        targetValue: goalData.targetValue,
        deadline: goalData.deadline,
        subjectId: goalData.subjectId
      }
    })
    
    logger.info(`Goal created for student ${studentId}: ${goal.id}`)
    
    return goal
  } catch (error) {
    logger.error('Error creating student goal:', error)
    throw new Error('Failed to create student goal')
  }
}

// ==========================================
// GET STUDENT GOALS
// ==========================================
export async function getStudentGoals(studentId: string) {
  try {
    const goals = await prisma.studentGoal.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' }
    })
    
    // Calculate progress for each goal
    const goalsWithProgress = await Promise.all(goals.map(async goal => {
      const progress = await calculateGoalProgress(goal)
      return { ...goal, progress }
    }))
    
    return goalsWithProgress
  } catch (error) {
    logger.error('Error getting student goals:', error)
    throw new Error('Failed to get student goals')
  }
}

// ==========================================
// CALCULATE GOAL PROGRESS
// ==========================================
async function calculateGoalProgress(goal: any) {
  try {
    const now = new Date()
    
    // Calculate based on target type
    switch (goal.targetType) {
      case 'score':
        // Get average score
        const scoreStats = await prisma.studentExam.aggregate({
          where: {
            studentId: goal.studentId,
            status: 'SUBMITTED'
          },
          _avg: {
            score: true
          }
        })
        
        const currentScore = scoreStats._avg.score || 0
        const percentage = Math.min(100, (currentScore / goal.targetValue) * 100)
        
        return {
          current: Math.round(currentScore),
          target: goal.targetValue,
          percentage: Math.round(percentage),
          completed: currentScore >= goal.targetValue
        }
      
      case 'exams':
        // Count completed exams
        const examCount = await prisma.studentExam.count({
          where: {
            studentId: goal.studentId,
            status: 'SUBMITTED'
          }
        })
        
        const percentage = Math.min(100, (examCount / goal.targetValue) * 100)
        
        return {
          current: examCount,
          target: goal.targetValue,
          percentage: Math.round(percentage),
          completed: examCount >= goal.targetValue
        }
      
      case 'time':
        // Calculate total time spent
        const timeStats = await prisma.studentExam.aggregate({
          where: {
            studentId: goal.studentId,
            status: 'SUBMITTED'
          },
          _sum: {
            timeSpent: true
          }
        })
        
        const currentTime = timeStats._sum.timeSpent || 0
        const percentage = Math.min(100, (currentTime / goal.targetValue) * 100)
        
        return {
          current: Math.round(currentTime),
          target: goal.targetValue,
          percentage: Math.round(percentage),
          completed: currentTime >= goal.targetValue
        }
      
      case 'subjects':
        // Get subject progress
        const subjectProgress = await prisma.studentProgress.findUnique({
          where: {
            studentId_subjectId: {
              studentId: goal.studentId,
              subjectId: goal.subjectId!
            }
          }
        })
        
        const currentScore = subjectProgress?.averageScore || 0
        const percentage = Math.min(100, (currentScore / goal.targetValue) * 100)
        
        return {
          current: Math.round(currentScore),
          target: goal.targetValue,
          percentage: Math.round(percentage),
          completed: currentScore >= goal.targetValue
        }
      
      default:
        return {
          current: 0,
          target: goal.targetValue,
          percentage: 0,
          completed: false
        }
    }
  } catch (error) {
    logger.error('Error calculating goal progress:', error)
    return {
      current: 0,
      target: goal.targetValue,
      percentage: 0,
      completed: false
    }
  }
}

// ==========================================
// UPDATE GOAL
// ==========================================
export async function updateGoal(goalId: string, goalData: {
  title?: string
  description?: string
  targetValue?: number
  deadline?: Date
  completed?: boolean
}) {
  try {
    const goal = await prisma.studentGoal.update({
      where: { id: goalId },
      data: goalData
    })
    
    logger.info(`Goal updated: ${goalId}`)
    
    return goal
  } catch (error) {
    logger.error('Error updating goal:', error)
    throw new Error('Failed to update goal')
  }
}

// ==========================================
// DELETE GOAL
// ==========================================
export async function deleteGoal(goalId: string) {
  try {
    await prisma.studentGoal.delete({
      where: { id: goalId }
    })
    
    logger.info(`Goal deleted: ${goalId}`)
  } catch (error) {
    logger.error('Error deleting goal:', error)
    throw new Error('Failed to delete goal')
  }
}

// ==========================================
// GET GOAL STATISTICS
// ==========================================
export async function getGoalStatistics(studentId: string) {
  try {
    const goals = await getStudentGoals(studentId)
    
    const totalGoals = goals.length
    const completedGoals = goals.filter(g => g.progress.completed).length
    const activeGoals = goals.filter(g => !g.progress.completed).length
    
    const averageProgress = goals.length > 0
      ? goals.reduce((sum, g) => sum + g.progress.percentage, 0) / goals.length
      : 0
    
    return {
      totalGoals,
      completedGoals,
      activeGoals,
      averageProgress: Math.round(averageProgress),
      goals
    }
  } catch (error) {
    logger.error('Error getting goal statistics:', error)
    throw new Error('Failed to get goal statistics')
  }
}
