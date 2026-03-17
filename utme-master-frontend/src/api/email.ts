// ==========================================
// EMAIL API FUNCTIONS
// ==========================================
// Frontend API functions for email operations

import { apiClient } from './client'

// ==========================================
// INTERFACES
// ==========================================

export interface EmailOptions {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  template?: string
  templateData?: Record<string, any>
}

export interface BulkEmailResult {
  successful: number
  failed: number
  results: Array<{
    email: string
    success: boolean
    error?: string
  }>
}

// ==========================================
// TEST EMAIL CONFIGURATION
// ==========================================
export const testEmailConfiguration = async (testEmail: string) => {
  const response = await apiClient.post('/email/test', { testEmail })
  return response.data
}

// ==========================================
// SEND WELCOME EMAIL
// ==========================================
export const sendWelcomeEmail = async (userEmail: string, userData: {
  firstName: string
  lastName: string
  role: string
}) => {
  const response = await apiClient.post('/email/welcome', {
    userEmail,
    userData
  })
  return response.data
}

// ==========================================
// SEND CUSTOM EMAIL
// ==========================================
export const sendCustomEmail = async (emailData: {
  to: string
  subject: string
  html?: string
  text?: string
}) => {
  const response = await apiClient.post('/email/send', emailData)
  return response.data
}

// ==========================================
// SEND BULK EMAILS
// ==========================================
export const sendBulkEmails = async (emails: EmailOptions[]) => {
  const response = await apiClient.post('/email/bulk', { emails })
  return response.data
}

// ==========================================
// EMAIL TEMPLATE FUNCTIONS
// ==========================================

export const getEmailTemplates = async () => {
  // TODO: Implement when backend endpoint is available
  // const response = await apiClient.get('/email/templates')
  // return response.data
  
  // Mock data for now
  return {
    success: true,
    data: {
      templates: [
        {
          id: 'welcome',
          name: 'Welcome Email',
          subject: 'Welcome to UTME Master!',
          description: 'Sent to new users after registration'
        },
        {
          id: 'password-reset',
          name: 'Password Reset',
          subject: 'Reset Your Password',
          description: 'Sent when user requests password reset'
        },
        {
          id: 'exam-completion',
          name: 'Exam Completion',
          subject: 'Exam Results Available',
          description: 'Sent after student completes an exam'
        }
      ]
    }
  }
}

export const previewEmailTemplate = async (templateId: string, templateData?: Record<string, any>) => {
  // TODO: Implement when backend endpoint is available
  // const response = await apiClient.post(`/email/templates/${templateId}/preview`, { templateData })
  // return response.data
  
  // Mock preview for now
  return {
    success: true,
    data: {
      subject: 'Preview Subject',
      html: '<h1>Preview HTML Content</h1>',
      text: 'Preview text content'
    }
  }
}