import apiClient from './client'

export interface Subject {
  id: string
  name: string
  code: string
  description: string | null
  questionCount?: number
}

export interface Topic {
  id: string
  name: string
  subjectId: string
}

// Get all subjects
export const getSubjects = async (): Promise<{ success: boolean; data: { subjects: Subject[] } }> => {
  const response = await apiClient.get('/subjects')
  return response.data
}

// Get subject by ID with topics
export const getSubjectById = async (id: string): Promise<{ success: boolean; data: Subject & { topics: Topic[] } }> => {
  const response = await apiClient.get(`/subjects/${id}`)
  return response.data
}

// Get topics for a subject
export const getTopicsBySubject = async (subjectId: string): Promise<{ success: boolean; data: Topic[] }> => {
  const response = await apiClient.get(`/subjects/${subjectId}/topics`)
  return response.data
}