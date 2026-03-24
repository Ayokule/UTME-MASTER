// ==========================================
// ERROR LOGGER UTILITY
// ==========================================
// Centralized error logging for all API calls
// Logs to console and can be extended to send to backend

interface ErrorInfo {
  timestamp: string
  type: 'API_ERROR' | 'PAGE_ERROR' | 'EXAM_ERROR' | 'AUTH_ERROR' | 'VALIDATION_ERROR' | 'UNKNOWN_ERROR'
  endpoint?: string
  method?: string
  statusCode?: number
  message: string
  details?: any
  stack?: string
  url?: string
}

class ErrorLogger {
  private logs: ErrorInfo[] = []
  private maxLogs = 100

  /**
   * Log API errors
   */
  logApiError(error: any, endpoint?: string, method?: string) {
    const isNetworkError = !error?.response && error?.message === 'Network Error'

    const errorInfo: ErrorInfo = {
      timestamp: new Date().toISOString(),
      type: 'API_ERROR',
      endpoint,
      method,
      statusCode: error?.response?.status,
      message: isNetworkError
        ? `Network Error — cannot reach server at ${error?.config?.baseURL || 'unknown'}. Is the backend running?`
        : error?.response?.data?.error?.message || error?.response?.data?.message || error?.message || 'Unknown API error',
      details: isNetworkError
        ? {
            hint: 'Backend may be down or VITE_API_URL is wrong',
            baseURL: error?.config?.baseURL,
            fullURL: error?.config?.url,
            requestData: error?.config?.data
          }
        : error?.response?.data,
      stack: error?.stack,
      url: error?.config?.url
    }

    this.addLog(errorInfo)
    this.printError(errorInfo)
  }

  /**
   * Log page/route errors
   */
  logPageError(error: any, pagePath?: string) {
    const errorInfo: ErrorInfo = {
      timestamp: new Date().toISOString(),
      type: 'PAGE_ERROR',
      message: error?.message || 'Unknown page error',
      details: error,
      stack: error?.stack,
      url: pagePath || window.location.pathname
    }

    this.addLog(errorInfo)
    this.printError(errorInfo)
  }

  /**
   * Log exam-related errors
   */
  logExamError(error: any, examId?: string, action?: string) {
    const errorInfo: ErrorInfo = {
      timestamp: new Date().toISOString(),
      type: 'EXAM_ERROR',
      message: error?.message || 'Unknown exam error',
      details: {
        examId,
        action,
        error: error?.response?.data || error
      },
      stack: error?.stack
    }

    this.addLog(errorInfo)
    this.printError(errorInfo)
  }

  /**
   * Log authentication errors
   */
  logAuthError(error: any, action?: string) {
    const errorInfo: ErrorInfo = {
      timestamp: new Date().toISOString(),
      type: 'AUTH_ERROR',
      message: error?.message || 'Unknown auth error',
      details: {
        action,
        error: error?.response?.data || error
      },
      stack: error?.stack
    }

    this.addLog(errorInfo)
    this.printError(errorInfo)
  }

  /**
   * Log validation errors
   */
  logValidationError(error: any, formName?: string) {
    const errorInfo: ErrorInfo = {
      timestamp: new Date().toISOString(),
      type: 'VALIDATION_ERROR',
      message: error?.message || 'Validation failed',
      details: {
        formName,
        errors: error?.details || error
      }
    }

    this.addLog(errorInfo)
    this.printError(errorInfo)
  }

  /**
   * Generic error logging
   */
  logError(error: any, type: ErrorInfo['type'] = 'UNKNOWN_ERROR', context?: string) {
    const errorInfo: ErrorInfo = {
      timestamp: new Date().toISOString(),
      type,
      message: error?.message || 'Unknown error',
      details: {
        context,
        error
      },
      stack: error?.stack
    }

    this.addLog(errorInfo)
    this.printError(errorInfo)
  }

  /**
   * Add log to internal storage
   */
  private addLog(errorInfo: ErrorInfo) {
    this.logs.push(errorInfo)

    // Keep only last 100 logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }

    // Store in localStorage for debugging
    try {
      localStorage.setItem('errorLogs', JSON.stringify(this.logs))
    } catch (e) {
      console.warn('Could not store error logs in localStorage')
    }
  }

  /**
   * Print formatted error to console
   */
  private printError(errorInfo: ErrorInfo) {
    const style = this.getStyleForType(errorInfo.type)

    console.group(
      `%c[${errorInfo.type}] ${errorInfo.message}`,
      style
    )

    console.log('%cTimestamp:', 'font-weight: bold', errorInfo.timestamp)

    if (errorInfo.endpoint) {
      console.log('%cEndpoint:', 'font-weight: bold', `${errorInfo.method} ${errorInfo.endpoint}`)
    }

    if (errorInfo.statusCode) {
      console.log('%cStatus Code:', 'font-weight: bold', errorInfo.statusCode)
    }

    if (errorInfo.url) {
      console.log('%cURL:', 'font-weight: bold', errorInfo.url)
    }

    if (errorInfo.details) {
      console.log('%cDetails:', 'font-weight: bold', errorInfo.details)
    }

    if (errorInfo.stack) {
      console.log('%cStack:', 'font-weight: bold', errorInfo.stack)
    }

    console.groupEnd()
  }

  /**
   * Get console style based on error type
   */
  private getStyleForType(type: ErrorInfo['type']): string {
    const styles = {
      API_ERROR: 'color: #ff6b6b; font-weight: bold; font-size: 12px;',
      PAGE_ERROR: 'color: #ffa500; font-weight: bold; font-size: 12px;',
      EXAM_ERROR: 'color: #ff4444; font-weight: bold; font-size: 12px;',
      AUTH_ERROR: 'color: #ff1744; font-weight: bold; font-size: 12px;',
      VALIDATION_ERROR: 'color: #ffb300; font-weight: bold; font-size: 12px;',
      UNKNOWN_ERROR: 'color: #999; font-weight: bold; font-size: 12px;'
    }

    return styles[type] || styles.UNKNOWN_ERROR
  }

  /**
   * Get all logs
   */
  getLogs(): ErrorInfo[] {
    return this.logs
  }

  /**
   * Get logs by type
   */
  getLogsByType(type: ErrorInfo['type']): ErrorInfo[] {
    return this.logs.filter(log => log.type === type)
  }

  /**
   * Clear all logs
   */
  clearLogs() {
    this.logs = []
    try {
      localStorage.removeItem('errorLogs')
    } catch (e) {
      console.warn('Could not clear error logs from localStorage')
    }
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }

  /**
   * Print summary of all errors
   */
  printSummary() {
    console.group('%c📊 ERROR LOGGER SUMMARY', 'color: #6366f1; font-weight: bold; font-size: 14px;')

    const typeCount = this.logs.reduce((acc, log) => {
      acc[log.type] = (acc[log.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    console.log('%cTotal Errors:', 'font-weight: bold', this.logs.length)
    console.table(typeCount)

    console.log('%cRecent Errors:', 'font-weight: bold')
    console.table(this.logs.slice(-5))

    console.groupEnd()
  }
}

// Export singleton instance
export const errorLogger = new ErrorLogger()

// Make available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).errorLogger = errorLogger
}

export default errorLogger
