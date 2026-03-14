import { z } from 'zod'

// Image upload validation
export const imageUploadSchema = z.object({
  file: z.object({
    mimetype: z.string().refine(
      (type) => type.startsWith('image/'),
      'File must be an image'
    ),
    size: z.number().max(5 * 1024 * 1024, 'File size must be less than 5MB')
  })
})

// Audio upload validation
export const audioUploadSchema = z.object({
  file: z.object({
    mimetype: z.string().refine(
      (type) => type.startsWith('audio/'),
      'File must be an audio file'
    ),
    size: z.number().max(10 * 1024 * 1024, 'File size must be less than 10MB')
  })
})

// Document upload validation
export const documentUploadSchema = z.object({
  file: z.object({
    mimetype: z.string().refine(
      (type) => ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(type),
      'File must be PDF or Word document'
    ),
    size: z.number().max(20 * 1024 * 1024, 'File size must be less than 20MB')
  })
})