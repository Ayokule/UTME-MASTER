// ==========================================
// API ERROR INTERCEPTOR
// ==========================================
// Automatically logs all API errors

import apiClient from './client'
import { errorLogger } from '../utils/errorLogger'

/**
 * Setup error interceptor for all API calls
 */
export function setupErrorInterceptor() {
  // Response interceptor for errors
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      // Extract request info
      const method = error.config?.method?.toUpperCase() || 'UNKNOWN'
      const endpoint = error.config?.url || 'UNKNOWN'
      const statusCode = error.response?.status

      // Determine error type based on status code
      if (statusCode === 404) {
        errorLogger.logApiError(error, endpoint, method)
        console.error(`❌ Page Not Found (404): ${endpoint}`)
      } else if (statusCode === 401 || statusCode === 403) {
        errorLogger.logAuthError(error, `${method} ${endpoint}`)
        console.error(`❌ Authentication Error (${statusCode}): ${endpoint}`)
      } else if (statusCode === 400) {
        errorLogger.logValidationError(error, endpoint)
        console.error(`❌ Validation Error (400): ${endpoint}`)
      } else if (statusCode >= 500) {
        errorLogger.logApiError(error, endpoint, method)
        console.error(`❌ Server Error (${statusCode}): ${endpoint}`)
      } else {
        errorLogger.logApiError(error, endpoint, method)
        console.error(`❌ API Error: ${endpoint}`)
      }

      // Return rejected promise to allow caller to handle
      return Promise.reject(error)
    }
  )
}

export default setupErrorInterceptor
