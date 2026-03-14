// ==========================================
// ENHANCED QUESTION VALIDATION - Phase 2.5
// ==========================================
// This validates questions with:
// - Dynamic number of options (2-10)
// - Rich text content
// - Audio/video URLs
// - Multiple correct answers
// - Question types

import { z } from 'zod'

// ==========================================
// QUESTION OPTION SCHEMA
// ==========================================
// Each option in the options array
const questionOptionSchema = z.object({
  // Label: A, B, C, D, E, F, G, H, I, J
  label: z.string().regex(/^[A-J]$/, 'Label must be A-J'),

  // Text: Can be rich text HTML
  // May contain: <latex>, <chem>, <physics> tags
  // May contain: <b>, <i>, <u>, images, etc.
  text: z.string().min(1, 'Option text cannot be empty'),

  // Is this the correct answer?
  isCorrect: z.boolean(),

  // Optional image for this specific option
  imageUrl: z.string().url().optional().or(z.literal(''))
})

// ==========================================
// CREATE/UPDATE QUESTION SCHEMA
// ==========================================
export const enhancedQuestionSchema = z.object({
  // Subject (required)
  subjectId: z.string().uuid('Invalid subject ID'),

  // Topic (optional)
  topicId: z.string().uuid('Invalid topic ID').optional().or(z.literal('')),

  // ==========================================
  // QUESTION TYPE
  // ==========================================
  questionType: z.enum(['MCQ', 'TRUE_FALSE', 'FILL_BLANK', 'MATCHING', 'ESSAY'], {
    required_error: 'Question type is required'
  }),

  // ==========================================
  // QUESTION TEXT (Rich Text)
  // ==========================================
  // Can contain HTML, LaTeX, chemistry notation, etc.
  questionText: z
    .string()
    .min(10, 'Question must be at least 10 characters')
    .max(50000, 'Question too long'),  // Allow long text for rich content

  // ==========================================
  // DYNAMIC OPTIONS
  // ==========================================
  // Array of 2-10 options
  options: z
    .array(questionOptionSchema)
    .min(2, 'At least 2 options required')
    .max(10, 'Maximum 10 options allowed')
    .refine(
      (options) => {
        // Check if at least one option is marked correct
        return options.some(opt => opt.isCorrect)
      },
      { message: 'At least one option must be correct' }
    )
    .refine(
      (options) => {
        // Check if all labels are unique
        const labels = options.map(opt => opt.label)
        return labels.length === new Set(labels).size
      },
      { message: 'Option labels must be unique' }
    )
    .refine(
      (options) => {
        // Check if all option texts are unique
        const texts = options.map(opt => opt.text.trim())
        return texts.length === new Set(texts).size
      },
      { message: 'All options must have different text' }
    ),

  // ==========================================
  // EXPLANATION (Rich Text, Optional)
  // ==========================================
  explanation: z
    .string()
    .max(10000, 'Explanation too long')
    .optional()
    .or(z.literal('')),

  // ==========================================
  // MEDIA FILES
  // ==========================================
  // Multiple images (JSON array)
  images: z
    .array(z.string().url('Invalid image URL'))
    .max(5, 'Maximum 5 images allowed')
    .optional(),

  // Audio URL (for oral English)
  audioUrl: z
    .string()
    .url('Invalid audio URL')
    .optional()
    .or(z.literal('')),

  // Video URL (future feature)
  videoUrl: z
    .string()
    .url('Invalid video URL')
    .optional()
    .or(z.literal('')),

  // ==========================================
  // METADATA
  // ==========================================
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),

  year: z
    .number()
    .int()
    .min(2000)
    .max(2030)
    .optional(),

  examType: z.enum(['JAMB', 'WAEC', 'NECO']),

  // Time limit for this question (seconds)
  timeLimitSeconds: z
    .number()
    .int()
    .min(10, 'Minimum 10 seconds')
    .max(600, 'Maximum 10 minutes')
    .optional(),

  // Points for this question
  points: z
    .number()
    .int()
    .min(1, 'Minimum 1 point')
    .max(10, 'Maximum 10 points')
    .default(1),

  // Allow multiple correct answers?
  allowMultiple: z.boolean().default(false)
})

// TypeScript types
export type EnhancedQuestionInput = z.infer<typeof enhancedQuestionSchema>
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>
export type QueryQuestionsInput = z.infer<typeof queryQuestionsSchema>
export type BulkDeleteInput = z.infer<typeof bulkDeleteSchema>

// ==========================================
// ADDITIONAL VALIDATION SCHEMAS
// ==========================================

// ==========================================
// SIMPLIFIED QUESTION VALIDATION FOR CURRENT SCHEMA
// ==========================================
// This works with the existing database structure

// Simple create question schema (matches current database)
export const createQuestionSchema = z.object({
  subjectId: z.string().uuid('Invalid subject ID'),
  topicId: z.string().uuid('Invalid topic ID').optional().or(z.literal('')),
  questionText: z.string().min(10, 'Question must be at least 10 characters'),
  optionA: z.string().min(1, 'Option A is required'),
  optionB: z.string().min(1, 'Option B is required'),
  optionC: z.string().min(1, 'Option C is required'),
  optionD: z.string().min(1, 'Option D is required'),
  correctAnswer: z.enum(['A', 'B', 'C', 'D'], {
    required_error: 'Correct answer is required'
  }),
  explanation: z.string().optional().or(z.literal('')),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  year: z.number().int().min(2000).max(2030).optional(),
  examType: z.enum(['JAMB', 'WAEC', 'NECO']),
  imageUrl: z.string().url().optional().or(z.literal(''))
})

