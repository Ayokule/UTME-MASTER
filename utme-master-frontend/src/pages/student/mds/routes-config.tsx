// src/router/routes.tsx
// OR src/App.tsx
// ==========================================
// ROUTING CONFIGURATION WITH ROLE SEPARATION
// ==========================================
// Properly organized routes by role
// Each role has its own section

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'

// ==========================================
// AUTH PAGES (Public)
// ==========================================
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import ForgotPassword from '../pages/auth/ForgotPassword'
import RoleSelection from '../pages/auth/RoleSelection'

// ==========================================
// STUDENT PAGES
// ==========================================
import StudentDashboard from '../pages/student/Dashboard'
import OfficialExamsDashboard from '../pages/student/OfficialExamsDashboard'
import PracticeTestsDashboard from '../pages/student/PracticeTestsDashboard'
import ExamStart from '../pages/student/ExamStart'
import ExamInterface from '../pages/student/ExamInterface'
import ExamReview from '../pages/student/ExamReview'
import Results from '../pages/student/Results'
import ExamSelection from '../pages/student/ExamSelection'

// ==========================================
// TEACHER PAGES (NEW - Create these)
// ==========================================
// import TeacherDashboard from '../pages/teacher/Dashboard'
// import TeacherClassManagement from '../pages/teacher/ClassManagement'
// import TeacherStudentProgress from '../pages/teacher/StudentProgress'
// import TeacherAnalytics from '../pages/teacher/Analytics'
// import TeacherSettings from '../pages/teacher/Settings'
// import TeacherExamCreation from '../pages/teacher/ExamCreation'

// ==========================================
// ADMIN PAGES (SEPARATED FROM TEACHER)
// ==========================================
// import AdminDashboard from '../pages/admin/Dashboard'
// import AdminSystemSettings from '../pages/admin/SystemSettings'
// import AdminLicenseManagement from '../pages/admin/LicenseManagement'
// import AdminSecurityDashboard from '../pages/admin/SecurityDashboard'
// import AdminAnalytics from '../pages/admin/Analytics'
// import AdminQuestionManagement from '../pages/admin/QuestionManagement'
// import AdminExamManagement from '../pages/admin/ExamManagement'
// import AdminEmailManagement from '../pages/admin/EmailManagement'
// import AdminUserManagement from '../pages/admin/UserManagement'
// import AdminLiveExamMonitoring from '../pages/admin/LiveExamMonitoring'

// ==========================================
// ERROR PAGES
// ==========================================
import NotFound from '../pages/errors/NotFound'
import UnauthorizedPage from '../pages/errors/UnauthorizedPage'

