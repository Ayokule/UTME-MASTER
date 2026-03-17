/**
 * Exam Flow Type Definitions
 * 
 * Comprehensive types for exam taking, review, and results
 * Ensures type safety across frontend exam components
 */

// ==========================================
// EXAM INFORMATION
// ==========================================

export interface ExamInfo {
  id: string
  title: string
  description?: string
  duration: number // in minutes
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

// ==========================================
// QUESTIONS
// ==========================================

export interface QuestionOption {
  label: 'A' | 'B' | 'C' | 'D'
  text: string
  explanation?: string
}

export interface QuestionWithOptions {
  id: string
  questionText: string
  questionType: 'MCQ' | 'TRUE_FALSE' | 'FILL_BLANK' | 'ESSAY' | 'MATCHING'
  options: QuestionOption[]
  images?: string[]
  audioUrl?: string
  videoUrl?: string
  subject: string
  topic?: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  
  // Only available after submission
  correctAnswer?: string
  explanation?: string
}

// ==========================================
// STUDENT ANSWERS
// ==========================================

export interface StudentAnswer {
  questionId: string
  selectedAnswer: 'A' | 'B' | 'C' | 'D' | null
  timeSpent: number // seconds
}

export interface StudentAnswerMap {
  [questionId: string]: StudentAnswer
}

// ==========================================
// EXAM STATE (During Taking)
// ==========================================

export interface ExamState {
  studentExamId: string
  examId: string
  examTitle: string
  currentQuestion: number
  answers: StudentAnswerMap
  timeRemaining: number // seconds
  submitted: boolean
  autoSubmitted: boolean
  startedAt: string
  submittedAt?: string
}

// ==========================================
// EXAM RESULTS
// ==========================================

export interface ExamScore {
  total: number // correct answers
  max: number // total marks
  percentage: number
  grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
  passed: boolean
  timeTaken: number // seconds
}

export interface SubjectScore {
  name: string
  score: number
  max: number
  correct: number
  total: number
  percentage: number
}

export interface QuestionResult {
  id: string
  questionNumber: number
  questionText: string
  options: QuestionOption[]
  selectedAnswer: 'A' | 'B' | 'C' | 'D' | null
  correctAnswer: 'A' | 'B' | 'C' | 'D'
  isCorrect: boolean
  explanation: string
  subject: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  pointsEarned: number
  timeSpent: number
}

export interface ExamAnalytics {
  improvement: number // percentage vs previous attempt
  predictedScore: number
  rankingPercentile: number
  strengthsChart: Array<{ subject: string; accuracy: number }>
  weaknessesChart: Array<{ subject: string; accuracy: number }>
  topicBreakdown: Array<{ topic: string; accuracy: number }>
}

export interface ExamResults {
  exam: ExamInfo
  score: ExamScore
  subjects: SubjectScore[]
  questions: QuestionResult[]
  analytics?: ExamAnalytics // Premium only
  canRetake: boolean
  attemptNumber: number
  submittedAt: string
}

// ==========================================
// API RESPONSES
// ==========================================

export interface StartExamResponse {
  studentExamId: string
  examId: string
  examTitle: string
  duration: number
  totalQuestions: number
  totalMarks: number
  startedAt: string
  timeRemaining: number
  questions: QuestionWithOptions[]
  allowReview: boolean
  allowRetake: boolean
}

export interface ResumeExamResponse {
  studentExamId: string
  examTitle: string
  duration: number
  totalQuestions: number
  totalMarks: number
  startedAt: string
  timeRemaining: number
  questions: QuestionWithOptions[]
  savedAnswers: StudentAnswerMap
  currentQuestion: number
}

export interface SaveAnswerResponse {
  saved: boolean
  questionId: string
  timestamp: string
}

export interface SubmitExamResponse {
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
  questions: QuestionResult[]
}

export interface GetResultsResponse {
  exam: ExamInfo
  score: ExamScore
  subjects: SubjectScore[]
  questions: QuestionResult[]
  analytics?: ExamAnalytics
  canRetake: boolean
  attemptNumber: number
  submittedAt: string
}

export interface RetakeExamResponse {
  studentExamId: string
  examId: string
  examTitle: string
  duration: number
  totalQuestions: number
  totalMarks: number
  startedAt: string
  timeRemaining: number
  questions: QuestionWithOptions[]
}

// ==========================================
// COMPONENT PROPS
// ==========================================

export interface ExamInterfaceProps {
  studentExamId: string
  onSubmit?: (results: ExamResults) => void
  onTimeExpired?: () => void
}

export interface QuestionDisplayProps {
  question: QuestionWithOptions
  questionNumber: number
  totalQuestions: number
  selectedAnswer?: string | null
  onAnswerChange: (answer: string | null) => void
  onNext: () => void
  onPrevious: () => void
  canGoNext: boolean
  canGoPrevious: boolean
}

export interface ResultsDisplayProps {
  results: ExamResults
  onRetake?: () => void
  onDownloadPDF?: () => void
}

export interface QuestionReviewProps {
  question: QuestionResult
  questionNumber: number
  totalQuestions: number
  onNext: () => void
  onPrevious: () => void
}

// ==========================================
// CACHE TYPES
// ==========================================

export interface ExamCache {
  studentExamId: string
  answers: StudentAnswerMap
  timeRemaining: number
  lastSavedAt: number // timestamp
  currentQuestion: number
}

// ==========================================
// ERROR TYPES
// ==========================================

export interface ExamError {
  code: 'EXAM_NOT_FOUND' | 'NOT_ELIGIBLE' | 'TIME_EXPIRED' | 'ALREADY_SUBMITTED' | 'INVALID_ANSWER' | 'CONCURRENT_SESSION'
  message: string
  details?: string
}
