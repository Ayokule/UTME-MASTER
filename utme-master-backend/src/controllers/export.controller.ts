// ==========================================
// EXPORT CONTROLLER
// ==========================================
// This file handles bulk export of questions to Excel/CSV
//
// What this does:
// - Accept export filters
// - Query questions from database
// - Generate Excel or CSV file
// - Return file for download

import { Request, Response } from 'express'
import { asyncHandler } from '../middleware/error.middleware'
import { BadRequestError } from '../utils/errors'
import { logger } from '../utils/logger'
import { prisma } from '../config/database'
import * as XLSX from 'xlsx'

// ==========================================
// EXPORT QUESTIONS
// ==========================================
// GET /api/export/questions
// Requires authentication (admin or teacher)
//
// Query parameters:
// - format: 'csv' | 'excel' (default: excel)
// - subjects: comma-separated subject codes (e.g., 'MTH,ENG,PHY')
// - difficulty: comma-separated difficulty levels (e.g., 'EASY,MEDIUM')
// - examType: comma-separated exam types (e.g., 'JAMB,WAEC')
// - year: specific year (e.g., '2024')
// - search: search term for question text
// - limit: maximum number of questions (default: 1000)
//
// Response:
// - Excel or CSV file download

export const exportQuestions = asyncHandler(async (req: Request, res: Response) => {
  const {
    format = 'excel',
    subjects,
    difficulty,
    examType,
    year,
    search,
    limit = '1000'
  } = req.query

  // Validate format
  if (format !== 'csv' && format !== 'excel') {
    throw new BadRequestError('Invalid format. Must be "csv" or "excel"')
  }

  // Build where clause for filtering
  const whereClause: any = {
    isActive: true
  }

  // Filter by subjects
  if (subjects && typeof subjects === 'string') {
    const subjectCodes = subjects.split(',').map(s => s.trim())
    const subjectIds = await prisma.subject.findMany({
      where: {
        code: { in: subjectCodes },
        isActive: true
      },
      select: { id: true }
    })
    
    if (subjectIds.length > 0) {
      whereClause.subjectId = {
        in: subjectIds.map(s => s.id)
      }
    }
  }

  // Filter by difficulty
  if (difficulty && typeof difficulty === 'string') {
    const difficultyLevels = difficulty.split(',').map(d => d.trim())
    whereClause.difficulty = {
      in: difficultyLevels
    }
  }

  // Filter by exam type
  if (examType && typeof examType === 'string') {
    const examTypes = examType.split(',').map(e => e.trim())
    whereClause.examType = {
      in: examTypes
    }
  }

  // Filter by year
  if (year && typeof year === 'string') {
    const yearNum = parseInt(year)
    if (!isNaN(yearNum)) {
      whereClause.year = yearNum
    }
  }

  // Filter by search term
  if (search && typeof search === 'string') {
    whereClause.questionText = {
      contains: search,
      mode: 'insensitive'
    }
  }

  // Query questions with related data
  const questions = await prisma.question.findMany({
    where: whereClause,
    include: {
      subject: {
        select: {
          name: true,
          code: true
        }
      },
      topic: {
        select: {
          name: true
        }
      },
      creator: {
        select: {
          firstName: true,
          lastName: true
        }
      }
    },
    orderBy: [
      { subject: { name: 'asc' } },
      { createdAt: 'desc' }
    ],
    take: parseInt(limit as string) || 1000
  })

  if (questions.length === 0) {
    throw new BadRequestError('No questions found matching the specified criteria')
  }

  // Transform data for export
  const exportData = questions.map((question, index) => ({
    'Row': index + 1,
    'Subject Code': question.subject?.code || '',
    'Subject Name': question.subject?.name || '',
    'Topic': question.topic?.name || '',
    'Question Text': question.questionText,
    'Option A': question.optionA,
    'Option B': question.optionB,
    'Option C': question.optionC,
    'Option D': question.optionD,
    'Correct Answer': question.correctAnswer,
    'Explanation': question.explanation || '',
    'Difficulty': question.difficulty,
    'Year': question.year || '',
    'Exam Type': question.examType,
    'Points': question.points || 1,
    'Time Limit (seconds)': question.timeLimitSeconds || '',
    'Image URL': question.imageUrl || '',
    'Audio URL': question.audioUrl || '',
    'Video URL': question.videoUrl || '',
    'Created By': question.creator 
      ? `${question.creator.firstName} ${question.creator.lastName}`.trim()
      : '',
    'Created Date': question.createdAt.toISOString().split('T')[0],
    'Last Updated': question.updatedAt.toISOString().split('T')[0]
  }))

  logger.info(`Exporting ${questions.length} questions as ${format}`)

  if (format === 'csv') {
    // Generate CSV
    const csv = generateCSV(exportData)
    
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename=questions_export_${new Date().toISOString().split('T')[0]}.csv`)
    res.send(csv)
  } else {
    // Generate Excel
    const buffer = generateExcel(exportData)
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename=questions_export_${new Date().toISOString().split('T')[0]}.xlsx`)
    res.send(buffer)
  }
})

