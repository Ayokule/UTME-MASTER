export interface QuestionOption {
  label: string
  text: string
  isCorrect: boolean
}

export interface Question {
  id: string
  subject: string
  topic?: string
  questionText: string
  options: QuestionOption[]
  // Legacy flat fields (kept for backward compat)
  optionA?: string
  optionB?: string
  optionC?: string
  optionD?: string
  correctAnswer: string
  explanation?: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  year?: number
  examType: 'JAMB' | 'WAEC' | 'NECO'
  imageUrl?: string
  createdAt: string
  updatedAt: string
}

export interface QuestionFilters {
  subjects: string[]
  topics: string[]
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD'
  yearFrom?: number
  yearTo?: number
  examType?: 'JAMB' | 'WAEC' | 'NECO'
  search?: string
}

export interface QuestionListResponse {
  questions: Question[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CreateQuestionData {
  subject: string
  topic?: string
  questionText: string
  options: QuestionOption[]
  correctAnswer: string
  explanation?: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  year?: number
  examType: 'JAMB' | 'WAEC' | 'NECO'
  imageUrl?: string
}

export interface UpdateQuestionData extends Partial<CreateQuestionData> {
  id: string
}

export interface BulkImportRow {
  Subject: string
  Topic?: string
  Question: string
  'Option A': string
  'Option B': string
  'Option C': string
  'Option D': string
  'Correct Answer': 'A' | 'B' | 'C' | 'D'
  Explanation?: string
  Difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  Year?: number
  'Exam Type': 'JAMB' | 'WAEC' | 'NECO'
  'Image URL'?: string
}

export interface ValidationResult {
  rowNumber: number
  valid: boolean
  errors: string[]
  data: BulkImportRow
}

export interface ImportResult {
  imported: number
  failed: number
  errors: ValidationResult[]
}