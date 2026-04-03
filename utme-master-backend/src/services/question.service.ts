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
  
  // Add subject filter — supports subjectId (UUID), subject (name), or subjects[]/subjects (array of names)
  if (query.subjectId) {
    where.subjectId = query.subjectId
  } else {
    const q = query as any
    const subjectNames: string[] = []

    // subjects[] or subjects array
    const subjectsParam = q['subjects[]'] ?? q.subjects
    if (subjectsParam) {
      const arr = Array.isArray(subjectsParam) ? subjectsParam : [subjectsParam]
      subjectNames.push(...arr.map((s: string) => s.trim()).filter(Boolean))
    }
    // single subject name
    if (q.subject && !subjectNames.length) {
      subjectNames.push(String(q.subject).trim())
    }

    if (subjectNames.length > 0) {
      where.subject = {
        name: { in: subjectNames, mode: 'insensitive' }
      }
    }
  }

  // Add topic filter — supports topicId or topics[]/topics array
  if (query.topicId) {
    where.topicId = query.topicId
  } else {
    const q = query as any
    const topicNames: string[] = []
    const topicsParam = q['topics[]'] ?? q.topics
    if (topicsParam) {
      const arr = Array.isArray(topicsParam) ? topicsParam : [topicsParam]
      topicNames.push(...arr.map((s: string) => s.trim()).filter(Boolean))
    }
    if (q.topic && !topicNames.length) topicNames.push(String(q.topic).trim())
    if (topicNames.length > 0) {
      where.topic = { name: { in: topicNames, mode: 'insensitive' } }
    }
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
  // Convert JSON options to separate fields for frontend compatibility
  const formattedQuestions = questions.map((q: any) => {
    const opts = q.options as any
    const getOpt = (label: string) => {
      if (Array.isArray(opts)) {
        return opts.find((o: any) => o.label === label)?.text || ''
      }
      return opts?.[label]?.text || opts?.[label] || ''
    }
    return {
      id: q.id,
      subjectId: q.subjectId,
      subject: q.subject.name,
      topicId: q.topicId,
      topic: q.topic?.name,
      questionText: q.questionText,
      options: Array.isArray(opts) ? opts : [
        { label: 'A', text: getOpt('A'), isCorrect: q.correctAnswer === 'A' },
        { label: 'B', text: getOpt('B'), isCorrect: q.correctAnswer === 'B' },
        { label: 'C', text: getOpt('C'), isCorrect: q.correctAnswer === 'C' },
        { label: 'D', text: getOpt('D'), isCorrect: q.correctAnswer === 'D' },
      ],
      optionA: getOpt('A'),
      optionB: getOpt('B'),
      optionC: getOpt('C'),
      optionD: getOpt('D'),
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      difficulty: q.difficulty,
      year: q.year,
      examType: q.examType,
      createdAt: q.createdAt
    }
  })
  
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
  const options = question.options as any
  // Support both array format [{label,text}] (import) and object format {A:{text}} (manual create)
  const getOption = (label: string) => {
    if (Array.isArray(options)) {
      return options.find((o: any) => o.label === label)?.text || ''
    }
    return options?.[label]?.text || options?.[label] || ''
  }

  return {
    id: question.id,
    subjectId: question.subjectId,
    subject: question.subject.name,
    topicId: question.topicId,
    topic: question.topic?.name,
    questionText: question.questionText,
    options: Array.isArray(options) ? options : [
      { label: 'A', text: getOption('A'), isCorrect: question.correctAnswer === 'A' },
      { label: 'B', text: getOption('B'), isCorrect: question.correctAnswer === 'B' },
      { label: 'C', text: getOption('C'), isCorrect: question.correctAnswer === 'C' },
      { label: 'D', text: getOption('D'), isCorrect: question.correctAnswer === 'D' },
    ],
    optionA: getOption('A'),
    optionB: getOption('B'),
    optionC: getOption('C'),
    optionD: getOption('D'),
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
    difficulty: question.difficulty,
    year: question.year,
    examType: question.examType,
    createdAt: question.createdAt,
    updatedAt: question.updatedAt
  }
}

