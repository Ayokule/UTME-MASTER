import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'STUDENT' | 'TEACHER' | 'ADMIN' | string[]
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()

  // If not authenticated, redirect to login with return path
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // If role is required and user doesn't have it, redirect to appropriate dashboard
  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    
    if (!allowedRoles.includes(user.role)) {
      const redirectPath = user.role === 'ADMIN' || user.role === 'TEACHER' ? '/admin/dashboard' : '/student/dashboard'
      return <Navigate to={redirectPath} replace />
    }
  }

  return <>{children}</>
}