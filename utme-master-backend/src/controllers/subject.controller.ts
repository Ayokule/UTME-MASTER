// ==========================================
// SUBJECT CONTROLLER
// ==========================================
// This file handles HTTP requests for subjects and topics
//
// What this controller does:
// - Get all subjects (for dropdowns)
// - Get single subject with topics
// - Get topics for a subject
// - Create subject (admin only)
// - Create topic (admin only)

import { Request, Response } from 'express'
import * as subjectService from '../services/subject.service'
import { asyncHandler } from '../middleware/error.middleware'

// ==========================================
// GET ALL SUBJECTS
// ==========================================
// GET /api/subjects
//
// Anyone can view subjects (needed for exam selection)
//
// Response:
// {
//   success: true,
//   data: {
//     subjects: [
//       { id: "...", name: "Mathematics", code: "MTH", examType: "JAMB" },
//       ...
//     ]
//   }
// }

export const getAllSubjects = asyncHandler(async (req: Request, res: Response) => {
  // Get all subjects from service
  const subjects = await subjectService.getAllSubjects()
  
  // Send response
  res.status(200).json({
    success: true,
    data: { subjects }
  })
})

// ==========================================
// GET SUBJECT BY ID
// ==========================================
// GET /api/subjects/:id
//
// Get single subject with all its topics
//
// URL parameter:
// - id: Subject UUID
//
// Response:
// {
//   success: true,
//   data: {
//     subject: {
//       id: "...",
//       name: "Mathematics",
//       code: "MTH",
//       examType: "JAMB",
//       topics: [...],
//       questionCount: 150
//     }
//   }
// }

export const getSubjectById = asyncHandler(async (req: Request, res: Response) => {
  // Extract subject ID from URL
  const { id } = req.params
  
  // Get subject from service
  const subject = await subjectService.getSubjectById(id)
  
  // Send response
  res.status(200).json({
    success: true,
    data: { subject }
  })
})

// ==========================================
// GET TOPICS FOR SUBJECT
// ==========================================
// GET /api/subjects/:id/topics
//
// Get all topics for a specific subject
// Used in question form when subject is selected
//
// URL parameter:
// - id: Subject UUID
//
// Response:
// {
//   success: true,
//   data: {
//     topics: [
//       { id: "...", name: "Algebra", orderNumber: 1 },
//       { id: "...", name: "Geometry", orderNumber: 2 },
//       ...
//     ]
//   }
// }

export const getTopicsBySubject = asyncHandler(async (req: Request, res: Response) => {
  // Extract subject ID from URL
  const { id } = req.params
  
  // Get topics from service
  const topics = await subjectService.getTopicsBySubject(id)
  
  // Send response
  res.status(200).json({
    success: true,
    data: { topics }
  })
})

// ==========================================
// GET TOPICS BY SUBJECT NAME
// ==========================================
// GET /api/subjects/by-name/:name/topics
//
// Get all topics for a specific subject by name
// Used in question form when subject name is selected
//
// URL parameter:
// - name: Subject name (e.g., "Mathematics")
//
// Response:
// {
//   success: true,
//   data: {
//     topics: [
//       { id: "...", name: "Algebra", orderNumber: 1 },
//       { id: "...", name: "Geometry", orderNumber: 2 },
//       ...
//     ]
//   }
// }

export const getTopicsBySubjectName = asyncHandler(async (req: Request, res: Response) => {
  // Extract subject name from URL
  const { name } = req.params
  
  // Get topics from service
  const topics = await subjectService.getTopicsBySubjectName(name)
  
  // Send response
  res.status(200).json({
    success: true,
    data: { topics }
  })
})

// ==========================================
// CREATE SUBJECT
// ==========================================
// POST /api/subjects
// Requires authentication (admin only)
//
// Request body:
// {
//   name: string (e.g., "Mathematics"),
//   code: string (e.g., "MTH"),
//   examType: "JAMB"|"WAEC"|"NECO"
// }
//
// Response:
// {
//   success: true,
//   message: "Subject created successfully",
//   data: { subject: {...} }
// }

export const createSubject = asyncHandler(async (req: Request, res: Response) => {
  // Extract data from request body
  const data = req.body
  
  // Create subject via service
  const subject = await subjectService.createSubject(data)
  
  // Send success response
  res.status(201).json({
    success: true,
    message: 'Subject created successfully',
    data: { subject }
  })
})

// ==========================================
// CREATE TOPIC
// ==========================================
// POST /api/subjects/:id/topics
// Requires authentication (admin only)
//
// URL parameter:
// - id: Subject UUID
//
// Request body:
// {
//   name: string (e.g., "Algebra"),
//   orderNumber: number (e.g., 1)
// }
//
// Response:
// {
//   success: true,
//   message: "Topic created successfully",
//   data: { topic: {...} }
// }

export const createTopic = asyncHandler(async (req: Request, res: Response) => {
  // Extract subject ID from URL
  const { id } = req.params
  
  // Extract data from body
  const { name, description } = req.body
  
  // Create topic via service
  const topicData = {
    subjectId: id,
    name,
    description
  } as {
    subjectId: string
    name: string
    description?: string
  }
  
  const topic = await subjectService.createTopic(topicData)
  
  // Send success response
  res.status(201).json({
    success: true,
    message: 'Topic created successfully',
    data: { topic }
  })
})

// ==========================================
// GET SUBJECT STATISTICS
// ==========================================
// GET /api/subjects/:id/statistics
//
// Get statistics for a subject
//
// Response:
// {
//   success: true,
//   data: {
//     statistics: {
//       totalQuestions: 150,
//       byDifficulty: { easy: 50, medium: 60, hard: 40 }
//     }
//   }
// }

export const getSubjectStatistics = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  
  const statistics = await subjectService.getSubjectStatistics(id)
  
  res.status(200).json({
    success: true,
    data: { statistics }
  })
})
