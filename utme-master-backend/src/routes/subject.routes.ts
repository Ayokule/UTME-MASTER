// ==========================================
// SUBJECT ROUTES
// ==========================================
// This file defines API endpoints for subjects and topics
//
// Subjects are exam categories (Math, English, Physics, etc.)
// Topics are subtopics within subjects (Algebra, Geometry, etc.)

import { Router } from 'express'
import * as subjectController from '../controllers/subject.controller'
import { authenticate, authorizeRole } from '../middleware/auth.middleware'
import { validateBody, validateParams } from '../middleware/validation.middleware'
import { 
  createSubjectSchema, 
  createTopicSchema, 
  subjectIdSchema 
} from '../validation/subject.validation'

// Create router
const router = Router()

// ==========================================
// PUBLIC ROUTES (No authentication required)
// ==========================================

// GET ALL SUBJECTS
// GET /api/subjects
//
// Anyone can view subjects (students need this to select subjects)
//
// Response:
// {
//   success: true,
//   data: {
//     subjects: [
//       { id: "...", name: "Mathematics", code: "MTH", examType: "JAMB" },
//       { id: "...", name: "English Language", code: "ENG", examType: "JAMB" },
//       ...
//     ]
//   }
// }

router.get(
  '/',
  subjectController.getAllSubjects
)

// GET SUBJECT BY ID
// GET /api/subjects/:id
//
// Get single subject with all its topics
//
// Response includes:
// - Subject details
// - All topics in the subject
// - Question count

router.get(
  '/:id',
  validateParams(subjectIdSchema),
  subjectController.getSubjectById
)

router.get(
  '/:id/topics',
  validateParams(subjectIdSchema),
  subjectController.getTopicsBySubject
)

// GET TOPICS BY SUBJECT NAME
// GET /api/subjects/by-name/:name/topics
//
// Get all topics for a subject by name (for frontend convenience)
// Used in question form when subject name is selected

router.get(
  '/by-name/:name/topics',
  subjectController.getTopicsBySubjectName
)

// GET SUBJECT STATISTICS
// GET /api/subjects/:id/statistics
//
// Get statistics for a subject
// - Total questions
// - Question breakdown by difficulty

router.get(
  '/:id/statistics',
  validateParams(subjectIdSchema),
  subjectController.getSubjectStatistics
)

// ==========================================
// PROTECTED ROUTES (Admin only)
// ==========================================

// CREATE SUBJECT
// POST /api/subjects
//
// Only ADMIN can create subjects
//
// Request body:
// {
//   name: "Physics",
//   code: "PHY",
//   examType: "JAMB"
// }

router.post(
  '/',
  authenticate,                    // Must be logged in
  authorizeRole(['ADMIN']),       // Must be ADMIN
  validateBody(createSubjectSchema),
  subjectController.createSubject
)

// CREATE TOPIC
// POST /api/subjects/:id/topics
//
// Only ADMIN can create topics
//
// Request body:
// {
//   name: "Mechanics",
//   orderNumber: 1
// }

router.post(
  '/:id/topics',
  authenticate,                    // Must be logged in
  authorizeRole(['ADMIN']),       // Must be ADMIN
  validateParams(subjectIdSchema),
  validateBody(createTopicSchema),
  subjectController.createTopic
)

// ==========================================
// EXPORT ROUTER
// ==========================================
// This router is imported in server.ts
// and mounted at /api/subjects
//
// Final endpoints:
// GET    /api/subjects              (get all subjects)
// GET    /api/subjects/:id          (get one subject)
// GET    /api/subjects/:id/topics   (get topics for subject)
// GET    /api/subjects/:id/statistics (get subject stats)
// POST   /api/subjects              (create subject - admin)
// POST   /api/subjects/:id/topics   (create topic - admin)

export default router

// ==========================================
// HOW TO USE THESE ENDPOINTS
// ==========================================
//
// 1. GET ALL SUBJECTS (for dropdown in question form):
//    fetch('/api/subjects')
//      .then(res => res.json())
//      .then(data => {
//        const subjects = data.data.subjects
//        // Populate dropdown
//      })
//
// 2. GET TOPICS WHEN SUBJECT IS SELECTED:
//    const subjectId = '123-456'
//    fetch(`/api/subjects/${subjectId}/topics`)
//      .then(res => res.json())
//      .then(data => {
//        const topics = data.data.topics
//        // Populate topic dropdown
//      })
//
// 3. CREATE SUBJECT (admin only, need token):
//    fetch('/api/subjects', {
//      method: 'POST',
//      headers: {
//        'Content-Type': 'application/json',
//        'Authorization': 'Bearer <token>'
//      },
//      body: JSON.stringify({
//        name: 'Computer Science',
//        code: 'CSC',
//        examType: 'JAMB'
//      })
//    })
