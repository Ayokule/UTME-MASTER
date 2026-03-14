export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN'
export type LicenseTier = 'TRIAL' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE'
export type ExamType = 'JAMB' | 'WAEC' | 'NECO'
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD'
export type AnswerOption = 'A' | 'B' | 'C' | 'D'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  licenseTier: LicenseTier
  phone?: string
  address?: string
  dateOfBirth?: string
  bio?: string
}

export interface Question {
  id: string
  subjectId: string
  questionText: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: AnswerOption
  difficulty: Difficulty
}
