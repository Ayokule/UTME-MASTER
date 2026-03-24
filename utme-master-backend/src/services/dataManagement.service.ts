// ==========================================
// DATA MANAGEMENT SERVICE
// ==========================================
// Handles: duplicate detection, bulk exam-question assignment,
// import tracking, audit logging, and data health checks.
// All functions EXTEND existing models — no duplicates.

import { prisma } from '../config/database'
import { NotFoundError, BadRequestError } from '../utils/errors'
import { logger } from '../utils/logger'

// ==========================================
// AUDIT LOG
// ==========================================

export async function writeAuditLog(params: {
  userId: string
  action: string
  entityType: string
  entityId?: string
  oldData?: any
  newData?: any
  ipAddress?: string
  userAgent?: string
}) {
  return prisma.auditLog.create({ data: params })
}

export async function getAuditLogs(query: {
  page?: number
  limit?: number
  userId?: string
  action?: string
  entityType?: string
}) {
  const page = query.page || 1
  const limit = Math.min(query.limit || 50, 100)
  const skip = (page - 1) * limit

  const where: any = {}
  if (query.userId) where.userId = query.userId
  if (query.action) where.action = { contains: query.action, mode: 'insensitive' }
  if (query.entityType) where.entityType = query.entityType

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true, email: true, role: true } }
      }
    }),
    prisma.auditLog.count({ where })
  ])

  return { logs, total, page, limit, totalPages: Math.ceil(total / limit) }
}

// ==========================================
// DUPLICATE DETECTION
// ==========================================

/**
 * Find questions with identical or near-identical text.
 * Groups duplicates by normalized question text.
 */
export async function findDuplicateQuestions() {
  const questions = await prisma.question.findMany({
    where: { isActive: true },
    select: {
      id: true,
      questionText: true,
      subjectId: true,
      examType: true,
      year: true,
      createdAt: true,
      subject: { select: { name: true } }
    },
    orderBy: { createdAt: 'asc' }
  })

  // Normalize: lowercase, strip HTML tags, collapse whitespace
  const normalize = (text: string) =>
    text.replace(/<[^>]+>/g, '').toLowerCase().replace(/\s+/g, ' ').trim()

  const groups = new Map<string, typeof questions>()

  for (const q of questions) {
    const key = normalize(q.questionText)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(q)
  }

  // Return only groups with 2+ questions (actual duplicates)
  const duplicates = Array.from(groups.entries())
    .filter(([, group]) => group.length > 1)
    .map(([normalizedText, group]) => ({
      normalizedText: normalizedText.slice(0, 100) + (normalizedText.length > 100 ? '...' : ''),
      count: group.length,
      questions: group
    }))

  return {
    totalDuplicateGroups: duplicates.length,
    totalDuplicateQuestions: duplicates.reduce((sum, g) => sum + g.count, 0),
    duplicates
  }
}

/**
 * Delete duplicate questions — keeps the oldest, removes the rest.
 * Returns count of deleted questions.
 */
export async function removeDuplicateQuestions(keepIds: string[], deleteIds: string[]) {
  if (deleteIds.length === 0) throw new BadRequestError('No IDs to delete')

  // Soft-delete: set isActive = false
  const result = await prisma.question.updateMany({
    where: { id: { in: deleteIds } },
    data: { isActive: false }
  })

  logger.info(`Removed ${result.count} duplicate questions`)
  return { removed: result.count }
}

// ==========================================
// BULK ASSIGN QUESTIONS TO EXAM
// ==========================================

/**
 * Assign multiple questions to an exam.
 * Skips questions already assigned. Returns summary.
 */
export async function bulkAssignQuestionsToExam(
  examId: string,
  questionIds: string[],
  userId: string
) {
  if (!questionIds.length) throw new BadRequestError('No question IDs provided')

  const exam = await prisma.exam.findUnique({ where: { id: examId } })
  if (!exam) throw new NotFoundError('Exam not found')

  // Find which questions are already assigned
  const existing = await prisma.examQuestion.findMany({
    where: { examId, questionId: { in: questionIds } },
    select: { questionId: true }
  })
  const alreadyAssigned = new Set(existing.map(e => e.questionId))

  // Validate all question IDs exist
  const validQuestions = await prisma.question.findMany({
    where: { id: { in: questionIds }, isActive: true },
    select: { id: true, options: true, questionText: true }
  })
  const validIds = new Set(validQuestions.map(q => q.id))

  const toAssign = questionIds.filter(id => validIds.has(id) && !alreadyAssigned.has(id))
  const skipped = questionIds.filter(id => alreadyAssigned.has(id))
  const notFound = questionIds.filter(id => !validIds.has(id))

  if (toAssign.length === 0) {
    return { assigned: 0, skipped: skipped.length, notFound: notFound.length, message: 'No new questions to assign' }
  }

  // Get current max orderNumber
  const maxOrder = await prisma.examQuestion.aggregate({
    where: { examId },
    _max: { orderNumber: true }
  })
  let nextOrder = (maxOrder._max.orderNumber ?? 0) + 1

  // Bulk create ExamQuestion records
  await prisma.examQuestion.createMany({
    data: toAssign.map(questionId => ({
      examId,
      questionId,
      orderNumber: nextOrder++,
      points: 1,
      questionData: {}
    })),
    skipDuplicates: true
  })

  // Update exam totalQuestions count
  const newCount = await prisma.examQuestion.count({ where: { examId } })
  await prisma.exam.update({
    where: { id: examId },
    data: { totalQuestions: newCount, updatedAt: new Date() }
  })

  // Write audit log
  await writeAuditLog({
    userId,
    action: 'BULK_ASSIGN_QUESTIONS',
    entityType: 'exam',
    entityId: examId,
    newData: { assignedCount: toAssign.length, questionIds: toAssign }
  })

  logger.info(`Assigned ${toAssign.length} questions to exam ${examId}`)

  return {
    assigned: toAssign.length,
    skipped: skipped.length,
    notFound: notFound.length,
    newTotalQuestions: newCount
  }
}

