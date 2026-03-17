import apiClient from './client'

export interface SystemHealth {
  status: 'healthy' | 'unhealthy'
  timestamp: string
  uptime: number
  database: {
    status: string
    connected: boolean
    responseTime: number
    error: string | null
  }
  memory: {
    used: number
    total: number
  }
  database_operations: {
    totalOperations: number
    successfulOperations: number
    failedOperations: number
    successRate: string
    averageDuration: string
    operationsByType: {
      READ: number
      WRITE: number
      UPDATE: number
      DELETE: number
    }
  }
}

export interface DatabaseDiagnostics {
  timestamp: string
  tables: {
    users: number
    exams: number
    questions: number
    subjects: number
    studentExams: number
    studentAnswers: number
  }
  errors: {
    recent: any[]
    summary: any
  }
}

// Check system health
export const checkSystemHealth = async (): Promise<SystemHealth> => {
  try {
    const response = await apiClient.get('/health')
    return response.data.data
  } catch (error: any) {
    console.error('❌ [HEALTH CHECK] Failed to check system health:', {
      error: error.message,
      status: error.response?.status
    })
    throw error
  }
}

// Get database diagnostics
export const getDatabaseDiagnostics = async (): Promise<DatabaseDiagnostics> => {
  try {
    const response = await apiClient.get('/health/database')
    return response.data.data
  } catch (error: any) {
    console.error('❌ [DB DIAGNOSTICS] Failed to get database diagnostics:', {
      error: error.message,
      status: error.response?.status
    })
    throw error
  }
}

// Get database logs
export const getDatabaseLogs = async () => {
  try {
    const response = await apiClient.get('/health/logs')
    return response.data.data
  } catch (error: any) {
    console.error('❌ [DB LOGS] Failed to get database logs:', {
      error: error.message,
      status: error.response?.status
    })
    throw error
  }
}
