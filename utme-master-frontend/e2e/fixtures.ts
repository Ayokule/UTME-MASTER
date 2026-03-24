/**
 * Test Fixtures for Playwright
 * Reusable test data and utilities
 */

import { test as baseTest } from '@playwright/test'

// Extend base test with fixtures
export const test = baseTest.extend({
  // Fixture for authenticated user
  authenticatedUser: async ({ page }, use) => {
    // Login before test
    await page.goto('/login')
    await page.getByPlaceholder(/email/i).fill('test@example.com')
    await page.getByPlaceholder(/password/i).fill('password123')
    await page.getByRole('button', { name: /login/i }).click()
    await page.waitForURL(/dashboard/)
    
    await use()
    
    // Logout after test
    await page.getByRole('button', { name: /logout/i }).click()
    await page.waitForURL(/login/)
  },
  
  // Fixture for admin user
  adminUser: async ({ page }, use) => {
    // Login as admin
    await page.goto('/login')
    await page.getByPlaceholder(/email/i).fill('admin@example.com')
    await page.getByPlaceholder(/password/i).fill('admin123')
    await page.getByRole('button', { name: /login/i }).click()
    await page.waitForURL(/admin\/dashboard/)
    
    await use()
    
    // Logout after test
    await page.getByRole('button', { name: /logout/i }).click()
    await page.waitForURL(/login/)
  },
  
  // Fixture for exam
  withExam: async ({ page }, use) => {
    // Create exam before test (if needed)
    await use()
    
    // Cleanup after test (if needed)
  },
})

// Export types
export type AuthenticatedUser = {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
}

export type AdminUser = {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
}

export type Exam = {
  id: string
  title: string
  description: string
  duration: number
  totalMarks: number
  passMarks: number
}

// Export fixtures
export const fixtures = {
  test,
  authenticatedUser: test.extend({}),
  adminUser: test.extend({}),
  withExam: test.extend({}),
}
