// ==========================================
// EXAM TAKING INTERFACE
// ==========================================
import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, ChevronLeft, ChevronRight, Flag, CheckCircle, Send, Home } from 'lucide-react'
import { useAuthStore } from '../../store/auth'
import * as examAPI from '../../api/exams'
import { showToast } from '../../components/ui/Toast'

interface Question {
  id: string
  questionText: string
  options: any[]
  images?: string[]
  audioUrl?: string
  questionType: string
  allowMultiple: boolean
  subject: string
  topic?: string
}

interface ExamData {
  studentExamId: string
  examTitle: string
  duration: number
  totalQuestions: number
  totalMarks: number
  questions: Question[]
  savedAnswers?: any
}

export default function ExamInterface() {
  const { studentExamId } = useParams<{ studentExamId: string }>()
  const navigate = useNavigate()
  const { token } = useAuthStore()
  
  const [examData, setExamData] = useState<ExamData | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set())
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const [submitting, setSubmitting] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | number>()
  
  // Load exam on mount
  useEffect(() => {
    loadExam()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [studentExamId, token])
  
  // Timer effect - runs once on mount and manages countdown
  // Separated from timeRemaining dependency to prevent infinite loops
  useEffect(() => {
    // Only start timer if we have time remaining
    if (timeRemaining <= 0) return

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        // Check if time is up
        if (prev <= 1) {
          // Auto-submit will be called here
          handleAutoSubmit()
          return 0
        }
        // Decrement by 1 second
        return prev - 1
      })
    }, 1000)

    // Cleanup interval on unmount
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, []) // Empty dependency array - only run once on mount
  
  async function loadExam() {
    // Verify we have required parameters
    if (!studentExamId || !token) {
      console.warn('⚠️ [EXAM INTERFACE] Missing studentExamId or token, redirecting to dashboard')
      navigate('/student/dashboard')
      return
    }

    setLoading(true)
    try {
      // Resume the exam session (it was already started in ExamSelection)
      console.log('🔄 [EXAM INTERFACE] Resuming exam session:', studentExamId)
      const data = await examAPI.resumeExam(studentExamId)
      
      // Validate exam data
      if (!data?.data?.questions || data.data.questions.length === 0) {
        throw new Error('No questions available')
      }
      
      console.log('✅ [EXAM INTERFACE] Exam loaded successfully:', {
        studentExamId: data.data.studentExamId,
        totalQuestions: data.data.totalQuestions,
        timeRemaining: data.data.timeRemaining
      })
      
      setExamData(data.data)
      setTimeRemaining(data.data.timeRemaining || 0)
      if (data.data.savedAnswers) {
        setAnswers(data.data.savedAnswers)
      }
    } catch (error: any) {
      console.error('❌ [EXAM INTERFACE] Error loading exam:', error.message)
      showToast.error(error.message || 'Failed to load exam')
      navigate('/student/dashboard')
    } finally {
      setLoading(false)
    }
  }
  
  async function submitAnswer(questionId: string, answer: any) {
    if (!examData) return
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000)
    try {
      await examAPI.submitAnswer(examData.studentExamId, questionId, answer, timeSpent)
    } catch (error) {
      console.error('Error saving answer:', error)
    }
  }
  
  function handleAnswerChange(questionId: string, answer: any) {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
    submitAnswer(questionId, answer)
  }
  
  function goToQuestion(index: number) {
    setCurrentIndex(index)
    setQuestionStartTime(Date.now())
  }
  
  function nextQuestion() {
    if (currentIndex < examData!.totalQuestions - 1) {
      goToQuestion(currentIndex + 1)
    }
  }
  
  function previousQuestion() {
    if (currentIndex > 0) {
      goToQuestion(currentIndex - 1)
    }
  }
  
  function toggleFlag() {
    if (!examData?.questions?.[currentIndex]) return
    const questionId = examData.questions[currentIndex].id
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(questionId)) {
        newSet.delete(questionId)
      } else {
        newSet.add(questionId)
      }
      return newSet
    })
  }
  
  async function handleSubmitExam() {
    if (!examData) return
    
    const unanswered = examData.totalQuestions - Object.keys(answers).length
    if (unanswered > 0) {
      const confirm = window.confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`)
      if (!confirm) return
    } else {
      const confirm = window.confirm('Submit your exam? You cannot change answers after.')
      if (!confirm) return
    }
    
    setSubmitting(true)
    try {
      console.log('🔄 [EXAM SUBMIT] Submitting exam:', examData.studentExamId)
      const data = await examAPI.submitExam(examData.studentExamId)
      console.log('✅ [EXAM SUBMIT] Exam submitted successfully:', data)
      navigate(`/student/results/${examData.studentExamId}`, {
        state: { results: data.data }
      })
    } catch (error: any) {
      console.error('❌ [EXAM SUBMIT] Failed to submit exam:', {
        error: error.message,
        status: error.response?.status,
        endpoint: `/exams/${examData?.studentExamId}/submit`
      })
      showToast.error('Failed to submit exam')
    } finally {
      setSubmitting(false)
    }
  }
  
  async function handleAutoSubmit() {
    if (!examData || submitting) return
    setSubmitting(true)
    try {
      console.log('🔄 [EXAM AUTO-SUBMIT] Auto-submitting exam:', examData.studentExamId)
      const data = await examAPI.submitExam(examData.studentExamId, true)
      console.log('✅ [EXAM AUTO-SUBMIT] Exam auto-submitted successfully:', data)
      alert("Time's up! Exam submitted.")
      navigate(`/student/results/${examData.studentExamId}`, {
        state: { results: data.data }
      })
    } catch (error: any) {
      console.error('❌ [EXAM AUTO-SUBMIT] Auto-submit failed:', {
        error: error.message,
        status: error.response?.status
      })
    }
  }
  
  function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Preparing Your Exam</h2>
          <p className="text-gray-600">Loading questions...</p>
        </motion.div>
      </div>
    )
  }
  
  if (!examData || !examData.questions || examData.questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Questions Available</h2>
          <button onClick={() => navigate('/student/dashboard')} className="px-4 py-2 bg-primary-600 text-white rounded-lg">Back to Dashboard</button>
        </div>
      </div>
    )
  }
  
  const currentQuestion = examData.questions[currentIndex]
  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Question Not Found</h2>
          <button onClick={() => navigate('/student/dashboard')} className="px-4 py-2 bg-primary-600 text-white rounded-lg">Back to Dashboard</button>
        </div>
      </div>
    )
  }
  
  const currentAnswer = answers[currentQuestion.id]
  const isFlagged = flaggedQuestions.has(currentQuestion.id)
  const progress = (Object.keys(answers).length / examData.totalQuestions) * 100
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => {
                if (window.confirm('Exit exam? Progress will be saved.')) navigate('/student/dashboard')
              }} className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <Home className="w-5 h-5" />
              </motion.button>
              <div>
                <h1 className="text-lg font-bold text-gray-900">{examData.examTitle}</h1>
                <p className="text-xs text-gray-500">Question {currentIndex + 1} of {examData.totalQuestions}</p>
              </div>
            </div>
            
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm ${timeRemaining < 300 ? 'bg-red-100 text-red-700 animate-pulse' : timeRemaining < 600 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
              <Clock className="w-4 h-4" />
              {formatTime(timeRemaining)}
            </motion.div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full" />
          </div>
          <p className="text-xs text-gray-600 mt-2">{Object.keys(answers).length} / {examData.totalQuestions} answered</p>
        </div>
      </motion.div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Question Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              
              {/* Question Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg font-bold">Q{currentIndex + 1}</div>
                  <div>
                    <p className="text-sm text-gray-600">{currentQuestion.subject}</p>
                    {currentQuestion.topic && <p className="text-xs text-gray-500">{currentQuestion.topic}</p>}
                  </div>
                </div>
                
                <button onClick={toggleFlag} className={`p-3 rounded-lg ${isFlagged ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'} hover:bg-amber-200`} title={isFlagged ? 'Unflag' : 'Flag for review'}>
                  <Flag className="w-5 h-5" fill={isFlagged ? 'currentColor' : 'none'} />
                </button>
              </div>
              
              {/* Question Text */}
              <div className="mb-8">
                <div className="text-lg text-gray-900 leading-relaxed" dangerouslySetInnerHTML={{ __html: currentQuestion.questionText }} />
                
                {/* Images */}
                {currentQuestion.images && currentQuestion.images.length > 0 && (
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    {currentQuestion.images.map((img, idx) => (
                      <img key={idx} src={img} alt={`Q${idx + 1}`} className="rounded-lg border border-gray-200" />
                    ))}
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((option: any) => {
                  const isSelected = currentQuestion.allowMultiple
                    ? currentAnswer?.selected?.includes(option.label)
                    : currentAnswer?.selected === option.label
                  
                  return (
                    <button
                      key={option.label}
                      onClick={() => {
                        if (currentQuestion.allowMultiple) {
                          const selected = currentAnswer?.selected || []
                          const newSelected = selected.includes(option.label)
                            ? selected.filter((l: string) => l !== option.label)
                            : [...selected, option.label]
                          handleAnswerChange(currentQuestion.id, { selected: newSelected })
                        } else {
                          handleAnswerChange(currentQuestion.id, { selected: option.label })
                        }
                      }}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        isSelected ? 'border-primary-600 bg-primary-50' : 'border-gray-300 hover:border-gray-400 bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-6 h-6 mt-0.5">
                          {currentQuestion.allowMultiple ? (
                            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${isSelected ? 'bg-primary-600 border-primary-600' : 'border-gray-400'}`}>
                              {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                            </div>
                          ) : (
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'bg-primary-600 border-primary-600' : 'border-gray-400'}`}>
                              {isSelected && <div className="w-3 h-3 bg-white rounded-full" />}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <span className="font-bold mr-3">{option.label}.</span>
                          <span dangerouslySetInnerHTML={{ __html: option.text }} />
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-6">
              <button onClick={previousQuestion} disabled={currentIndex === 0} className="px-6 py-3 bg-white border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2">
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>
              
              {currentIndex === examData.totalQuestions - 1 ? (
                <button onClick={handleSubmitExam} disabled={submitting} className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 flex items-center gap-2">
                  {submitting ? 'Submitting...' : <>
                    <Send className="w-5 h-5" />
                    Submit Exam
                  </>}
                </button>
              ) : (
                <button onClick={nextQuestion} className="px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 flex items-center gap-2">
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
          
          {/* Question Navigator */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h3 className="font-bold text-lg mb-4">Questions</h3>
              
              <div className="grid grid-cols-5 gap-2 mb-6">
                {examData.questions.map((q, idx) => {
                  const isAnswered = answers[q.id]
                  const isCurrent = idx === currentIndex
                  const isFlaggedQ = flaggedQuestions.has(q.id)
                  
                  return (
                    <button
                      key={q.id}
                      onClick={() => goToQuestion(idx)}
                      className={`aspect-square rounded-lg font-semibold text-sm relative ${
                        isCurrent ? 'bg-primary-600 text-white ring-2 ring-primary-300' : isAnswered ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {idx + 1}
                      {isFlaggedQ && <Flag className="w-3 h-3 absolute -top-1 -right-1 text-amber-500" fill="currentColor" />}
                    </button>
                  )
                })}
              </div>
              
              {/* Legend */}
              <div className="space-y-2 text-sm mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-100"></div>
                  <span className="text-gray-600">Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gray-100"></div>
                  <span className="text-gray-600">Not Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-primary-600"></div>
                  <span className="text-gray-600">Current</span>
                </div>
              </div>
              
              {/* Submit Button */}
              <button onClick={handleSubmitExam} disabled={submitting} className="w-full px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:opacity-50">
                Submit Exam
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
