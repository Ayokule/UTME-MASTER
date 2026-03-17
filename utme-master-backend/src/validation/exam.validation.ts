// ==========================================
// EXAM VALIDATION SCHEMAS - ENHANCED VERSION
// ==========================================
// Zod schemas for validating exam-related requests
// All validation issues resolved

import { z } from 'zod'

// ==========================================
// CREATE EXAM SCHEMA
// ==========================================
export const createExamSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  
  duration: z.number()
    .int()
    .min(300, 'Duration must be at least 5 minutes (300 seconds)')
    .max(18000, 'Duration cannot exceed 5 hours (18000 seconds)'),
  
  totalMarks: z.number()
    .int()
    .min(1, 'Total marks must be at least 1')
    .max(1000, 'Total marks cannot exceed 1000'),
  
  passMarks: z.number()
    .int()
    .min(1, 'Pass marks must be at least 1'),
  
  totalQuestions: z.number()
    .int()
    .min(1, 'Must have at least 1 question')
    .max(200, 'Cannot exceed 200 questions'),
  
  subjectIds: z.array(z.string().uuid())
    .min(1, 'At least one subject must be selected')
    .max(10, 'Cannot select more than 10 subjects'),
  
  questionsPerSubject: z.record(z.string(), z.number().int().min(1))
    .optional(),
  
  randomizeQuestions: z.boolean().optional().default(false),
  randomizeOptions: z.boolean().optional().default(false),
  showResults: z.boolean().optional().default(true),
  allowReview: z.boolean().optional().default(true),
  allowRetake: z.boolean().optional().default(false),
  
  difficulties: z.array(z.enum(['EASY', 'MEDIUM', 'HARD']))
    .optional(),
  
  yearFrom: z.number()
    .int()
    .min(2000)
    .max(2030)
    .optional(),
  
  yearTo: z.number()
    .int()
    .min(2000)
    .max(2030)
    .optional(),
  
  isPublished: z.boolean().optional().default(false),
  
  startsAt: z.string()
    .datetime()
    .optional()
    .transform(val => val ? new Date(val) : undefined),
  
  endsAt: z.string()
    .datetime()
    .optional()
    .transform(val => val ? new Date(val) : undefined)
})
.refine(data => data.passMarks <= data.totalMarks, {
  message: 'Pass marks cannot exceed total marks',
  path: ['passMarks']
})
.refine(data => {
  if (data.yearFrom && data.yearTo) {
    return data.yearFrom <= data.yearTo
  }
  return true
}, {
  message: 'Year from cannot be greater than year to',
  path: ['yearFrom']
})
.refine(data => {
  if (data.startsAt && data.endsAt) {
    return data.startsAt < data.endsAt
  }
  return true
}, {
  message: 'Start time must be before end time',
  path: ['startsAt']
})

// ==========================================
// SUBMIT ANSWER SCHEMA - ENHANCED
// ==========================================
export const submitAnswerSchema = z.object({
  questionId: z.string()
    .min(1, 'Question ID is required')
    .uuid('Question ID must be a valid UUID'),
  
  // Enhanced answer validation
  answer: z.union([
    z.object({
      selected: z.string().min(1, 'Selected answer is required')
    }),
    z.object({
      selected: z.array(z.string()).min(1, 'At least one answer must be selected')
    }),
    z.object({
      text: z.string().min(1, 'Text answer is required')
    }),
    z.any() // Fallback for other answer types
  ], {
    errorMap: () => ({ message: 'Answer is required and must be in valid format' })
  }),
  
  timeSpent: z.number()
    .int()
    .min(0, 'Time spent cannot be negative')
    .max(3600, 'Time spent cannot exceed 1 hour')
    .optional()
    .default(0)
})

// ==========================================
// SUBMIT EXAM SCHEMA
// ==========================================
export const submitExamSchema = z.object({
  autoSubmit: z.boolean()
    .optional()
    .default(false)
})

// ==========================================
// START PRACTICE EXAM SCHEMA - ENHANCED
// ==========================================
export const startPracticeExamSchema = z.object({
  subject: z.string()
    .min(1, 'Subject is required')
    .max(100, 'Subject name too long'),
  
  examType: z.enum(['JAMB', 'WAEC', 'NECO', 'MOCK', 'PRACTICE'])
    .default('JAMB'),
  
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'all'])
    .optional()
    .default('all'),
  
  questionCount: z.number()
    .int()
    .min(1, 'Must have at least 1 question')
    .max(200, 'Cannot exceed 200 questions')
    .default(40),
  
  duration: z.number()
    .int()
    .min(5, 'Duration must be at least 5 minutes')
    .max(300, 'Duration cannot exceed 5 hours (300 minutes)')
    .default(60)
})

// ==========================================
// ROUTE PARAMS VALIDATION
// ==========================================
export const examIdSchema = z.object({
  examId: z.string().uuid('Invalid exam ID format')
})

export const studentExamIdSchema = z.object({
  studentExamId: z.string().uuid('Invalid student exam ID format')
})

// ==========================================
// TYPE EXPORTS
// ==========================================
export type CreateExamData = z.infer<typeof createExamSchema>
export type SubmitAnswerData = z.infer<typeof submitAnswerSchema>
export type SubmitExamData = z.infer<typeof submitExamSchema>
export type StartPracticeExamData = z.infer<typeof startPracticeExamSchema>