/**
 * Remove questions from an exam.
 */
export async function removeQuestionsFromExam(
  examId: string,
  questionIds: string[],
  userId: string
) {
  const exam = await prisma.exam.findUnique({ where: { id: examId } })
  if (!exam) throw new NotFoundError('Exam not found')

  const result = await prisma.examQuestion.deleteMany({
    where: { examId, questionId: { in: questionIds } }
  })

  const newCount = await prisma.examQuestion.count({ where: { examId } })
  await prisma.exam.update({
    where: { id: examId },
    data: { totalQuestions: newCount, updatedAt: new Date() }
  })

  await writeAuditLog({
    userId,
    action: 'REMOVE_QUESTIONS_FROM_EXAM',
    entityType: 'exam',
    entityId: examId,
    newData: { removedCount: result.count, questionIds }
  })

  return { removed: result.count, newTotalQuestions: newCount }
}

/**
 * Get questions currently assigned to an exam.
 */
export async function getExamQuestions(examId: string) {
  const exam = await prisma.exam.findUnique({ where: { id: examId } })
  if (!exam) throw new NotFoundError('Exam not found')

  const examQuestions = await prisma.examQuestion.findMany({
    where: { examId },
    orderBy: { orderNumber: 'asc' },
    include: {
      question: {
        include: {
          subject: { select: { name: true } },
          topic: { select: { name: true } }
        }
      }
    }
  })

  return examQuestions.map(eq => ({
    examQuestionId: eq.id,
    orderNumber: eq.orderNumber,
    points: eq.points,
    question: {
      id: eq.question.id,
      questionText: eq.question.questionText,
      difficulty: eq.question.difficulty,
      examType: eq.question.examType,
      subject: (eq.question as any).subject?.name,
      topic: (eq.question as any).topic?.name,
      year: eq.question.year
    }
  }))
}

// ==========================================
// IMPORT TRACKING
// ==========================================

export async function createImportJob(params: {
  fileName: string
  totalRows: number
  importedBy: string
}) {
  return prisma.questionImport.create({
    data: { ...params, status: 'PROCESSING' }
  })
}

export async function updateImportJob(
  id: string,
  data: { imported?: number; skipped?: number; failed?: number; status?: string; errorLog?: any }
) {
  return prisma.questionImport.update({ where: { id }, data })
}

export async function getImportHistory(userId?: string) {
  return prisma.questionImport.findMany({
    where: userId ? { importedBy: userId } : {},
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      importer: { select: { firstName: true, lastName: true, email: true } }
    }
  })
}

// ==========================================
// DATA HEALTH CHECK
// ==========================================

/**
 * Returns a summary of data quality issues in the system.
 */
export async function getDataHealthReport() {
  const [
    totalQuestions,
    inactiveQuestions,
    questionsWithoutSubject,
    examsWithNoQuestions,
    totalExams,
    duplicateResult,
    recentImports
  ] = await Promise.all([
    prisma.question.count({ where: { isActive: true } }),
    prisma.question.count({ where: { isActive: false } }),
    prisma.question.count({ where: { isActive: true, subjectId: '' } }),
    prisma.exam.findMany({
      where: { isActive: true },
      select: { id: true, title: true, _count: { select: { examQuestions: true } } }
    }).then(exams => exams.filter(e => e._count.examQuestions === 0)),
    prisma.exam.count({ where: { isActive: true } }),
    findDuplicateQuestions(),
    prisma.questionImport.findMany({ orderBy: { createdAt: 'desc' }, take: 5 })
  ])

  return {
    questions: {
      total: totalQuestions,
      inactive: inactiveQuestions,
      withoutSubject: questionsWithoutSubject,
      duplicateGroups: duplicateResult.totalDuplicateGroups,
      duplicateCount: duplicateResult.totalDuplicateQuestions
    },
    exams: {
      total: totalExams,
      emptyExams: examsWithNoQuestions.length,
      emptyExamList: examsWithNoQuestions.map(e => ({ id: e.id, title: e.title }))
    },
    recentImports: recentImports.map(i => ({
      id: i.id,
      fileName: i.fileName,
      status: i.status,
      imported: i.imported,
      failed: i.failed,
      createdAt: i.createdAt
    }))
  }
}