// ==========================================
// CREATE NEW QUESTION
// ==========================================
export async function createQuestion(data: any, userId: string) {
  // ==========================================
  // STEP 1: Resolve subject — accept name or UUID
  // ==========================================
  let subject: any

  if (data.subjectId) {
    subject = await prisma.subject.findUnique({ where: { id: data.subjectId } })
  } else if (data.subject) {
    // Look up by name (case-insensitive)
    subject = await prisma.subject.findFirst({
      where: { name: { equals: data.subject, mode: 'insensitive' } }
    })
    // Auto-create subject if it doesn't exist
    if (!subject) {
      subject = await prisma.subject.create({
        data: {
          name: data.subject,
          code: data.subject.substring(0, 4).toUpperCase()
        }
      })
      logger.info(`Auto-created subject: ${data.subject}`)
    }
  }

  if (!subject) {
    throw new NotFoundError('Subject not found')
  }

  // ==========================================
  // STEP 2: Resolve topic (optional)
  // ==========================================
  let topicId: string | null = null

  if (data.topicId) {
    const topic = await prisma.topic.findUnique({ where: { id: data.topicId } })
    if (!topic) throw new NotFoundError('Topic not found')
    if (topic.subjectId !== subject.id) throw new BadRequestError('Topic does not belong to selected subject')
    topicId = topic.id
  } else if (data.topic) {
    // Look up or create topic by name
    let topic = await prisma.topic.findFirst({
      where: { name: { equals: data.topic, mode: 'insensitive' }, subjectId: subject.id }
    })
    if (!topic) {
      topic = await prisma.topic.create({
        data: { name: data.topic, subjectId: subject.id }
      })
    }
    topicId = topic.id
  }

  // ==========================================
  // STEP 3: Resolve options — normalize to array format
  // ==========================================
  let optionsArray: { label: string; text: string; isCorrect: boolean }[]
  let correctAnswer: string = String(data.correctAnswer || '').toUpperCase()

  if (Array.isArray(data.options) && data.options.length >= 2) {
    optionsArray = data.options.map((opt: any) => ({
      label: String(opt.label),
      text: String(opt.text || ''),
      isCorrect: opt.isCorrect ?? (String(opt.label) === correctAnswer)
    }))
    // Derive correctAnswer from isCorrect flag if not explicitly set
    const correctOpt = optionsArray.find(o => o.isCorrect)
    if (correctOpt && !correctAnswer) correctAnswer = correctOpt.label
  } else {
    // Legacy flat fields — convert to array
    optionsArray = [
      { label: 'A', text: String(data.optionA || ''), isCorrect: correctAnswer === 'A' },
      { label: 'B', text: String(data.optionB || ''), isCorrect: correctAnswer === 'B' },
      { label: 'C', text: String(data.optionC || ''), isCorrect: correctAnswer === 'C' },
      { label: 'D', text: String(data.optionD || ''), isCorrect: correctAnswer === 'D' },
    ]
  }

  // ==========================================
  // STEP 4: Create question in database
  // ==========================================
  const question = await prisma.question.create({
    data: {
      subjectId: subject.id,
      topicId,
      questionText: data.questionText,
      options: optionsArray,
      correctAnswer,
      explanation: data.explanation || null,
      difficulty: data.difficulty,
      year: data.year || null,
      examType: data.examType,
      isActive: true,
      createdBy: userId
    },
    include: {
      subject: { select: { id: true, name: true, code: true } },
      topic: { select: { id: true, name: true } }
    }
  })

  logger.info(`Question created: ${question.id} (${subject.name})`)

  const opts = question.options as any[]
  const getOpt = (label: string) => opts.find((o: any) => o.label === label)?.text || ''

  return {
    id: question.id,
    subjectId: question.subjectId,
    subjectName: question.subject.name,
    topicId: question.topicId,
    topicName: question.topic?.name,
    questionText: question.questionText,
    options: opts,
    optionA: getOpt('A'),
    optionB: getOpt('B'),
    optionC: getOpt('C'),
    optionD: getOpt('D'),
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
    difficulty: question.difficulty,
    year: question.year,
    examType: question.examType,
    createdAt: question.createdAt
  }
}

