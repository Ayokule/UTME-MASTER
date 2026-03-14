// ==========================================
// EXPORT ROUTES
// ==========================================
// This file defines API endpoints for exporting questions
//
// What routes do:
// - Connect export URLs to controller functions
// - Add authentication middleware (admin/teacher only)
// - Handle question export in various formats

import { Router } from 'express'
import * as exportController from '../controllers/export.controller'
import { authenticate } from '../middleware/auth.middleware'

// Create router
const router = Router()

// ==========================================
// ALL ROUTES REQUIRE AUTHENTICATION
// ==========================================
// Only admins and teachers can export questions

// EXPORT QUESTIONS
// GET /api/export/questions
//
// Export questions based on filters
//
// Query parameters:
// - format: 'csv' | 'excel' (default: excel)
// - subjects: comma-separated subject codes
// - difficulty: comma-separated difficulty levels
// - examType: comma-separated exam types
// - year: specific year
// - search: search term for question text
// - limit: maximum number of questions (default: 1000)
//
// Response: File download (Excel or CSV)
//
// Middleware chain:
// 1. authenticate - Verify user is logged in as admin/teacher
// 2. exportController.exportQuestions - Generate and send file

router.get(
  '/questions',
  authenticate,                           // Must be logged in
  exportController.exportQuestions        // Handle export
)

// GET EXPORT STATISTICS
// GET /api/export/statistics
//
// Returns statistics about available questions for export
//
// Response includes:
// - Total questions count
// - Questions by subject
// - Questions by difficulty
// - Questions by exam type
// - Questions by year
//
// Middleware chain:
// 1. authenticate - Verify user is logged in as admin/teacher
// 2. exportController.getExportStatistics - Get statistics

router.get(
  '/statistics',
  authenticate,                                // Must be logged in
  exportController.getExportStatistics         // Handle request
)

// ==========================================
// EXPORT ROUTER
// ==========================================
// This router is imported in server.ts
// and mounted at /api/export
//
// So these routes become:
// GET /api/export/questions        (export questions)
// GET /api/export/statistics       (export statistics)

export default router

// ==========================================
// HOW TO USE THESE ENDPOINTS
// ==========================================
//
// You need a valid JWT token from login to test these endpoints
//
// 1. EXPORT ALL QUESTIONS AS EXCEL:
//    curl -H "Authorization: Bearer <token>" \
//         "http://localhost:3000/api/export/questions" \
//         --output questions.xlsx
//
// 2. EXPORT MATH QUESTIONS AS CSV:
//    curl -H "Authorization: Bearer <token>" \
//         "http://localhost:3000/api/export/questions?format=csv&subjects=MTH" \
//         --output math_questions.csv
//
// 3. EXPORT EASY JAMB QUESTIONS:
//    curl -H "Authorization: Bearer <token>" \
//         "http://localhost:3000/api/export/questions?difficulty=EASY&examType=JAMB" \
//         --output easy_jamb_questions.xlsx
//
// 4. GET EXPORT STATISTICS:
//    curl -H "Authorization: Bearer <token>" \
//         http://localhost:3000/api/export/statistics

// ==========================================
// PERMISSION MATRIX
// ==========================================
//
// Endpoint                          | Student | Teacher | Admin
// ----------------------------------|---------|---------|-------
// GET /api/export/questions         |   ❌    |   ✅    |   ✅
// GET /api/export/statistics        |   ❌    |   ✅    |   ✅
//
// Note: Only teachers and admins can export questions