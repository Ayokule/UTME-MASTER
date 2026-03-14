// Application constants

export const APP_NAME = 'UTME Master'
export const APP_VERSION = '1.0.0'

// API endpoints
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Exam constants
export const EXAM_TYPES = {
  JAMB: 'JAMB',
  WAEC: 'WAEC', 
  NECO: 'NECO'
} as const

export const QUESTION_TYPES = {
  MCQ: 'MCQ',
  TRUE_FALSE: 'TRUE_FALSE',
  FILL_BLANK: 'FILL_BLANK',
  ESSAY: 'ESSAY'
} as const

export const DIFFICULTY_LEVELS = {
  EASY: 'EASY',
  MEDIUM: 'MEDIUM',
  HARD: 'HARD'
} as const

// User roles
export const USER_ROLES = {
  STUDENT: 'STUDENT',
  TEACHER: 'TEACHER',
  ADMIN: 'ADMIN'
} as const

// License tiers
export const LICENSE_TIERS = {
  TRIAL: 'TRIAL',
  BASIC: 'BASIC',
  PREMIUM: 'PREMIUM',
  ENTERPRISE: 'ENTERPRISE'
} as const

// Exam status
export const EXAM_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED'
} as const

// Student exam status
export const STUDENT_EXAM_STATUS = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  SUBMITTED: 'SUBMITTED',
  EXPIRED: 'EXPIRED'
} as const

// Grade boundaries
export const GRADE_BOUNDARIES = {
  A: 90,
  B: 80,
  C: 70,
  D: 60,
  E: 50,
  F: 0
} as const

// Time constants
export const TIME_CONSTANTS = {
  MINUTE: 60,
  HOUR: 3600,
  DAY: 86400
} as const

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100
} as const

// File upload
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'audio/mpeg', 'audio/wav'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.mp3', '.wav']
} as const

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
  LANGUAGE: 'language'
} as const

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  STUDENT: {
    DASHBOARD: '/student/dashboard',
    EXAMS: '/student/exams',
    RESULTS: '/student/results',
    ANALYTICS: '/student/analytics'
  },
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    QUESTIONS: '/admin/questions',
    EXAMS: '/admin/exams',
    USERS: '/admin/users',
    ANALYTICS: '/admin/analytics'
  }
} as const

// Chart colors
export const CHART_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', 
  '#10b981', '#3b82f6', '#ef4444', '#84cc16'
] as const

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
} as const

export type ExamType = keyof typeof EXAM_TYPES
export type QuestionType = keyof typeof QUESTION_TYPES
export type DifficultyLevel = keyof typeof DIFFICULTY_LEVELS
export type UserRole = keyof typeof USER_ROLES
export type LicenseTier = keyof typeof LICENSE_TIERS
export type ExamStatus = keyof typeof EXAM_STATUS
export type StudentExamStatus = keyof typeof STUDENT_EXAM_STATUS
export type NotificationType = keyof typeof NOTIFICATION_TYPES