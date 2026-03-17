/**
 * Results API Client
 * 
 * Handles all API communication for exam results and review.
 * Includes error handling and type safety.
 */

import apiClient from './client.js'

/**
 * Get exam results for a completed exam
 * 
 * @param studentExamId - The student exam ID
 * @returns Exam results with score, subject breakdown, questions, and analytics
 * @throws Error if results not found or user not authorized
 * 
 * Example:
 * ```typescript
 * const results = await getExamResults('exam-123')
 * console.log(results.score.percentage) // 75
 * ```
 */
export const getExamResults = async (studentExamId: string) => {
  try {
    console.log('🔄 [RESULTS API] Fetching results for exam:', studentExamId)
    const response = await apiClient.get(`/api/exams/results/${studentExamId}`)
    const data = response.data?.data || response.data
    console.log('✅ [RESULTS API] Results loaded successfully')
    return data
  } catch (error: any) {
    console.error('❌ [RESULTS API] Failed to fetch results:', {
      studentExamId,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    })
    throw error
  }
}

/**
 * Start a retake of an exam
 * 
 * Creates a new student exam record for retaking a previously completed exam.
 * Only works if the exam allows retakes.
 * 
 * @param examId - The exam ID to retake
 * @returns New student exam ID for the retake
 * @throws Error if exam not found, doesn't allow retakes, or user not authorized
 * 
 * Example:
 * ```typescript
 * const { studentExamId } = await retakeExam('exam-123')
 * navigate(`/student/exam/${studentExamId}`)
 * ```
 */
export const retakeExam = async (studentExamId: string) => {
  try {
    console.log('🔄 [RESULTS API] Starting retake for exam:', studentExamId)
    const response = await apiClient.post(`/api/student/exam/${studentExamId}/retake`)
    const data = response.data?.data || response.data
    console.log('✅ [RESULTS API] Retake started successfully:', data.studentExamId)
    return data
  } catch (error: any) {
    console.error('❌ [RESULTS API] Failed to start retake:', {
      studentExamId,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    })
    throw error
  }
}

/**
 * Download exam results as PDF
 * 
 * Generates and downloads a PDF report of the exam results.
 * 
 * @param studentExamId - The student exam ID
 * @returns Blob containing the PDF file
 * @throws Error if PDF generation fails or user not authorized
 * 
 * Example:
 * ```typescript
 * const blob = await downloadResultsPDF('exam-123')
 * const url = URL.createObjectURL(blob)
 * const a = document.createElement('a')
 * a.href = url
 * a.download = 'results.pdf'
 * a.click()
 * ```
 */
export const downloadResultsPDF = async (studentExamId: string) => {
  try {
    console.log('🔄 [RESULTS API] Downloading PDF for exam:', studentExamId)
    const response = await apiClient.get(`/api/student/results/${studentExamId}/pdf`, {
      responseType: 'blob'
    })
    console.log('✅ [RESULTS API] PDF downloaded successfully')
    return response.data
  } catch (error: any) {
    console.error('❌ [RESULTS API] Failed to download PDF:', {
      studentExamId,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    })
    throw error
  }
}

export default {
  getExamResults,
  retakeExam,
  downloadResultsPDF
}
