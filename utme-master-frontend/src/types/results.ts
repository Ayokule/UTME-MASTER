export interface SubjectBreakdown {
  subjectId: string;
  subjectName: string;
  score: number;
  totalQuestions: number;
}

export interface ExamResults {
  studentExamId: string;
  examTitle: string;
  totalScore: number;
  maxPossibleScore: number;
  percentage: number;
  status: 'PASSED' | 'FAILED';
  completedAt: string;
  subjectBreakdown: SubjectBreakdown[];
  // Add other fields based on your actual API response structure
}
/**
 * Results Type Definitions
 * 
 * These interfaces define the shape of exam results data.
 * All results API responses should conform to these types.
 */

// ==========================================
// EXAM INFO INTERFACE
// ==========================================

/**
 * Basic exam information
 * 
 * @property id - Unique exam ID
 * @property title - Exam title
 * @property duration - Exam duration in minutes
 * @property totalQuestions - Total number of questions
 * @property description - Exam description
 */
export interface ExamInfo {
  id: string
  title: string
  duration: number
  totalQuestions: number
  description: string
}

// ==========================================
// SCORE INTERFACE
// ==========================================

/**
 * Score information for the exam
 * 
 * @property total - Total score achieved
 * @property max - Maximum possible score
 * @property percentage - Score as percentage (0-100)
 * @property grade - Letter grade (A, B, C, D, F)
 * @property passed - Whether student passed (typically 50% or higher)
 * @property timeTaken - Time spent on exam in seconds
 */
export interface Score {
  total: number
  max: number
  percentage: number
  grade: string
  passed: boolean
  timeTaken: number
}

// ==========================================
// SUBJECT BREAKDOWN INTERFACE
// ==========================================

/**
 * Performance breakdown by subject
 * 
 * @property name - Subject name (e.g., "Mathematics", "English")
 * @property score - Score achieved in this subject
 * @property max - Maximum possible score in this subject
 * @property correct - Number of correct answers
 * @property total - Total questions in this subject
 * @property percentage - Percentage score in this subject
 */
export interface SubjectBreakdown {
  name: string
  score: number
  max: number
  correct: number
  total: number
  percentage: number
}

// ==========================================
// QUESTION REVIEW INTERFACE
// ==========================================

/**
 * Detailed question information for review
 * 
 * @property id - Question ID
 * @property questionNumber - Question number (1-based)
 * @property questionText - The question text (HTML)
 * @property options - Array of answer options
 * @property selectedAnswer - Student's selected answer
 * @property correctAnswer - The correct answer
 * @property isCorrect - Whether student answered correctly
 * @property explanation - Explanation of the correct answer
 * @property subject - Subject this question belongs to
 * @property difficulty - Difficulty level (EASY, MEDIUM, HARD)
 * @property pointsEarned - Points earned for this question
 * @property timeSpent - Time spent on this question in seconds
 */
export interface ReviewQuestion {
  id: string
  questionNumber: number
  questionText: string
  options: Array<{
    label: string
    text: string
  }>
  selectedAnswer: string | null
  correctAnswer: string
  isCorrect: boolean
  explanation: string
  subject: string
  difficulty: string
  pointsEarned: number
  timeSpent: number
}

// ==========================================
// ANALYTICS INTERFACE
// ==========================================

/**
 * Premium analytics data (only for non-TRIAL users)
 * 
 * @property improvement - Percentage improvement from previous attempt
 * @property predictedScore - Predicted JAMB score (0-400)
 * @property rankingPercentile - Student's ranking percentile
 * @property strengthsChart - Subjects where student excels
 * @property weaknessesChart - Subjects needing improvement
 * @property topicBreakdown - Performance by topic
 */
export interface Analytics {
  improvement: number
  predictedScore: number
  rankingPercentile: number
  strengthsChart: Array<{
    subject: string
    accuracy: number
  }>
  weaknessesChart: Array<{
    subject: string
    accuracy: number
  }>
  topicBreakdown: any[]
}

// ==========================================
// MAIN EXAM RESULTS INTERFACE
// ==========================================

/**
 * Complete exam results structure
 * 
 * This is the main response from GET /api/student/results/:studentExamId
 * 
 * @property exam - Exam information
 * @property score - Score details
 * @property subjects - Subject-wise breakdown
 * @property questions - Detailed question review data
 * @property analytics - Premium analytics (optional, only for non-TRIAL users)
 * @property canRetake - Whether exam can be retaken
 * @property attemptNumber - Which attempt this is
 * @property submittedAt - When exam was submitted (ISO timestamp)
 */
export interface ExamResults {
  exam: ExamInfo
  score: Score
  subjects: SubjectBreakdown[]
  questions: ReviewQuestion[]
  analytics?: Analytics
  canRetake: boolean
  attemptNumber: number
  submittedAt: string
}

// ==========================================
// RETAKE RESPONSE INTERFACE
// ==========================================

/**
 * Response when starting a retake
 * 
 * @property success - Whether retake was started successfully
 * @property studentExamId - New student exam ID for the retake
 * @property message - Optional message
 */
export interface RetakeResponse {
  success: boolean
  studentExamId: string
  message?: string
}
