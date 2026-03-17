// ==========================================
// QUESTION CONTROLLER
// ==========================================
// This file handles HTTP requests for question management
//
// What controllers do:
// - Receive HTTP requests
// - Extract data from request (body, params, query)
// - Call service layer (business logic)
// - Send HTTP response back to client
//
// Controllers are the bridge between HTTP and business logic

import { Request, Response } from 'express'
import * as questionService from '../services/question.service'
import { asyncHandler } from '../middleware/error.middleware'
import { logger } from '../utils/logger'

// ==========================================
// GET ALL QUESTIONS
// ==========================================
// GET /api/questions?page=1&limit=20&search=...
//
// Query parameters:
// - page: number (default: 1)
// - limit: number (default: 20)
// - search: string (optional)
// - subjectId: UUID (optional)
// - topicId: UUID (optional)
// - difficulty: EASY|MEDIUM|HARD (optional)
// - year: number (optional)
// - examType: JAMB|WAEC|NECO (optional)
// - sortBy: createdAt|difficulty|year (default: createdAt)
// - sortOrder: asc|desc (default: desc)
//
// Response:
// {
//   success: true,
//   data: {
//     questions: [...],
//     pagination: { page, limit, total, totalPages }
//   }
// }

export const getQuestions = asyncHandler(async (req: Request, res: Response) => {
  // Extract query parameters
  // req.query contains URL parameters: ?page=1&limit=20
  const query = req.query
  
  // Call service to get questions
  // Service does all the work (database query, filtering, pagination)
  const result = await questionService.getQuestions(query as any)
  
  // Send success response
  res.status(200).json({
    success: true,
    data: result
  })
})

// ==========================================
// GET SINGLE QUESTION
// ==========================================
// GET /api/questions/:id
//
// URL parameter:
// - id: Question UUID
//
// Response:
// {
//   success: true,
//   data: { question: {...} }
// }

export const getQuestionById = asyncHandler(async (req: Request, res: Response) => {
  // Extract question ID from URL
  // Example: /api/questions/123-456-789 → id = '123-456-789'
  const { id } = req.params
  
  // Get question from service
  const question = await questionService.getQuestionById(id)
  
  // Send response
  res.status(200).json({
    success: true,
    data: { question }
  })
})

// ==========================================
// CREATE NEW QUESTION
// ==========================================
// POST /api/questions
// Requires authentication (admin or teacher)
//
// Request body:
// {
//   subjectId: string (UUID),
//   topicId?: string (UUID),
//   questionText: string,
//   optionA: string,
//   optionB: string,
//   optionC: string,
//   optionD: string,
//   correctAnswer: 'A'|'B'|'C'|'D',
//   explanation?: string,
//   difficulty: 'EASY'|'MEDIUM'|'HARD',
//   year?: number,
//   examType: 'JAMB'|'WAEC'|'NECO',
//   imageUrl?: string
// }
//
// Response:
// {
//   success: true,
//   message: 'Question created successfully',
//   data: { question: {...} }
// }

export const createQuestion = asyncHandler(async (req: Request, res: Response) => {
  // Extract data from request body
  // req.body contains JSON data sent from frontend
  const data = req.body
  
  // Create question via service (pass user ID for audit tracking)
  const question = await questionService.createQuestion(data, req.user!.id)
  
  // Send success response
  // Status 201 = Created (new resource created)
  res.status(201).json({
    success: true,
    message: 'Question created successfully',
    data: { question }
  })
})

// ==========================================
// UPDATE QUESTION
// ==========================================
// PUT /api/questions/:id
// Requires authentication (admin or teacher)
//
// URL parameter:
// - id: Question UUID
//
// Request body: Same as create (all fields can be updated)
//
// Response:
// {
//   success: true,
//   message: 'Question updated successfully',
//   data: { question: {...} }
// }

export const updateQuestion = asyncHandler(async (req: Request, res: Response) => {
  // Get question ID from URL
  const { id } = req.params
  
  // Get update data from body
  const data = req.body
  
  // Update question via service
  const question = await questionService.updateQuestion(id, data)
  
  // Send success response
  res.status(200).json({
    success: true,
    message: 'Question updated successfully',
    data: { question }
  })
})

// ==========================================
// DELETE QUESTION
// ==========================================
// DELETE /api/questions/:id
// Requires authentication (admin or teacher)
//
// URL parameter:
// - id: Question UUID
//
// Response:
// {
//   success: true,
//   message: 'Question deleted successfully'
// }

export const deleteQuestion = asyncHandler(async (req: Request, res: Response) => {
  // Get question ID from URL
  const { id } = req.params
  
  // Delete question via service
  // Note: This is soft delete (mark as inactive)
  await questionService.deleteQuestion(id)
  
  // Send success response
  res.status(200).json({
    success: true,
    message: 'Question deleted successfully'
  })
})

// ==========================================
// BULK DELETE QUESTIONS
// ==========================================
// DELETE /api/questions/bulk
// Requires authentication (admin or teacher)
//
// Request body:
// {
//   ids: string[] (array of question UUIDs)
// }
//
// Response:
// {
//   success: true,
//   message: 'X question(s) deleted successfully',
//   data: { deletedCount: number }
// }

export const bulkDeleteQuestions = asyncHandler(async (req: Request, res: Response) => {
  // Get array of question IDs from body
  const { ids } = req.body
  
  // Bulk delete via service
  const result = await questionService.bulkDeleteQuestions({ ids })
  
  // Send success response
  res.status(200).json({
    success: true,
    message: result.message,
    data: {
      deletedCount: result.deletedCount
    }
  })
})

// ==========================================
// HOW CONTROLLERS WORK
// ==========================================
//
// Request flow example (Create Question):
//
// 1. Client sends HTTP request:
//    POST http://localhost:3000/api/questions
//    Headers: { Authorization: "Bearer <token>" }
//    Body: {
//      subjectId: "123-456",
//      questionText: "What is 2+2?",
//      optionA: "3", optionB: "4", optionC: "5", optionD: "6",
//      correctAnswer: "B",
//      difficulty: "EASY",
//      examType: "JAMB"
//    }
//
// 2. Express receives request
//
// 3. Middleware runs:
//    - authenticate: Verifies JWT token
//    - authorizeRole: Checks user is ADMIN or TEACHER
//    - validateBody: Validates request data (Zod)
//
// 4. Route handler calls controller:
//    router.post('/', authenticate, authorizeRole(['ADMIN', 'TEACHER']), 
//                validateBody(createQuestionSchema), createQuestion)
//
// 5. Controller extracts data from req.body:
//    const data = req.body
//
// 6. Controller calls service:
//    const question = await questionService.createQuestion(data)
//
// 7. Service does business logic:
//    - Validate subject exists
//    - Create question in database
//    - Return formatted question
//
// 8. Controller sends HTTP response:
//    res.status(201).json({
//      success: true,
//      message: 'Question created successfully',
//      data: { question }
//    })
//
// 9. Client receives response:
//    Status: 201 Created
//    Body: {
//      success: true,
//      message: "Question created successfully",
//      data: {
//        question: {
//          id: "abc-def",
//          subjectName: "Mathematics",
//          questionText: "What is 2+2?",
//          ...
//        }
//      }
//    }
