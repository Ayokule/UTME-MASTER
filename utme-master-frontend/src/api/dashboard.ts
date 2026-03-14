import apiClient from './client.js'
import { DashboardData } from '../types/dashboard'

// Get student dashboard data
export const getDashboardData = async (): Promise<DashboardData> => {
  const response = await apiClient.get('/student/dashboard')
  
  // Handle backend response structure: { success: true, data: {...} }
  const data = response.data?.data || response.data
  
  return data
}

// Get detailed subject analytics (premium feature)
export const getSubjectAnalytics = async (subject: string) => {
  const response = await apiClient.get(`/student/analytics/subject/${encodeURIComponent(subject)}`)
  return response.data
}

// Get predicted JAMB score (premium feature)
export const getPredictedScore = async () => {
  const response = await apiClient.get('/student/analytics/predicted-score')
  return response.data
}

// Get study recommendations
export const getStudyRecommendations = async () => {
  const response = await apiClient.get('/student/recommendations')
  return response.data
}