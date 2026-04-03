// ==========================================
// DATA MANAGEMENT API CLIENT
// ==========================================
// Extends existing API clients — no duplicates.

import apiClient from './client'

// ---- Types ----

export interface DuplicateGroup {
  normalizedText: string
  count: number
  questions: { id: string; questionText: string; subject: { name: string }; examType: string; year?: number; createdAt: string }[]
}

export interface HealthReport {
  questions: {
    total: number
    inactive: number
    withoutSubject: number
    duplicateGroups: number
    duplicateCount: number
    improperCount: number
    improperQuestions: { id: string; questionPreview: string; subject: string; issues: string[] }[]
  }
  exams: { total: number; emptyExams: number; emptyExamList: { id: string; title: string }[] }
  recentImports: { id: string; fileName: string; status: string; imported: number; failed: number; createdAt: string }[]
}

export interface AuditLog {
  id: string
  action: string
  entityType: string
  entityId?: string
  createdAt: string
  user: { firstName: string; lastName: string; email: string; role: string }
}

// ---- Health ----

export const getHealthReport = async (): Promise<{ success: boolean; data: HealthReport }> => {
  const res = await apiClient.get('/data-management/health')
  return res.data
}

// ---- Duplicates ----

export const getDuplicates = async (): Promise<{ success: boolean; data: { totalDuplicateGroups: number; totalDuplicateQuestions: number; duplicates: DuplicateGroup[] } }> => {
  const res = await apiClient.get('/data-management/duplicates')
  return res.data
}

export const removeDuplicates = async (deleteIds: string[]): Promise<{ success: boolean; data: { removed: number } }> => {
  const res = await apiClient.post('/data-management/duplicates/remove', { deleteIds })
  return res.data
}

// ---- Exam Question Assignment ----

export const getExamQuestions = async (examId: string) => {
  const res = await apiClient.get(`/data-management/exams/${examId}/questions`)
  return res.data
}

export const assignQuestionsToExam = async (examId: string, questionIds: string[]) => {
  const res = await apiClient.post(`/data-management/exams/${examId}/questions/assign`, { questionIds })
  return res.data
}

export const removeQuestionsFromExam = async (examId: string, questionIds: string[]) => {
  const res = await apiClient.delete(`/data-management/exams/${examId}/questions/remove`, { data: { questionIds } })
  return res.data
}

// ---- Audit Logs ----

export const getAuditLogs = async (params?: { page?: number; limit?: number; action?: string; entityType?: string }) => {
  const query = new URLSearchParams()
  if (params?.page) query.set('page', String(params.page))
  if (params?.limit) query.set('limit', String(params.limit))
  if (params?.action) query.set('action', params.action)
  if (params?.entityType) query.set('entityType', params.entityType)
  const res = await apiClient.get(`/data-management/audit-logs?${query}`)
  return res.data
}

// ---- Import History ----

export const getImportHistory = async () => {
  const res = await apiClient.get('/data-management/imports')
  return res.data
}
