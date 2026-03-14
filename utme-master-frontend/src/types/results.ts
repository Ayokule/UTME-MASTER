export interface ExamScore {
  total: number
  max: number
  percentage: number
  grade: string
  passed: boolean
  timeTaken: number // in seconds
}

export interface SubjectScore {
  name: string
  score: number
  max: number
  correct: number
  total: number
  percentage: number
}

export interface QuestionResult {
  id: string
  questionNumber: number
  questionText: string
  options: {
    label: string
    text: string
  }[]
  selectedAnswer: string | null
  correctAnswer: string
  isCorrect: boolean
  explanation?: string
  subject: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  pointsEarned: number
  timeSpent?: number
}

export interface ExamAnalytics {
  improvement: number // percentage improvement from last attempt
  predictedScore: number // predicted JAMB score
  rankingPercentile: number // top X% of users
  strengthsChart: {
    subject: string
    accuracy: number
  }[]
  weaknessesChart: {
    subject: string
    accuracy: number
  }[]
  topicBreakdown: {
    topic: string
    subject: string
    correct: number
    total: number
    accuracy: number
  }[]
}

export interface ExamResults {
  exam: {
    id: string
    title: string
    duration: number
    totalQuestions: number
    description?: string
  }
  score: ExamScore
  subjects: SubjectScore[]
  questions: QuestionResult[]
  analytics?: ExamAnalytics // Only for premium users
  canRetake: boolean
  attemptNumber: number
  submittedAt: string
}

export interface CelebrationConfig {
  message: string
  emoji: string
  gradient: string
  textColor: string
}