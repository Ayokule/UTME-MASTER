import { create } from 'zustand'
import { User } from '../api/auth'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  updateUser: (user: User) => void
  clearAuth: () => void
}

// Initialize auth state from localStorage
const initializeAuth = () => {
  try {
    const token = localStorage.getItem('authToken')
    const userStr = localStorage.getItem('user')
    
    if (token && userStr) {
      const user = JSON.parse(userStr)
      return { user, token, isAuthenticated: true }
    }
  } catch (error) {
    console.error('Error initializing auth from localStorage:', error)
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
  }
  
  return { user: null, token: null, isAuthenticated: false }
}

export const useAuthStore = create<AuthState>((set) => ({
  ...initializeAuth(),
  setAuth: (user: User, token: string) => {
    localStorage.setItem('authToken', token)
    localStorage.setItem('user', JSON.stringify(user))
    set({ user, token, isAuthenticated: true })
  },
  updateUser: (user: User) => {
    localStorage.setItem('user', JSON.stringify(user))
    set((state) => ({ ...state, user }))
  },
  clearAuth: () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    set({ user: null, token: null, isAuthenticated: false })
  },
}))