// ==========================================
// UPDATE EXISTING QUESTION
// ==========================================
export async function updateQuestion(id: string, data: any) {
  const existingQuestion = await prisma.question.findUnique({ where: { id } })
  if (!existingQuestion) throw new NotFoundError('Question not found')

  // Resolve subject
  let subjectId = existingQuestion.subjectId
  if (data.subjectId) {
    const s = await prisma.subject.findUnique({ where: { id: data.subjectId } })
    if (!s) throw new NotFoundError('Subject not found')
    subjectId = s.id
  } else if (data.subject) {
    let s = await prisma.subject.findFirst({
      where: { name: { equals: data.subject, mode: 'insensitive' } }
    })
    if (!s) {
      s = await prisma.subject.create({
        data: { name: data.subject, code: data.subject.substring(0, 4).toUpperCase() }
      })
    }
    subjectId = s.id
  }

  // Resolve topic
  let topicId: string | null = existingQuestion.topicId
  if (data.topicId) {
    topicId = data.topicId
  } else if (data.topic) {
    let t = await prisma.topic.findFirst({
      where: { name: { equals: data.topic, mode: 'insensitive' }, subjectId }
    })
    if (!t) t = await prisma.topic.create({ data: { name: data.topic, subjectId } })
    topicId = t.id
  }

  // Resolve options — normalize to array format
  let optionsUpdate: any = undefined
  let correctAnswer = String(data.correctAnswer || existingQuestion.correctAnswer || '').toUpperCase()

  if (Array.isArray(data.options) && data.options.length >= 2) {
    optionsUpdate = data.options.map((opt: any) => ({
      label: String(opt.label),
      text: String(opt.text || ''),
      isCorrect: opt.isCorrect ?? (String(opt.label) === correctAnswer)
    }))
    const correctOpt = data.options.find((o: any) => o.isCorrect)
    if (correctOpt) correctAnswer = correctOpt.label
  } else if (data.optionA !== undefined) {
    optionsUpdate = [
      { label: 'A', text: String(data.optionA || ''), isCorrect: correctAnswer === 'A' },
      { label: 'B', text: String(data.optionB || ''), isCorrect: correctAnswer === 'B' },
      { label: 'C', text: String(data.optionC || ''), isCorrect: correctAnswer === 'C' },
      { label: 'D', text: String(data.optionD || ''), isCorrect: correctAnswer === 'D' },
    ]
  }

  const question = await prisma.question.update({
    where: { id },
    data: {
      subjectId,
      topicId,
      questionText: data.questionText || existingQuestion.questionText,
      ...(optionsUpdate && { options: optionsUpdate }),
      correctAnswer,
      explanation: data.explanation ?? existingQuestion.explanation,
      difficulty: data.difficulty || existingQuestion.difficulty,
      year: data.year ?? existingQuestion.year,
      examType: data.examType || existingQuestion.examType
    },
    include: {
      subject: { select: { id: true, name: true, code: true } },
      topic: { select: { id: true, name: true } }
    }
  })

  logger.info(`Question updated: ${question.id}`)

  const updatedOpts = question.options as any
  const getUpdatedOpt = (label: string) => {
    if (Array.isArray(updatedOpts)) return (updatedOpts as any[]).find((o: any) => o.label === label)?.text || ''
    return updatedOpts?.[label]?.text || ''
  }

  return {
    id: question.id,
    subjectId: question.subjectId,
    subjectName: question.subject.name,
    topicId: question.topicId,
    topicName: question.topic?.name,
    questionText: question.questionText,
    options: Array.isArray(updatedOpts) ? (updatedOpts as any[]) : [],
    optionA: getUpdatedOpt('A'),
    optionB: getUpdatedOpt('B'),
    optionC: getUpdatedOpt('C'),
    optionD: getUpdatedOpt('D'),
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
    difficulty: question.difficulty,
    year: question.year,
    examType: question.examType,
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