// ==========================================
// EXPORT STATISTICS
// ==========================================
// GET /api/export/statistics
// Returns export statistics for the admin dashboard

export const getExportStatistics = asyncHandler(async (req: Request, res: Response) => {
  const [
    totalQuestions,
    questionsBySubject,
    questionsByDifficulty,
    questionsByExamType,
    questionsByYear
  ] = await Promise.all([
    // Total questions
    prisma.question.count({
      where: { isActive: true }
    }),
    
    // Questions by subject
    prisma.question.groupBy({
      by: ['subjectId'],
      where: { isActive: true },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } }
    }),
    
    // Questions by difficulty
    prisma.question.groupBy({
      by: ['difficulty'],
      where: { isActive: true },
      _count: { id: true }
    }),
    
    // Questions by exam type
    prisma.question.groupBy({
      by: ['examType'],
      where: { isActive: true },
      _count: { id: true }
    }),
    
    // Questions by year
    prisma.question.groupBy({
      by: ['year'],
      where: { 
        isActive: true,
        year: { not: null }
      },
      _count: { id: true },
      orderBy: { year: 'desc' }
    })
  ])

  // Get subject names
  const subjects = await prisma.subject.findMany({
    where: { isActive: true },
    select: { id: true, name: true, code: true }
  })
  const subjectMap = new Map(subjects.map(s => [s.id, s]))

  // Format subject statistics
  const subjectStats = questionsBySubject.map(stat => ({
    subject: subjectMap.get(stat.subjectId)?.name || 'Unknown',
    code: subjectMap.get(stat.subjectId)?.code || 'UNK',
    count: stat._count.id
  }))

  const statistics = {
    totalQuestions,
    bySubject: subjectStats,
    byDifficulty: questionsByDifficulty.map(stat => ({
      difficulty: stat.difficulty,
      count: stat._count.id
    })),
    byExamType: questionsByExamType.map(stat => ({
      examType: stat.examType,
      count: stat._count.id
    })),
    byYear: questionsByYear.map(stat => ({
      year: stat.year,
      count: stat._count.id
    }))
  }

  res.json({
    success: true,
    data: statistics
  })
})

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function generateCSV(data: any[]): string {
  if (data.length === 0) return ''
  
  const headers = Object.keys(data[0])
  const csvRows = []
  
  // Add headers
  csvRows.push(headers.map(header => `"${header}"`).join(','))
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header]
      // Escape quotes and wrap in quotes
      return `"${String(value || '').replace(/"/g, '""')}"`
    })
    csvRows.push(values.join(','))
  }
  
  return csvRows.join('\n')
}

function generateExcel(data: any[]): Buffer {
  // Create worksheet from data
  const worksheet = XLSX.utils.json_to_sheet(data)
  
  // Set column widths for better readability
  worksheet['!cols'] = [
    { wch: 5 },   // Row
    { wch: 12 },  // Subject Code
    { wch: 20 },  // Subject Name
    { wch: 15 },  // Topic
    { wch: 60 },  // Question Text
    { wch: 25 },  // Option A
    { wch: 25 },  // Option B
    { wch: 25 },  // Option C
    { wch: 25 },  // Option D
    { wch: 15 },  // Correct Answer
    { wch: 50 },  // Explanation
    { wch: 12 },  // Difficulty
    { wch: 8 },   // Year
    { wch: 12 },  // Exam Type
    { wch: 8 },   // Points
    { wch: 15 },  // Time Limit
    { wch: 30 },  // Image URL
    { wch: 30 },  // Audio URL
    { wch: 30 },  // Video URL
    { wch: 20 },  // Created By
    { wch: 12 },  // Created Date
    { wch: 12 }   // Last Updated
  ]
  
  // Create workbook and add worksheet
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Questions')
  
  // Generate Excel file buffer
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
}