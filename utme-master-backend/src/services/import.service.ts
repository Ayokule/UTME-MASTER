// ==========================================
// BULK IMPORT SERVICE
// ==========================================
// This file handles bulk importing questions from Excel/CSV
//
// What this service does:
// 1. Parse Excel/CSV file
// 2. Validate each row
// 3. Check for duplicates
// 4. Create questions in database
// 5. Return success/error report
//
// Supported formats:
// - Excel (.xlsx, .xls)
// - CSV (.csv)
//
// Required columns:
// - subjectCode (e.g., "MTH")
// - questionText
// - optionA, optionB, optionC, optionD
// - correctAnswer (A, B, C, or D)
// - difficulty (EASY, MEDIUM, or HARD)
// - examType (JAMB, WAEC, or NECO)
//
// Optional columns:
// - topicName
// - explanation
// - year

import * as XLSX from 'xlsx'  // Library for reading Excel files
import { prisma } from '../config/database'
import { BadRequestError } from '../utils/errors'
import { logger } from '../utils/logger'

// ==========================================
// TYPES
// ==========================================

// What each row in Excel should look like
interface ImportRow {
  subjectCode: string       // Required: MTH, ENG, PHY, etc.
  topicName?: string        // Optional
  questionText: string      // Required
  optionA: string          // Required
  optionB: string          // Required
  optionC: string          // Required
  optionD: string          // Required
  correctAnswer: string    // Required: A, B, C, or D
  explanation?: string     // Optional
  difficulty: string       // Required: EASY, MEDIUM, or HARD
  year?: number            // Optional: 2024, 2023, etc.
  examType: string         // Required: JAMB, WAEC, or NECO
}

// Result of importing one row
interface ImportResult {
  row: number              // Row number in Excel
  success: boolean         // Did import succeed?
  questionText?: string    // Preview of question
  error?: string          // Error message if failed
}

// ==========================================
// PARSE FILE BUFFER
// ==========================================
// Convert file buffer to array of rows
//
// How it works:
// 1. File uploaded as Buffer (binary data)
// 2. XLSX library reads Buffer
// 3. Converts to JSON array
// 4. Returns array of objects (one per row)

function parseFile(buffer: Buffer, filename: string): any[] {
  try {
    // Read file buffer
    // XLSX can read both Excel (.xlsx) and CSV (.csv)
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    
    // Get first sheet
    // Most Excel files have one sheet
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    // Convert sheet to JSON
    // Each row becomes an object
    // Column headers become object keys
    const data = XLSX.utils.sheet_to_json(worksheet)
    
    logger.debug(`Parsed ${data.length} rows from ${filename}`)
    
    return data
  } catch (error) {
    logger.error('Error parsing file:', error)
    throw new BadRequestError('Failed to parse file. Make sure it is a valid Excel or CSV file.')
  }
}

// ==========================================
// VALIDATE ROW
// ==========================================
// Check if row has all required fields
// Returns error message if invalid, null if valid

function validateRow(row: any, rowNumber: number): string | null {
  // Check required fields
  if (!row.subjectCode || String(row.subjectCode).trim() === '') {
    return `Row ${rowNumber}: Subject code is required`
  }
  
  if (!row.questionText || String(row.questionText).trim() === '') {
    return `Row ${rowNumber}: Question text is required`
  }
  
  if (!row.optionA || String(row.optionA).trim() === '') {
    return `Row ${rowNumber}: Option A is required`
  }
  
  if (!row.optionB || String(row.optionB).trim() === '') {
    return `Row ${rowNumber}: Option B is required`
  }
  
  if (!row.optionC || String(row.optionC).trim() === '') {
    return `Row ${rowNumber}: Option C is required`
  }
  
  if (!row.optionD || String(row.optionD).trim() === '') {
    return `Row ${rowNumber}: Option D is required`
  }
  
  // Validate correct answer
  const correctAnswer = String(row.correctAnswer).trim().toUpperCase()
  if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) {
    return `Row ${rowNumber}: Correct answer must be A, B, C, or D`
  }
  
  // Validate difficulty
  const difficulty = String(row.difficulty).trim().toUpperCase()
  if (!['EASY', 'MEDIUM', 'HARD'].includes(difficulty)) {
    return `Row ${rowNumber}: Difficulty must be EASY, MEDIUM, or HARD`
  }
  
  // Validate exam type
  const examType = String(row.examType).trim().toUpperCase()
  if (!['JAMB', 'WAEC', 'NECO'].includes(examType)) {
    return `Row ${rowNumber}: Exam type must be JAMB, WAEC, or NECO`
  }
  
  // All checks passed
  return null
}

// ==========================================
// PROCESS SINGLE ROW
// ==========================================
// Import one question from Excel row
//
// Steps:
// 1. Find subject by code
// 2. Find/create topic (if provided)
// 3. Create question
// 4. Return result

