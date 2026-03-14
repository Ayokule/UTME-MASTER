// ==========================================
// QUESTION ROUTES
// ==========================================
// This file defines API endpoints for question management
//
// What routes do:
// - Connect URLs to controller functions
// - Define HTTP methods (GET, POST, PUT, DELETE)
// - Add middleware (authentication, validation)
// - Control who can access each endpoint

import { Router } from 'express'
import * as questionController from '../controllers/question.controller'
import { authenticate, authorizeRole } from '../middleware/auth.middleware'
import { validateBody, validateQuery, validateParams } from '../middleware/validation.middleware'
import {
  createQuestionSchema,
  updateQuestionSchema,
  queryQuestionsSchema,
  bulkDeleteSchema,
  questionIdSchema
} from '../validation/question.validation'

// Create router
const router = Router()

// ==========================================
// PUBLIC ROUTES (No authentication required)
// ==========================================

// GET ALL QUESTIONS
// GET /api/questions?page=1&limit=20&search=...
//
// Anyone can view questions (students need this for exams)
//
// Query parameters:
// - page: number (default: 1)
// - limit: number (default: 20, max: 100)
// - search: string (search in question text)
// - subjectId: UUID (filter by subject)
// - topicId: UUID (filter by topic)
// - difficulty: EASY|MEDIUM|HARD
// - year: number (e.g., 2024)
// - examType: JAMB|WAEC|NECO
// - sortBy: createdAt|difficulty|year
// - sortOrder: asc|desc
//
// Middleware chain:
// 1. validateQuery - Validate query parameters
// 2. questionController.getQuestions - Fetch and return questions

router.get(
  '/',
  validateQuery(queryQuestionsSchema),  // Validate query params
  questionController.getQuestions        // Handle request
)

// GET SINGLE QUESTION
// GET /api/questions/:id
//
// Anyone can view a single question
//
// URL parameter:
// - id: Question UUID
//
// Middleware chain:
// 1. validateParams - Validate :id parameter
// 2. questionController.getQuestionById - Fetch and return question

router.get(
  '/:id',
  validateParams(questionIdSchema),    // Validate :id param
  questionController.getQuestionById    // Handle request
)

// ==========================================
// PROTECTED ROUTES (Authentication required)
// ==========================================
// These routes require user to be logged in
// AND have ADMIN or TEACHER role

// CREATE NEW QUESTION
// POST /api/questions
//
// Only ADMIN or TEACHER can create questions
//
// Request body:
// {
//   subjectId: string (UUID),
//   topicId?: string (UUID, optional),
//   questionText: string,
//   optionA: string,
//   optionB: string,
//   optionC: string,
//   optionD: string,
//   correctAnswer: 'A'|'B'|'C'|'D',
//   explanation?: string (optional),
//   difficulty: 'EASY'|'MEDIUM'|'HARD',
//   year?: number (optional),
//   examType: 'JAMB'|'WAEC'|'NECO',
//   imageUrl?: string (optional)
// }
//
// Middleware chain:
// 1. authenticate - Check if user is logged in (verify JWT token)
// 2. authorizeRole - Check if user is ADMIN or TEACHER
// 3. validateBody - Validate request body
// 4. questionController.createQuestion - Create question

router.post(
  '/',
  authenticate,                                      // Must be logged in
  authorizeRole(['ADMIN', 'TEACHER']),              // Must be ADMIN or TEACHER
  validateBody(createQuestionSchema),                // Validate body
  questionController.createQuestion                  // Handle request
)

// UPDATE QUESTION
// PUT /api/questions/:id
//
// Only ADMIN or TEACHER can update questions
//
// URL parameter:
// - id: Question UUID
//
// Request body: Same as create (all fields can be updated)
//
// Middleware chain:
// 1. authenticate - Check if user is logged in
// 2. authorizeRole - Check if user is ADMIN or TEACHER
// 3. validateParams - Validate :id parameter
// 4. validateBody - Validate request body
// 5. questionController.updateQuestion - Update question

router.put(
  '/:id',
  authenticate,                                      // Must be logged in
  authorizeRole(['ADMIN', 'TEACHER']),              // Must be ADMIN or TEACHER
  validateParams(questionIdSchema),                  // Validate :id
  validateBody(updateQuestionSchema),                // Validate body
  questionController.updateQuestion                  // Handle request
)

