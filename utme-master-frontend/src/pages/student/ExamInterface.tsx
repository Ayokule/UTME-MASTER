// ==========================================
// EXAM TAKING INTERFACE
// ==========================================
import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, ChevronLeft, ChevronRight, Flag, CheckCircle, Send, Home, AlertTriangle, X, LogOut } from 'lucide-react'
import { useAuthStore } from '../../store/auth'
import * as examAPI from '../../api/exams'
import { showToast } from '../../components/ui/Toast'

interface Question {
  id: string
  questionText: string
  options: any[]
  images?: string[]
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
// MODAL COMPONENT — timer-safe (no state pause)
// ==========================================
function ConfirmModal({
  open,
  title,
  icon,
  iconColor,
  children,
  confirmLabel,
  confirmClass,
  onConfirm,
  onCancel
}: {
  open: boolean
  title: string
  icon: React.ReactNode
  iconColor: string
  children: React.ReactNode
  confirmLabel: string
  confirmClass: string
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop — does NOT pause timer, just visual overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ duration: 0.2 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
      >
        <button onClick={onCancel} className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-lg">
          <X className="w-5 h-5" />
        </button>

        <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${iconColor}`}>
          {icon}
        </div>

        <h2 className="text-xl font-bold text-gray-900 text-center mb-2">{title}</h2>
        <div className="text-gray-600 text-sm text-center mb-6">{children}</div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-3 rounded-xl font-bold text-white transition-colors ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function ExamInterface() {
  const { studentExamId } = useParams<{ studentExamId: string }>()
  const navigate = useNavigate()
  const { token } = useAuthStore()

  const [examData, setExamData] = useState<ExamData | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set())
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const [submitting, setSubmitting] = useState(false)

  // Modal state — opening a modal does NOT touch the timer
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [showExitModal, setShowExitModal] = useState(false)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerStarted = useRef(false)
  const examDataRef = useRef<ExamData | null>(null)
  const submittingRef = useRef(false)

  // Keep refs in sync
  useEffect(() => { examDataRef.current = examData }, [examData])
  useEffect(() => { submittingRef.current = submitting }, [submitting])

  // Load exam on mount
  useEffect(() => {
    loadExam()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [studentExamId, token])

  // Start timer once timeRemaining is populated — never pauses
  useEffect(() => {
    if (timeRemaining <= 0 || timerStarted.current) return
    timerStarted.current = true
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          // Use refs to avoid stale closure
          if (!submittingRef.current && examDataRef.current) {
            doAutoSubmit(examDataRef.current.studentExamId)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRemaining])

  async function loadExam() {
    if (!studentExamId || !token) {
      navigate('/student/dashboard')
      return
    }
    setLoading(true)
    try {
      const data = await examAPI.resumeExam(studentExamId)
      if (!data?.data?.questions || data.data.questions.length === 0) {
        throw new Error('No questions available for this exam')
      }
      setExamData(data.data)
      setTimeRemaining(data.data.timeRemaining || 0)
      if (data.data.savedAnswers) setAnswers(data.data.savedAnswers)
    } catch (error: any) {
      const msg = error.response?.data?.error?.message || error.message || 'Failed to load exam'
      setErrorMessage(msg)
    } finally {
      setLoading(false)
    }
  }

  async function submitAnswer(questionId: string, answer: any) {
    if (!examData) return
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000)
    try {
      await examAPI.submitAnswer(examData.studentExamId, questionId, answer, timeSpent)
    } catch { /* silent — answer save failures don't break exam */ }
  }

  function handleAnswerChange(questionId: string, answer: any) {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
    submitAnswer(questionId, answer)
  }

  function goToQuestion(index: number) {
    setCurrentIndex(index)
    setQuestionStartTime(Date.now())
  }

  function toggleFlag() {
    if (!examData?.questions?.[currentIndex]) return
    const questionId = examData.questions[currentIndex].id
    setFlaggedQuestions(prev => {
      const next = new Set(prev)
      next.has(questionId) ? next.delete(questionId) : next.add(questionId)
      return next
    })
  }

  // Report flagged questions to admin/teacher then submit
  async function reportAndSubmit(studentExamIdArg: string) {
    if (flaggedQuestions.size > 0) {
      try {
        await examAPI.reportFlaggedQuestions(studentExamIdArg, Array.from(flaggedQuestions))
      } catch { /* non-blocking */ }
    }
    const data = await examAPI.submitExam(studentExamIdArg)
    return data
  }

  async function handleConfirmSubmit() {
    if (!examData) return
    setShowSubmitModal(false)
    setSubmitting(true)
    try {
      const data = await reportAndSubmit(examData.studentExamId)
      navigate(`/student/results/${examData.studentExamId}`, { state: { results: data.data } })
    } catch (error: any) {
      showToast.error('Failed to submit exam. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function doAutoSubmit(sid: string) {
    submittingRef.current = true
    setSubmitting(true)
    try {
      if (flaggedQuestions.size > 0) {
        await examAPI.reportFlaggedQuestions(sid, Array.from(flaggedQuestions)).catch(() => {})
      }
      const data = await examAPI.submitExam(sid, true)
      navigate(`/student/results/${sid}`, { state: { results: data.data } })
    } catch { /* auto-submit best effort */ }
  }

  function handleConfirmExit() {
    setShowExitModal(false)
    navigate('/student/dashboard')
  }

  function formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  // ==========================================
  // LOADING STATE
  // ==========================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Preparing Your Exam</h2>
          <p className="text-gray-600">Loading questions...</p>
        </motion.div>
      </div>
    )
  }

  // ==========================================
  // ERROR STATE — shown to student, not debug panel
  // ==========================================
  if (errorMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to Start Exam</h2>
          <p className="text-gray-600 mb-6">{errorMessage}</p>
          <button
            onClick={() => navigate('/student/exams')}
            className="w-full px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700"
          >
            Back to Exams
          </button>
        </motion.div>
      </div>
    )
  }

  if (!examData?.questions?.length) {
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
  if (!currentQuestion) return null

  const currentAnswer = answers[currentQuestion.id]
  const isFlagged = flaggedQuestions.has(currentQuestion.id)
  const answeredCount = Object.keys(answers).length
  const unansweredCount = examData.totalQuestions - answeredCount
  const progress = (answeredCount / examData.totalQuestions) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">

      {/* ==========================================
          MODALS — rendered outside layout, timer keeps running
          ========================================== */}
      <AnimatePresence>
        {showSubmitModal && (
          <ConfirmModal
            open={showSubmitModal}
            title="Submit Exam?"
            icon={<Send className="w-7 h-7 text-green-600" />}
            iconColor="bg-green-100"
            confirmLabel="Yes, Submit"
            confirmClass="bg-green-600 hover:bg-green-700"
            onConfirm={handleConfirmSubmit}
            onCancel={() => setShowSubmitModal(false)}
          >
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3 my-4">
                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-green-700">{answeredCount}</p>
                  <p className="text-xs text-green-600 mt-1">Answered</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-amber-700">{unansweredCount}</p>
                  <p className="text-xs text-amber-600 mt-1">Unanswered</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-blue-700">{flaggedQuestions.size}</p>
                  <p className="text-xs text-blue-600 mt-1">Flagged</p>
                </div>
              </div>
              {unansweredCount > 0 && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-left">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-700">You have {unansweredCount} unanswered question{unansweredCount > 1 ? 's' : ''}. Unanswered questions score zero.</p>
                </div>
              )}
              {flaggedQuestions.size > 0 && (
                <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-left">
                  <Flag className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-700">{flaggedQuestions.size} flagged question{flaggedQuestions.size > 1 ? 's' : ''} will be reported to your teacher for review.</p>
                </div>
              )}
              <p className="text-xs text-gray-500">You cannot change your answers after submitting.</p>
            </div>
          </ConfirmModal>
        )}

        {showExitModal && (
          <ConfirmModal
            open={showExitModal}
            title="Exit Exam?"
            icon={<LogOut className="w-7 h-7 text-orange-600" />}
            iconColor="bg-orange-100"
            confirmLabel="Exit Exam"
            confirmClass="bg-orange-600 hover:bg-orange-700"
            onConfirm={handleConfirmExit}
            onCancel={() => setShowExitModal(false)}
          >
            <div className="space-y-3">
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800 font-medium">Your progress will be saved.</p>
                <p className="text-xs text-orange-700 mt-1">You can resume this exam later from the exam selection page. The timer will continue running.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-gray-700">{answeredCount}/{examData.totalQuestions}</p>
                  <p className="text-xs text-gray-500 mt-1">Answered</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-gray-700">{formatTime(timeRemaining)}</p>
                  <p className="text-xs text-gray-500 mt-1">Time Left</p>
                </div>
              </div>
            </div>
          </ConfirmModal>
        )}
      </AnimatePresence>

      {/* ==========================================
          HEADER
          ========================================== */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setShowExitModal(true)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <Home className="w-5 h-5" />
              </motion.button>
              <div>
                <h1 className="text-lg font-bold text-gray-900">{examData.examTitle}</h1>
                <p className="text-xs text-gray-500">Question {currentIndex + 1} of {examData.totalQuestions}</p>
              </div>
            </div>

            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm ${
                timeRemaining < 300 ? 'bg-red-100 text-red-700 animate-pulse' :
                timeRemaining < 600 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
              }`}>
              <Clock className="w-4 h-4" />
              {formatTime(timeRemaining)}
            </motion.div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full" />
          </div>
          <p className="text-xs text-gray-600 mt-1">{answeredCount} / {examData.totalQuestions} answered</p>
        </div>
      </motion.div>

      {/* ==========================================
          MAIN CONTENT
          ========================================== */}
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

                <button onClick={toggleFlag}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isFlagged ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-gray-100 text-gray-600 hover:bg-amber-100 hover:text-amber-700'
                  }`}
                  title={isFlagged ? 'Remove flag' : 'Flag for teacher review'}>
                  <Flag className="w-4 h-4" fill={isFlagged ? 'currentColor' : 'none'} />
                  {isFlagged ? 'Flagged' : 'Flag'}
                </button>
              </div>

              {/* Question Text */}
              <div className="mb-8">
                <div className="text-lg text-gray-900 leading-relaxed" dangerouslySetInnerHTML={{ __html: currentQuestion.questionText }} />
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
                    <button key={option.label}
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
                      }`}>
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

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <button onClick={() => goToQuestion(currentIndex - 1)} disabled={currentIndex === 0}
                className="px-6 py-3 bg-white border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2">
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>

              {currentIndex === examData.totalQuestions - 1 ? (
                <button onClick={() => setShowSubmitModal(true)} disabled={submitting}
                  className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 flex items-center gap-2">
                  {submitting ? 'Submitting...' : <><Send className="w-5 h-5" />Submit Exam</>}
                </button>
              ) : (
                <button onClick={() => goToQuestion(currentIndex + 1)}
                  className="px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 flex items-center gap-2">
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
                  const isAnswered = !!answers[q.id]
                  const isCurrent = idx === currentIndex
                  const isFlaggedQ = flaggedQuestions.has(q.id)

                  return (
                    <button key={q.id} onClick={() => goToQuestion(idx)}
                      className={`aspect-square rounded-lg font-semibold text-sm relative ${
                        isCurrent ? 'bg-primary-600 text-white ring-2 ring-primary-300' :
                        isAnswered ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                        'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}>
                      {idx + 1}
                      {isFlaggedQ && <Flag className="w-3 h-3 absolute -top-1 -right-1 text-amber-500" fill="currentColor" />}
                    </button>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="space-y-2 text-xs mb-6">
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-green-100" /><span className="text-gray-600">Answered</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-gray-100" /><span className="text-gray-600">Not Answered</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-primary-600" /><span className="text-gray-600">Current</span></div>
                <div className="flex items-center gap-2"><Flag className="w-4 h-4 text-amber-500" fill="currentColor" /><span className="text-gray-600">Flagged</span></div>
              </div>

              {flaggedQuestions.size > 0 && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-700 font-medium">{flaggedQuestions.size} question{flaggedQuestions.size > 1 ? 's' : ''} flagged</p>
                  <p className="text-xs text-amber-600 mt-0.5">Will be reported to teacher on submit</p>
                </div>
              )}

              <button onClick={() => setShowSubmitModal(true)} disabled={submitting}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:opacity-50">
                Submit Exam
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
