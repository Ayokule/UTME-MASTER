// ==========================================
// QUESTION SERVICE
// ==========================================
// This file contains business logic for question management
//
// What this service does:
// - Create new questions
// - Get all questions (with filters and pagination)
// - Get single question by ID
// - Update existing question
// - Delete question
// - Bulk delete questions
//
// Business logic lives here, NOT in controllers!
// Controllers just handle HTTP, services handle data

import { prisma } from '../config/database'
import { NotFoundError, BadRequestError } from '../utils/errors'
import { logger } from '../utils/logger'
import type {
  CreateQuestionInput,
  UpdateQuestionInput,
  QueryQuestionsInput,
  BulkDeleteInput
} from '../validation/question.validation'

// ==========================================
// GET ALL QUESTIONS (with filters)
// ==========================================
// Fetch questions with optional filters and pagination
//
// Features:
// - Pagination (page, limit)
// - Search by question text
// - Filter by subject, topic, difficulty, year, exam type
// - Sort by createdAt, difficulty, year
// - Returns questions + pagination info

export async function getQuestions(query: QueryQuestionsInput) {
  // ==========================================
  // BUILD WHERE CLAUSE (Filters)
  // ==========================================
  // Prisma where clause - defines which questions to fetch
  
  const where: any = {
    isActive: true  // Only get active questions
  }
  
  // Add search filter (search in question text)
  if (query.search) {
    where.questionText = {
      contains: query.search,  // Case-insensitive search
      mode: 'insensitive'
    }
  }
  
  // Add subject filter
  if (query.subjectId) {
    where.subjectId = query.subjectId
  }
  
  // Add topic filter
  if (query.topicId) {
    where.topicId = query.topicId
  }
  
  // Add difficulty filter
  if (query.difficulty) {
    where.difficulty = query.difficulty
  }
  
  // Add year filter
  if (query.year) {
    where.year = query.year
  }
  
  // Add exam type filter
  if (query.examType) {
    where.examType = query.examType
  }
  
  // ==========================================
  // CALCULATE PAGINATION
  // ==========================================
  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 20
  const skip = (page - 1) * limit  // How many to skip
  
  // ==========================================
  // BUILD ORDER BY CLAUSE (Sorting)
  // ==========================================
  const orderBy: any = {
    [query.sortBy || 'createdAt']: query.sortOrder || 'desc'
  }
  
  // ==========================================
  // FETCH QUESTIONS
  // ==========================================
  // Get total count (for pagination)
  const total = await prisma.question.count({ where })
  
  // Get questions for current page
  const questions = await prisma.question.findMany({
    where,
    orderBy,
    skip,
    take: limit,
    
    // Include related data (subject, topic)
    include: {
      subject: {
        select: {
          id: true,
          name: true,
          code: true
        }
      },
      topic: {
        select: {
          id: true,
          name: true
        }
      }
    }
  })
  
  // ==========================================
  // FORMAT RESPONSE
  // ==========================================
  // Transform database results to API response format
  const formattedQuestions = questions.map((q: any) => ({
    id: q.id,
    subjectId: q.subjectId,
    subject: q.subject.name,
    topicId: q.topicId,
    topic: q.topic?.name,
    questionText: q.questionText,
    optionA: q.optionA,
    optionB: q.optionB,
    optionC: q.optionC,
    optionD: q.optionD,
    correctAnswer: q.correctAnswer,
    explanation: q.explanation,
    difficulty: q.difficulty,
    year: q.year,
    examType: q.examType,
    imageUrl: q.imageUrl,
    createdAt: q.createdAt
  }))
  
  // ==========================================
  // RETURN RESULTS + PAGINATION
  // ==========================================
  const totalPages = Math.ceil(total / limit)
  
  logger.debug(`Fetched ${questions.length} questions (page ${page}/${totalPages})`)
  
  return {
    questions: formattedQuestions,
    pagination: {
      page,
      limit,
      total,
      totalPages
    }
  }
}

