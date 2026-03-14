// ==========================================
// SUCCESS LOGGER UTILITY
// ==========================================
// Logs successful operations and startup info

interface SuccessInfo {
  timestamp: string
  type: 'APP_START' | 'API_SUCCESS' | 'AUTH_SUCCESS' | 'EXAM_SUCCESS' | 'DATA_LOAD' | 'OPERATION_SUCCESS'
  message: string
  details?: any
  duration?: number // in milliseconds
}

class SuccessLogger {
  private logs: SuccessInfo[] = []
  private maxLogs = 50

  /**
   * Log app startup
   */
  logAppStart(version?: string, environment?: string) {
    const successInfo: SuccessInfo = {
      timestamp: new Date().toISOString(),
      type: 'APP_START',
      message: '🚀 UTME Master App Started Successfully',
      details: {
        version: version || '1.0.0',
        environment: environment || import.meta.env.MODE,
        url: window.location.href,
        userAgent: navigator.userAgent
      }
    }

    this.addLog(successInfo)
    this.printSuccess(successInfo)
  }

  /**
   * Log API success
   */
  logApiSuccess(endpoint: string, method: string, statusCode: number, duration?: number) {
    const successInfo: SuccessInfo = {
      timestamp: new Date().toISOString(),
      type: 'API_SUCCESS',
      message: `✅ ${method} ${endpoint}`,
      details: {
        statusCode,
        endpoint,
        method
      },
      duration
    }

    this.addLog(successInfo)
    console.log(`%c✅ ${method} ${endpoint} (${statusCode})`, 'color: #10b981; font-weight: bold;')
  }

  /**
   * Log authentication success
   */
  logAuthSuccess(email: string, role: string) {
    const successInfo: SuccessInfo = {
      timestamp: new Date().toISOString(),
      type: 'AUTH_SUCCESS',
      message: `✅ User logged in: ${email}`,
      details: {
        email,
        role
      }
    }

    this.addLog(successInfo)
    this.printSuccess(successInfo)
  }

  /**
   * Log exam success
   */
  logExamSuccess(examId: string, action: string, details?: any) {
    const successInfo: SuccessInfo = {
      timestamp: new Date().toISOString(),
      type: 'EXAM_SUCCESS',
      message: `✅ Exam ${action}: ${examId}`,
      details: {
        examId,
        action,
        ...details
      }
    }

    this.addLog(successInfo)
    this.printSuccess(successInfo)
  }

  /**
   * Log data load success
   */
  logDataLoad(dataType: string, count: number, duration?: number) {
    const successInfo: SuccessInfo = {
      timestamp: new Date().toISOString(),
      type: 'DATA_LOAD',
      message: `✅ Loaded ${count} ${dataType}`,
      details: {
        dataType,
        count
      },
      duration
    }

    this.addLog(successInfo)
    console.log(`%c✅ Loaded ${count} ${dataType}${duration ? ` (${duration}ms)` : ''}`, 'color: #10b981; font-weight: bold;')
  }

  /**
   * Log generic operation success
   */
  logSuccess(message: string, details?: any, duration?: number) {
    const successInfo: SuccessInfo = {
      timestamp: new Date().toISOString(),
      type: 'OPERATION_SUCCESS',
      message: `✅ ${message}`,
      details,
      duration
    }

    this.addLog(successInfo)
    this.printSuccess(successInfo)
  }

  /**
   * Add log to internal storage
   */
  private addLog(successInfo: SuccessInfo) {
    this.logs.push(successInfo)

    // Keep only last 50 logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }
  }

  /**
   * Print formatted success to console
   */
  private printSuccess(successInfo: SuccessInfo) {
    const style = 'color: #10b981; font-weight: bold; font-size: 12px;'

    console.group(`%c${successInfo.message}`, style)
    console.log('%cTimestamp:', 'font-weight: bold', successInfo.timestamp)

    if (successInfo.duration) {
      console.log('%cDuration:', 'font-weight: bold', `${successInfo.duration}ms`)
    }

    if (successInfo.details) {
      console.log('%cDetails:', 'font-weight: bold', successInfo.details)
    }

    console.groupEnd()
  }

  /**
   * Get all logs
   */
  getLogs(): SuccessInfo[] {
    return this.logs
  }

  /**
   * Print summary
   */
  printSummary() {
    console.group('%c📊 SUCCESS LOGGER SUMMARY', 'color: #10b981; font-weight: bold; font-size: 14px;')

    const typeCount = this.logs.reduce((acc, log) => {
      acc[log.type] = (acc[log.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    console.log('%cTotal Successes:', 'font-weight: bold', this.logs.length)
    console.table(typeCount)

    console.log('%cRecent Successes:', 'font-weight: bold')
    console.table(this.logs.slice(-5))

    console.groupEnd()
  }
}

// Export singleton instance
export const successLogger = new SuccessLogger()

// Make available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).successLogger = successLogger
}

export default successLogger
