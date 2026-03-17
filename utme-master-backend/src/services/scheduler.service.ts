// ==========================================
// SCHEDULER SERVICE
// ==========================================
// Background service for automatic exam scheduling and other timed tasks

import { logger } from '../utils/logger'
import * as examService from './exam.service'

// ==========================================
// SCHEDULER CLASS
// ==========================================
class SchedulerService {
  private intervals: Map<string, NodeJS.Timeout> = new Map()
  private isRunning = false

  // Start the scheduler
  start() {
    if (this.isRunning) {
      logger.warn('Scheduler is already running')
      return
    }

    this.isRunning = true
    logger.info('Starting scheduler service...')

    // Process exam scheduling every minute
    this.scheduleTask('examScheduling', this.processExamScheduling.bind(this), 60 * 1000) // 1 minute

    // Add other scheduled tasks here as needed
    // this.scheduleTask('cleanupTasks', this.cleanupExpiredSessions.bind(this), 5 * 60 * 1000) // 5 minutes

    logger.info('Scheduler service started successfully')
  }

  // Stop the scheduler
  stop() {
    if (!this.isRunning) {
      logger.warn('Scheduler is not running')
      return
    }

    logger.info('Stopping scheduler service...')

    // Clear all intervals
    this.intervals.forEach((interval, taskName) => {
      clearInterval(interval)
      logger.info(`Stopped scheduled task: ${taskName}`)
    })

    this.intervals.clear()
    this.isRunning = false

    logger.info('Scheduler service stopped')
  }

  // Schedule a recurring task
  private scheduleTask(name: string, task: () => Promise<void>, intervalMs: number) {
    // Run immediately
    this.runTask(name, task)

    // Schedule recurring execution
    const interval = setInterval(() => {
      this.runTask(name, task)
    }, intervalMs)

    this.intervals.set(name, interval)
    logger.info(`Scheduled task '${name}' to run every ${intervalMs}ms`)
  }

  // Run a task with error handling
  private async runTask(name: string, task: () => Promise<void>) {
    try {
      logger.debug(`Running scheduled task: ${name}`)
      await task()
      logger.debug(`Completed scheduled task: ${name}`)
    } catch (error) {
      logger.error(`Error in scheduled task '${name}':`, error)
    }
  }

  // ==========================================
  // SCHEDULED TASKS
  // ==========================================

  // Process exam scheduling (activation/deactivation)
  private async processExamScheduling() {
    try {
      const result = await examService.processExamScheduling()
      
      if (result.activated > 0 || result.deactivated > 0) {
        logger.info(`Exam scheduling processed: ${result.activated} activated, ${result.deactivated} deactivated`)
      }
    } catch (error) {
      logger.error('Failed to process exam scheduling:', error)
    }
  }

  // Cleanup expired sessions (example of additional task)
  private async cleanupExpiredSessions() {
    try {
      // TODO: Implement cleanup logic
      // - Remove expired student exam sessions
      // - Clean up temporary files
      // - Archive old logs
      logger.debug('Cleanup task executed (placeholder)')
    } catch (error) {
      logger.error('Failed to cleanup expired sessions:', error)
    }
  }

  // Get scheduler status
  getStatus() {
    return {
      isRunning: this.isRunning,
      activeTasks: Array.from(this.intervals.keys()),
      taskCount: this.intervals.size
    }
  }
}

// ==========================================
// SINGLETON INSTANCE
// ==========================================
export const schedulerService = new SchedulerService()

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

// Start scheduler (called from server.ts)
export function startScheduler() {
  schedulerService.start()
}

// Stop scheduler (called during graceful shutdown)
export function stopScheduler() {
  schedulerService.stop()
}

// Get scheduler status
export function getSchedulerStatus() {
  return schedulerService.getStatus()
}

// Manual trigger for exam scheduling (for testing/admin)
export async function triggerExamScheduling() {
  try {
    const result = await examService.processExamScheduling()
    logger.info('Manual exam scheduling trigger completed', result)
    return result
  } catch (error) {
    logger.error('Manual exam scheduling trigger failed:', error)
    throw error
  }
}