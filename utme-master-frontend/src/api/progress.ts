// ==========================================
// PROGRESS API FUNCTIONS
// ==========================================
// Frontend API functions for student progress tracking

import { apiClient } from './client'

// ==========================================
// INTERFACES
// ==========================================

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

export interface ProgressInsights {
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  achievements: string[]
}

// ==========================================
// PROGRESS API FUNCTIONS
// ==========================================

export const getProgressSummary = async (timeRange: '7d' | '30d' | '90d' | 'all' = '30d') => {
  const response = await apiClient.get(`/student/progress/summary?range=${timeRange}`)
  return response.data
}

export const getSubjectProgress = async (timeRange: '7d' | '30d' | '90d' | 'all' = '30d') => {
  const response = await apiClient.get(`/student/progress/subjects?range=${timeRange}`)
  return response.data
}

export const getPerformanceTrends = async (timeRange: '7d' | '30d' | '90d' | 'all' = '30d') => {
  const response = await apiClient.get(`/student/progress/trends?range=${timeRange}`)
  return response.data
}

export const getStudyStreak = async () => {
  const response = await apiClient.get('/student/progress/streak')
  return response.data
}

export const getProgressInsights = async () => {
  const response = await apiClient.get('/student/progress/insights')
  return response.data
}

export const getDetailedSubjectAnalysis = async (subjectId: string) => {
  const response = await apiClient.get(`/student/progress/subjects/${subjectId}/detailed`)
  return response.data
}

export const getTopicProgress = async (subjectId: string) => {
  const response = await apiClient.get(`/student/progress/subjects/${subjectId}/topics`)
  return response.data
}

export const getStudyGoals = async () => {
  const response = await apiClient.get('/student/progress/goals')
  return response.data
}

export const setStudyGoal = async (goalData: {
  type: 'daily_questions' | 'weekly_hours' | 'accuracy_target'
  target: number
  deadline?: string
}) => {
  const response = await apiClient.post('/student/progress/goals', goalData)
  return response.data
}

export const updateStudyGoal = async (goalId: string, updates: {
  target?: number
  deadline?: string
  completed?: boolean
}) => {
  const response = await apiClient.put(`/student/progress/goals/${goalId}`, updates)
  return response.data
}

export const getAchievements = async () => {
  const response = await apiClient.get('/student/progress/achievements')
  return response.data
}

export const getLeaderboard = async (timeRange: '7d' | '30d' | 'all' = '30d') => {
  const response = await apiClient.get(`/student/progress/leaderboard?range=${timeRange}`)
  return response.data
}

export const getStudyCalendar = async (month: string, year: string) => {
  const response = await apiClient.get(`/student/progress/calendar?month=${month}&year=${year}`)
  return response.data
}

export const logStudySession = async (sessionData: {
  subjectId: string
  duration: number
  questionsAnswered: number
  correctAnswers: number
  topics: string[]
}) => {
  const response = await apiClient.post('/student/progress/sessions', sessionData)
  return response.data
}

export const getWeakAreasRecommendations = async () => {
  const response = await apiClient.get('/student/progress/recommendations')
  return response.data
}

export const getProgressComparison = async (compareWith: 'class_average' | 'top_performers') => {
  const response = await apiClient.get(`/student/progress/comparison?type=${compareWith}`)
  return response.data
}