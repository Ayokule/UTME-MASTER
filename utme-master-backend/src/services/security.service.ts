// ==========================================
// SECURITY SERVICE
// ==========================================
// Centralized security configuration and monitoring

import { logger } from '../utils/logger'
import { prisma } from '../config/database'

// ==========================================
// SECURITY MONITORING
// ==========================================

interface SecurityEvent {
  type: 'RATE_LIMIT' | 'BRUTE_FORCE' | 'XSS_ATTEMPT' | 'SQL_INJECTION' | 'CSRF_VIOLATION'
  ip: string
  userAgent?: string
  endpoint: string
  details?: any
  timestamp: Date
}

class SecurityMonitor {
  private events: SecurityEvent[] = []
  private readonly MAX_EVENTS = 1000

  logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>) {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: new Date()
    }

    this.events.push(securityEvent)
    
    // Keep only recent events
    if (this.events.length > this.MAX_EVENTS) {
      this.events = this.events.slice(-this.MAX_EVENTS)
    }

    // Log to file
    logger.warn('Security event detected', securityEvent)

    // Check for patterns that might indicate an attack
    this.analyzeSecurityPatterns(event.ip, event.type)
  }

  private analyzeSecurityPatterns(ip: string, eventType: SecurityEvent['type']) {
    const recentEvents = this.events.filter(
      event => event.ip === ip && 
      event.timestamp.getTime() > Date.now() - (15 * 60 * 1000) // Last 15 minutes
    )

    // Alert if same IP has multiple different attack types
    const uniqueTypes = new Set(recentEvents.map(e => e.type))
    if (uniqueTypes.size >= 3) {
      logger.error(`Coordinated attack detected from IP: ${ip}`, {
        ip,
        eventTypes: Array.from(uniqueTypes),
        eventCount: recentEvents.length
      })
    }

    // Alert if high frequency of same attack type
    const sameTypeEvents = recentEvents.filter(e => e.type === eventType)
    if (sameTypeEvents.length >= 10) {
      logger.error(`High frequency ${eventType} attacks from IP: ${ip}`, {
        ip,
        eventType,
        count: sameTypeEvents.length
      })
    }
  }

  getSecuritySummary() {
    const now = Date.now()
    const last24Hours = this.events.filter(
      event => event.timestamp.getTime() > now - (24 * 60 * 60 * 1000)
    )

    const eventsByType = last24Hours.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const topIPs = last24Hours.reduce((acc, event) => {
      acc[event.ip] = (acc[event.ip] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalEvents: last24Hours.length,
      eventsByType,
      topOffendingIPs: Object.entries(topIPs)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([ip, count]) => ({ ip, count }))
    }
  }
}

export const securityMonitor = new SecurityMonitor()

// ==========================================
// SECURITY CONFIGURATION
// ==========================================

export interface SecurityConfig {
  rateLimit: {
    general: { windowMs: number; max: number }
    auth: { windowMs: number; max: number }
    passwordReset: { windowMs: number; max: number }
  }
  bruteForce: {
    maxAttempts: number
    blockDuration: number
  }
  password: {
    minLength: number
    requireUppercase: boolean
    requireLowercase: boolean
    requireNumbers: boolean
    requireSpecialChars: boolean
  }
  session: {
    timeout: number
    maxConcurrentSessions: number
  }
}

const defaultSecurityConfig: SecurityConfig = {
  rateLimit: {
    general: { windowMs: 15 * 60 * 1000, max: 100 },
    auth: { windowMs: 15 * 60 * 1000, max: 5 },
    passwordReset: { windowMs: 60 * 60 * 1000, max: 3 }
  },
  bruteForce: {
    maxAttempts: 5,
    blockDuration: 60 * 60 * 1000 // 1 hour
  },
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false
  },
  session: {
    timeout: 30 * 60 * 1000, // 30 minutes
    maxConcurrentSessions: 3
  }
}

export async function getSecurityConfig(): Promise<SecurityConfig> {
  try {
    // In a full implementation, this would come from database
    // For now, return default config
    return defaultSecurityConfig
  } catch (error) {
    logger.error('Failed to load security config, using defaults:', error)
    return defaultSecurityConfig
  }
}

// ==========================================
// IP BLOCKING SERVICE
// ==========================================

class IPBlockingService {
  private blockedIPs = new Set<string>()
  private suspiciousIPs = new Map<string, { score: number; lastActivity: Date }>()

  blockIP(ip: string, reason: string) {
    this.blockedIPs.add(ip)
    logger.warn(`IP blocked: ${ip}`, { reason })
  }

  unblockIP(ip: string) {
    this.blockedIPs.delete(ip)
    this.suspiciousIPs.delete(ip)
    logger.info(`IP unblocked: ${ip}`)
  }

  isBlocked(ip: string): boolean {
    return this.blockedIPs.has(ip)
  }

  addSuspiciousActivity(ip: string, severity: number = 1) {
    const current = this.suspiciousIPs.get(ip) || { score: 0, lastActivity: new Date() }
    current.score += severity
    current.lastActivity = new Date()
    
    this.suspiciousIPs.set(ip, current)

    // Auto-block if score gets too high
    if (current.score >= 10) {
      this.blockIP(ip, `Suspicious activity score: ${current.score}`)
    }
  }

  cleanupOldEntries() {
    const cutoff = Date.now() - (24 * 60 * 60 * 1000) // 24 hours
    
    for (const [ip, data] of this.suspiciousIPs.entries()) {
      if (data.lastActivity.getTime() < cutoff) {
        this.suspiciousIPs.delete(ip)
      }
    }
  }

  getBlockedIPs(): string[] {
    return Array.from(this.blockedIPs)
  }

  getSuspiciousIPs(): Array<{ ip: string; score: number; lastActivity: Date }> {
    return Array.from(this.suspiciousIPs.entries()).map(([ip, data]) => ({
      ip,
      ...data
    }))
  }
}

export const ipBlockingService = new IPBlockingService()

// ==========================================
// SECURITY UTILITIES
// ==========================================

export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function isValidPassword(password: string, config?: SecurityConfig['password']): { valid: boolean; errors: string[] } {
  const cfg = config || defaultSecurityConfig.password
  const errors: string[] = []

  if (password.length < cfg.minLength) {
    errors.push(`Password must be at least ${cfg.minLength} characters long`)
  }

  if (cfg.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (cfg.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (cfg.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  if (cfg.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

export function sanitizeFilename(filename: string): string {
  // Remove dangerous characters from filenames
  return filename.replace(/[^a-zA-Z0-9.-]/g, '_').substring(0, 255)
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

// ==========================================
// AUDIT LOGGING
// ==========================================

export async function logSecurityAudit(event: {
  userId?: string
  action: string
  resource: string
  ip: string
  userAgent?: string
  success: boolean
  details?: any
}) {
  try {
    // In a full implementation, this would save to audit log table
    logger.info('Security audit event', {
      ...event,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    logger.error('Failed to log security audit event:', error)
  }
}

// ==========================================
// PERIODIC CLEANUP
// ==========================================

// Clean up old security data periodically
setInterval(() => {
  ipBlockingService.cleanupOldEntries()
}, 60 * 60 * 1000) // Every hour