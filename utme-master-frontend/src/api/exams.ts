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
  id: string
  title: string
  description: string
  duration: number
  totalQuestions: number
  totalMarks: number
  passMarks: number
  isPublished: boolean
  allowReview: boolean
  allowRetake: boolean
  startsAt?: string
  endsAt?: string
  createdAt: string
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

  if (status === 400) {
    throw new Error(message || 'Invalid request')
  }
  if (status === 401) {
    throw new Error('Authentication failed. Please log in again.')
  }
  if (status === 403) {
    throw new Error('Access denied.')
  }
  if (status === 404) {
    throw new Error('Exam not found.')
  }
  if (status >= 500) {
    throw new Error('Server error. Please try again later.')
  }

  throw new Error(message || 'An error occurred')
}

// ==========================================
// API FUNCTIONS
// ==========================================

/**
 * Get all available exams for student
 * 
 * @returns List of available exams
 */
export const getAvailableExams = async (): Promise<{ success: boolean; data: { exams: Exam[] } }> => {
  try {
    console.log('🔄 [EXAMS API] Fetching available exams...')
    const response = await apiClient.get('/exams')
    console.log('✅ [EXAMS API] Exams fetched successfully')
    return response.data
  } catch (error) {
    handleError(error, 'Failed to fetch available exams')
  }
}

/**
 * Resume an exam (for already started exams)
 * 
 * Retrieves an exam that was previously started but not submitted.
 * If exam is already submitted, returns 400 error.
 * 
 * @param studentExamId - The student exam ID
 * @returns Exam data with saved answers
 * @throws Error if exam not found or already submitted
 */
export const resumeExam = async (studentExamId: string): Promise<{ success: boolean; data: ExamData }> => {
  try {
    console.log('🔄 [EXAMS API] Resuming exam:', studentExamId)
    const response = await apiClient.get(`/exams/resume/${studentExamId}`)
    console.log('✅ [EXAMS API] Exam resumed successfully')
    return response.data
  } catch (error: any) {
    // If exam is already submitted, return 400 error
    if (error.response?.status === 400 && error.response?.data?.message?.includes('submitted')) {
      console.log('ℹ️ [EXAMS API] Exam already submitted, redirecting to results')
      throw error
    }
    handleError(error, 'Failed to resume exam')
  }
}

/**
 * Start a practice exam
 * 
 * Creates a new practice exam with specified parameters.
 * 
 * @param params - Exam parameters
 * @param params.subject - Subject name (e.g., "Mathematics")
 * @param params.examType - Exam type (JAMB, WAEC, NECO)
 * @param params.difficulty - Difficulty level (EASY, MEDIUM, HARD)
 * @param params.questionCount - Number of questions
 * @param params.duration - Duration in minutes
 * @returns New exam data with student exam ID
 * @throws Error if parameters invalid or exam creation fails
 * 
 * Example:
 * ```typescript
 * const exam = await startPracticeExam({
 *   subject: 'Mathematics',
 *   examType: 'JAMB',
 *   difficulty: 'MEDIUM',
 *   questionCount: 40,
 *   duration: 60
 * })
 * ```
 */
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

/**
 * Start an exam
 * 
 * Initializes an exam and starts the timer on the backend.
 * 
 * @param examId - The exam ID to start
 * @returns Exam data with questions and metadata
 * @throws Error if exam not found or already started
 */
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

/**
 * Save an answer during exam
 * 
 * Saves a single answer and tracks time spent on the question.
 * Multiple saves are batched on the backend.
 * 
 * @param studentExamId - The student exam ID
 * @param questionId - The question ID
 * @param answer - The answer object
 * @param timeSpent - Time spent on this question in seconds
 * @returns Success response
 * @throws Error if save fails
 */
export const submitAnswer = async (
  studentExamId: string,
  questionId: string,
  answer: any,
  timeSpent: number = 0
): Promise<{ success: boolean; data: any }> => {
  try {
    console.log('🔄 [EXAMS API] Saving answer for question:', questionId)
    const response = await apiClient.post(`/exams/${studentExamId}/answers`, {
      questionId,
      answer,
      timeSpent
    })
    console.log('✅ [EXAMS API] Answer saved successfully')
    return response.data
  } catch (error: any) {
    // Log but don't throw - answer save failures shouldn't break the exam
    console.error('⚠️ [EXAMS API] Failed to save answer:', error.message)
    return { success: false, data: null }
  }
}

