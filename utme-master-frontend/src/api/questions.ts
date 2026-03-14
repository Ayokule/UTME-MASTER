import apiClient from './client'
import { Question, QuestionListResponse, CreateQuestionData, UpdateQuestionData, QuestionFilters, ImportResult } from '../types/question'

interface GetQuestionsParams extends QuestionFilters {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Get paginated questions with filters
export const getQuestions = async (params: GetQuestionsParams): Promise<QuestionListResponse> => {
  const searchParams = new URLSearchParams()
  
  // Add pagination
  if (params.page) searchParams.append('page', params.page.toString())
  if (params.limit) searchParams.append('limit', params.limit.toString())
  
  // Add sorting
  if (params.sortBy) searchParams.append('sortBy', params.sortBy)
  if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder)
  
  // Add filters
  if (params.subjects?.length) {
    params.subjects.forEach(subject => searchParams.append('subjects[]', subject))
  }
  if (params.topics?.length) {
    params.topics.forEach(topic => searchParams.append('topics[]', topic))
  }
  if (params.difficulty) searchParams.append('difficulty', params.difficulty)
  if (params.yearFrom) searchParams.append('yearFrom', params.yearFrom.toString())
  if (params.yearTo) searchParams.append('yearTo', params.yearTo.toString())
  if (params.examType) searchParams.append('examType', params.examType)
  if (params.search) searchParams.append('search', params.search)
  
  const response = await apiClient.get(`/questions?${searchParams.toString()}`)
  
  // Handle backend response structure: { success: true, data: { questions: [...], pagination: {...} } }
  const data = response.data?.data || response.data
  
  return {
    questions: data.questions || [],
    total: data.total || data.pagination?.total || 0,
    page: data.page || data.pagination?.page || params.page || 1,
    limit: data.limit || data.pagination?.limit || params.limit || 20,
    totalPages: data.totalPages || data.pagination?.totalPages || 0
  }
}

// Get single question by ID
export const getQuestion = async (id: string): Promise<Question> => {
  const response = await apiClient.get(`/questions/${id}`)
  return response.data
}

// Create new question
export const createQuestion = async (data: CreateQuestionData): Promise<Question> => {
  const response = await apiClient.post('/questions', data)
  return response.data
}

// Update existing question
export const updateQuestion = async (id: string, data: UpdateQuestionData): Promise<Question> => {
  const response = await apiClient.put(`/questions/${id}`, data)
  return response.data
}

// Delete question
export const deleteQuestion = async (id: string): Promise<void> => {
  await apiClient.delete(`/questions/${id}`)
}

// Bulk delete questions
export const bulkDeleteQuestions = async (ids: string[]): Promise<void> => {
  await apiClient.post('/questions/bulk-delete', { ids })
}

// Upload image for question
export const uploadQuestionImage = async (file: File): Promise<{ url: string }> => {
  const formData = new FormData()
  formData.append('image', file)
  
  const response = await apiClient.post('/questions/upload-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  
  return response.data
}

// Get subjects for dropdown
export const getSubjects = async (): Promise<string[]> => {
  const response = await apiClient.get('/subjects')
  // Handle backend response structure: { success: true, data: { subjects: [...] } }
  const data = response.data?.data || response.data
  const subjects = data.subjects || data
  return Array.isArray(subjects) ? subjects.map((subject: any) => subject.name) : []
}

// Get topics for a subject
export const getTopicsBySubject = async (subject: string): Promise<string[]> => {
  try {
    const response = await apiClient.get(`/subjects/by-name/${encodeURIComponent(subject)}/topics`)
    // Handle backend response structure
    const data = response.data?.data || response.data
    const topics = data.topics || data
    return Array.isArray(topics) ? topics.map((topic: any) => topic.name || topic) : []
  } catch (error) {
    console.error('Failed to load topics for subject:', subject, error)
    return []
  }
}

// Bulk import questions
export const importQuestions = async (questions: any[]): Promise<ImportResult> => {
  const response = await apiClient.post('/questions/import', { questions })
  return response.data
}

// Download import template
export const downloadImportTemplate = async (): Promise<Blob> => {
  const response = await apiClient.get('/questions/import-template', {
    responseType: 'blob'
  })
  return response.data
}

// Get question statistics
export const getQuestionStats = async (): Promise<{
  total: number
  bySubject: Record<string, number>
  byDifficulty: Record<string, number>
  byExamType: Record<string, number>
}> => {
  const response = await apiClient.get('/questions/stats')
  return response.data
}