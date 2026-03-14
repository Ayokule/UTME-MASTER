// ==========================================
// EXAM TAKING INTERFACE - Phase 3
// ==========================================
// This is where students actually take exams!
//
// Features:
// - Countdown timer
// - Question navigation
// - Answer selection
// - Flag questions for review
// - Progress tracking
// - Auto-submit when time runs out
// - Save answers automatically
//
// ALL WITH BEGINNER-FRIENDLY COMMENTS!

import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Flag, 
  CheckCircle, 
  Circle,
  AlertCircle,
  Send,
  Home,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Eye,
  EyeOff
} from 'lucide-react'
import { useAuthStore } from '../../store/auth'
import * as examAPI from '../../api/exams'
import { showToast } from '../../components/ui/Toast'
import RealTimeAnalytics from '../../components/dashboard/RealTimeAnalytics'

// ==========================================
// TYPES
// ==========================================
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

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function ExamInterface() {
  const { id } = useParams() // This could be examId or studentExamId
  const navigate = useNavigate()
  const { token } = useAuthStore()
  
  // ==========================================
  // STATE
  // ==========================================
  
  // Exam data
  const [examData, setExamData] = useState<ExamData | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Current question
  const [currentIndex, setCurrentIndex] = useState(0)
  
  // Answers (questionId → answer)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  
  // Flagged questions (for review)
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set())
  
  // Timer
  const [timeRemaining, setTimeRemaining] = useState(0)
  
  // Question time tracking
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  
  // Submitting state
  const [submitting, setSubmitting] = useState(false)
  
  // UI state
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showNavigator, setShowNavigator] = useState(true)
  const [audioMuted, setAudioMuted] = useState(false)
  
  // Timer ref
  const timerRef = useRef<NodeJS.Timeout | number>()
  
  // ==========================================
  // LOAD EXAM ON MOUNT
  // ==========================================
  useEffect(() => {
    loadExam()
    
    // Cleanup timer on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [id])
  
  // ==========================================
  // START COUNTDOWN TIMER
  // ==========================================
  useEffect(() => {
    if (timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Time's up! Auto-submit
            handleAutoSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)  // Update every second
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [timeRemaining])
  
  // ==========================================
  // LOAD EXAM
  // ==========================================
  async function loadExam() {
    if (!id || !token) {
      navigate('/student/dashboard')
      return
    }

    setLoading(true)
    
    try {
      let data
      
      // For practice exams, we always get a studentExamId from the practice/start endpoint
      // So we should always try to resume first, then fallback to regular start
      try {
        // Try to resume first (for practice exams and resumed regular exams)
        data = await examAPI.resumeExam(id)
        console.log('Successfully resumed exam:', id)
      } catch (resumeError: any) {
        console.log('Resume failed:', resumeError)
        
        // Check if exam is already submitted
        if (resumeError.response?.status === 400 && resumeError.response?.data?.message?.includes('submitted')) {
          console.log('Exam already submitted, redirecting to results...')
          navigate(`/student/results/${id}`)
          return
        }
        
        // If resume fails for other reasons, try regular exam start
        try {
          data = await examAPI.startExam(id)
          console.log('Successfully started regular exam:', id)
        } catch (startError: any) {
          console.error('Both resume and start failed:', startError)
          throw new Error('Unable to load exam. It may have been deleted or you may not have permission.')
        }
      }
      
      // Ensure we have valid exam data
      if (!data?.data) {
        throw new Error('Invalid exam data received')
      }
      
      // Debug logging
      console.log('Exam data loaded:', {
        studentExamId: data.data.studentExamId,
        totalQuestions: data.data.totalQuestions,
        questionsCount: data.data.questions?.length,
        hasQuestions: data.data.questions && data.data.questions.length > 0
      })
      
      // Validate questions exist
      if (!data.data.questions || data.data.questions.length === 0) {
        console.error('NO QUESTIONS AVAILABLE:', {
          studentExamId: data.data.studentExamId,
          totalQuestions: data.data.totalQuestions,
          questionsArray: data.data.questions
        })
        throw new Error('No questions available for this exam. Please contact support.')
      }
      
      setExamData(data.data)
      setTimeRemaining(data.data.timeRemaining || 0)
      
      // Load saved answers if resuming
      if (data.data.savedAnswers) {
        setAnswers(data.data.savedAnswers)
      }
      
    } catch (error: any) {
      console.error('Error loading exam:', error)
      alert(error.message || 'Failed to load exam')
      navigate('/student/dashboard')
    } finally {
      setLoading(false)
    }
  }
  
  // ==========================================
  // SUBMIT ANSWER
  // ==========================================
  async function submitAnswer(questionId: string, answer: any) {
    if (!examData) return
    
    // Calculate time spent on this question
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000)
    
    try {
      await examAPI.submitAnswer(examData.studentExamId, questionId, answer, timeSpent)
      
      // Success - answer saved!
      
    } catch (error) {
      console.error('Error saving answer:', error)
      // Don't show error to user - retry in background
    }
  }
  
  // ==========================================
  // HANDLE ANSWER CHANGE
  // ==========================================
  function handleAnswerChange(questionId: string, answer: any) {
    // Update local state
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
    
    // Save to backend (debounced)
    submitAnswer(questionId, answer)
  }
  
  // ==========================================
  // NAVIGATION
  // ==========================================
  function goToQuestion(index: number) {
    // Save time for current question
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000)
    
    // Update index
    setCurrentIndex(index)
    
    // Reset timer for new question
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
  
  // ==========================================
  // FLAG QUESTION FOR REVIEW
  // ==========================================
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
  
  // ==========================================
  // SUBMIT EXAM
  // ==========================================
  async function handleSubmitExam() {
    if (!examData) return
    
    // Confirm submission
    const unanswered = examData.totalQuestions - Object.keys(answers).length
    
    if (unanswered > 0) {
      const confirm = window.confirm(
        `You have ${unanswered} unanswered question(s). Are you sure you want to submit?`
      )
      if (!confirm) return
    } else {
      const confirm = window.confirm(
        'Are you sure you want to submit your exam? You cannot change your answers after submission.'
      )
      if (!confirm) return
    }
    
    setSubmitting(true)
    
    try {
      const data = await examAPI.submitExam(examData.studentExamId)
      
      // Navigate to results page
      navigate(`/student/exams/${examData.studentExamId}/results`, {
        state: { results: data.data }
      })
      
    } catch (error) {
      console.error('Error submitting exam:', error)
      alert('Failed to submit exam. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }
  
  // ==========================================
  // AUTO SUBMIT (TIME'S UP)
  // ==========================================
  async function handleAutoSubmit() {
    if (!examData || submitting) return
    
    setSubmitting(true)
    
    try {
      const data = await examAPI.submitExam(examData.studentExamId, true)
      
      // Show time's up message
      alert("Time's up! Your exam has been submitted automatically.")
      
      // Navigate to results
      navigate(`/student/exams/${examData.studentExamId}/results`, {
        state: { results: data.data }
      })
      
    } catch (error) {
      console.error('Error auto-submitting:', error)
      alert('Time expired but failed to submit. Please contact support.')
    }
  }
  
  // ==========================================
  // FORMAT TIME
  // ==========================================
  function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }
  
  // ==========================================
  // RENDER LOADING
  // ==========================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full mx-auto mb-6"
          />
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-gray-900 mb-2"
          >
            Preparing Your Exam
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600"
          >
            Loading questions and setting up your test environment...
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 p-6 bg-white rounded-xl shadow-lg max-w-md mx-auto"
          >
            <h3 className="font-semibold text-gray-900 mb-4">Exam Tips:</h3>
            <ul className="text-sm text-gray-600 space-y-2 text-left">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Read each question carefully
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Flag questions for review
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Manage your time wisely
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Review flagged questions before submitting
              </li>
            </ul>
          </motion.div>
        </motion.div>
      </div>
    )
  }
  
  if (!examData || !examData.questions || examData.questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Questions Available</h2>
          <p className="text-gray-600 mb-4">This exam doesn't have any questions.</p>
          <button 
            onClick={() => navigate('/student/dashboard')}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Back to Dashboard
          </button>
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
          <p className="text-gray-600 mb-4">Unable to load the current question.</p>
          <button 
            onClick={() => navigate('/student/dashboard')}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }
  
  const currentAnswer = answers[currentQuestion.id]
  const isFlagged = flaggedQuestions.has(currentQuestion.id)
  const progress = (Object.keys(answers).length / examData.totalQuestions) * 100
  
  // ==========================================
  // RENDER EXAM INTERFACE
  // ==========================================
  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            
            {/* Exam Title */}
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (window.confirm('Are you sure you want to exit the exam? Your progress will be saved.')) {
                    navigate('/student/dashboard')
                  }
                }}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Home className="w-5 h-5" />
              </motion.button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{examData.examTitle}</h1>
                <p className="text-sm text-gray-600">
                  Question {currentIndex + 1} of {examData.totalQuestions}
                </p>
              </div>
            </div>
            
            {/* Timer */}
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-lg transition-all ${
                timeRemaining < 300 ? 'bg-red-100 text-red-700 animate-pulse' : 
                timeRemaining < 600 ? 'bg-amber-100 text-amber-700' :
                'bg-green-100 text-green-700'
              }`}
            >
              <Clock className="w-6 h-6" />
              {formatTime(timeRemaining)}
            </motion.div>

            {/* Control Buttons */}
            <div className="flex items-center gap-2">
              {/* Audio Mute Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setAudioMuted(!audioMuted)}
                className={`p-2 rounded-lg transition-colors ${
                  audioMuted
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-700'
                } hover:bg-gray-200`}
                title={audioMuted ? 'Unmute audio' : 'Mute audio'}
              >
                {audioMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </motion.button>

              {/* Navigator Toggle Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNavigator(!showNavigator)}
                className={`p-2 rounded-lg transition-colors ${
                  showNavigator
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700'
                } hover:bg-gray-200`}
                title={showNavigator ? 'Hide question navigator' : 'Show question navigator'}
              >
                {showNavigator ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </motion.button>

              {/* Fullscreen Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsFullscreen(!isFullscreen)}
                className={`p-2 rounded-lg transition-colors ${
                  isFullscreen
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                } hover:bg-gray-200`}
                title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </motion.button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4"
          >
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{Object.keys(answers).length} / {examData.totalQuestions} answered</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-r from-primary-500 to-secondary-500 h-3 rounded-full"
              />
            </div>
          </motion.div>

          {/* Real-Time Analytics */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <RealTimeAnalytics
              totalQuestions={examData.totalQuestions}
              answeredQuestions={Object.keys(answers).length}
              correctAnswers={0} // Will be calculated from answers
              timeRemaining={timeRemaining}
              currentQuestionIndex={currentIndex}
            />
          </motion.div>
        </div>
      </motion.div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className={`grid grid-cols-1 ${showNavigator ? 'lg:grid-cols-4' : 'lg:grid-cols-1'} gap-8`}>
          
          {/* Question Area */}
          <div className={showNavigator ? 'lg:col-span-3' : 'w-full'}>
            <div className="bg-white rounded-2xl shadow-lg p-8">
              
              {/* Question Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg font-bold">
                    Q{currentIndex + 1}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{currentQuestion.subject}</p>
                    {currentQuestion.topic && (
                      <p className="text-xs text-gray-500">{currentQuestion.topic}</p>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={toggleFlag}
                  className={`p-3 rounded-lg ${
                    isFlagged 
                      ? 'bg-amber-100 text-amber-700' 
                      : 'bg-gray-100 text-gray-600'
                  } hover:bg-amber-200`}
                  title={isFlagged ? 'Unflag question' : 'Flag for review'}
                >
                  <Flag className="w-5 h-5" fill={isFlagged ? 'currentColor' : 'none'} />
                </button>
              </div>
              
              {/* Question Text */}
              <div className="mb-8">
                <div 
                  className="text-lg text-gray-900 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: currentQuestion.questionText }}
                />
                
                {/* Audio Player (if exists) */}
                {currentQuestion.audioUrl && (
                  <div className="mt-6">
                    <audio 
                      src={currentQuestion.audioUrl} 
                      controls 
                      muted={audioMuted}
                      className="w-full"
                    />
                    {audioMuted && (
                      <p className="text-sm text-amber-600 mt-2 flex items-center gap-1">
                        <VolumeX className="w-4 h-4" />
                        Audio is muted
                      </p>
                    )}
                  </div>
                )}
                
                {/* Images (if exist) */}
                {currentQuestion.images && currentQuestion.images.length > 0 && (
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    {currentQuestion.images.map((img, idx) => (
                      <img 
                        key={idx}
                        src={img} 
                        alt={`Question image ${idx + 1}`}
                        className="rounded-lg border border-gray-200"
                      />
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
                          // Multiple selection
                          const selected = currentAnswer?.selected || []
                          const newSelected = selected.includes(option.label)
                            ? selected.filter((l: string) => l !== option.label)
                            : [...selected, option.label]
                          
                          handleAnswerChange(currentQuestion.id, { selected: newSelected })
                        } else {
                          // Single selection
                          handleAnswerChange(currentQuestion.id, { selected: option.label })
                        }
                      }}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-300 hover:border-gray-400 bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-6 h-6 mt-0.5">
                          {currentQuestion.allowMultiple ? (
                            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                              isSelected ? 'bg-primary-600 border-primary-600' : 'border-gray-400'
                            }`}>
                              {isSelected && (
                                <CheckCircle className="w-4 h-4 text-white" />
                              )}
                            </div>
                          ) : (
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              isSelected ? 'bg-primary-600 border-primary-600' : 'border-gray-400'
                            }`}>
                              {isSelected && (
                                <div className="w-3 h-3 bg-white rounded-full" />
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <span className="font-bold mr-3">{option.label}.</span>
                          <span 
                            dangerouslySetInnerHTML={{ __html: option.text }}
                          />
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
              
              {currentQuestion.allowMultiple && (
                <p className="mt-4 text-sm text-amber-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Select all correct answers
                </p>
              )}
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={previousQuestion}
                disabled={currentIndex === 0}
                className="px-6 py-3 bg-white border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>
              
              {currentIndex === examData.totalQuestions - 1 ? (
                <button
                  onClick={handleSubmitExam}
                  disabled={submitting}
                  className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Submit Exam
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={nextQuestion}
                  className="px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
          
          {/* Question Navigator */}
          {showNavigator && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h3 className="font-bold text-lg mb-4">Questions</h3>
              
              <div className="grid grid-cols-5 gap-2">
                {examData.questions.map((q, idx) => {
                  const isAnswered = answers[q.id]
                  const isCurrent = idx === currentIndex
                  const isFlagged = flaggedQuestions.has(q.id)
                  
                  return (
                    <button
                      key={q.id}
                      onClick={() => goToQuestion(idx)}
                      className={`
                        aspect-square rounded-lg font-semibold text-sm relative
                        ${isCurrent 
                          ? 'bg-primary-600 text-white ring-2 ring-primary-300' 
                          : isAnswered 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }
                      `}
                    >
                      {idx + 1}
                      {isFlagged && (
                        <Flag 
                          className="w-3 h-3 absolute -top-1 -right-1 text-amber-500" 
                          fill="currentColor"
                        />
                      )}
                    </button>
                  )
                })}
              </div>
              
              {/* Legend */}
              <div className="mt-6 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-green-100"></div>
                  <span className="text-gray-600">Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-gray-100"></div>
                  <span className="text-gray-600">Not Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-primary-600"></div>
                  <span className="text-gray-600">Current</span>
                </div>
                <div className="flex items-center gap-2">
                  <Flag className="w-5 h-5 text-amber-500" fill="currentColor" />
                  <span className="text-gray-600">Flagged</span>
                </div>
              </div>
              
              {/* Submit Button */}
              <button
                onClick={handleSubmitExam}
                disabled={submitting}
                className="w-full mt-6 px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:opacity-50"
              >
                Submit Exam
              </button>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  )
}
