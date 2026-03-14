// ==========================================
// DASHBOARD ROUTES
// ==========================================
// This file defines API endpoints for student dashboard analytics
//
// What routes do:
// - Connect dashboard URLs to controller functions
// - Add authentication middleware (all routes require login)
// - Handle student performance analytics
// - Provide study recommendations

import { Router } from 'express'
import * as dashboardController from '../controllers/dashboard.controller'
import { authenticate } from '../middleware/auth.middleware'

// Create router
const router = Router()

// ==========================================
// ALL ROUTES REQUIRE AUTHENTICATION
// ==========================================
// Students must be logged in to access dashboard data

// GET STUDENT DASHBOARD
// GET /api/student/dashboard
//
// Returns comprehensive dashboard analytics for logged-in student
//
// Response includes:
// - Student info (name, streak, license tier)
// - Performance stats (total tests, average score, best score, study hours)
// - Subject performance chart data
// - Progress over time chart data
// - Recent exam activity
// - Strengths and weaknesses analysis
// - Motivational quote of the day
//
// Middleware chain:
// 1. authenticate - Verify user is logged in
// 2. dashboardController.getDashboard - Generate dashboard data

router.get(
  '/dashboard',
  authenticate,                           // Must be logged in
  dashboardController.getDashboard        // Handle request
)

// GET SUBJECT ANALYTICS (Premium Feature)
// GET /api/student/analytics/subject/:subject
//
// Returns detailed analytics for a specific subject
// Only available for PREMIUM and TRIAL users
//
// URL parameter:
// - subject: Subject name (e.g., "Mathematics", "English")
//
// Response includes:
// - Topic-wise performance breakdown
// - Question accuracy by topic
// - Recent score trends for the subject
// - Improvement recommendations
//
// Middleware chain:
// 1. authenticate - Verify user is logged in
// 2. dashboardController.getSubjectAnalytics - Generate subject analytics

router.get(
  '/analytics/subject/:subject',
  authenticate,                                    // Must be logged in
  dashboardController.getSubjectAnalytics          // Handle request
)

// GET PREDICTED JAMB SCORE (Premium Feature)
// GET /api/student/analytics/predicted-score
//
// Returns AI-powered JAMB score prediction
// Only available for PREMIUM and TRIAL users
//
// Response includes:
// - Predicted JAMB score (out of 400)
// - Confidence level of prediction
// - Number of exams used for prediction
// - Improvement recommendations
//
// Middleware chain:
// 1. authenticate - Verify user is logged in
// 2. dashboardController.getPredictedScore - Calculate prediction

router.get(
  '/analytics/predicted-score',
  authenticate,                                    // Must be logged in
  dashboardController.getPredictedScore            // Handle request
)

// GET STUDY RECOMMENDATIONS
// GET /api/student/recommendations
//
// Returns personalized study recommendations based on performance
// Available for all users (FREE, TRIAL, PREMIUM)
//
// Response includes:
// - Subject-specific recommendations
// - General study tips
// - Performance analysis summary
// - Number of exams analyzed
//
// Middleware chain:
// 1. authenticate - Verify user is logged in
// 2. dashboardController.getStudyRecommendations - Generate recommendations

router.get(
  '/recommendations',
  authenticate,                                      // Must be logged in
  dashboardController.getStudyRecommendations        // Handle request
)

// GET ADMIN DASHBOARD
// GET /api/admin/dashboard
//
// Returns comprehensive admin dashboard analytics
// Only available for ADMIN and TEACHER users
//
// Response includes:
// - System statistics (total students, questions, exams, etc.)
// - Recent activity feed
// - Subject distribution
// - Exam status statistics
// - Performance trends
// - System health metrics
//
// Middleware chain:
// 1. authenticate - Verify user is logged in as admin/teacher
// 2. dashboardController.getAdminDashboard - Generate admin dashboard data

router.get(
  '/admin',
  authenticate,                                      // Must be logged in
  dashboardController.getAdminDashboard              // Handle request
)

// ==========================================
// EXPORT ROUTER
// ==========================================
// This router is imported in server.ts
// and mounted at /api/student
//
// So these routes become:
// GET    /api/student/dashboard                    (main dashboard)
// GET    /api/student/analytics/subject/:subject  (subject analytics)
// GET    /api/student/analytics/predicted-score   (JAMB prediction)
// GET    /api/student/recommendations             (study tips)

export default router

// ==========================================
// HOW TO TEST THESE ENDPOINTS
// ==========================================
//
// You need a valid JWT token from login to test these endpoints
//
// 1. GET DASHBOARD:
//    curl -H "Authorization: Bearer <token>" \
//         http://localhost:3000/api/student/dashboard
//
// 2. GET SUBJECT ANALYTICS:
//    curl -H "Authorization: Bearer <token>" \
//         http://localhost:3000/api/student/analytics/subject/Mathematics
//
// 3. GET PREDICTED SCORE:
//    curl -H "Authorization: Bearer <token>" \
//         http://localhost:3000/api/student/analytics/predicted-score
//
// 4. GET RECOMMENDATIONS:
//    curl -H "Authorization: Bearer <token>" \
//         http://localhost:3000/api/student/recommendations

// ==========================================
// PERMISSION MATRIX
// ==========================================
//
// Endpoint                                    | Free | Trial | Premium
// --------------------------------------------|------|-------|--------
// GET /api/student/dashboard                  |  ✅  |   ✅  |   ✅
// GET /api/student/analytics/subject/:subject |  ❌  |   ✅  |   ✅
// GET /api/student/analytics/predicted-score  |  ❌  |   ✅  |   ✅
// GET /api/student/recommendations            |  ✅  |   ✅  |   ✅
//
// Note: Premium features return 403 Forbidden for FREE users