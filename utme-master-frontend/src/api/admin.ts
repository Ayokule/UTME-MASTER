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

// Get admin dashboard data
export const getAdminDashboard = async (): Promise<AdminDashboardData> => {
  const response = await apiClient.get('/student/admin')
  return response.data.data
}