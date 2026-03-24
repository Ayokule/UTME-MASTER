/**
 * Test Mocks for UTME Master Frontend
 * Common mock data and utilities for testing
 */

// Mock User Data
export const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'STUDENT',
  licenseTier: 'TRIAL',
  isActive: true,
  createdAt: new Date(),
}

export const mockAdminUser = {
  id: 'user-admin-123',
  email: 'admin@example.com',
  firstName: 'Admin',
  lastName: 'User',
  role: 'ADMIN',
  licenseTier: 'PREMIUM',
  isActive: true,
  createdAt: new Date(),
}

// Mock Exam Data
export const mockExam = {
  id: 'exam-123',
  title: 'JAMB Mock Exam - Mathematics',
  description: 'A mock exam for JAMB Mathematics preparation',
  duration: 3600,
  totalMarks: 100,
  passMarks: 50,
  totalQuestions: 40,
  subjectIds: ['subj-math'],
  questionsPerSubject: { 'subj-math': 40 },
  randomizeQuestions: false,
  randomizeOptions: false,
  showResults: true,
  allowReview: true,
  allowRetake: false,
  isActive: true,
  isPublished: true,
  startsAt: null,
  endsAt: null,
  createdBy: 'user-123',
  createdAt: new Date(),
}

export const mockExamWithScheduling = {
  ...mockExam,
  startsAt: new Date(Date.now() + 3600000), // 1 hour from now
  endsAt: new Date(Date.now() + 7200000), // 2 hours from now
}

// Mock Question Data
export const mockQuestion = {
  id: 'question-123',
  questionText: 'What is the capital of Nigeria?',
  questionType: 'MCQ',
  options: {
    A: { text: 'Lagos' },
    B: { text: 'Abuja' },
    C: { text: 'Kano' },
    D: { text: 'Port Harcourt' },
  },
  correctAnswer: 'B',
  explanation: 'Abuja is the capital of Nigeria',
  difficulty: 'EASY',
  year: 2024,
  examType: 'JAMB',
  subjectId: 'subj-math',
  isActive: true,
  createdBy: 'user-123',
  createdAt: new Date(),
}

// Mock Student Exam Data
export const mockStudentExam = {
  id: 'student-exam-123',
  examId: 'exam-123',
  studentId: 'user-123',
  status: 'IN_PROGRESS',
  startedAt: new Date(),
  submittedAt: null,
  timeSpent: 0,
  timeRemaining: 3600,
  totalQuestions: 40,
  answeredQuestions: 0,
  correctAnswers: 0,
  wrongAnswers: 0,
  score: 0,
  totalScore: 100,
  passed: null,
  grade: null,
  questionOrder: ['question-1', 'question-2'],
  autoSubmitted: false,
  isPractice: false,
  createdAt: new Date(),
}

// Mock Subject Data
export const mockSubject = {
  id: 'subj-math',
  name: 'Mathematics',
  code: 'MTH',
  description: 'Mathematics subject for exams',
  isActive: true,
  createdAt: new Date(),
}

// Mock Results Data
export const mockResults = {
  studentExamId: 'student-exam-123',
  examTitle: 'JAMB Mock Exam - Mathematics',
  totalQuestions: 40,
  answeredQuestions: 40,
  correctAnswers: 32,
  wrongAnswers: 8,
  score: 80,
  totalMarks: 100,
  scorePercentage: '80.0',
  passed: true,
  grade: 'A',
  passMarks: 50,
  autoSubmitted: false,
  submittedAt: new Date(),
  timeSpent: 1800,
}

// Mock Dashboard Stats
export const mockDashboardStats = {
  total_exams: 5,
  passed_exams: 3,
  failed_exams: 2,
  average_score: 75,
  best_score: 90,
  worst_score: 60,
  improvement_trend: 15,
  strong_areas: ['Algebra', 'Geometry'],
  weak_areas: ['Calculus', 'Statistics'],
}

// Mock API Response
export const createMockApiResponse = <T>(data: T, success = true) => ({
  success,
  data,
  message: success ? 'Operation successful' : 'Operation failed',
})

// Mock API Error Response
export const createMockErrorResponse = (message: string, code: string) => ({
  success: false,
  error: {
    message,
    code,
  },
})

// Mock Auth Store
export const createMockAuthStore = (overrides = {}) => ({
  user: mockUser,
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyLTEyMyJ9.token',
  isAuthenticated: true,
  isLoading: false,
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
  ...overrides,
})

// Mock Query Client
export const createMockQueryClient = () => ({
  setQueryData: jest.fn(),
  getQueryData: jest.fn(),
  invalidateQueries: jest.fn(),
  refetchQueries: jest.fn(),
  clear: jest.fn(),
})

// Mock Toast
export const mockToast = {
  success: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  warning: jest.fn(),
  loading: jest.fn(),
  dismiss: jest.fn(),
}
