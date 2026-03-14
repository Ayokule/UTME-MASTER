export interface DashboardStats {
  total_tests: number
  average_score: number
  best_score: number
  hours_studied: number
}

export interface SubjectPerformance {
  subject: string
  score: number
  tests: number
  color?: string
}

export interface ProgressPoint {
  date: string
  score: number
  exam_title?: string
}

export interface RecentActivity {
  id: string
  exam_title: string
  score: number
  percentage: number
  date: string
  subjects: string[]
  status: 'COMPLETED' | 'IN_PROGRESS' | 'ABANDONED'
}

export interface DashboardData {
  student: {
    name: string
    streak_days: number
    license_tier: 'TRIAL' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE'
  }
  stats: DashboardStats
  subject_performance: SubjectPerformance[]
  progress: ProgressPoint[]
  recent_activity: RecentActivity[]
  strengths: string[]
  weaknesses: string[]
  quote_of_day?: string
}

export interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'neutral'
}