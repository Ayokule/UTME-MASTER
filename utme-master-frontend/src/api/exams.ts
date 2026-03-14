import apiClient from './client'

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

// Get all available exams for student
export const getAvailableExams = async (): Promise<{ success: boolean; data: { exams: Exam[] } }> => {
  const response = await apiClient.get('/exams')
  return response.data
}

// Resume an exam (for already started exams)
export const resumeExam = async (studentExamId: string): Promise<{ success: boolean; data: ExamData }> => {
  const response = await apiClient.get(`/exams/resume/${studentExamId}`)
  return response.data
}

// Start a practice exam
export const startPracticeExam = async (params: {
  subject: string
  examType: string
  difficulty?: string
  questionCount?: number
  duration?: number
}): Promise<{ success: boolean; data: ExamData }> => {
  const response = await apiClient.post('/exams/practice/start', params)
  return response.data
}

// Start an exam
export const startExam = async (examId: string): Promise<{ success: boolean; data: ExamData }> => {
  const response = await apiClient.post(`/exams/${examId}/start`)
  return response.data
}

// Submit an answer
export const submitAnswer = async (
  studentExamId: string,
  questionId: string,
  answer: any,
  timeSpent: number = 0
): Promise<{ success: boolean; data: any }> => {
  const response = await apiClient.post(`/exams/${studentExamId}/answers`, {
    questionId,
    answer,
    timeSpent
  })
  return response.data
}

// Submit exam
export const submitExam = async (
  studentExamId: string,
  autoSubmit: boolean = false
): Promise<{ success: boolean; data: ExamResults }> => {
  const response = await apiClient.post(`/exams/${studentExamId}/submit`, {
    autoSubmit
  })
  return response.data
}

// Get exam results
export const getExamResults = async (studentExamId: string): Promise<{ success: boolean; data: ExamResults }> => {
  const response = await apiClient.get(`/exams/results/${studentExamId}`)
  return response.data
}

// Get review questions (after exam completion)
export const getReviewQuestions = async (studentExamId: string): Promise<{ success: boolean; data: any }> => {
  const response = await apiClient.get(`/exams/results/${studentExamId}/review`)
  return response.data
}

// Create exam (admin only)
export const createExam = async (examData: any): Promise<{ success: boolean; data: any }> => {
  const response = await apiClient.post('/exams', examData)
  return response.data
}