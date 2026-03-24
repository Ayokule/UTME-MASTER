/**
 * Exams API Client
 *
 * Handles all API communication for exam management and taking.
 * Includes error handling, logging, and type safety.
 */

import apiClient from './client'

// ==========================================
// TYPE DEFINITIONS
// ==========================================

export interface Exam {
  subjects: any
  subjectCode: string
  subjectName: string
  status: string
  id: string
  title: string
  description: string
  duration: number
  totalQuestions: number
  totalMarks: number
  passMarks: number
  isPublished: boolean
  isActive: boolean
  allowReview: boolean
  allowRetake: boolean
  startsAt?: string
  endsAt?: string
  createdAt: string
  updatedAt?: string
  _count?: { examQuestions: number }
}

export interface ExamQuestion {
  id: string
  questionText: string
  options: any[]
  images?: string[]
  audioUrl?: string
  videoUrl?: string
  questionType: string
  allowMultiple: boolean
  subject: string
  topic?: string
}

export interface ExamData {
  studentExamId: string
  examTitle: string
  duration: number
  totalQuestions: number
  totalMarks: number
  startedAt: string
  timeRemaining: number
  questions: ExamQuestion[]
  currentQuestionIndex: number
  savedAnswers?: Record<string, any>
}

export interface ExamResults {
  studentExamId: string
  examTitle: string
  totalQuestions: number
  answeredQuestions: number
  correctAnswers: number
  wrongAnswers: number
  score: number
  totalMarks: number
  scorePercentage: string
  passed: boolean
  grade: string
  passMarks: number
  autoSubmitted: boolean
  submittedAt: string
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Handle API errors with meaningful messages
 */
function handleError(error: any, context: string): never {
  const status = error.response?.status
  const message = error.response?.data?.message || error.message

  console.error(`❌ [EXAMS API] ${context}:`, {
    status,
    message,
    url: error.config?.url,
    timestamp: new Date().toISOString()
  })

  if (status === 400) throw new Error(message || 'Invalid request')
  if (status === 401) throw new Error('Authentication failed. Please log in again.')
  if (status === 403) throw new Error('Access denied.')
  if (status === 404) throw new Error('Exam not found.')
  if (status >= 500) throw new Error('Server error. Please try again later.')

  throw new Error(message || 'An error occurred')
}

/**
 * Normalize question options from JSON or separate fields
 */
export function normalizeOptions(question: any) {
  if (Array.isArray(question.options)) return question.options
  const optionsObj = question.options as any || {}
  return [
    { label: 'A', text: optionsObj.A?.text || question.optionA || '' },
    { label: 'B', text: optionsObj.B?.text || question.optionB || '' },
    { label: 'C', text: optionsObj.C?.text || question.optionC || '' },
    { label: 'D', text: optionsObj.D?.text || question.optionD || '' }
  ]
}

// ==========================================
// API FUNCTIONS
// ==========================================

export const getAvailableExams = async (): Promise<{ success: boolean; data: { exams: Exam[] } }> => {
  try {
    console.log('🔄 [EXAMS API] Fetching available exams...')
    const response = await apiClient.get('/exams/available')
    console.log('✅ [EXAMS API] Available exams fetched successfully')
    return response.data
  } catch (error) {
    handleError(error, 'Failed to fetch available exams')
  }
}

export const resumeExam = async (studentExamId: string): Promise<{ success: boolean; data: ExamData }> => {
  try {
    console.log('🔄 [EXAMS API] Resuming exam:', studentExamId)
    const response = await apiClient.get(`/exams/resume/${studentExamId}`)
    console.log('✅ [EXAMS API] Exam resumed successfully')
    return response.data
  } catch (error: any) {
    if (error.response?.status === 400 && error.response?.data?.message?.includes('submitted')) {
      console.log('ℹ️ [EXAMS API] Exam already submitted, redirecting to results')
      throw error
    }
    handleError(error, 'Failed to resume exam')
  }
}

export const startPracticeExam = async (params: {
  subject: string
  examType: 'JAMB' | 'WAEC' | 'NECO'
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD'
  questionCount?: number
  duration?: number
}): Promise<{ success: boolean; data: { studentExamId: string } }> => {
  try {
    console.log('🔄 [EXAMS API] Starting practice exam with params:', params)
    const response = await apiClient.post('/exams/practice/start', params)
    console.log('✅ [EXAMS API] Practice exam started successfully:', response.data.data.studentExamId)
    return response.data
  } catch (error) {
    handleError(error, 'Failed to start practice exam')
  }
}

export const startExam = async (examId: string): Promise<{ success: boolean; data: ExamData }> => {
  try {
    console.log('🔄 [EXAMS API] Starting exam:', examId)
    const response = await apiClient.post(`/exams/${examId}/start`)
    console.log('✅ [EXAMS API] Exam started successfully')
    return response.data
  } catch (error) {
    handleError(error, 'Failed to start exam')
  }
}

export const submitAnswer = async (
  studentExamId: string,
  questionId: string,
  answer: any,
  timeSpent: number = 0
): Promise<{ success: boolean; data: any }> => {
  try {
    console.log('🔄 [EXAMS API] Saving answer for question:', questionId)
    const response = await apiClient.post(`/exams/${studentExamId}/answers`, { questionId, answer, timeSpent })
    console.log('✅ [EXAMS API] Answer saved successfully')
    return response.data
  } catch (error: any) {
    console.error('⚠️ [EXAMS API] Failed to save answer:', error.message)
    return { success: false, data: null }
  }
}

export const submitExam = async (
  studentExamId: string,
  autoSubmit: boolean = false
): Promise<{ success: boolean; data: ExamResults }> => {
  try {
    console.log('🔄 [EXAMS API] Submitting exam:', studentExamId, { autoSubmit })
    const response = await apiClient.post(`/exams/${studentExamId}/submit`, { autoSubmit })
    console.log('✅ [EXAMS API] Exam submitted successfully')
    return response.data
  } catch (error) {
    handleError(error, 'Failed to submit exam')
  }
}

export const getExamResults = async (studentExamId: string): Promise<{ success: boolean; data: ExamResults }> => {
  try {
    console.log('🔄 [EXAMS API] Fetching exam results:', studentExamId)
    const response = await apiClient.get(`/exams/results/${studentExamId}`)
    console.log('✅ [EXAMS API] Results fetched successfully')
    return response.data
  } catch (error) {
    handleError(error, 'Failed to fetch exam results')
  }
}

export const getReviewQuestions = async (studentExamId: string): Promise<{ success: boolean; data: any }> => {
  try {
    console.log('🔄 [EXAMS API] Fetching review questions:', studentExamId)
    const response = await apiClient.get(`/exams/results/${studentExamId}/review`)
    console.log('✅ [EXAMS API] Review questions fetched successfully')
    return response.data
  } catch (error) {
    handleError(error, 'Failed to fetch review questions')
  }
}

export const getAdminExams = async (): Promise<{ success: boolean; data: { exams: Exam[] } }> => {
  try {
    console.log('🔄 [EXAMS API] Fetching all exams (admin)...')
    const response = await apiClient.get('/exams')
    console.log('✅ [EXAMS API] Admin exams fetched successfully')
    return response.data
  } catch (error) {
    handleError(error, 'Failed to fetch admin exams')
  }
}

export const updateExam = async (examId: string, data: Partial<Exam> & Record<string, any>): Promise<{ success: boolean; data: any }> => {
  try {
    console.log('🔄 [EXAMS API] Updating exam:', examId)
    const response = await apiClient.put(`/exams/${examId}`, data)
    console.log('✅ [EXAMS API] Exam updated successfully')
    return response.data
  } catch (error) {
    handleError(error, 'Failed to update exam')
  }
}

export const deleteExam = async (examId: string): Promise<{ success: boolean; data: any }> => {
  try {
    console.log('🔄 [EXAMS API] Deleting exam:', examId)
    const response = await apiClient.delete(`/exams/${examId}`)
    console.log('✅ [EXAMS API] Exam deleted successfully')
    return response.data
  } catch (error) {
    handleError(error, 'Failed to delete exam')
  }
}

export const getExamDetails = async (examId: string): Promise<{ success: boolean; data: any }> => {
  try {
    console.log('🔄 [EXAMS API] Fetching exam details:', examId)
    const response = await apiClient.get(`/exams/${examId}/statistics`)
    console.log('✅ [EXAMS API] Exam details fetched successfully')
    return response.data
  } catch (error) {
    handleError(error, 'Failed to fetch exam details')
  }
}

export const retakeExam = async (studentExamId: string): Promise<{ success: boolean; data: any }> => {
  try {
    console.log('🔄 [EXAMS API] Retaking exam:', studentExamId)
    const response = await apiClient.post(`/api/student/exam/${studentExamId}/retake`)
    console.log('✅ [EXAMS API] Exam retaken successfully')
    return response.data
  } catch (error) {
    handleError(error, 'Failed to retake exam')
  }
}

export const reportFlaggedQuestions = async (studentExamId: string, flaggedQuestionIds: string[]): Promise<{ success: boolean; data: any }> => {
  try {
    const response = await apiClient.post(`/exams/${studentExamId}/flag-questions`, { flaggedQuestionIds })
    return response.data
  } catch (error) {
    handleError(error, 'Failed to report flagged questions')
  }
}

export const getFlaggedQuestions = async (params?: { status?: string; examId?: string }): Promise<{ success: boolean; data: { flaggedQuestions: any[]; total: number } }> => {
  try {
    const response = await apiClient.get('/exams/flagged-questions', { params })
    return response.data
  } catch (error) {
    handleError(error, 'Failed to fetch flagged questions')
  }
}

export const updateFlaggedQuestionStatus = async (flagId: string, status: 'REVIEWED' | 'DISMISSED'): Promise<{ success: boolean; data: any }> => {
  try {
    const response = await apiClient.patch(`/exams/flagged-questions/${flagId}`, { status })
    return response.data
  } catch (error) {
    handleError(error, 'Failed to update flagged question status')
  }
}

export const assignQuestionsToExam = async (examId: string, questionIds: string[]): Promise<{ success: boolean; data: any }> => {
  try {
    const response = await apiClient.put(`/exams/${examId}/questions`, { questionIds })
    return response.data
  } catch (error) {
    handleError(error, 'Failed to assign questions')
  }
}

export const getExamQuestionIds = async (examId: string): Promise<{ success: boolean; data: { questionIds: string[] } }> => {
  try {
    const response = await apiClient.get(`/exams/${examId}/questions`)
    return response.data
  } catch (error) {
    handleError(error, 'Failed to get exam questions')
  }
}

export const createExamAdmin = async (examData: any): Promise<{ success: boolean; data: any }> => {
  try {
    console.log('🔄 [EXAMS API] Creating exam...')
    const response = await apiClient.post('/exams', examData)
    console.log('✅ [EXAMS API] Exam created successfully')
    return response.data
  } catch (error) {
    handleError(error, 'Failed to create exam')
  }
}

export const getExamStats = async (examId: string): Promise<{ success: boolean; data: any }> => {
  try {
    console.log('🔄 [EXAMS API] Fetching exam statistics:', examId)
    const response = await apiClient.get(`/exams/${examId}/statistics`)
    console.log('✅ [EXAMS API] Statistics fetched successfully')
    return response.data
  } catch (error) {
    handleError(error, 'Failed to fetch exam statistics')
  }
}