// DELETE QUESTION
// DELETE /api/questions/:id
//
// Only ADMIN or TEACHER can delete questions
//
// URL parameter:
// - id: Question UUID
//
// Note: This is a soft delete (marks question as inactive)
// Question remains in database for history/analytics
//
// Middleware chain:
// 1. authenticate - Check if user is logged in
// 2. authorizeRole - Check if user is ADMIN or TEACHER
// 3. validateParams - Validate :id parameter
// 4. questionController.deleteQuestion - Delete question

router.delete(
  '/:id',
  authenticate,                                      // Must be logged in
  authorizeRole(['ADMIN', 'TEACHER']),              // Must be ADMIN or TEACHER
  validateParams(questionIdSchema),                  // Validate :id
  questionController.deleteQuestion                  // Handle request
)

// BULK DELETE QUESTIONS
// DELETE /api/questions/bulk
//
// Only ADMIN or TEACHER can bulk delete
//
// Request body:
// {
//   ids: string[] (array of question UUIDs, max 100)
// }
//
// Note: This is also soft delete
//
// Middleware chain:
// 1. authenticate - Check if user is logged in
// 2. authorizeRole - Check if user is ADMIN or TEACHER
// 3. validateBody - Validate request body
// 4. questionController.bulkDeleteQuestions - Delete questions

router.delete(
  '/bulk',
  authenticate,                                      // Must be logged in
  authorizeRole(['ADMIN', 'TEACHER']),              // Must be ADMIN or TEACHER
  validateBody(bulkDeleteSchema),                    // Validate body
  questionController.bulkDeleteQuestions             // Handle request
)

// ==========================================
// EXPORT ROUTER
// ==========================================
// This router is imported in server.ts
// and mounted at /api/questions
//
// So these routes become:
// GET    /api/questions           (get all)
// GET    /api/questions/:id       (get one)
// POST   /api/questions           (create)
// PUT    /api/questions/:id       (update)
// DELETE /api/questions/:id       (delete)
// DELETE /api/questions/bulk      (bulk delete)

export default router

// ==========================================
// HOW TO TEST THESE ENDPOINTS
// ==========================================
//
// You can use curl, Postman, or your frontend to test
//
// 1. GET ALL QUESTIONS:
//    curl http://localhost:3000/api/questions
//
// 2. GET WITH FILTERS:
//    curl "http://localhost:3000/api/questions?page=1&limit=10&search=math&difficulty=EASY"
//
// 3. GET SINGLE QUESTION:
//    curl http://localhost:3000/api/questions/123-456-789
//
// 4. CREATE QUESTION (need token):
//    curl -X POST http://localhost:3000/api/questions \
//      -H "Authorization: Bearer <token>" \
//      -H "Content-Type: application/json" \
//      -d '{
//        "subjectId": "abc-123",
//        "questionText": "What is 2+2?",
//        "optionA": "3",
//        "optionB": "4",
//        "optionC": "5",
//        "optionD": "6",
//        "correctAnswer": "B",
//        "difficulty": "EASY",
//        "examType": "JAMB"
//      }'
//
// 5. UPDATE QUESTION (need token):
//    curl -X PUT http://localhost:3000/api/questions/123-456-789 \
//      -H "Authorization: Bearer <token>" \
//      -H "Content-Type: application/json" \
//      -d '{ ...updated data... }'
//
// 6. DELETE QUESTION (need token):
//    curl -X DELETE http://localhost:3000/api/questions/123-456-789 \
//      -H "Authorization: Bearer <token>"
//
// 7. BULK DELETE (need token):
//    curl -X DELETE http://localhost:3000/api/questions/bulk \
//      -H "Authorization: Bearer <token>" \
//      -H "Content-Type: application/json" \
//      -d '{
//        "ids": ["id1", "id2", "id3"]
//      }'

// ==========================================
// PERMISSION MATRIX
// ==========================================
//
// Endpoint                    | Public | Student | Teacher | Admin
// ----------------------------|--------|---------|---------|-------
// GET /api/questions          |   ✅   |    ✅   |   ✅    |   ✅
// GET /api/questions/:id      |   ✅   |    ✅   |   ✅    |   ✅
// POST /api/questions         |   ❌   |    ❌   |   ✅    |   ✅
// PUT /api/questions/:id      |   ❌   |    ❌   |   ✅    |   ✅
// DELETE /api/questions/:id   |   ❌   |    ❌   |   ✅    |   ✅
// DELETE /api/questions/bulk  |   ❌   |    ❌   |   ✅    |   ✅
