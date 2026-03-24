import { Request, Response } from 'express'
import { asyncHandler } from '../middleware/error.middleware'
import { success, badRequest } from '../utils/responseHelper'

export const uploadImage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
        badRequest(res, 'No file uploaded')
        return
    }

    // Validate file type
    if (!req.file.mimetype.startsWith('image/')) {
        badRequest(res, 'File must be an image')
        return
    }

    // Validate file size (5MB max)
    if (req.file.size > 5 * 1024 * 1024) {
        badRequest(res, 'File size must be less than 5MB')
        return
    }

    // Save file
    const imageUrl = `/uploads/images/${req.file.filename}`

    success(res, { url: imageUrl }, 'Image uploaded successfully', 201)
})

export const uploadAudio = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
        badRequest(res, 'No file uploaded')
        return
    }

    // Validate file type
    if (!req.file.mimetype.startsWith('audio/')) {
        badRequest(res, 'File must be an audio file')
        return
    }

    // Validate file size (10MB max)
    if (req.file.size > 10 * 1024 * 1024) {
        badRequest(res, 'File size must be less than 10MB')
        return
    }

    // Save file
    const audioUrl = `/uploads/audio/${req.file.filename}`

    success(res, { url: audioUrl }, 'Audio uploaded successfully', 201)
})

export const uploadDocument = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
        badRequest(res, 'No file uploaded')
        return
    }

    // Validate file type
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    
    if (!allowedTypes.includes(req.file.mimetype)) {
        badRequest(res, 'File must be PDF or Word document')
        return
    }

    // Validate file size (20MB max)
    if (req.file.size > 20 * 1024 * 1024) {
        badRequest(res, 'File size must be less than 20MB')
        return
    }

    // Save file
    const documentUrl = `/uploads/documents/${req.file.filename}`

    success(res, { url: documentUrl }, 'Document uploaded successfully', 201)
})