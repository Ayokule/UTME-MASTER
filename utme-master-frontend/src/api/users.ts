import apiClient from './client'

export interface AdminUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'SUPER_ADMIN'
  phone?: string | null
  licenseTier: string
  licenseExpiresAt?: string | null
  isActive: boolean
  lastLogin?: string | null
  createdAt: string
  _count?: { studentExams: number }
}

export interface UsersResponse {
  users: AdminUser[]
  pagination: { page: number; limit: number; total: number; pages: number }
}

export const getUsers = async (params?: {
  page?: number; limit?: number; role?: string; search?: string
}): Promise<{ success: boolean; data: UsersResponse }> => {
  const response = await apiClient.get('/admin/users', { params })
  return response.data
}

export const getUserById = async (id: string): Promise<{ success: boolean; data: { user: AdminUser } }> => {
  const response = await apiClient.get(`/admin/users/${id}`)
  return response.data
}

export const updateUser = async (id: string, data: Partial<AdminUser>): Promise<{ success: boolean; data: { user: AdminUser } }> => {
  const response = await apiClient.put(`/admin/users/${id}`, data)
  return response.data
}

export const resetUserPassword = async (id: string, password: string): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.put(`/admin/users/${id}/password`, { password })
  return response.data
}

export const toggleUserActive = async (id: string): Promise<{ success: boolean; data: { user: AdminUser } }> => {
  const response = await apiClient.put(`/admin/users/${id}/toggle-active`)
  return response.data
}

export const deleteUser = async (id: string): Promise<{ success: boolean }> => {
  const response = await apiClient.delete(`/admin/users/${id}`)
  return response.data
}

export const createUser = async (data: {
  email: string; password: string; firstName: string; lastName: string
  role: string; phone?: string
}): Promise<{ success: boolean; data: any }> => {
  const response = await apiClient.post('/auth/register', data)
  return response.data
}
