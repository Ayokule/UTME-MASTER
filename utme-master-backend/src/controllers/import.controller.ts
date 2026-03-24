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
import multer from 'multer'
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

export const bulkImportQuestions = asyncHandler(async (req: Request & { file?: Express.Multer.File }, res: Response) => {
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
  // STEP 2: Validate file type and size
  // ==========================================
  // Only accept Excel and CSV files
  const allowedExtensions = ['.xlsx', '.xls', '.csv']
  const fileExtension = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'))
  
  if (!allowedExtensions.includes(fileExtension)) {
    throw new BadRequestError('Invalid file type. Only Excel (.xlsx, .xls) and CSV (.csv) files are allowed.')
  }
  
  // Check file size (max 10MB for enhanced version)
  const maxSize = 10 * 1024 * 1024  // 10MB in bytes
  if (file.size > maxSize) {
    throw new BadRequestError('File too large. Maximum size is 10MB.')
  }
  
  // Validate file content type
  const allowedMimeTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'text/csv', // .csv
    'application/csv'
  ]
  
  if (file.mimetype && !allowedMimeTypes.includes(file.mimetype)) {
    logger.warn(`Unexpected MIME type: ${file.mimetype} for file: ${file.originalname}`)
  }
  
  logger.info(`Processing enhanced bulk import: ${file.originalname} (${file.size} bytes, ${file.mimetype})`)
  
  // ==========================================
  // STEP 3: Process file with enhanced service
  // ==========================================
  // Get user ID from authenticated request
  const userId = (req as any).user.id
  
  // Call enhanced service to parse and import questions
  const statistics = await importService.bulkImportQuestions(
    file.buffer,           // File content as Buffer
    file.originalname,     // Original filename
    userId                 // User ID for createdBy field
  )
  
  // ==========================================
  // STEP 4: Generate comprehensive response
  // ==========================================
  const message = `Import completed: ${statistics.successCount} success, ${statistics.errorCount} errors`
  
  if (statistics.warningCount > 0) {
    logger.info(`${message}, ${statistics.warningCount} warnings`)
  } else {
    logger.info(message)
  }
  
  // Determine response status based on results
  let statusCode = 200
  if (statistics.errorCount > 0 && statistics.successCount === 0) {
    statusCode = 400 // All failed
  } else if (statistics.errorCount > 0) {
    statusCode = 207 // Partial success
  }
  
  res.status(statusCode).json({
    success: statistics.successCount > 0,
    message,
    data: {
      ...statistics,
      summary: {
        totalProcessed: statistics.totalRows,
        successful: statistics.successCount,
        failed: statistics.errorCount,
        warnings: statistics.warningCount,
        duplicatesSkipped: statistics.duplicatesSkipped,
        subjectsProcessed: statistics.subjectsProcessed.length,
        topicsCreated: statistics.topicsCreated.length
      }
    }
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
  // Create Enhanced Excel template
  // ==========================================
  
  // Define columns (headers) with descriptions
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
    'examType',
    'points',
    'timeLimitSeconds'
  ]
  
  // Add comprehensive example rows
  const exampleData = [
    {
      subjectCode: 'MTH',
      topicName: 'Algebra',
      questionText: 'Solve for x: 2x + 5 = 13',
      optionA: 'x = 3',
      optionB: 'x = 4',
      optionC: 'x = 5',
      optionD: 'x = 6',
      correctAnswer: 'B',
      explanation: '2x + 5 = 13, so 2x = 8, therefore x = 4',
      difficulty: 'EASY',
      year: 2024,
      examType: 'JAMB',
      points: 1,
      timeLimitSeconds: 60
    },
    {
      subjectCode: 'ENG',
      topicName: 'Grammar',
      questionText: 'Choose the correct verb form: The team _____ playing well this season.',
      optionA: 'is',
      optionB: 'are',
      optionC: 'was',
      optionD: 'were',
      correctAnswer: 'A',
      explanation: 'Team is a collective noun treated as singular, so use "is"',
      difficulty: 'MEDIUM',
      year: 2023,
      examType: 'JAMB',
      points: 1,
      timeLimitSeconds: 45
    },
    {
      subjectCode: 'PHY',
      topicName: 'Mechanics',
      questionText: 'A car accelerates from rest at 2 m/s². What is its velocity after 5 seconds?',
      optionA: '8 m/s',
      optionB: '10 m/s',
      optionC: '12 m/s',
      optionD: '15 m/s',
      correctAnswer: 'B',
      explanation: 'Using v = u + at: v = 0 + (2)(5) = 10 m/s',
      difficulty: 'MEDIUM',
      year: 2024,
      examType: 'JAMB',
      points: 2,
      timeLimitSeconds: 90
    },
    {
      subjectCode: 'CHM',
      topicName: 'Atomic Structure',
      questionText: 'What is the atomic number of Carbon?',
      optionA: '4',
      optionB: '6',
      optionC: '8',
      optionD: '12',
      correctAnswer: 'B',
      explanation: 'Carbon has 6 protons, so its atomic number is 6',
      difficulty: 'EASY',
      year: 2024,
      examType: 'JAMB',
      points: 1,
      timeLimitSeconds: 30
    },
    {
      subjectCode: 'BIO',
      topicName: 'Cell Biology',
      questionText: 'Which organelle is responsible for protein synthesis?',
      optionA: 'Mitochondria',
      optionB: 'Nucleus',
      optionC: 'Ribosome',
      optionD: 'Golgi apparatus',
      correctAnswer: 'C',
      explanation: 'Ribosomes are the cellular structures responsible for protein synthesis',
      difficulty: 'MEDIUM',
      year: 2023,
      examType: 'JAMB',
      points: 1,
      timeLimitSeconds: 60
    }
  ]
  
  // Create worksheet from data
  const worksheet = XLSX.utils.json_to_sheet(exampleData, { header: headers })
  
  // Set column widths for better readability
  worksheet['!cols'] = [
    { wch: 12 },  // subjectCode
    { wch: 15 },  // topicName
    { wch: 60 },  // questionText
    { wch: 25 },  // optionA
    { wch: 25 },  // optionB
    { wch: 25 },  // optionC
    { wch: 25 },  // optionD
    { wch: 15 },  // correctAnswer
    { wch: 50 },  // explanation
    { wch: 12 },  // difficulty
    { wch: 8 },   // year
    { wch: 12 },  // examType
    { wch: 8 },   // points
    { wch: 15 }   // timeLimitSeconds
  ]
  
  // Add header styling and validation info
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
  
  // Create instructions worksheet
  const instructionsData = [
    ['BULK QUESTION IMPORT TEMPLATE'],
    [''],
    ['INSTRUCTIONS:'],
    ['1. Fill in your questions following the format shown in the "Questions" sheet'],
    ['2. Do not modify the column headers'],
    ['3. Save the file and upload it to the bulk import page'],
    [''],
    ['REQUIRED COLUMNS:'],
    ['- subjectCode: Subject code (MTH, ENG, PHY, CHM, BIO, etc.)'],
    ['- questionText: The question text (max 1000 characters)'],
    ['- optionA, optionB, optionC, optionD: Answer options (max 200 characters each)'],
    ['- correctAnswer: Must be A, B, C, or D'],
    ['- difficulty: Must be EASY, MEDIUM, or HARD'],
    ['- examType: Must be JAMB, WAEC, or NECO'],
    [''],
    ['OPTIONAL COLUMNS:'],
    ['- topicName: Topic within the subject (will be created if not exists)'],
    ['- explanation: Explanation for the correct answer (max 500 characters)'],
    ['- year: Year of the question (1990-2025)'],
    ['- points: Points for the question (1-10, default: 1)'],
    ['- timeLimitSeconds: Time limit in seconds (10-600, default: 60)'],
    [''],
    ['VALIDATION RULES:'],
    ['- Maximum 1000 questions per file'],
    ['- File size limit: 10MB'],
    ['- Duplicate questions will be skipped'],
    ['- Invalid subject codes will cause errors'],
    ['- All required fields must be filled'],
    [''],
    ['SUBJECT CODES:'],
    ['MTH - Mathematics'],
    ['ENG - English Language'],
    ['PHY - Physics'],
    ['CHM - Chemistry'],
    ['BIO - Biology'],
    ['LIT - Literature in English'],
    ['GOV - Government'],
    ['ECO - Economics'],
    ['GEO - Geography'],
    ['HIS - History'],
    ['CRS - Christian Religious Studies'],
    ['IRS - Islamic Religious Studies'],
    [''],
    ['For more help, contact your system administrator.']
  ]
  
  const instructionsWorksheet = XLSX.utils.aoa_to_sheet(instructionsData)
  
  // Set column width for instructions
  instructionsWorksheet['!cols'] = [{ wch: 80 }]
  
  // Create workbook and add worksheets
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, instructionsWorksheet, 'Instructions')
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Questions')
  
  // Generate Excel file buffer
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
  
  // ==========================================
  // Send enhanced template file
  // ==========================================
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  )
  res.setHeader(
    'Content-Disposition',
    'attachment; filename=enhanced_question_import_template.xlsx'
  )
  
  res.send(buffer)
  
  logger.info('Enhanced template downloaded')
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