// ==========================================
// MAIN ROUTER COMPONENT
// ==========================================
export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ────────────────────────────────────────
            PUBLIC ROUTES (No auth required)
            ──────────────────────────────────────── */}
        
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/role-selection" element={<RoleSelection />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* ────────────────────────────────────────
            STUDENT ROUTES (STUDENT role only)
            ──────────────────────────────────────── */}
        
        <Route path="/student/dashboard" element={
          <ProtectedRoute requiredRole="STUDENT">
            <StudentDashboard />
          </ProtectedRoute>
        } />

        <Route path="/student/exam-dashboard" element={
          <ProtectedRoute requiredRole="STUDENT">
            <OfficialExamsDashboard />
          </ProtectedRoute>
        } />

        <Route path="/student/test-dashboard" element={
          <ProtectedRoute requiredRole="STUDENT">
            <PracticeTestsDashboard />
          </ProtectedRoute>
        } />

        <Route path="/student/exams" element={
          <ProtectedRoute requiredRole="STUDENT">
            <ExamSelection />
          </ProtectedRoute>
        } />

        <Route path="/student/exam-start/:examId" element={
          <ProtectedRoute requiredRole="STUDENT">
            <ExamStart />
          </ProtectedRoute>
        } />

        <Route path="/student/exam/:examId" element={
          <ProtectedRoute requiredRole="STUDENT">
            <ExamInterface />
          </ProtectedRoute>
        } />

        <Route path="/student/exam/:examId/review" element={
          <ProtectedRoute requiredRole="STUDENT">
            <ExamReview />
          </ProtectedRoute>
        } />

        <Route path="/student/test/:testId" element={
          <ProtectedRoute requiredRole="STUDENT">
            <ExamInterface /> {/* Reuse for tests */}
          </ProtectedRoute>
        } />

        <Route path="/student/results/:studentExamId" element={
          <ProtectedRoute requiredRole="STUDENT">
            <Results />
          </ProtectedRoute>
        } />

        {/* ────────────────────────────────────────
            TEACHER ROUTES (TEACHER role)
            Note: ADMIN can also access these
            ──────────────────────────────────────── */}
        
        {/* Coming soon - uncomment when created
        <Route path="/teacher/dashboard" element={
          <ProtectedRoute requiredRole={["TEACHER", "ADMIN"]}>
            <TeacherDashboard />
          </ProtectedRoute>
        } />

        <Route path="/teacher/classes" element={
          <ProtectedRoute requiredRole={["TEACHER", "ADMIN"]}>
            <TeacherClassManagement />
          </ProtectedRoute>
        } />

        <Route path="/teacher/students" element={
          <ProtectedRoute requiredRole={["TEACHER", "ADMIN"]}>
            <TeacherStudentProgress />
          </ProtectedRoute>
        } />

        <Route path="/teacher/analytics" element={
          <ProtectedRoute requiredRole={["TEACHER", "ADMIN"]}>
            <TeacherAnalytics />
          </ProtectedRoute>
        } />

        <Route path="/teacher/settings" element={
          <ProtectedRoute requiredRole={["TEACHER", "ADMIN"]}>
            <TeacherSettings />
          </ProtectedRoute>
        } />

        <Route path="/teacher/exam-creation" element={
          <ProtectedRoute requiredRole={["TEACHER", "ADMIN"]}>
            <TeacherExamCreation />
          </ProtectedRoute>
        } />
        */}

        {/* ────────────────────────────────────────
            ADMIN ROUTES (ADMIN role ONLY)
            ──────────────────────────────────────── */}
        
        {/* Coming soon - uncomment when created
        <Route path="/admin/dashboard" element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="/admin/settings" element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminSystemSettings />
          </ProtectedRoute>
        } />

        <Route path="/admin/license" element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminLicenseManagement />
          </ProtectedRoute>
        } />

        <Route path="/admin/security" element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminSecurityDashboard />
          </ProtectedRoute>
        } />

        <Route path="/admin/analytics" element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminAnalytics />
          </ProtectedRoute>
        } />

        <Route path="/admin/questions" element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminQuestionManagement />
          </ProtectedRoute>
        } />

        <Route path="/admin/questions/create" element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminQuestionCreate />
          </ProtectedRoute>
        } />

        <Route path="/admin/questions/edit/:id" element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminQuestionEdit />
          </ProtectedRoute>
        } />

        <Route path="/admin/exams" element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminExamManagement />
          </ProtectedRoute>
        } />

        <Route path="/admin/users" element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminUserManagement />
          </ProtectedRoute>
        } />

        <Route path="/admin/email" element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminEmailManagement />
          </ProtectedRoute>
        } />

        <Route path="/admin/monitoring" element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminLiveExamMonitoring />
          </ProtectedRoute>
        } />
        */}

        {/* ────────────────────────────────────────
            ERROR ROUTES
            ──────────────────────────────────────── */}
        
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

/**
 * ==========================================
 * ROUTING PRINCIPLES
 * ==========================================
 * 
 * 1. AUTHENTICATION
 *    - ProtectedRoute checks isAuthenticated
 *    - Redirects to /login if not authenticated
 * 
 * 2. AUTHORIZATION (Role-based)
 *    - ProtectedRoute checks requiredRole
 *    - Renders UnauthorizedPage if no permission
 *    - ADMIN can access TEACHER routes (optional)
 *    - STUDENT cannot access TEACHER/ADMIN routes
 * 
 * 3. ORGANIZATION
 *    - /student/* - Only STUDENT can access
 *    - /teacher/* - Only TEACHER (and ADMIN if allowed)
 *    - /admin/* - Only ADMIN can access
 * 
 * 4. SECURITY
 *    - Check happens BEFORE component loads
 *    - No role-checking inside components
 *    - Route-level protection is authoritative
 * 
 * 5. SCALABILITY
 *    - Easy to add new routes
 *    - Easy to add new role checks
 *    - Easy to add premium/trial tier checks
 */
