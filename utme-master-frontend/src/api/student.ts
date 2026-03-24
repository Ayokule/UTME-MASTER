/**
 * Student API Client
 * Covers: exam list, exam history, test list, test history
 */

import apiClient from './client'

// ==========================================
// TYPES
// ==========================================

export interface StudentExam {
  id: string
  title: string
  type: string
  subjects: string[]
  totalQuestions: number
  duration: number
  difficulty: string
  participants: number
  averageScore: number
  status: 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED'
  userAttempts: number
  userBestScore: number | null
  userLastAttempt: string | null
  canRetake: boolean
}

export interface ExamAttempt {
  id: string
  examId: string
  examTitle: string
  score: number
  percentage: number
  totalQuestions: number
  correctAnswers: number
  duration: number
  submittedAt: string
  status: string
}

export interface ExamStats {
  totalExams: number
  examsCompleted: number
  averageScore: number
  bestScore: number
  improvementTrend: string
  totalHours: number
  strongSubjects: string[]
  weakSubjects: string[]
}

export interface StudentTest {
  id: string
  title: string
  subject: string
  topic: string
  description: string
  totalQuestions: number
  duration: number
  difficulty: string
  participants: number
  averageScore: number
  status: 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED'
  userAttempts: number
  userBestScore: number | null
  userLastAttempt: string | null
  canRetake: boolean
  questions_passed: number
}

export interface TestAttempt {
  id: string
  testId: string
  testTitle: string
  subject: string
  score: number
  percentage: number
  totalQuestions: number
  correctAnswers: number
  duration: number
  completedAt: string
  status: string
}

export interface TestStats {
  totalTests: number
  testsCompleted: number
  averageScore: number
  bestScore: number
  improvementTrend: string
  currentStreak: number
  totalHours: number
  strongSubjects: string[]
  weakSubjects: string[]
  subjectPerformance: { subject: string; score: number; tests: number }[]
}

// ==========================================
// OFFICIAL EXAMS
// ==========================================

export const getStudentExams = async (): Promise<{ exams: StudentExam[]; stats: ExamStats }> => {
  const response = await apiClient.get('/student/exams')
  return response.data?.data || response.data
}

export const getExamHistory = async (): Promise<ExamAttempt[]> => {
  const response = await apiClient.get('/student/exam-history')
  const data = response.data?.data
  return Array.isArray(data) ? data : (data?.history ?? [])
}

export const startOfficialExam = async (examId: string): Promise<{ studentExamId: string; token: string }> => {
  const response = await apiClient.post(`/exams/${examId}/start`)
  return response.data?.data || response.data
}

// ==========================================
// PRACTICE TESTS
// ==========================================

export const getStudentTests = async (): Promise<{ tests: StudentTest[]; stats: TestStats }> => {
  const response = await apiClient.get('/student/tests')
  return response.data?.data || response.data
}

export const getTestHistory = async (): Promise<TestAttempt[]> => {
  const response = await apiClient.get('/student/test-history')
  const data = response.data?.data
  return Array.isArray(data) ? data : (data?.history ?? [])
}

export const startTest = async (testId: string): Promise<{ studentTestId: string; token: string }> => {
  const response = await apiClient.post(`/tests/${testId}/start`)
  return response.data?.data || response.data
}

export const submitTest = async (
  studentTestId: string,
  autoSubmit = false
): Promise<{ score: number; percentage: number }> => {
  const response = await apiClient.post(`/tests/${studentTestId}/submit`, { autoSubmit })
  return response.data?.data || response.data
}
