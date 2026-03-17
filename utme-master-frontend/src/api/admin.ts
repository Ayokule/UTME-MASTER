import apiClient from './client'

export interface AdminStats {
  totalStudents: number
  totalTeachers: number
  totalQuestions: number
  totalExams: number
  activeUsers: number
  totalSubjects: number
}

export interface RecentActivity {
  id: string
  type: 'exam_completed' | 'user_registered'
  description: string
  time: string
  icon: string
  score?: number
  role?: string
}

export interface SubjectDistribution {
  subject: string
  questions: number
  code: string
}

export interface ExamStatusStats {
  completed: number
  in_progress: number
  not_started: number
}

export interface PerformanceChart {
  date: string
  averageScore: number
  totalExams: number
}

export interface SystemHealth {
  database: string
  api: string
  storage: string
  uptime: string
}

export interface AdminDashboardData {
  stats: AdminStats
  recentActivity: RecentActivity[]
  subjectDistribution: SubjectDistribution[]
  examStatusStats: ExamStatusStats
  performanceChart: PerformanceChart[]
  systemHealth: SystemHealth
}

// ==========================================
// NEW ANALYTICS INTERFACES
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

export interface DashboardAnalytics {
  overview: {
    totalStudents: number
    totalExams: number
    totalQuestions: number
    averagePerformance: number
    performanceTrend: number
  }
  recentActivity: Array<{
    id: string
    studentName: string
    examTitle: string
    score: number
    percentage: number
    completedAt: string
  }>
}

// Get admin dashboard data
export const getAdminDashboard = async (): Promise<AdminDashboardData> => {
  const response = await apiClient.get('/analytics/admin/dashboard')
  return response.data.data
}

// ==========================================
// NEW ANALYTICS API FUNCTIONS
// ==========================================

// Get student performance stats
export const getStudentPerformanceStats = async (studentId: string): Promise<{ success: boolean; data: { stats: StudentPerformanceStats } }> => {
  const response = await apiClient.get(`/analytics/student/${studentId}/performance`)
  return response.data
}

// Get exam statistics
export const getExamStatistics = async (examId: string): Promise<{ success: boolean; data: { statistics: ExamStatistics } }> => {
  const response = await apiClient.get(`/analytics/exam/${examId}/statistics`)
  return response.data
}

// Get progress tracking
export const getProgressTracking = async (
  studentId: string, 
  timeRange: 'week' | 'month' | 'quarter' | 'year' = 'month'
): Promise<{ success: boolean; data: { progress: ProgressTracking } }> => {
  const response = await apiClient.get(`/analytics/student/${studentId}/progress-tracking?timeRange=${timeRange}`)
  return response.data
}

// Get dashboard analytics
export const getDashboardAnalytics = async (): Promise<{ success: boolean; data: { analytics: DashboardAnalytics } }> => {
  const response = await apiClient.get('/analytics/dashboard')
  return response.data
}

// ==========================================
// SYSTEM SETTINGS API
// ==========================================

export interface SystemSettings {
  id: string
  // General Settings
  siteName: string
  siteDescription: string
  maintenanceMode: boolean
  maxUploadSize: number
  sessionTimeout: number
  timezone: string
  
  // Security Settings
  enableTwoFactor: boolean
  passwordMinLength: number
  passwordExpiry: number
  maxLoginAttempts: number
  lockoutDuration: number
  enableAuditLog: boolean
  
  // Email Settings
  enableNotifications: boolean
  smtpHost: string
  smtpPort: number
  smtpUsername: string
  smtpPassword: string
  fromEmail: string
  
  // Metadata
  updatedBy: string
  createdAt: string
  updatedAt: string
  updatedByUser: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
}

// Get system settings
export const getSystemSettings = async (): Promise<{ success: boolean; data: { settings: SystemSettings } }> => {
  const response = await apiClient.get('/admin/settings')
  return response.data
}

// Update system settings
export const updateSystemSettings = async (settings: Partial<SystemSettings>): Promise<{ success: boolean; message: string; data: { settings: SystemSettings } }> => {
  const response = await apiClient.put('/admin/settings', settings)
  return response.data
}

// Reset system settings to defaults
export const resetSystemSettings = async (): Promise<{ success: boolean; message: string; data: { settings: SystemSettings } }> => {
  const response = await apiClient.post('/admin/settings/reset')
  return response.data
}

// Test email configuration
export const testEmailConfiguration = async (): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.post('/admin/settings/test-email')
  return response.data
}