// Update question schema (same as create, all fields optional)
export const updateQuestionSchema = createQuestionSchema.partial()

// Query questions schema
export const queryQuestionsSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().min(1)).optional(),
  limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).optional(),
  search: z.string().optional(),
  subjectId: z.string().uuid().optional(),
  topicId: z.string().uuid().optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  year: z.string().transform(Number).pipe(z.number().int()).optional(),
  examType: z.enum(['JAMB', 'WAEC', 'NECO']).optional(),
  sortBy: z.enum(['createdAt', 'difficulty', 'year']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
})

// Bulk delete schema
export const bulkDeleteSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(100)
})

// Question ID parameter schema
export const questionIdSchema = z.object({
  id: z.string().uuid()
})

// ==========================================
// TRUE/FALSE QUESTION VALIDATION
// ==========================================
// Special validation for True/False questions
export const trueFalseQuestionSchema = enhancedQuestionSchema.refine(
  (data) => {
    if (data.questionType === 'TRUE_FALSE') {
      // Must have exactly 2 options
      return data.options.length === 2
    }
    return true
  },
  {
    message: 'True/False questions must have exactly 2 options',
    path: ['options']
  }
)

// ==========================================
// ESSAY QUESTION VALIDATION
// ==========================================
// Essay questions don't need options
export const essayQuestionSchema = z.object({
  subjectId: z.string().uuid(),
  topicId: z.string().uuid().optional().or(z.literal('')),
  questionType: z.literal('ESSAY'),
  questionText: z.string().min(10),
  explanation: z.string().optional().or(z.literal('')),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  year: z.number().optional(),
  examType: z.enum(['JAMB', 'WAEC', 'NECO']),
  images: z.array(z.string().url()).optional(),
  audioUrl: z.string().url().optional().or(z.literal('')),
  timeLimitSeconds: z.number().optional(),
  points: z.number().default(1)
})

// ==========================================
// EXAMPLE VALID QUESTIONS
// ==========================================

// 1. MATH QUESTION (4 options with LaTeX):
// {
//   questionType: 'MCQ',
//   questionText: '<p>Solve for x: <latex>x^2 - 5x + 6 = 0</latex></p>',
//   options: [
//     { label: 'A', text: '<latex>x = 2</latex> or <latex>x = 3</latex>', isCorrect: true },
//     { label: 'B', text: '<latex>x = 1</latex> or <latex>x = 6</latex>', isCorrect: false },
//     { label: 'C', text: '<latex>x = -2</latex> or <latex>x = -3</latex>', isCorrect: false },
//     { label: 'D', text: 'No real solution', isCorrect: false }
//   ],
//   difficulty: 'MEDIUM',
//   examType: 'JAMB',
//   points: 1
// }

// 2. CHEMISTRY QUESTION (6 options):
// {
//   questionType: 'MCQ',
//   questionText: '<p>Which of the following is a noble gas?</p>',
//   options: [
//     { label: 'A', text: '<chem>H_2</chem>', isCorrect: false },
//     { label: 'B', text: '<chem>O_2</chem>', isCorrect: false },
//     { label: 'C', text: '<chem>He</chem>', isCorrect: true },
//     { label: 'D', text: '<chem>N_2</chem>', isCorrect: false },
//     { label: 'E', text: '<chem>Cl_2</chem>', isCorrect: false },
//     { label: 'F', text: '<chem>CO_2</chem>', isCorrect: false }
//   ],
//   difficulty: 'EASY',
//   examType: 'JAMB',
//   points: 1
// }

// 3. ORAL ENGLISH (with audio):
// {
//   questionType: 'MCQ',
//   questionText: '<p>Listen to the audio and identify the stress pattern:</p>',
//   audioUrl: 'https://example.com/audio/pronunciation.mp3',
//   options: [
//     { label: 'A', text: 'First syllable', isCorrect: true },
//     { label: 'B', text: 'Second syllable', isCorrect: false },
//     { label: 'C', text: 'Third syllable', isCorrect: false }
//   ],
//   difficulty: 'MEDIUM',
//   examType: 'JAMB',
//   points: 1
// }

// 4. MULTIPLE CORRECT ANSWERS:
// {
//   questionType: 'MCQ',
//   questionText: '<p>Which of the following are prime numbers? (Select all that apply)</p>',
//   options: [
//     { label: 'A', text: '2', isCorrect: true },
//     { label: 'B', text: '3', isCorrect: true },
//     { label: 'C', text: '4', isCorrect: false },
//     { label: 'D', text: '5', isCorrect: true },
//     { label: 'E', text: '6', isCorrect: false }
//   ],
//   allowMultiple: true,
//   difficulty: 'MEDIUM',
//   examType: 'JAMB',
//   points: 2
// }

// 5. TRUE/FALSE:
// {
//   questionType: 'TRUE_FALSE',
//   questionText: '<p>Water boils at 100°C at sea level.</p>',
//   options: [
//     { label: 'A', text: 'True', isCorrect: true },
//     { label: 'B', text: 'False', isCorrect: false }
//   ],
//   difficulty: 'EASY',
//   examType: 'JAMB',
//   points: 1
// }

// 6. ESSAY QUESTION:
// {
//   questionType: 'ESSAY',
//   questionText: '<p>Discuss the causes and effects of climate change. (Minimum 300 words)</p>',
//   difficulty: 'HARD',
//   examType: 'WAEC',
//   points: 10,
//   timeLimitSeconds: 1800  // 30 minutes
// }
