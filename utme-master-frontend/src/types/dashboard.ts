/**
 * Dashboard Type Definitions
 * 
 * These interfaces define the shape of data flowing through the dashboard.
 * All API responses should conform to these types.
 * 
 * Nigerian Context:
 * - JAMB: Joint Admissions and Matriculation Board (main exam)
 * - WAEC: West African Examinations Council
 * - NECO: National Examination Council
 */

// ==========================================
// STATISTICS INTERFACE
// ==========================================

/**
 * Student performance statistics
 * 
 * @property total_tests - Total number of exams completed
 * @property average_score - Average score across all exams (0-100)
 * @property best_score - Highest score achieved (0-100)
 * @property hours_studied - Total study time in hours
 */
export interface DashboardStats {
  total_tests: number
  average_score: number
  best_score: number
  hours_studied: number
}

// ==========================================
// SUBJECT PERFORMANCE INTERFACE
// ==========================================

/**
 * Performance data for a single subject
 * 
 * Used for: Subject Performance Chart component
 * 
 * @property subject - Subject name (e.g., "Mathematics", "English", "Physics")
 * @property score - Average score in this subject (0-100)
 * @property tests - Number of tests taken in this subject
 * @property color - Optional hex color for chart visualization
 */
export interface SubjectPerformance {
  subject: string
  score: number
  tests: number
  color?: string
}

// ==========================================
// PROGRESS POINT INTERFACE
// ==========================================

/**
 * Single data point for progress tracking
 * 
 * Used for: Progress Over Time Chart component
 * 
 * @property date - ISO date string (YYYY-MM-DD)
 * @property score - Score achieved on this date (0-100)
 * @property exam_title - Optional exam name for tooltip
 */
export interface ProgressPoint {
  date: string
  score: number
  exam_title?: string
}

// ==========================================
// RECENT ACTIVITY INTERFACE
// ==========================================

/**
 * Recent exam activity record
 * 
 * Used for: Recent Activity component
 * 
 * @property id - Unique activity ID
 * @property exam_title - Name of the exam taken
 * @property score - Raw score achieved
 * @property percentage - Score as percentage (0-100)
 * @property date - ISO timestamp of completion
 * @property subjects - Array of subjects in the exam
 * @property status - Current status of the exam
 */
export interface RecentActivity {
  id: string
  exam_title: string
  score: number
  percentage: number
  date: string
  subjects: string[]
  status: 'COMPLETED' | 'IN_PROGRESS' | 'ABANDONED'
}

// ==========================================
// STUDENT INFO INTERFACE
// ==========================================

/**
 * Student profile information
 * 
 * @property name - Student's full name
 * @property streak_days - Consecutive days of study
 * @property license_tier - Subscription level (FREE, TRIAL, PREMIUM, ENTERPRISE)
 */
export interface StudentInfo {
  name: string
  streak_days: number
  license_tier: 'FREE' | 'TRIAL' | 'PREMIUM' | 'ENTERPRISE'
}

// ==========================================
// MAIN DASHBOARD DATA INTERFACE
// ==========================================

/**
 * Complete dashboard data structure
 * 
 * This is the main response from GET /api/student/dashboard
 * All child components receive subsets of this data.
 * 
 * @property student - Student profile information
 * @property stats - Performance statistics
 * @property subject_performance - Array of subject scores
 * @property progress - Array of progress points over time
 * @property recent_activity - Array of recent exam activities
 * @property strengths - Array of subject names where student excels
 * @property weaknesses - Array of subject names needing improvement
 * @property quote_of_day - Motivational quote for the student
 */
export interface DashboardData {
  student: StudentInfo
  stats: DashboardStats
  subject_performance: SubjectPerformance[]
  progress: ProgressPoint[]
  recent_activity: RecentActivity[]
  strengths: string[]
  weaknesses: string[]
  quote_of_day?: string
}

// ==========================================
// STAT CARD PROPS INTERFACE
// ==========================================

/**
 * Props for StatCard component
 * 
 * Used for: Displaying individual statistics
 * 
 * @property icon - React node for the icon
 * @property label - Label text (e.g., "Tests Taken")
 * @property value - The statistic value
 * @property change - Optional change indicator (e.g., "+5")
 * @property trend - Direction of change
 */
export interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'neutral'
}

// ==========================================
// API RESPONSE WRAPPER
// ==========================================

/**
 * Standard API response structure
 * 
 * All backend endpoints return this format:
 * {
 *   success: true,
 *   data: { ... actual data ... }
 * }
 */
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

// ==========================================
// ERROR RESPONSE INTERFACE
// ==========================================

/**
 * Error response from API
 * 
 * @property success - Always false for errors
 * @property message - Human-readable error message
 * @property error - Technical error details
 * @property status - HTTP status code
 */
export interface ApiErrorResponse {
  success: false
  message: string
  error?: string
  status?: number
}