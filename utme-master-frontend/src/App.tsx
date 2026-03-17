import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import ProtectedRoute from './components/ProtectedRoute'
import ToastProvider from './components/ui/Toast'
import ErrorDebugPanel from './components/debug/ErrorDebugPanel'
import { successLogger } from './utils/successLogger'
import 'react-quill/dist/quill.snow.css'

// Lazy load components with error handling
const Login = lazy(() => import('./pages/auth/Login'))
const Register = lazy(() => import('./pages/auth/Register'))
const RoleSelection = lazy(() => import('./pages/auth/RoleSelection'))
const NotFound = lazy(() => import('./pages/NotFound'))

// Profile pages
const EditProfile = lazy(() => import('./pages/profile/EditProfile'))
const ProfileSettings = lazy(() => import('./pages/profile/Settings'))

// Student pages
const StudentDashboard = lazy(() => import('./pages/student/Dashboard'))
const ExamDashboard = lazy(() => import('./pages/student/ExamDashboard'))
const TestDashboard = lazy(() => import('./pages/student/TestDashboard'))
const ExamSelection = lazy(() => import('./pages/student/ExamSelection'))
const ExamInterface = lazy(() => import('./pages/student/ExamInterface'))
const Results = lazy(() => import('./pages/student/Results'))
const ExamReview = lazy(() => import('./pages/student/ExamReview'))

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const ExamManagement = lazy(() => import('./pages/admin/ExamManagement'))
const QuestionList = lazy(() => import('./pages/admin/QuestionList'))
const QuestionCreate = lazy(() => import('./pages/admin/QuestionCreate'))
const QuestionEdit = lazy(() => import('./pages/admin/QuestionEdit'))
const AdminAnalytics = lazy(() => import('./pages/admin/Analytics'))
const LicenseManagement = lazy(() => import('./pages/admin/LicenseManagement'))
const BulkImport = lazy(() => import('./pages/admin/BulkImport'))
const SystemSettings = lazy(() => import('./pages/admin/SystemSettings'))

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="text-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-secondary-400 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        <p className="text-gray-600 font-medium animate-pulse">Loading amazing experience...</p>
      </div>
    </div>
  )
}

function App() {
  useEffect(() => {
    // Log app startup
    successLogger.logAppStart('1.0.0', import.meta.env.MODE)
    console.log('🎯 UTME Master App is running...')
  }, [])
  
  return (
    <ErrorBoundary>
      <BrowserRouter future={{ v7_startTransition: true }}>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Navigate to="/role-selection" replace />} />
            <Route path="/role-selection" element={<RoleSelection />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Profile Routes - Available to all authenticated users */}
            <Route path="/profile/edit" element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            } />
            <Route path="/profile/settings" element={
              <ProtectedRoute>
                <ProfileSettings />
              </ProtectedRoute>
            } />

            {/* Student Protected Routes */}
            <Route path="/student/dashboard" element={
              <ProtectedRoute requiredRole="STUDENT">
                <StudentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/student/exam-dashboard" element={
              <ProtectedRoute requiredRole="STUDENT">
                <ExamDashboard />
              </ProtectedRoute>
            } />
            <Route path="/student/test-dashboard" element={
              <ProtectedRoute requiredRole="STUDENT">
                <TestDashboard />
              </ProtectedRoute>
            } />
            <Route path="/student/exams" element={
              <ProtectedRoute requiredRole="STUDENT">
                <ExamSelection />
              </ProtectedRoute>
            } />
            <Route path="/student/exam/:studentExamId" element={
              <ProtectedRoute requiredRole="STUDENT">
                <ExamInterface />
              </ProtectedRoute>
            } />
            <Route path="/student/results/:studentExamId" element={
              <ProtectedRoute requiredRole="STUDENT">
                <Results />
              </ProtectedRoute>
            } />
            <Route path="/student/exam-review/:studentExamId" element={
              <ProtectedRoute requiredRole="STUDENT">
                <ExamReview />
              </ProtectedRoute>
            } />

            {/* Admin Protected Routes - Allow both ADMIN and TEACHER */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute requiredRole={["ADMIN", "TEACHER"]}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/exams" element={
              <ProtectedRoute requiredRole={["ADMIN", "TEACHER"]}>
                <ExamManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/questions" element={
              <ProtectedRoute requiredRole={["ADMIN", "TEACHER"]}>
                <QuestionList />
              </ProtectedRoute>
            } />
            <Route path="/admin/questions/create" element={
              <ProtectedRoute requiredRole={["ADMIN", "TEACHER"]}>
                <QuestionCreate />
              </ProtectedRoute>
            } />
            <Route path="/admin/questions/edit/:id" element={
              <ProtectedRoute requiredRole={["ADMIN", "TEACHER"]}>
                <QuestionEdit />
              </ProtectedRoute>
            } />
            <Route path="/admin/analytics" element={
              <ProtectedRoute requiredRole={["ADMIN", "TEACHER"]}>
                <AdminAnalytics />
              </ProtectedRoute>
            } />
            <Route path="/admin/licenses" element={
              <ProtectedRoute requiredRole="ADMIN">
                <LicenseManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/bulk-import" element={
              <ProtectedRoute requiredRole={["ADMIN", "TEACHER"]}>
                <BulkImport />
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute requiredRole="ADMIN">
                <SystemSettings />
              </ProtectedRoute>
            } />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>

        {/* Toast Notifications */}
        <ToastProvider />

        {/* Error Debug Panel (Development Only) */}
        <ErrorDebugPanel />
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
