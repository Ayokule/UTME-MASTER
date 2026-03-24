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
    const userRole = typeof user.role === 'string' ? user.role : String((user.role as any)?.name || user.role)
    
    if (!allowedRoles.includes(userRole)) {
      let redirectPath = '/student/dashboard'
      if (userRole === 'ADMIN') redirectPath = '/admin/dashboard'
      else if (userRole === 'TEACHER') redirectPath = '/teacher/dashboard'
      return <Navigate to={redirectPath} replace />
    }
  }

  return <>{children}</>
}