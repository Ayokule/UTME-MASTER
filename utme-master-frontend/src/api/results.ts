import apiClient from './client.js'
import { ExamResults } from '../types/results'

// Get exam results by student exam ID
export const getExamResults = async (studentExamId: string): Promise<ExamResults> => {
  const response = await apiClient.get(`/student/results/${studentExamId}`)
  return response.data
}

// Retake an exam
export const retakeExam = async (examId: string): Promise<{ studentExamId: string }> => {
  const response = await apiClient.post(`/exams/${examId}/retake`)
  return response.data
}

// Share exam results
export const shareResults = async (studentExamId: string, platform: string) => {
  const response = await apiClient.post(`/student/results/${studentExamId}/share`, {
    platform
  })
  return response.data
}

// Download results as PDF
export const downloadResultsPDF = async (studentExamId: string): Promise<Blob> => {
  const response = await apiClient.get(`/student/results/${studentExamId}/pdf`, {
    responseType: 'blob'
  })
  return response.data
}

// Get comparison with previous attempts
export const getResultsComparison = async (examId: string) => {
  const response = await apiClient.get(`/student/results/comparison/${examId}`)
  return response.data
}