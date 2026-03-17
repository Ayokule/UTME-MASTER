/**
 * Student Dashboard API Client
 * 
 * Handles API communication for separate Official Exams and Practice Tests dashboards.
 */

import apiClient from './client'

export interface OfficialExamsDashboard {
  type: 'official_exams'
  stats: {
    total_exams: number
    average_score: number
    best_score: number
    worst_score: number
    pass_rate: number
    passed_exams: number
  }
  subject_performance: Array<{
    subject: string
    score: number
    tests: number
  }>
  progress: Array<{
    date: string
    score: number
    exam_title: string
  }>
  recent_activity: Array<{
    id: string
    exam_title: string
    score: number
    percentage: number
    date: string
    subjects: string[]
    status: string
    grade: string
  }>
  strengths: string[]
  weaknesses: string[]
}

export interface PracticeTestsDashboard {
  type: 'practice_tests'
  stats: {
    total_tests: number
    average_score: number
    best_score: number
    worst_score: number
    improvement_trend: number
  }
  subject_performance: Array<{
    subject: string
    score: number
    tests: number
  }>
  progress: Array<{
    date: string
    score: number
    test_title: string
  }>
  recent_activity: Array<{
    id: string
    test_title: string
    score: number
    percentage: number
    date: string
    subjects: string[]
    status: string
    time_spent: number
  }>
  strong_areas: string[]
  weak_areas: string[]
}

/**
 * Get Official Exams Dashboard
 * 
 * Retrieves dashboard data for official exams only.
 * Shows statistics, performance by subject, progress over time, and recent activity.
 * 
 * @returns Official exams dashboard data
 * @throws Error if request fails
 */
export const getOfficialExamsDashboard = async (): Promise<{ success: boolean; data: OfficialExamsDashboard }> => {
  try {
    console.log('🔄 [STUDENT DASHBOARD API] Fetching official exams dashboard...')
    const response = await apiClient.get('/student/dashboard/official-exams')
    console.log('✅ [STUDENT DASHBOARD API] Official exams dashboard fetched successfully')
    return response.data
  } catch (error: any) {
    console.error('❌ [STUDENT DASHBOARD API] Failed to fetch official exams dashboard:', error.message)
    throw error
  }
}

/**
 * Get Practice Tests Dashboard
 * 
 * Retrieves dashboard data for practice tests only.
 * Shows statistics, performance by subject, progress over time, and recent activity.
 * Includes improvement trend analysis.
 * 
 * @returns Practice tests dashboard data
 * @throws Error if request fails
 */
export const getPracticeTestsDashboard = async (): Promise<{ success: boolean; data: PracticeTestsDashboard }> => {
  try {
    console.log('🔄 [STUDENT DASHBOARD API] Fetching practice tests dashboard...')
    const response = await apiClient.get('/student/dashboard/practice-tests')
    console.log('✅ [STUDENT DASHBOARD API] Practice tests dashboard fetched successfully')
    return response.data
  } catch (error: any) {
    console.error('❌ [STUDENT DASHBOARD API] Failed to fetch practice tests dashboard:', error.message)
    throw error
  }
}
