// ==========================================
// SUBJECT SERVICE
// ==========================================
// This file handles business logic for subjects and topics
//
// What this service does:
// - Get all subjects
// - Get single subject with its topics
// - Get topics for a specific subject
// - Create new subject (admin only)
// - Create new topic (admin only)

import { prisma } from '../config/database'
import { NotFoundError, BadRequestError } from '../utils/errors'
import { logger } from '../utils/logger'

// ==========================================
// GET ALL SUBJECTS
// ==========================================
// Fetch all active subjects
// Used for dropdowns in question form

export async function getAllSubjects() {
  // Get all active subjects
  const subjects = await prisma.subject.findMany({
    where: {
      isActive: true  // Only get active subjects
    },
    orderBy: {
      name: 'asc'  // Sort alphabetically
    },
    select: {
      id: true,
      name: true,
      code: true,
      description: true
    }
  })
  
  logger.debug(`Fetched ${subjects.length} subjects`)
  
  return subjects
}

// ==========================================
// GET SUBJECT BY ID
// ==========================================
// Get single subject with all its topics

export async function getSubjectById(id: string) {
  // Find subject with its topics
  const subject = await prisma.subject.findUnique({
    where: { id },
    include: {
      // Include topics
      topics: {
        orderBy: {
          name: 'asc'  // Sort by name since orderNumber doesn't exist
        },
        select: {
          id: true,
          name: true
        }
      },
      // Count questions in this subject
      _count: {
        select: {
          questions: true
        }
      }
    }
  })
  
  // Not found?
  if (!subject) {
    throw new NotFoundError('Subject not found')
  }
  
  // Format response
  return {
    id: subject.id,
    name: subject.name,
    code: subject.code,
    description: subject.description,
    topics: subject.topics,
    questionCount: subject._count.questions
  }
}

// ==========================================
// GET TOPICS FOR SUBJECT
// ==========================================
// Get all topics for a specific subject
// Used in question form when subject is selected

export async function getTopicsBySubject(subjectId: string) {
  // First check if subject exists
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId }
  })
  
  if (!subject) {
    throw new NotFoundError('Subject not found')
  }
  
  // Get topics
  const topics = await prisma.topic.findMany({
    where: {
      subjectId: subjectId
    },
    orderBy: {
      name: 'asc'
    },
    select: {
      id: true,
      name: true
    }
  })
  
  logger.debug(`Fetched ${topics.length} topics for subject ${subject.name}`)
  
  return topics
}
// ==========================================
// GET TOPICS BY SUBJECT NAME
// ==========================================
// Get all topics for a specific subject by name
// Used in question form when subject name is selected

export async function getTopicsBySubjectName(subjectName: string) {
  // First find the subject by name
  const subject = await prisma.subject.findFirst({
    where: {
      name: {
        equals: subjectName,
        mode: 'insensitive' // Case insensitive search
      },
      isActive: true
    }
  })

  if (!subject) {
    // If subject doesn't exist, return empty array instead of throwing error
    // This allows for custom subjects that don't exist in database yet
    logger.debug(`Subject not found: ${subjectName}`)
    return []
  }

  // Get topics for this subject
  const topics = await prisma.topic.findMany({
    where: {
      subjectId: subject.id,
      isActive: true
    },
    orderBy: {
      name: 'asc'
    },
    select: {
      id: true,
      name: true
    }
  })

  logger.debug(`Fetched ${topics.length} topics for subject ${subject.name}`)

  return topics
}

// ==========================================
// CREATE SUBJECT
// ==========================================
// Create a new subject (admin only)

export async function createSubject(data: {
  name: string
  code: string
  description?: string
}) {
  // Check if code already exists
  const existing = await prisma.subject.findUnique({
    where: { code: data.code }
  })
  
  if (existing) {
    throw new BadRequestError('Subject code already exists')
  }
  
  // Create subject
  const subject = await prisma.subject.create({
    data: {
      name: data.name,
      code: data.code,
      description: data.description,
      isActive: true
    }
  })
  
  logger.info(`Subject created: ${subject.name} (${subject.code})`)
  
  return {
    id: subject.id,
    name: subject.name,
    code: subject.code,
    description: subject.description
  }
}

// ==========================================
// CREATE TOPIC
// ==========================================
// Create a new topic for a subject (admin only)

export async function createTopic(data: {
  subjectId: string
  name: string
  description?: string
}) {
  // Check if subject exists
  const subject = await prisma.subject.findUnique({
    where: { id: data.subjectId }
  })
  
  if (!subject) {
    throw new NotFoundError('Subject not found')
  }
  
  // Create topic
  const topic = await prisma.topic.create({
    data: {
      subjectId: data.subjectId,
      name: data.name,
      description: data.description || null,
      isActive: true
    }
  })
  
  logger.info(`Topic created: ${topic.name} (${subject.name})`)
  
  return {
    id: topic.id,
    name: topic.name,
    description: topic.description,
    subjectId: topic.subjectId
  }
}

// ==========================================
// GET SUBJECT STATISTICS
// ==========================================
// Get statistics for a subject (question counts, etc.)

export async function getSubjectStatistics(subjectId: string) {
  // Check subject exists
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId }
  })
  
  if (!subject) {
    throw new NotFoundError('Subject not found')
  }
  
  // Count questions by difficulty
  const easyCount = await prisma.question.count({
    where: {
      subjectId: subjectId,
      difficulty: 'EASY',
      isActive: true
    }
  })
  
  const mediumCount = await prisma.question.count({
    where: {
      subjectId: subjectId,
      difficulty: 'MEDIUM',
      isActive: true
    }
  })
  
  const hardCount = await prisma.question.count({
    where: {
      subjectId: subjectId,
      difficulty: 'HARD',
      isActive: true
    }
  })
  
  const totalQuestions = easyCount + mediumCount + hardCount
  
  return {
    subjectId: subject.id,
    subjectName: subject.name,
    totalQuestions,
    byDifficulty: {
      easy: easyCount,
      medium: mediumCount,
      hard: hardCount
    }
  }
}
