// ==========================================
// DATABASE ERROR LOGGER
// ==========================================
// Comprehensive logging for database operations
// Helps identify data loading and storage issues

import { logger } from './logger'

export interface DbOperationLog {
  operation: 'READ' | 'WRITE' | 'UPDATE' | 'DELETE'
  table: string
  timestamp: string
  duration: number
  success: boolean
  recordsAffected?: number
  error?: string
  details?: any
}

class DatabaseErrorLogger {
  private logs: DbOperationLog[] = []

  /**
   * Log database read operations
   */
  logRead(table: string, duration: number, recordsFound: number, error?: any) {
    const log: DbOperationLog = {
      operation: 'READ',
      table,
      timestamp: new Date().toISOString(),
      duration,
      success: !error,
      recordsAffected: recordsFound,
      error: error?.message
    }

    this.logs.push(log)

    if (error) {
      logger.error(`❌ [DB READ] ${table}`, {
        duration: `${duration}ms`,
        error: error.message,
        code: error.code,
        details: error
      })
    } else {
      logger.info(`✅ [DB READ] ${table}`, {
        duration: `${duration}ms`,
        recordsFound
      })
    }
  }

  /**
   * Log database write operations
   */
  logWrite(table: string, duration: number, recordsCreated: number, error?: any) {
    const log: DbOperationLog = {
      operation: 'WRITE',
      table,
      timestamp: new Date().toISOString(),
      duration,
      success: !error,
      recordsAffected: recordsCreated,
      error: error?.message
    }

    this.logs.push(log)

    if (error) {
      logger.error(`❌ [DB WRITE] ${table}`, {
        duration: `${duration}ms`,
        error: error.message,
        code: error.code,
        details: error
      })
    } else {
      logger.info(`✅ [DB WRITE] ${table}`, {
        duration: `${duration}ms`,
        recordsCreated
      })
    }
  }

  /**
   * Log database update operations
   */
  logUpdate(table: string, duration: number, recordsUpdated: number, error?: any) {
    const log: DbOperationLog = {
      operation: 'UPDATE',
      table,
      timestamp: new Date().toISOString(),
      duration,
      success: !error,
      recordsAffected: recordsUpdated,
      error: error?.message
    }

    this.logs.push(log)

    if (error) {
      logger.error(`❌ [DB UPDATE] ${table}`, {
        duration: `${duration}ms`,
        error: error.message,
        code: error.code,
        details: error
      })
    } else {
      logger.info(`✅ [DB UPDATE] ${table}`, {
        duration: `${duration}ms`,
        recordsUpdated
      })
    }
  }

  /**
   * Log database delete operations
   */
  logDelete(table: string, duration: number, recordsDeleted: number, error?: any) {
    const log: DbOperationLog = {
      operation: 'DELETE',
      table,
      timestamp: new Date().toISOString(),
      duration,
      success: !error,
      recordsAffected: recordsDeleted,
      error: error?.message
    }

    this.logs.push(log)

    if (error) {
      logger.error(`❌ [DB DELETE] ${table}`, {
        duration: `${duration}ms`,
        error: error.message,
        code: error.code,
        details: error
      })
    } else {
      logger.info(`✅ [DB DELETE] ${table}`, {
        duration: `${duration}ms`,
        recordsDeleted
      })
    }
  }

  /**
   * Log connection errors
   */
  logConnectionError(error: any) {
    logger.error('❌ [DB CONNECTION] Database connection failed', {
      error: error.message,
      code: error.code,
      details: error
    })
  }

  /**
   * Log query errors
   */
  logQueryError(query: string, error: any, params?: any) {
    logger.error('❌ [DB QUERY] Query execution failed', {
      query,
      error: error.message,
      code: error.code,
      params,
      details: error
    })
  }

  /**
   * Get all logs
   */
  getLogs(): DbOperationLog[] {
    return this.logs
  }

  /**
   * Get logs for specific table
   */
  getTableLogs(table: string): DbOperationLog[] {
    return this.logs.filter(log => log.table === table)
  }

  /**
   * Get failed operations
   */
  getFailedOperations(): DbOperationLog[] {
    return this.logs.filter(log => !log.success)
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary() {
    const totalOps = this.logs.length
    const failedOps = this.logs.filter(log => !log.success).length
    const successOps = totalOps - failedOps
    const avgDuration = this.logs.reduce((sum, log) => sum + log.duration, 0) / totalOps || 0

    return {
      totalOperations: totalOps,
      successfulOperations: successOps,
      failedOperations: failedOps,
      successRate: ((successOps / totalOps) * 100).toFixed(2) + '%',
      averageDuration: avgDuration.toFixed(2) + 'ms',
      operationsByType: {
        READ: this.logs.filter(log => log.operation === 'READ').length,
        WRITE: this.logs.filter(log => log.operation === 'WRITE').length,
        UPDATE: this.logs.filter(log => log.operation === 'UPDATE').length,
        DELETE: this.logs.filter(log => log.operation === 'DELETE').length
      }
    }
  }

  /**
   * Clear logs
   */
  clearLogs() {
    this.logs = []
  }
}

export const dbErrorLogger = new DatabaseErrorLogger()
