import { z } from 'zod'

export const questionSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  topic: z.string().optional(),
  questionText: z.string().min(10, 'Question must be at least 10 characters'),
  optionA: z.string().min(1, 'Option A is required'),
  optionB: z.string().min(1, 'Option B is required'),
  optionC: z.string().min(1, 'Option C is required'),
  optionD: z.string().min(1, 'Option D is required'),
  correctAnswer: z.enum(['A', 'B', 'C', 'D'], {
    message: 'Correct answer is required'
  }),
  explanation: z.string().optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD'], {
    message: 'Difficulty must be EASY, MEDIUM, or HARD'
  }),
  year: z.number().min(2000).max(2030).optional(),
  examType: z.enum(['JAMB', 'WAEC', 'NECO'], {
    message: 'Exam type is required'
  }),
  imageUrl: z.string().url().optional().or(z.literal(''))
}).refine((data) => {
  // Check that all options are unique
  const options = [data.optionA, data.optionB, data.optionC, data.optionD]
  const uniqueOptions = new Set(options)
  return uniqueOptions.size === options.length
}, {
  message: 'All options must be unique',
  path: ['optionA'] // This will show the error on optionA, but it applies to all options
})

export const questionFiltersSchema = z.object({
  subjects: z.array(z.string()).default([]),
  topics: z.array(z.string()).default([]),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  yearFrom: z.number().min(2000).max(2030).optional(),
  yearTo: z.number().min(2000).max(2030).optional(),
  examType: z.enum(['JAMB', 'WAEC', 'NECO']).optional(),
  search: z.string().optional()
}).refine((data) => {
  if (data.yearFrom && data.yearTo) {
    return data.yearFrom <= data.yearTo
  }
  return true
}, {
  message: 'Year from must be less than or equal to year to',
  path: ['yearFrom']
})

export const bulkImportRowSchema = z.object({
  Subject: z.string().min(1, 'Subject is required'),
  Topic: z.string().optional(),
  Question: z.string().min(10, 'Question must be at least 10 characters'),
  'Option A': z.string().min(1, 'Option A is required'),
  'Option B': z.string().min(1, 'Option B is required'),
  'Option C': z.string().min(1, 'Option C is required'),
  'Option D': z.string().min(1, 'Option D is required'),
  'Correct Answer': z.enum(['A', 'B', 'C', 'D'], {
    message: 'Correct answer must be A, B, C, or D'
  }),
  Explanation: z.string().optional(),
  Difficulty: z.enum(['EASY', 'MEDIUM', 'HARD'], {
    message: 'Difficulty must be EASY, MEDIUM, or HARD'
  }),
  Year: z.number().min(2000).max(2030).optional(),
  'Exam Type': z.enum(['JAMB', 'WAEC', 'NECO'], {
    message: 'Exam type must be JAMB, WAEC, or NECO'
  }),
  'Image URL': z.string().url().optional().or(z.literal(''))
}).refine((data) => {
  // Check that all options are unique
  const options = [data['Option A'], data['Option B'], data['Option C'], data['Option D']]
  const uniqueOptions = new Set(options)
  return uniqueOptions.size === options.length
}, {
  message: 'All options must be unique',
  path: ['Option A']
})

export type QuestionFormData = z.infer<typeof questionSchema>
export type QuestionFiltersData = z.infer<typeof questionFiltersSchema>
export type BulkImportRowData = z.infer<typeof bulkImportRowSchema>