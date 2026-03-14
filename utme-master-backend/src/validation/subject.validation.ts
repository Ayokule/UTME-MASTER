import { z } from 'zod'

// Create subject schema
export const createSubjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required').max(100, 'Subject name too long'),
  code: z.string().min(2, 'Subject code is required').max(10, 'Subject code too long'),
  description: z.string().optional(),
  examType: z.enum(['JAMB', 'WAEC', 'NECO']),
  isActive: z.boolean().default(true)
})

// Update subject schema
export const updateSubjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  code: z.string().min(2).max(10).optional(),
  description: z.string().optional(),
  examType: z.enum(['JAMB', 'WAEC', 'NECO']).optional(),
  isActive: z.boolean().optional()
})

// Create topic schema
export const createTopicSchema = z.object({
  name: z.string().min(1, 'Topic name is required').max(100, 'Topic name too long'),
  description: z.string().optional(),
  orderNumber: z.number().int().positive().optional()
})

// Subject ID param schema
export const subjectIdSchema = z.object({
  id: z.string().uuid('Invalid subject ID')
})

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>
export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>
export type CreateTopicInput = z.infer<typeof createTopicSchema>