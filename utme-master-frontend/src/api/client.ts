import axios from 'axios'
import { useAuthStore } from '../store/auth'
import { errorLogger } from '../utils/errorLogger'
import { successLogger } from '../utils/successLogger'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Try to get token from Zustand store first, then localStorage
    const authStore = useAuthStore.getState()
    const token = authStore.token || localStorage.getItem('authToken')
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors and log all responses
apiClient.interceptors.response.use(
  (response) => {
    // Log successful API calls
    const method = response.config?.method?.toUpperCase() || 'UNKNOWN'
    const endpoint = response.config?.url || 'UNKNOWN'
    const statusCode = response.status

    successLogger.logApiSuccess(endpoint, method, statusCode)

    return response
  },
  (error) => {
    // Extract request info
    const method = error.config?.method?.toUpperCase() || 'UNKNOWN'
    const endpoint = error.config?.url || 'UNKNOWN'
    const statusCode = error.response?.status

    // Log the error
    errorLogger.logApiError(error, endpoint, method)

    // Handle specific error types
    if (statusCode === 401) {
      // Clear auth data on unauthorized
      const authStore = useAuthStore.getState()
      authStore.clearAuth()
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      window.location.href = '/login'
    } else if (statusCode === 404) {
      console.error(`❌ Not Found (404): ${method} ${endpoint}`)
    } else if (statusCode === 403) {
      console.error(`❌ Forbidden (403): ${method} ${endpoint}`)
    } else if (statusCode >= 500) {
      console.error(`❌ Server Error (${statusCode}): ${method} ${endpoint}`)
    }

    return Promise.reject(error)
  }
)

export default apiClient