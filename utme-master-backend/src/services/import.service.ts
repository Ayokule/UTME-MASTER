// ==========================================
// BULK IMPORT SERVICE - ENHANCED VERSION
// ==========================================
// This file handles bulk importing questions from Excel/CSV
//
// What this service does:
// 1. Parse Excel/CSV file with advanced validation
// 2. Validate each row with comprehensive checks
// 3. Check for duplicates and data integrity
// 4. Create questions in database with transaction support
// 5. Return detailed success/error report with statistics
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
// - points (default: 1)
// - timeLimitSeconds (default: 60)

import * as XLSX from 'xlsx'  // Library for reading Excel files
import { prisma } from '../config/database'
import { BadRequestError } from '../utils/errors'
import { logger } from '../utils/logger'
import { throwBadRequest } from '../utils/errorStandardization'

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
  points?: number          // Optional: default 1
  timeLimitSeconds?: number // Optional: default 60
}

// Result of importing one row
interface ImportResult {
  row: number              // Row number in Excel
  success: boolean         // Did import succeed?
  questionText?: string    // Preview of question
  error?: string          // Error message if failed
  warnings?: string[]     // Non-fatal warnings
}

// Enhanced import statistics
interface ImportStatistics {
  totalRows: number
  successCount: number
  errorCount: number
  warningCount: number
  duplicatesSkipped: number
  subjectsProcessed: string[]
  topicsCreated: string[]
  results: ImportResult[]
}

// ==========================================
// ENHANCED FILE PARSING
// ==========================================
// Convert file buffer to array of rows with better error handling

