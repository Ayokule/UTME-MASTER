/**
 * Jest Setup for UTME Master Backend
 * Global test configuration and utilities
 */

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
process.env.JWT_EXPIRES_IN = '1d';
process.env.FRONTEND_URL = 'http://localhost:5173';
process.env.BACKEND_URL = 'http://localhost:5000';

// Mock database connection
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    upsert: jest.fn(),
    count: jest.fn(),
  },
  exam: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    upsert: jest.fn(),
    count: jest.fn(),
  },
  question: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    upsert: jest.fn(),
    count: jest.fn(),
  },
  examQuestion: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    upsert: jest.fn(),
    count: jest.fn(),
  },
  studentExam: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    upsert: jest.fn(),
    count: jest.fn(),
  },
  studentAnswer: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    upsert: jest.fn(),
    count: jest.fn(),
  },
  subject: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    upsert: jest.fn(),
    count: jest.fn(),
  },
  topic: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    upsert: jest.fn(),
    count: jest.fn(),
  },
  studentProgress: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    upsert: jest.fn(),
    count: jest.fn(),
  },
};

// Export mock prisma
export const prisma = mockPrisma;

// Mock logger
export const logger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};

// Mock email service
export const emailService = {
  sendExamCompletionEmail: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  sendNotificationEmail: jest.fn(),
};

// Utility function to create mock user
export function createMockUser(overrides = {}) {
  return {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'STUDENT',
    licenseTier: 'TRIAL',
    isActive: true,
    createdAt: new Date(),
    ...overrides,
  };
}

// Utility function to create mock exam
export function createMockExam(overrides = {}) {
  return {
    id: 'exam-123',
    title: 'Mock Exam',
    description: 'A mock exam for testing',
    duration: 3600,
    totalMarks: 100,
    passMarks: 50,
    totalQuestions: 40,
    subjectIds: ['subj-1'],
    questionsPerSubject: { 'subj-1': 40 },
    randomizeQuestions: false,
    randomizeOptions: false,
    showResults: true,
    allowReview: true,
    allowRetake: false,
    isActive: true,
    isPublished: true,
    createdBy: 'user-123',
    createdAt: new Date(),
    ...overrides,
  };
}

// Utility function to create mock question
export function createMockQuestion(overrides = {}) {
  return {
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
    subjectId: 'subj-1',
    isActive: true,
    createdBy: 'user-123',
    createdAt: new Date(),
    ...overrides,
  };
}

// Utility function to create mock student exam
export function createMockStudentExam(overrides = {}) {
  return {
    id: 'student-exam-123',
    examId: 'exam-123',
    studentId: 'user-123',
    status: 'IN_PROGRESS',
    startedAt: new Date(),
    totalQuestions: 40,
    questionOrder: ['question-1', 'question-2'],
    timeRemaining: 3600,
    isPractice: false,
    ...overrides,
  };
}

// Cleanup mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Global expect extensions
expect.extend({
  toBeValidExam(received) {
    const pass = received && 
      typeof received.id === 'string' &&
      typeof received.title === 'string' &&
      typeof received.duration === 'number' &&
      typeof received.totalMarks === 'number' &&
      typeof received.passMarks === 'number';
    
    return {
      pass,
      message: () => `Expected ${received} to be a valid exam`,
    };
  },
  
  toBeValidQuestion(received) {
    const pass = received && 
      typeof received.id === 'string' &&
      typeof received.questionText === 'string' &&
      received.options &&
      typeof received.correctAnswer === 'string';
    
    return {
      pass,
      message: () => `Expected ${received} to be a valid question`,
    };
  },
});
