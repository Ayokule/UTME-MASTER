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

// Normalize user object — guard against role being an object instead of string
const normalizeUser = (user: any): User => ({
  ...user,
  role: typeof user.role === 'object' ? (user.role?.name || user.role?.value || String(user.role)) : user.role,
})

// Initialize auth state from localStorage
const initializeAuth = () => {
  try {
    const token = localStorage.getItem('authToken')
    const userStr = localStorage.getItem('user')
    
    if (token && userStr) {
      const raw = JSON.parse(userStr)
      const user = normalizeUser(raw)
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
    const clean = normalizeUser(user)
    localStorage.setItem('authToken', token)
    localStorage.setItem('user', JSON.stringify(clean))
    set({ user: clean, token, isAuthenticated: true })
  },
  updateUser: (user: User) => {
    const clean = normalizeUser(user)
    localStorage.setItem('user', JSON.stringify(clean))
    set((state) => ({ ...state, user: clean }))
  },
  clearAuth: () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    set({ user: null, token: null, isAuthenticated: false })
  },
}))