// ==========================================
// FILE UPLOAD CONFIGURATION (Multer)
// ==========================================
// This file configures multer for handling file uploads
//
// What is multer?
// - Middleware for handling multipart/form-data
// - Used for file uploads in Express
// - Parses file from request and adds to req.file
//
// Configuration:
// - Storage: memory (keep file in RAM, not disk)
// - File size limit: 5MB
// - File type validation

import multer from 'multer'
import { Request } from 'express'
import { BadRequestError } from '../utils/errors'

// ==========================================
// STORAGE CONFIGURATION
// ==========================================
// Where to store uploaded files
//
// Options:
// 1. diskStorage - Save to disk (hard drive)
// 2. memoryStorage - Keep in memory (RAM)
//
// We use memoryStorage because:
// - Files are temporary (just for import)
// - No need to save to disk
// - Faster processing
// - Auto cleanup when done

const storage = multer.memoryStorage()

// ==========================================
// FILE FILTER
// ==========================================
// Validate file type before upload
//
// Only allow:
// - Excel files (.xlsx, .xls)
// - CSV files (.csv)
// - Images (.jpg, .jpeg, .png)

function fileFilter(
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  // Get file extension
  const filename = file.originalname.toLowerCase()
  
  // Determine allowed types based on field name
  if (file.fieldname === 'file') {
    // For bulk import (Excel/CSV)
    const allowedExtensions = ['.xlsx', '.xls', '.csv']
    const isValid = allowedExtensions.some(ext => filename.endsWith(ext))
    
    if (!isValid) {
      return cb(new BadRequestError('Only Excel (.xlsx, .xls) and CSV (.csv) files are allowed'))
    }
  } else if (file.fieldname === 'image') {
    // For question images
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const isValid = allowedMimeTypes.includes(file.mimetype)
    
    if (!isValid) {
      return cb(new BadRequestError('Only image files (JPG, PNG, WEBP) are allowed'))
    }
  } else if (file.fieldname === 'audio') {
    // For question audio files
    const allowedMimeTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg']
    const isValid = allowedMimeTypes.includes(file.mimetype)
    
    if (!isValid) {
      return cb(new BadRequestError('Only audio files (MP3, WAV, OGG) are allowed'))
    }
  } else if (file.fieldname === 'audio') {
    // For question audio files
    const allowedMimeTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg']
    const isValid = allowedMimeTypes.includes(file.mimetype)
    
    if (!isValid) {
      return cb(new BadRequestError('Only audio files (MP3, WAV, OGG) are allowed'))
    }
  }
  
  // File is valid
  cb(null, true)
} // File is valid


// ==========================================
// CREATE MULTER INSTANCE
// ==========================================
// Configure multer with our settings

export const upload = multer({
  storage: storage,
  
  // File size limit: 5MB
  limits: {
    fileSize: 5 * 1024 * 1024  // 5MB in bytes
  },
  
  // File type validation
  fileFilter: fileFilter
})

// ==========================================
// USAGE IN ROUTES
// ==========================================
//
// Single file upload:
//   router.post('/upload',
//     upload.single('file'),  // Expect file in field named 'file'
//     controller.handleUpload
//   )
//
// Multiple files:
//   router.post('/upload-multiple',
//     upload.array('files', 10),  // Max 10 files
//     controller.handleMultiple
//   )
//
// Mixed fields:
//   router.post('/submit',
//     upload.fields([
//       { name: 'file', maxCount: 1 },
//       { name: 'image', maxCount: 5 }
//     ]),
//     controller.handleMixed
//   )
//
// In controller:
//   const file = req.file          // Single file
//   const files = req.files        // Multiple files
//   const buffer = file.buffer     // File content
//   const filename = file.originalname  // Original name
//   const mimetype = file.mimetype // MIME type
//   const size = file.size         // Size in bytes
