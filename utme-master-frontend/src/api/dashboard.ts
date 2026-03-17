/**
 * Dashboard API Client
 * 
 * Handles all API communication for the student dashboard.
 * Includes error handling, retry logic, and type safety.
 * 
 * Endpoint Convention: /api/student/...
 * All endpoints require JWT authentication
 * 
 * Nigerian Context:
 * - JAMB: Joint Admissions and Matriculation Board (main exam)
 * - WAEC: West African Examinations Council
 * - NECO: National Examination Council
 */

import apiClient from './client.js'
import { DashboardData } from '../types/dashboard'

// ==========================================
// CONFIGURATION
// ==========================================

// Note: apiClient already has /api in baseURL, so we only need the path after /api
const API_BASE = '/student'
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // milliseconds

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Retry logic for failed requests
 * Implements exponential backoff for server errors
 * 
 * @param fn - Async function to retry
 * @param retries - Number of retries remaining
 * @returns Result of the function
 */
async function retryRequest<T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> {
  try {
    return await fn()
  } catch (error: any) {
    // Retry only on server errors (5xx) and network issues
    if (retries > 0 && error.response?.status >= 500) {
      const delay = RETRY_DELAY * (MAX_RETRIES - retries + 1)
      await new Promise(resolve => setTimeout(resolve, delay))
      return retryRequest(fn, retries - 1)
    }
    throw error
  }
}

/**
 * Extract data from API response
 * Handles both wrapped { success, data } and direct responses
 * 
 * @param response - Axios response object
 * @returns Extracted data
 */
function extractData<T>(response: any): T {
  return response.data?.data || response.data
}

/**
 * Handle API errors with meaningful messages
 * Logs errors for debugging and provides user-friendly messages
 * 
 * @param error - Axios error object
 * @throws Error with user-friendly message
 */
function handleError(error: any): never {
  const status = error.response?.status
  const message = error.response?.data?.message || error.message

  console.error('[Dashboard API Error]', {
    status,
    message,
    url: error.config?.url,
    timestamp: new Date().toISOString()
  })

  // Handle specific error cases
  if (status === 401) {
    throw new Error('Authentication failed. Please log in again.')
  }
  if (status === 403) {
    throw new Error('Access denied. This feature requires a premium subscription.')
  }
  if (status === 404) {
    throw new Error('Resource not found.')
  }
  if (status >= 500) {
    throw new Error('Server error. Please try again later.')
  }

  throw new Error(message || 'An error occurred')
}

// ==========================================
// API FUNCTIONS
// ==========================================

/**
 * Fetch main dashboard data
 * 
 * Returns comprehensive student performance analytics including:
 * - Student profile (name, study streak, license tier)
 * - Performance statistics (tests taken, average score, best score, study hours)
 * - Subject-wise performance breakdown
 * - Progress over time
 * - Recent exam activity
 * - Strengths and weaknesses analysis
 * - Motivational quote
 * 
 * Available for: All users (FREE, TRIAL, PREMIUM)
 * 
 * @returns DashboardData with all dashboard information
 * @throws Error if request fails
 * 
 * Example:
 * ```typescript
 * const data = await getDashboardData()
 * console.log(data.stats.average_score) // 75.5
 * console.log(data.subject_performance) // Array of subject scores
 * ```
 */
export const getDashboardData = async (): Promise<DashboardData> => {
  try {
    return await retryRequest(async () => {
      const response = await apiClient.get(`${API_BASE}/dashboard`)
      return extractData<DashboardData>(response)
    })
  } catch (error) {
    handleError(error)
  }
}

/**
 * Get detailed subject analytics
 * 
 * Returns in-depth analytics for a specific JAMB subject including:
 * - Total exams taken in this subject
 * - Recent score trends
 * - Topic-wise performance breakdown
 * - Improvement recommendations
 * 
 * Premium Feature: Only available for TRIAL and PREMIUM users
 * FREE users will receive 403 Forbidden error
 * 
 * @param subject - Subject name (e.g., "Mathematics", "English", "Physics")
 * @returns Subject-specific analytics data
 * @throws Error if user lacks permission or subject not found
 * 
 * Example:
 * ```typescript
 * const math = await getSubjectAnalytics('Mathematics')
 * console.log(math.total_exams) // 15
 * console.log(math.recent_scores) // Array of recent scores
 * ```
 */
export const getSubjectAnalytics = async (subject: string) => {
  try {
    return await retryRequest(async () => {
      const encoded = encodeURIComponent(subject)
      const response = await apiClient.get(
        `${API_BASE}/analytics/subject/${encoded}`
      )
      return extractData(response)
    })
  } catch (error) {
    handleError(error)
  }
}

/**
 * Get predicted JAMB score
 * 
 * Returns AI-powered JAMB score prediction based on recent exam performance.
 * JAMB scores range from 0-400.
 * 
 * Prediction includes:
 * - Predicted JAMB score (0-400)
 * - Confidence level (0-100%)
 * - Number of exams used for prediction
 * - Personalized improvement recommendations
 * 
 * Premium Feature: Only available for TRIAL and PREMIUM users
 * FREE users will receive 403 Forbidden error
 * 
 * @returns Predicted JAMB score with confidence level
 * @throws Error if user lacks permission or insufficient data
 * 
 * Example:
 * ```typescript
 * const prediction = await getPredictedScore()
 * console.log(prediction.predicted_score) // 285 (out of 400)
 * console.log(prediction.confidence) // 85 (percent)
 * ```
 */
export const getPredictedScore = async () => {
  try {
    return await retryRequest(async () => {
      const response = await apiClient.get(
        `${API_BASE}/analytics/predicted-score`
      )
      return extractData(response)
    })
  } catch (error) {
    handleError(error)
  }
}

/**
 * Get personalized study recommendations
 * 
 * Returns AI-generated study recommendations based on performance analysis.
 * Includes subject-specific tips and general study strategies.
 * 
 * Available for: All users (FREE, TRIAL, PREMIUM)
 * 
 * Recommendations include:
 * - Subject-specific improvement areas
 * - General study tips
 * - Performance analysis summary
 * - Number of exams analyzed
 * 
 * @returns Array of personalized study recommendations
 * 
 * Example:
 * ```typescript
 * const tips = await getStudyRecommendations()
 * console.log(tips.recommendations) // Array of recommendation strings
 * console.log(tips.overall_performance) // Overall score percentage
 * ```
 */
export const getStudyRecommendations = async () => {
  try {
    return await retryRequest(async () => {
      const response = await apiClient.get(`${API_BASE}/recommendations`)
      return extractData(response)
    })
  } catch (error) {
    handleError(error)
  }
}

// ==========================================
// EXPORT DEFAULT
// ==========================================

export default {
  getDashboardData,
  getSubjectAnalytics,
  getPredictedScore,
  getStudyRecommendations
}