// ==========================================
// GET SINGLE QUESTION BY ID
// ==========================================
export async function getQuestionById(id: string) {
  // Find question in database
  const question = await prisma.question.findUnique({
    where: { id },
    include: {
      subject: {
        select: {
          id: true,
          name: true,
          code: true
        }
      },
      topic: {
        select: {
          id: true,
          name: true
        }
      }
    }
  })
  
  // Not found?
  if (!question) {
    throw new NotFoundError('Question not found')
  }
  
  // Format response
  return {
    id: question.id,
    subjectId: question.subjectId,
    subject: question.subject.name,
    topicId: question.topicId,
    topic: question.topic?.name,
    questionText: question.questionText,
    optionA: question.optionA,
    optionB: question.optionB,
    optionC: question.optionC,
    optionD: question.optionD,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
    difficulty: question.difficulty,
    year: question.year,
    examType: question.examType,
    imageUrl: question.imageUrl,
    createdAt: question.createdAt,
    updatedAt: question.updatedAt
  }
}

// ==========================================
// CREATE NEW QUESTION
// ==========================================
export async function createQuestion(data: CreateQuestionInput) {
  // ==========================================
  // STEP 1: Validate subject exists
  // ==========================================
  const subject = await prisma.subject.findUnique({
    where: { id: data.subjectId }
  })
  
  if (!subject) {
    throw new NotFoundError('Subject not found')
  }
  
  // ==========================================
  // STEP 2: Validate topic exists (if provided)
  // ==========================================
  if (data.topicId) {
    const topic = await prisma.topic.findUnique({
      where: { id: data.topicId }
    })
    
    if (!topic) {
      throw new NotFoundError('Topic not found')
    }
    
    // Check topic belongs to selected subject
    if (topic.subjectId !== data.subjectId) {
      throw new BadRequestError('Topic does not belong to selected subject')
    }
  }
  
  // ==========================================
  // STEP 3: Create question in database
  // ==========================================
  const question = await prisma.question.create({
    data: {
      subjectId: data.subjectId,
      topicId: data.topicId || null,
      questionText: data.questionText,
      options: [
        { label: 'A', text: data.optionA, isCorrect: data.correctAnswer === 'A' },
        { label: 'B', text: data.optionB, isCorrect: data.correctAnswer === 'B' },
        { label: 'C', text: data.optionC, isCorrect: data.correctAnswer === 'C' },
        { label: 'D', text: data.optionD, isCorrect: data.correctAnswer === 'D' }
      ],
      optionA: data.optionA,
      optionB: data.optionB,
      optionC: data.optionC,
      optionD: data.optionD,
      correctAnswer: data.correctAnswer,
      explanation: data.explanation || null,
      difficulty: data.difficulty,
      year: data.year || null,
      examType: data.examType,
      imageUrl: data.imageUrl || null,
      isActive: true,
      createdBy: 'system' // TODO: Use actual user ID from auth
    },
    include: {
      subject: {
        select: {
          id: true,
          name: true,
          code: true
        }
      },
      topic: {
        select: {
          id: true,
          name: true
        }
      }
    }
  })
  
  logger.info(`Question created: ${question.id} (${subject.name})`)
  
  // ==========================================
  // STEP 4: Return formatted question
  // ==========================================
  return {
    id: question.id,
    subjectId: question.subjectId,
    subjectName: question.subject.name,
    topicId: question.topicId,
    topicName: question.topic?.name,
    questionText: question.questionText,
    optionA: question.optionA,
    optionB: question.optionB,
    optionC: question.optionC,
    optionD: question.optionD,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
    difficulty: question.difficulty,
    year: question.year,
    examType: question.examType,
    imageUrl: question.imageUrl,
    createdAt: question.createdAt
  }
}

