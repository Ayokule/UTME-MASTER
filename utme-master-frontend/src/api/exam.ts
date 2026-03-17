// ==========================================
// EXAM API FUNCTIONS
// ==========================================
// Frontend API functions for exam operations

import { apiClient } from './client'

// ==========================================
// INTERFACES
// ==========================================

export interface ExamScheduleData {
  startsAt?: string
  endsAt?: string
  autoActivate?: boolean
  autoDeactivate?: boolean
}

export interface AvailableExam {
  id: string
  title: string
  description: string
  duration: number
  totalQuestions: number
  totalMarks: number
  passMarks: number
  startsAt: string | null
  endsAt: string | null
  allowRetake: boolean
  status: 'available' | 'scheduled' | 'expired' | 'in_progress' | 'completed'
  statusMessage: string
  canStart: boolean
  canResume: boolean
  attempts: number
  bestScore: number | null
}

export interface ScheduledExam {
  id: string
  title: string
  description: string
  startsAt: string | null
  endsAt: string | null
  isPublished: boolean
  isActive: boolean
  status: 'scheduled' | 'active' | 'expired'
  statusMessage: string
  creator: {
    firstName: string
    lastName: string
    email: string
  }
  totalAttempts: number
  activeAttempts: number
  createdAt: string
}

export interface ExamAvailability {
  available: boolean
  reason?: string
  startsAt?: string
  endsAt?: string
}

// ==========================================
// EXAM BASIC OPERATIONS
// ==========================================

export const startExam = async (examId: string) => {
  const response = await apiClient.post(`/exams/${examId}/start`)
  return response.data
}

export const resumeExam = async (studentExamId: string) => {
  const response = await apiClient.get(`/exams/resume/${studentExamId}`)
  return response.data
}

export const submitAnswer = async (studentExamId: string, answerData: {
  questionId: string
  answer: any
  timeSpent?: number
}) => {
  const response = await apiClient.post(`/exams/${studentExamId}/answers`, answerData)
  return response.data
}

export const submitExam = async (studentExamId: string, autoSubmit: boolean = false) => {
  const response = await apiClient.post(`/exams/${studentExamId}/submit`, { autoSubmit })
  return response.data
}

export const getExamResults = async (studentExamId: string) => {
  const response = await apiClient.get(`/exams/student/results/${studentExamId}`)
  return response.data
}

export const getReviewQuestions = async (studentExamId: string) => {
  const response = await apiClient.get(`/exams/student/results/${studentExamId}/review`)
  return response.data
}

export const getQuestionPerformanceAnalysis = async (studentExamId: string) => {
  const response = await apiClient.get(`/exams/student/results/${studentExamId}/analysis`)
  return response.data
}

export const retakeExam = async (examId: string) => {
  const response = await apiClient.post(`/exams/${examId}/retake`)
  return response.data
}

// ==========================================
// EXAM SCHEDULING FUNCTIONS
// ==========================================

export const getAvailableExams = async () => {
  const response = await apiClient.get('/exams/available')
  return response.data
}

export const scheduleExam = async (examId: string, scheduleData: ExamScheduleData) => {
  const response = await apiClient.put(`/exams/${examId}/schedule`, scheduleData)
  return response.data
}

export const getScheduledExams = async () => {
  const response = await apiClient.get('/exams/scheduled')
  return response.data
}

export const checkExamAvailability = async (examId: string) => {
  const response = await apiClient.get(`/exams/${examId}/availability`)
  return response.data
}

export const processExamScheduling = async () => {
  const response = await apiClient.post('/exams/process-scheduling')
  return response.data
}

// ==========================================
// PRACTICE EXAM FUNCTIONS
// ==========================================

export const startPracticeExam = async (practiceData: {
  subject: string
  examType: string
  difficulty?: string
  questionCount?: number
  duration?: number
}) => {
  const response = await apiClient.post('/exams/practice/start', practiceData)
  return response.data
}

// ==========================================
// ADMIN FUNCTIONS
// ==========================================

export const createExam = async (examData: any) => {
  const response = await apiClient.post('/exams', examData)
  return response.data
}

export const getAllExams = async () => {
  const response = await apiClient.get('/exams')
  return response.data
}

export const getExamStatistics = async (examId: string) => {
  const response = await apiClient.get(`/exams/${examId}/statistics`)
  return response.data
}