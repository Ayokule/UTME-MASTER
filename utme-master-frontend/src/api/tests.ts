/**
 * Practice Tests API Client
 * Covers: test list, test history, start/submit test
 */

import apiClient from './client'
import { StudentTest, TestAttempt, TestStats } from './student'

// ==========================================
// PRACTICE TESTS
// ==========================================

/** GET /api/student/tests */
export const getStudentTests = async (): Promise<{ tests: StudentTest[]; stats: TestStats }> => {
  const response = await apiClient.get('/student/tests')
  return response.data?.data || response.data
}

/** GET /api/student/test-history */
export const getTestHistory = async (): Promise<TestAttempt[]> => {
  const response = await apiClient.get('/student/test-history')
  return response.data?.data || response.data
}

/** POST /api/tests/:testId/start */
export const startTest = async (testId: string): Promise<{ studentTestId: string; token: string }> => {
  const response = await apiClient.post(`/tests/${testId}/start`)
  return response.data?.data || response.data
}

/** POST /api/tests/:studentTestId/submit */
export const submitTest = async (
  studentTestId: string,
  autoSubmit = false
): Promise<{ score: number; percentage: number }> => {
  const response = await apiClient.post(`/tests/${studentTestId}/submit`, { autoSubmit })
  return response.data?.data || response.data
}
