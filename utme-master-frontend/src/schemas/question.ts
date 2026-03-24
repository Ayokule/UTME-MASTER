import { z } from 'zod'

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'] as const
export type OptionLabel = typeof OPTION_LABELS[number]

export const questionOptionSchema = z.object({
  label: z.string(),
  text: z.string().min(1, 'Option text is required'),
  isCorrect: z.boolean()
})

export const questionSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  topic: z.string().optional(),
  questionText: z.string().min(10, 'Question must be at least 10 characters'),
  options: z.array(questionOptionSchema)
    .min(2, 'At least 2 options required')
    .max(10, 'Maximum 10 options allowed'),
  correctAnswer: z.string().min(1, 'Correct answer is required'),
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
  // At least one option must be correct
  return data.options.some(o => o.isCorrect)
}, {
  message: 'Please select at least one correct answer',
  path: ['correctAnswer']
}).refine((data) => {
  // All option texts must be unique
  const texts = data.options.map(o => o.text.trim().toLowerCase())
  return new Set(texts).size === texts.length
}, {
  message: 'All options must be unique',
  path: ['options']
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

export const OPTION_LABEL_LIST = OPTION_LABELS
export type QuestionFormData = z.infer<typeof questionSchema>
export type QuestionFiltersData = z.infer<typeof questionFiltersSchema>
