import apiClient from './client'

export interface DashboardStats {
  totalExams: number
  averageScore: number
  averagePercentage: string
  totalQuestions: number
  totalCorrect: number
  totalWrong: number
  accuracy: string
  passRate: string
  bestSubject: string
  worstSubject: string
  recentExams: RecentExam[]
  subjectPerformance: SubjectPerformance[]
  performanceTrend: PerformanceTrend[]
  strengths: SubjectStrength[]
  weaknesses: SubjectWeakness[]
}

export interface RecentExam {
  id: string
  examTitle: string
  score: number
  totalMarks: number
  percentage: string
  grade: string
  passed: boolean
  submittedAt: string
  timeSpent?: number
}

export interface SubjectPerformance {
  subject: string
  total: number
  correct: number
  wrong: number
  accuracy: string
  percentage: number
}

export interface PerformanceTrend {
  examNumber: number
  examTitle: string
  score: number
  totalMarks: number
  percentage: string
  date: string
  passed: boolean
}

export interface SubjectStrength {
  subject: string
  accuracy: string
}

export interface SubjectWeakness {
  subject: string
  accuracy: string
}

export interface PerformanceComparison {
  studentAverage: string
  classAverage: string
  percentile: string
  comparison: string
  difference: string
}

export interface SubjectAnalysis {
  subject: string
  totalQuestions: number
  correct: number
  wrong: number
  accuracy: string
  topicBreakdown: TopicBreakdown[]
  difficultyBreakdown: DifficultyBreakdown[]
  recentPerformance: RecentPerformance[]
  strongTopics: TopicBreakdown[]
  weakTopics: TopicBreakdown[]
}

export interface TopicBreakdown {
  topic: string
  total: number
  correct: number
  wrong: number
  accuracy: string
}

export interface DifficultyBreakdown {
  difficulty: string
  total: number
  correct: number
  wrong: number
  accuracy: string
}

export interface RecentPerformance {
  question: string
  isCorrect: boolean
  difficulty: string
  topic?: string
  answeredAt: string
}

export interface ProgressData {
  period: string
  totalExams: number
  progressData: PerformanceTrend[]
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING'
}

// Get student dashboard analytics
export const getStudentDashboard = async (): Promise<{ success: boolean; data: DashboardStats }> => {
  const response = await apiClient.get('/analytics/student/dashboard')
  return response.data
}

// Get subject analysis
export const getSubjectAnalysis = async (subjectId: string): Promise<{ success: boolean; data: SubjectAnalysis }> => {
  const response = await apiClient.get(`/analytics/student/subjects/${subjectId}`)
  return response.data
}

// Get performance comparison with class
export const getPerformanceComparison = async (): Promise<{ success: boolean; data: PerformanceComparison }> => {
  const response = await apiClient.get('/analytics/student/comparison')
  return response.data
}

// Get progress over time
export const getProgressOverTime = async (days: number = 30): Promise<{ success: boolean; data: ProgressData }> => {
  const response = await apiClient.get(`/analytics/student/progress?days=${days}`)
  return response.data
}

// Admin analytics
export interface AdminDashboardStats {
  users: {
    total: number
    students: number
    teachers: number
    activeStudents: number
  }
  questions: {
    total: number
    active: number
    subjectDistribution: { subject: string; count: number }[]
  }
  exams: {
    total: number
    published: number
    totalAttempts: number
    completed: number
    inProgress: number
  }
  performance: {
    averageScore: string
    passRate: string
  }
  recentActivity: {
    studentName: string
    examTitle: string
    score: number
    percentage: string
    passed: boolean
    submittedAt: string
  }[]
  topPerformers: {
    name: string
    email: string
    averageScore: string
    totalExams: number
  }[]
}

// Get admin dashboard analytics
export const getAdminDashboard = async (): Promise<{ success: boolean; data: AdminDashboardStats }> => {
  const response = await apiClient.get('/analytics/admin/dashboard')
  return response.data
}