import { ReactNode } from 'react'
import Navigation from './Navigation'
import { useAuthStore } from '../store/auth'

interface LayoutProps {
  children: ReactNode
  showNavigation?: boolean
}

export default function Layout({ children, showNavigation = true }: LayoutProps) {
  const { isAuthenticated } = useAuthStore()

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col">
      {/* Show navigation only if user is authenticated and showNavigation is true */}
      {isAuthenticated && showNavigation && <Navigation />}
      
      {/* Main content */}
      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  )
}