/**
 * Submit exam
 * 
 * Submits the exam and calculates results.
 * Can be called manually or automatically when time runs out.
 * 
 * @param studentExamId - The student exam ID
 * @param autoSubmit - Whether this is an auto-submit (time ran out)
 * @returns Exam results
 * @throws Error if submission fails
 * 
 * Example:
 * ```typescript
 * const results = await submitExam('exam-123')
 * navigate(`/student/results/${results.data.studentExamId}`)
 * ```
 */
export const submitExam = async (
  studentExamId: string,
  autoSubmit: boolean = false
): Promise<{ success: boolean; data: ExamResults }> => {
  try {
    console.log('🔄 [EXAMS API] Submitting exam:', studentExamId, { autoSubmit })
    const response = await apiClient.post(`/exams/${studentExamId}/submit`, {
      autoSubmit
    })
    console.log('✅ [EXAMS API] Exam submitted successfully')
    return response.data
  } catch (error) {
    handleError(error, 'Failed to submit exam')
  }
}

/**
 * Get exam results
 * 
 * Retrieves results for a completed exam.
 * 
 * @param studentExamId - The student exam ID
 * @returns Exam results
 * @throws Error if results not found
 */
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

/**
 * Get review questions (after exam completion)
 * 
 * Retrieves detailed question data for review after exam completion.
 * 
 * @param studentExamId - The student exam ID
 * @returns Review questions with explanations
 * @throws Error if review data not found
 */
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

/**
 * Create exam (admin only)
 * 
 * Creates a new exam with questions.
 * 
 * @param examData - Exam data
 * @returns Created exam
 * @throws Error if creation fails or user not authorized
 */
export const createExam = async (examData: any): Promise<{ success: boolean; data: any }> => {
  try {
    console.log('🔄 [EXAMS API] Creating exam...')
    const response = await apiClient.post('/exams', examData)
    console.log('✅ [EXAMS API] Exam created successfully')
    return response.data
  } catch (error) {
    handleError(error, 'Failed to create exam')
  }
}


// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Normalize question options from JSON or separate fields
 * Ensures consistent format across the app
 * 
 * @param question - Question object with options
 * @returns Normalized options array
 * 
 * Example:
 * ```typescript
 * const options = normalizeOptions(question)
 * // Returns: [
 * //   { label: 'A', text: 'First option' },
 * //   { label: 'B', text: 'Second option' },
 * //   { label: 'C', text: 'Third option' },
 * //   { label: 'D', text: 'Fourth option' }
 * // ]
 * ```
 */
export function normalizeOptions(question: any) {
  // If options is already an array, return as is
  if (Array.isArray(question.options)) {
    return question.options
  }

  // If options is JSON object, convert to array
  const optionsObj = question.options as any || {}
  return [
    { label: 'A', text: optionsObj.A?.text || question.optionA || '' },
    { label: 'B', text: optionsObj.B?.text || question.optionB || '' },
    { label: 'C', text: optionsObj.C?.text || question.optionC || '' },
    { label: 'D', text: optionsObj.D?.text || question.optionD || '' }
  ]
}

/**
 * Retake an exam
 * 
 * Creates a new exam session for retaking
 * 
 * @param studentExamId - The previous student exam ID
 * @returns New exam data with new student exam ID
 * @throws Error if retakes not allowed
 */
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

/**
 * Create exam (admin only)
 * 
 * Creates a new exam with specified configuration
 * 
 * @param examData - Exam configuration
 * @returns Created exam
 * @throws Error if user not authorized or data invalid
 */
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

/**
 * Get exam statistics (admin only)
 * 
 * Retrieves performance statistics for an exam
 * 
 * @param examId - The exam ID
 * @returns Exam statistics
 * @throws Error if exam not found
 */
export const getExamStats = async (examId: string): Promise<{ success: boolean; data: any }> => {
  try {
    console.log('🔄 [EXAMS API] Fetching exam statistics:', examId)
    const response = await apiClient.get(`/api/exams/${examId}/statistics`)
    console.log('✅ [EXAMS API] Statistics fetched successfully')
    return response.data
  } catch (error) {
    handleError(error, 'Failed to fetch exam statistics')
  }
}
