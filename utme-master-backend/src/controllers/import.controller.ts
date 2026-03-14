// ==========================================
// IMPORT CONTROLLER
// ==========================================
// This file handles bulk import of questions from Excel/CSV
//
// What this does:
// - Accept file upload
// - Process file (parse and validate)
// - Import questions to database
// - Return detailed report
//
// Also provides template download

import { Request, Response } from 'express'
import * as importService from '../services/import.service'
import { asyncHandler } from '../middleware/error.middleware'
import { BadRequestError } from '../utils/errors'
import { logger } from '../utils/logger'
import * as XLSX from 'xlsx'

// ==========================================
// BULK IMPORT QUESTIONS
// ==========================================
// POST /api/import/questions
// Requires authentication (admin or teacher)
//
// Request:
// - multipart/form-data (file upload)
// - Field: file (Excel or CSV)
//
// Response:
// {
//   success: true,
//   message: "Import completed: 45 success, 5 errors",
//   data: {
//     totalRows: 50,
//     successCount: 45,
//     errorCount: 5,
//     results: [
//       { row: 2, success: true, questionText: "What is..." },
//       { row: 3, success: false, error: "Subject not found: ABC" },
//       ...
//     ]
//   }
// }

export const bulkImportQuestions = asyncHandler(async (req: Request, res: Response) => {
  // ==========================================
  // STEP 1: Check if file was uploaded
  // ==========================================
  // File is uploaded via multipart/form-data
  // Express with multer middleware adds file to req.file
  
  if (!req.file) {
    throw new BadRequestError('No file uploaded')
  }
  
  const file = req.file
  
  // ==========================================
  // STEP 2: Validate file type
  // ==========================================
  // Only accept Excel and CSV files
  const allowedExtensions = ['.xlsx', '.xls', '.csv']
  const fileExtension = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'))
  
  if (!allowedExtensions.includes(fileExtension)) {
    throw new BadRequestError('Invalid file type. Only Excel (.xlsx, .xls) and CSV (.csv) files are allowed.')
  }
  
  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024  // 5MB in bytes
  if (file.size > maxSize) {
    throw new BadRequestError('File too large. Maximum size is 5MB.')
  }
  
  logger.info(`Processing bulk import: ${file.originalname} (${file.size} bytes)`)
  
  // ==========================================
  // STEP 3: Process file
  // ==========================================
  // Get user ID from authenticated request
  const userId = (req as any).user.id
  
  // Call service to parse and import questions
  const result = await importService.bulkImportQuestions(
    file.buffer,           // File content as Buffer
    file.originalname,     // Original filename
    userId                 // User ID for createdBy field
  )
  
  // ==========================================
  // STEP 4: Send response
  // ==========================================
  const message = `Import completed: ${result.successCount} success, ${result.errorCount} errors`
  
  logger.info(message)
  
  res.status(200).json({
    success: true,
    message,
    data: result
  })
})

// ==========================================
// DOWNLOAD TEMPLATE
// ==========================================
// GET /api/import/template
//
// Download Excel template with example data
// Users can fill this template and upload it
//
// Response:
// - Excel file (.xlsx)
// - Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet

export const downloadTemplate = asyncHandler(async (req: Request, res: Response) => {
  // ==========================================
  // Create Excel template
  // ==========================================
  
  // Define columns (headers)
  const headers = [
    'subjectCode',
    'topicName',
    'questionText',
    'optionA',
    'optionB',
    'optionC',
    'optionD',
    'correctAnswer',
    'explanation',
    'difficulty',
    'year',
    'examType'
  ]
  
  // Add example rows
  const exampleData = [
    {
      subjectCode: 'MTH',
      topicName: 'Algebra',
      questionText: 'What is 2 + 2?',
      optionA: '3',
      optionB: '4',
      optionC: '5',
      optionD: '6',
      correctAnswer: 'B',
      explanation: 'Basic addition: 2 + 2 = 4',
      difficulty: 'EASY',
      year: 2024,
      examType: 'JAMB'
    },
    {
      subjectCode: 'ENG',
      topicName: 'Grammar',
      questionText: 'Choose the correct verb: He ___ to school every day.',
      optionA: 'go',
      optionB: 'goes',
      optionC: 'going',
      optionD: 'gone',
      correctAnswer: 'B',
      explanation: 'Subject-verb agreement: third person singular uses "goes"',
      difficulty: 'MEDIUM',
      year: 2023,
      examType: 'JAMB'
    },
    {
      subjectCode: 'PHY',
      topicName: 'Mechanics',
      questionText: 'What is the unit of force?',
      optionA: 'Joule',
      optionB: 'Watt',
      optionC: 'Newton',
      optionD: 'Pascal',
      correctAnswer: 'C',
      explanation: 'Force is measured in Newtons (N)',
      difficulty: 'EASY',
      year: 2024,
      examType: 'JAMB'
    }
  ]
  
  // Create worksheet from data
  const worksheet = XLSX.utils.json_to_sheet(exampleData, { header: headers })
  
  // Set column widths for better readability
  worksheet['!cols'] = [
    { wch: 12 },  // subjectCode
    { wch: 15 },  // topicName
    { wch: 50 },  // questionText
    { wch: 20 },  // optionA
    { wch: 20 },  // optionB
    { wch: 20 },  // optionC
    { wch: 20 },  // optionD
    { wch: 15 },  // correctAnswer
    { wch: 40 },  // explanation
    { wch: 12 },  // difficulty
    { wch: 8 },   // year
    { wch: 12 }   // examType
  ]
  
  // Create workbook and add worksheet
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Questions')
  
  // Generate Excel file buffer
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
  
  // ==========================================
  // Send file
  // ==========================================
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  )
  res.setHeader(
    'Content-Disposition',
    'attachment; filename=question_import_template.xlsx'
  )
  
  res.send(buffer)
  
  logger.info('Template downloaded')
})

// ==========================================
// HOW TO USE
// ==========================================
//
// Frontend code for file upload:
//
// const fileInput = document.getElementById('file')
// const file = fileInput.files[0]
//
// const formData = new FormData()
// formData.append('file', file)
//
// fetch('/api/import/questions', {
//   method: 'POST',
//   headers: {
//     'Authorization': `Bearer ${token}`
//   },
//   body: formData  // Don't set Content-Type! Browser sets it automatically
// })
// .then(res => res.json())
// .then(data => {
//   console.log(data.message)
//   console.log(`Success: ${data.data.successCount}`)
//   console.log(`Errors: ${data.data.errorCount}`)
//   
//   // Show errors to user
//   data.data.results.forEach(result => {
//     if (!result.success) {
//       console.error(result.error)
//     }
//   })
// })
