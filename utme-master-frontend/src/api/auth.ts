import apiClient from './client'

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  role?: 'STUDENT' | 'TEACHER'
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'STUDENT' | 'TEACHER' | 'ADMIN'
  licenseTier: 'TRIAL' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE'
  phone?: string
  address?: string
  dateOfBirth?: string
  bio?: string
}

export interface AuthResponse {
  success: boolean
  data: {
    user: User
    token: string
  }
}

// Login user
export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await apiClient.post('/auth/login', data)
  return response.data
}

// Register user
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await apiClient.post('/auth/register', data)
  return response.data
}

// Get current user profile
export const getProfile = async (): Promise<{ success: boolean; data: { user: User } }> => {
  const response = await apiClient.get('/auth/profile')
  return response.data
}

// Logout user
export const logout = async (): Promise<void> => {
  try {
    await apiClient.post('/auth/logout')
  } finally {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
  }
}