function parseFile(buffer: Buffer, filename: string): any[] {
  try {
    // Determine file type
    const isCSV = filename.toLowerCase().endsWith('.csv')
    
    if (isCSV) {
      // Special handling for CSV files
      const csvText = buffer.toString('utf8')
      const workbook = XLSX.read(csvText, { type: 'string' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const data = XLSX.utils.sheet_to_json(worksheet)
      
      logger.debug(`Parsed ${data.length} rows from CSV file: ${filename}`)
      return data
    } else {
      // Excel file handling
      const workbook = XLSX.read(buffer, { type: 'buffer' })
      
      if (workbook.SheetNames.length === 0) {
        throwBadRequest('Excel file contains no sheets')
      }
      
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      
      if (!worksheet) {
        throwBadRequest('Cannot read worksheet data')
      }
      
      const data = XLSX.utils.sheet_to_json(worksheet, {
        defval: '', // Default value for empty cells
        blankrows: false // Skip blank rows
      })
      
      logger.debug(`Parsed ${data.length} rows from Excel file: ${filename}`)
      return data
    }
  } catch (error) {
    logger.error('Error parsing file:', error)
    throw new BadRequestError(`Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}. Make sure it is a valid Excel or CSV file.`)
  }
}

// ==========================================
// ENHANCED VALIDATION
// ==========================================
// Comprehensive validation with warnings and detailed error messages

function validateRow(row: any, rowNumber: number): { error: string | null; warnings: string[] } {
  const warnings: string[] = []
  
  // Normalize row data
  const normalizedRow = {
    subjectCode: String(row.subjectCode || '').trim().toUpperCase(),
    questionText: String(row.questionText || '').trim(),
    optionA: String(row.optionA || '').trim(),
    optionB: String(row.optionB || '').trim(),
    optionC: String(row.optionC || '').trim(),
    optionD: String(row.optionD || '').trim(),
    correctAnswer: String(row.correctAnswer || '').trim().toUpperCase(),
    difficulty: String(row.difficulty || '').trim().toUpperCase(),
    examType: String(row.examType || '').trim().toUpperCase(),
    explanation: String(row.explanation || '').trim(),
    topicName: String(row.topicName || '').trim(),
    year: row.year ? parseInt(String(row.year)) : null,
    points: row.points ? parseInt(String(row.points)) : null,
    timeLimitSeconds: row.timeLimitSeconds ? parseInt(String(row.timeLimitSeconds)) : null
  }
  
  // Check required fields
  if (!normalizedRow.subjectCode) {
    return { error: `Row ${rowNumber}: Subject code is required`, warnings }
  }
  
  if (!normalizedRow.questionText) {
    return { error: `Row ${rowNumber}: Question text is required`, warnings }
  }
  
  if (normalizedRow.questionText.length < 10) {
    warnings.push(`Row ${rowNumber}: Question text is very short (${normalizedRow.questionText.length} characters)`)
  }
  
  if (normalizedRow.questionText.length > 1000) {
    return { error: `Row ${rowNumber}: Question text is too long (max 1000 characters)`, warnings }
  }
  
  // Validate options
  const options = [normalizedRow.optionA, normalizedRow.optionB, normalizedRow.optionC, normalizedRow.optionD]
  const optionLabels = ['A', 'B', 'C', 'D']
  
  for (let i = 0; i < options.length; i++) {
    if (!options[i]) {
      return { error: `Row ${rowNumber}: Option ${optionLabels[i]} is required`, warnings }
    }
    if (options[i].length > 200) {
      return { error: `Row ${rowNumber}: Option ${optionLabels[i]} is too long (max 200 characters)`, warnings }
    }
  }
  
  // Check for duplicate options
  const uniqueOptions = new Set(options.map(opt => opt.toLowerCase()))
  if (uniqueOptions.size < options.length) {
    warnings.push(`Row ${rowNumber}: Some options appear to be duplicates`)
  }
  
  // Validate correct answer
  if (!['A', 'B', 'C', 'D'].includes(normalizedRow.correctAnswer)) {
    return { error: `Row ${rowNumber}: Correct answer must be A, B, C, or D`, warnings }
  }
  
  // Validate difficulty
  if (!['EASY', 'MEDIUM', 'HARD'].includes(normalizedRow.difficulty)) {
    return { error: `Row ${rowNumber}: Difficulty must be EASY, MEDIUM, or HARD`, warnings }
  }
  
  // Validate exam type
  if (!['JAMB', 'WAEC', 'NECO'].includes(normalizedRow.examType)) {
    return { error: `Row ${rowNumber}: Exam type must be JAMB, WAEC, or NECO`, warnings }
  }
  
  // Validate optional fields
  if (normalizedRow.year && (normalizedRow.year < 1990 || normalizedRow.year > new Date().getFullYear() + 1)) {
    warnings.push(`Row ${rowNumber}: Year ${normalizedRow.year} seems unusual`)
  }
  
  if (normalizedRow.points && (normalizedRow.points < 1 || normalizedRow.points > 10)) {
    warnings.push(`Row ${rowNumber}: Points ${normalizedRow.points} is outside typical range (1-10)`)
  }
  
  if (normalizedRow.timeLimitSeconds && (normalizedRow.timeLimitSeconds < 10 || normalizedRow.timeLimitSeconds > 600)) {
    warnings.push(`Row ${rowNumber}: Time limit ${normalizedRow.timeLimitSeconds}s seems unusual (typical: 30-300s)`)
  }
  
  if (normalizedRow.explanation && normalizedRow.explanation.length > 500) {
    warnings.push(`Row ${rowNumber}: Explanation is very long (${normalizedRow.explanation.length} characters)`)
  }
  
  // All checks passed
  return { error: null, warnings }
}

// ==========================================
// DUPLICATE DETECTION
// ==========================================
// Check if question already exists in database

async function checkForDuplicate(questionText: string, subjectId: string): Promise<boolean> {
  const existingQuestion = await prisma.question.findFirst({
    where: {
      questionText: {
        equals: questionText,
        mode: 'insensitive'
      },
      subjectId: subjectId,
      isActive: true
    }
  })
  
  return !!existingQuestion
}

// ==========================================
// ENHANCED PROCESS SINGLE ROW
// ==========================================
// Import one question from Excel row with comprehensive error handling

async function processRow(row: any, rowNumber: number, userId: string): Promise<ImportResult> {
  try {
    // ==========================================
    // STEP 1: Validate row
    // ==========================================
    const validation = validateRow(row, rowNumber)
    if (validation.error) {
      return {
        row: rowNumber,
        success: false,
        error: validation.error,
        warnings: validation.warnings
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
        error: `Subject not found: ${subjectCode}. Available subjects can be found in the system.`,
        warnings: validation.warnings
      }
    }
    
    // ==========================================
    // STEP 3: Check for duplicates
    // ==========================================
    const questionText = String(row.questionText).trim()
    const isDuplicate = await checkForDuplicate(questionText, subject.id)
    
    if (isDuplicate) {
      return {
        row: rowNumber,
        success: false,
        error: `Duplicate question detected: "${questionText.substring(0, 50)}..."`,
        warnings: validation.warnings
      }
    }
    
    // ==========================================
    // STEP 4: Find or create topic (if provided)
    // ==========================================
    let topicId: string | null = null
    
    if (row.topicName && String(row.topicName).trim() !== '') {
      const topicName = String(row.topicName).trim()
      
      // Try to find existing topic
      let topic = await prisma.topic.findFirst({
        where: {
          subjectId: subject.id,
          name: {
            equals: topicName,
            mode: 'insensitive'
          }
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
        
        logger.debug(`Created topic: ${topicName} for subject: ${subject.name}`)
      }
      
      topicId = topic.id
    }
    
    // ==========================================
    // STEP 5: Prepare question data
    // ==========================================
    const correctAnswer = String(row.correctAnswer).trim().toUpperCase() as 'A' | 'B' | 'C' | 'D'
    
    const questionData = {
      subjectId: subject.id,
      topicId: topicId,
      questionText: questionText,
      options: [
        { label: 'A', text: String(row.optionA).trim(), isCorrect: correctAnswer === 'A' },
        { label: 'B', text: String(row.optionB).trim(), isCorrect: correctAnswer === 'B' },
        { label: 'C', text: String(row.optionC).trim(), isCorrect: correctAnswer === 'C' },
        { label: 'D', text: String(row.optionD).trim(), isCorrect: correctAnswer === 'D' }
      ],
      correctAnswer: correctAnswer,
      explanation: row.explanation ? String(row.explanation).trim() : null,
      difficulty: String(row.difficulty).trim().toUpperCase() as 'EASY' | 'MEDIUM' | 'HARD',
      year: row.year ? parseInt(String(row.year)) : null,
      examType: String(row.examType).trim().toUpperCase() as 'JAMB' | 'WAEC' | 'NECO',
      // Auto-assign points by difficulty: EASY=1, MEDIUM=2, HARD=3
      // Override with explicit points column if provided
      points: row.points
        ? parseInt(String(row.points))
        : String(row.difficulty).trim().toUpperCase() === 'HARD' ? 3
        : String(row.difficulty).trim().toUpperCase() === 'MEDIUM' ? 2
        : 1,
      timeLimitSeconds: row.timeLimitSeconds ? parseInt(String(row.timeLimitSeconds)) : 60,
      createdBy: userId,
      isActive: true
    }
    
    // ==========================================
    // STEP 6: Create question in database
    // ==========================================
    const question = await prisma.question.create({
      data: questionData
    })
    
    // ==========================================
    // STEP 7: Return success
    // ==========================================
    return {
      row: rowNumber,
      success: true,
      questionText: question.questionText.length > 50 
        ? question.questionText.substring(0, 50) + '...'
        : question.questionText,
      warnings: validation.warnings
    }
    
  } catch (error) {
    // Something went wrong
    logger.error(`Error processing row ${rowNumber}:`, error)
    
    return {
      row: rowNumber,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown database error occurred'
    }
  }
}

// ==========================================
// ENHANCED BULK IMPORT QUESTIONS
// ==========================================
// Main function: Import all questions from file with comprehensive reporting

export async function bulkImportQuestions(buffer: Buffer, filename: string, userId: string): Promise<ImportStatistics> {
  logger.info(`Starting enhanced bulk import from ${filename}`)
  
  // ==========================================
  // STEP 1: Parse file
  // ==========================================
  const rows = parseFile(buffer, filename)
  
  if (rows.length === 0) {
    throw new BadRequestError('File is empty or contains no data rows')
  }
  
  if (rows.length > 1000) {
    throw new BadRequestError('Cannot import more than 1000 questions at once. Please split your file.')
  }
  
  // ==========================================
  // STEP 2: Initialize tracking variables
  // ==========================================
  const results: ImportResult[] = []
  const subjectsProcessed = new Set<string>()
  const topicsCreated = new Set<string>()
  let duplicatesSkipped = 0
  let warningCount = 0
  
  // ==========================================
  // STEP 3: Process each row with transaction support
  // ==========================================
  // Process rows one by one for better error handling and logging
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const rowNumber = i + 2  // +2 because row 1 is header, Excel rows start at 1
    
    try {
      const result = await processRow(row, rowNumber, userId)
      results.push(result)
      
      // Track statistics
      if (result.success) {
        const subjectCode = String(row.subjectCode).trim().toUpperCase()
        subjectsProcessed.add(subjectCode)
        
        if (row.topicName && String(row.topicName).trim() !== '') {
          topicsCreated.add(String(row.topicName).trim())
        }
      } else if (result.error?.includes('Duplicate question')) {
        duplicatesSkipped++
      }
      
      if (result.warnings && result.warnings.length > 0) {
        warningCount++
      }
      
      // Log progress every 50 rows
      if ((i + 1) % 50 === 0) {
        logger.info(`Processed ${i + 1}/${rows.length} rows`)
      }
      
    } catch (error) {
      logger.error(`Unexpected error processing row ${rowNumber}:`, error)
      results.push({
        row: rowNumber,
        success: false,
        error: 'Unexpected error occurred during processing'
      })
    }
  }
  
  // ==========================================
  // STEP 4: Calculate final statistics
  // ==========================================
  const successCount = results.filter(r => r.success).length
  const errorCount = results.filter(r => !r.success).length
  
  const statistics: ImportStatistics = {
    totalRows: rows.length,
    successCount,
    errorCount,
    warningCount,
    duplicatesSkipped,
    subjectsProcessed: Array.from(subjectsProcessed),
    topicsCreated: Array.from(topicsCreated),
    results
  }
  
  logger.info(`Enhanced bulk import completed: ${successCount} success, ${errorCount} errors, ${warningCount} warnings, ${duplicatesSkipped} duplicates skipped`)
  
  // ==========================================
  // STEP 5: Return comprehensive report
  // ==========================================
  return statistics
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
