import { Router } from 'express'
import { authenticate, authorizeRole } from '../middleware/auth.middleware'
import { upload } from '../config/multer'
import * as uploadController from '../controllers/upload.controller'

const router = Router()

// Image upload
router.post(
    '/image',
    authenticate,
    authorizeRole(['ADMIN', 'TEACHER']),
    upload.single('image'),
    uploadController.uploadImage
)

// Audio upload
router.post(
    '/audio',
    authenticate,
    authorizeRole(['ADMIN', 'TEACHER']),
    upload.single('audio'),
    uploadController.uploadAudio
)

// Document upload
router.post(
    '/document',
    authenticate,
    authorizeRole(['ADMIN', 'TEACHER']),
    upload.single('document'),
    uploadController.uploadDocument
)

export default router