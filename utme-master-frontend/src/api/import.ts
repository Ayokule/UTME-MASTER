import apiClient from './client'

// ==========================================
// IMPORT API FUNCTIONS
// ==========================================

export interface ImportResult {
  row: number
  success: boolean
  questionText?: string
  error?: string
  warnings?: string[]
}

export interface ImportStatistics {
  totalRows: number
  successCount: number
  errorCount: number
  warningCount: number
  duplicatesSkipped: number
  subjectsProcessed: string[]
  topicsCreated: string[]
  results: ImportResult[]
  summary: {
    totalProcessed: number
    successful: number
    failed: number
    warnings: number
    duplicatesSkipped: number
    subjectsProcessed: number
    topicsCreated: number
  }
}

export interface BulkImportResponse {
  success: boolean
  message: string
  data: ImportStatistics
}

// ==========================================
// BULK IMPORT QUESTIONS
// ==========================================
// Upload and import questions from Excel/CSV file
export const bulkImportQuestions = async (file: File): Promise<BulkImportResponse> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await apiClient.post('/import/questions', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })

  return response.data
}

// ==========================================
// DOWNLOAD TEMPLATE
// ==========================================
// Download Excel template for question import
export const downloadImportTemplate = async (): Promise<Blob> => {
  const response = await apiClient.get('/import/template', {
    responseType: 'blob'
  })

  return response.data
}

// ==========================================
// VALIDATE FILE
// ==========================================
// Client-side file validation before upload
export const validateImportFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  const allowedExtensions = ['xlsx', 'xls', 'csv']
  const fileExtension = file.name.toLowerCase().split('.').pop()
  
  if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
    return {
      valid: false,
      error: 'Invalid file type. Please select an Excel (.xlsx, .xls) or CSV (.csv) file.'
    }
  }

  // Check file size (10MB max)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File too large. Maximum size is 10MB.'
    }
  }

  // Check if file is empty
  if (file.size === 0) {
    return {
      valid: false,
      error: 'File is empty. Please select a valid file.'
    }
  }

  return { valid: true }
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

// Format file size for display
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Get file type icon
export const getFileTypeIcon = (filename: string): string => {
  const extension = filename.toLowerCase().split('.').pop()
  
  switch (extension) {
    case 'xlsx':
    case 'xls':
      return '📊'
    case 'csv':
      return '📄'
    default:
      return '📁'
  }
}

// Generate import summary text
export const generateImportSummary = (statistics: ImportStatistics): string => {
  const { summary } = statistics
  
  let summaryText = `Processed ${summary.totalProcessed} rows: `
  
  const parts = []
  if (summary.successful > 0) {
    parts.push(`${summary.successful} successful`)
  }
  if (summary.failed > 0) {
    parts.push(`${summary.failed} failed`)
  }
  if (summary.warnings > 0) {
    parts.push(`${summary.warnings} with warnings`)
  }
  if (summary.duplicatesSkipped > 0) {
    parts.push(`${summary.duplicatesSkipped} duplicates skipped`)
  }
  
  summaryText += parts.join(', ')
  
  if (summary.topicsCreated > 0) {
    summaryText += `. Created ${summary.topicsCreated} new topics.`
  }
  
  return summaryText
}