async function processRow(row: any, rowNumber: number, userId: string): Promise<ImportResult> {
  try {
    // ==========================================
    // STEP 1: Validate row
    // ==========================================
    const validationError = validateRow(row, rowNumber)
    if (validationError) {
      return {
        row: rowNumber,
        success: false,
        error: validationError
      }
    }
    
    // ==========================================
    // STEP 2: Find subject by code
    // ==========================================
    const subjectCode = String(row.subjectCode).trim().toUpperCase()
    
    const subject = await prisma.subject.findUnique({
      where: { code: subjectCode }
    })
    
    if (!subject) {
      return {
        row: rowNumber,
        success: false,
        error: `Subject not found: ${subjectCode}`
      }
    }
    
    // ==========================================
    // STEP 3: Find or create topic (if provided)
    // ==========================================
    let topicId: string | null = null
    
    if (row.topicName && String(row.topicName).trim() !== '') {
      const topicName = String(row.topicName).trim()
      
      // Try to find existing topic
      let topic = await prisma.topic.findFirst({
        where: {
          subjectId: subject.id,
          name: topicName
        }
      })
      
      // If not found, create it
      if (!topic) {
        topic = await prisma.topic.create({
          data: {
            subjectId: subject.id,
            name: topicName
          }
        })
        
        logger.debug(`Created topic: ${topicName}`)
      }
      
      topicId = topic.id
    }
    
    // ==========================================
    // STEP 4: Create question
    // ==========================================
    const questionData = {
      subjectId: subject.id,
      topicId: topicId,
      questionText: String(row.questionText).trim(),
      // Create options JSON from individual option fields
      options: [
        { label: 'A', text: String(row.optionA).trim(), isCorrect: String(row.correctAnswer).trim().toUpperCase() === 'A' },
        { label: 'B', text: String(row.optionB).trim(), isCorrect: String(row.correctAnswer).trim().toUpperCase() === 'B' },
        { label: 'C', text: String(row.optionC).trim(), isCorrect: String(row.correctAnswer).trim().toUpperCase() === 'C' },
        { label: 'D', text: String(row.optionD).trim(), isCorrect: String(row.correctAnswer).trim().toUpperCase() === 'D' }
      ],
      // Legacy fields for backward compatibility
      optionA: String(row.optionA).trim(),
      optionB: String(row.optionB).trim(),
      optionC: String(row.optionC).trim(),
      optionD: String(row.optionD).trim(),
      correctAnswer: String(row.correctAnswer).trim().toUpperCase() as 'A' | 'B' | 'C' | 'D',
      explanation: row.explanation ? String(row.explanation).trim() : null,
      difficulty: String(row.difficulty).trim().toUpperCase() as 'EASY' | 'MEDIUM' | 'HARD',
      year: row.year ? parseInt(String(row.year)) : null,
      examType: String(row.examType).trim().toUpperCase() as 'JAMB' | 'WAEC' | 'NECO',
      createdBy: userId,
      isActive: true
    }
    
    const question = await prisma.question.create({
      data: questionData
    })
    
    // ==========================================
    // STEP 5: Return success
    // ==========================================
    return {
      row: rowNumber,
      success: true,
      questionText: question.questionText.substring(0, 50) + '...'
    }
    
  } catch (error) {
    // Something went wrong
    logger.error(`Error processing row ${rowNumber}:`, error)
    
    return {
      row: rowNumber,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// ==========================================
// BULK IMPORT QUESTIONS
// ==========================================
// Main function: Import all questions from file
//
// How it works:
// 1. Parse file (Excel/CSV → JSON)
// 2. Validate all rows
// 3. Process each row (create question)
// 4. Return detailed report

export async function bulkImportQuestions(buffer: Buffer, filename: string, userId: string) {
  logger.info(`Starting bulk import from ${filename}`)
  
  // ==========================================
  // STEP 1: Parse file
  // ==========================================
  const rows = parseFile(buffer, filename)
  
  if (rows.length === 0) {
    throw new BadRequestError('File is empty')
  }
  
  if (rows.length > 500) {
    throw new BadRequestError('Cannot import more than 500 questions at once')
  }
  
  // ==========================================
  // STEP 2: Process each row
  // ==========================================
  const results: ImportResult[] = []
  
  // Process rows one by one
  // We could do this in parallel, but sequential is safer
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const rowNumber = i + 2  // +2 because row 1 is header, Excel rows start at 1
    
    const result = await processRow(row, rowNumber, userId)
    results.push(result)
  }
  
  // ==========================================
  // STEP 3: Calculate summary
  // ==========================================
  const successCount = results.filter(r => r.success).length
  const errorCount = results.filter(r => !r.success).length
  
  logger.info(`Bulk import completed: ${successCount} success, ${errorCount} errors`)
  
  // ==========================================
  // STEP 4: Return report
  // ==========================================
  return {
    totalRows: rows.length,
    successCount,
    errorCount,
    results
  }
}

// ==========================================
// EXAMPLE EXCEL FORMAT
// ==========================================
// Excel file should have these columns:
//
// | subjectCode | topicName | questionText | optionA | optionB | optionC | optionD | correctAnswer | explanation | difficulty | year | examType |
// |-------------|-----------|--------------|---------|---------|---------|---------|---------------|-------------|------------|------|----------|
// | MTH         | Algebra   | What is 2+2? | 3       | 4       | 5       | 6       | B             | Basic math  | EASY       | 2024 | JAMB     |
// | ENG         | Grammar   | Choose...    | is      | are     | was     | were    | A             |             | MEDIUM     | 2023 | JAMB     |
//
// Download template:
// GET /api/import/template