// ==========================================
// UPDATE EXISTING QUESTION
// ==========================================
export async function updateQuestion(id: string, data: UpdateQuestionInput) {
  // ==========================================
  // STEP 1: Check question exists
  // ==========================================
  const existingQuestion = await prisma.question.findUnique({
    where: { id }
  })
  
  if (!existingQuestion) {
    throw new NotFoundError('Question not found')
  }
  
  // ==========================================
  // STEP 2: Validate subject exists
  // ==========================================
  const subject = await prisma.subject.findUnique({
    where: { id: data.subjectId }
  })
  
  if (!subject) {
    throw new NotFoundError('Subject not found')
  }
  
  // ==========================================
  // STEP 3: Validate topic exists (if provided)
  // ==========================================
  if (data.topicId) {
    const topic = await prisma.topic.findUnique({
      where: { id: data.topicId }
    })
    
    if (!topic) {
      throw new NotFoundError('Topic not found')
    }
    
    if (topic.subjectId !== data.subjectId) {
      throw new BadRequestError('Topic does not belong to selected subject')
    }
  }
  
  // ==========================================
  // STEP 4: Update question in database
  // ==========================================
  const question = await prisma.question.update({
    where: { id },
    data: {
      subjectId: data.subjectId,
      topicId: data.topicId || null,
      questionText: data.questionText,
      options: data.optionA ? [
        { label: 'A', text: data.optionA, isCorrect: data.correctAnswer === 'A' },
        { label: 'B', text: data.optionB, isCorrect: data.correctAnswer === 'B' },
        { label: 'C', text: data.optionC, isCorrect: data.correctAnswer === 'C' },
        { label: 'D', text: data.optionD, isCorrect: data.correctAnswer === 'D' }
      ] : undefined,
      optionA: data.optionA,
      optionB: data.optionB,
      optionC: data.optionC,
      optionD: data.optionD,
      correctAnswer: data.correctAnswer,
      explanation: data.explanation || null,
      difficulty: data.difficulty,
      year: data.year || null,
      examType: data.examType,
      imageUrl: data.imageUrl || null
    },
    include: {
      subject: {
        select: {
          id: true,
          name: true,
          code: true
        }
      },
      topic: {
        select: {
          id: true,
          name: true
        }
      }
    }
  })
  
  logger.info(`Question updated: ${question.id}`)
  
  // ==========================================
  // STEP 5: Return formatted question
  // ==========================================
  return {
    id: question.id,
    subjectId: question.subjectId,
    subjectName: question.subject.name,
    topicId: question.topicId,
    topicName: question.topic?.name,
    questionText: question.questionText,
    optionA: question.optionA,
    optionB: question.optionB,
    optionC: question.optionC,
    optionD: question.optionD,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
    difficulty: question.difficulty,
    year: question.year,
    examType: question.examType,
    imageUrl: question.imageUrl,
    createdAt: question.createdAt,
    updatedAt: question.updatedAt
  }
}

// ==========================================
// DELETE QUESTION
// ==========================================
// Soft delete (mark as inactive)
// We don't actually delete from database
// Why? Preserve data for analytics and history

export async function deleteQuestion(id: string) {
  // Check question exists
  const question = await prisma.question.findUnique({
    where: { id }
  })
  
  if (!question) {
    throw new NotFoundError('Question not found')
  }
  
  // Soft delete (mark as inactive)
  await prisma.question.update({
    where: { id },
    data: {
      isActive: false
    }
  })
  
  logger.info(`Question deleted (soft): ${id}`)
  
  return { message: 'Question deleted successfully' }
}

// ==========================================
// BULK DELETE QUESTIONS
// ==========================================
// Delete multiple questions at once
// Also soft delete

export async function bulkDeleteQuestions(data: BulkDeleteInput) {
  const { ids } = data
  
  // Check how many questions exist
  const existingQuestions = await prisma.question.count({
    where: {
      id: { in: ids }
    }
  })
  
  if (existingQuestions === 0) {
    throw new NotFoundError('No questions found with provided IDs')
  }
  
  // Soft delete all
  const result = await prisma.question.updateMany({
    where: {
      id: { in: ids }
    },
    data: {
      isActive: false
    }
  })
  
  logger.info(`Bulk deleted ${result.count} questions`)
  
  return {
    message: `${result.count} question(s) deleted successfully`,
    deletedCount: result.count
  }
}

// ==========================================
// EXAMPLE USAGE IN CONTROLLER
// ==========================================
//
// import * as questionService from '../services/question.service'
//
// export async function getQuestions(req: Request, res: Response) {
//   const result = await questionService.getQuestions(req.query)
//   res.json({
//     success: true,
//     data: result
//   })
// }
