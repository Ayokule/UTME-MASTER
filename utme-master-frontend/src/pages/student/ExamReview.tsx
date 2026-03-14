// ==========================================
// EXAM REVIEW PAGE
// ==========================================
// Shows detailed review of exam answers
// Student can see correct/incorrect answers
// with explanations

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, ArrowLeft, Download } from 'lucide-react'
import Layout from '../../components/Layout'
import { getReviewQuestions, getExamResults } from '../../api/exams'
import { showToast } from '../../components/ui/Toast'

interface ReviewQuestion {
  id: string
  questionText: string
  subject: string
  options: any[]
  studentAnswer: string
  isCorrect: boolean
  explanation: string
}

interface ExamResults {
  studentExamId: string
  examTitle: string
  totalQuestions: number
  answeredQuestions: number
  correctAnswers: number
  wrongAnswers: number
  score: number
  totalMarks: number
  scorePercentage: string
  passed: boolean
  grade: string
  passMarks: number
  submittedAt: string
}

export default function ExamReview() {
  const { studentExamId } = useParams()
  const navigate = useNavigate()

  const [questions, setQuestions] = useState<ReviewQuestion[]>([])
  const [results, setResults] = useState<ExamResults | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null)

  useEffect(() => {
    loadReview()
  }, [studentExamId])

  async function loadReview() {
    if (!studentExamId) {
      navigate('/student/dashboard')
      return
    }

    try {
      setLoading(true)
      const [questionsData, resultsData] = await Promise.all([
        getReviewQuestions(studentExamId),
        getExamResults(studentExamId)
      ])

      setQuestions(questionsData.data?.questions || [])
      setResults(resultsData.data)
    } catch (error: any) {
      console.error('Error loading review:', error)
      showToast.error('Failed to load exam review')
      navigate('/student/dashboard')
    } finally {
      setLoading(false)
    }
  }

  function downloadReview() {
    const reviewData = {
      exam: results,
      questions: questions,
      downloadedAt: new Date().toISOString()
    }

    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(reviewData, null, 2)))
    element.setAttribute('download', `exam-review-${studentExamId}.json`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading exam review...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (!results) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-600">No review data available</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/student/dashboard')}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </motion.button>

        {/* Results Summary */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-8 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {results.examTitle}
              </h1>
              <p className="text-gray-600">
                Submitted on {new Date(results.submittedAt).toLocaleDateString()}
              </p>
            </div>
            <div className={`text-center p-6 rounded-lg ${results.passed ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className={`text-4xl font-bold ${results.passed ? 'text-green-600' : 'text-red-600'}`}>
                {results.scorePercentage}%
              </p>
              <p className={`text-lg font-semibold ${results.passed ? 'text-green-700' : 'text-red-700'}`}>
                {results.passed ? 'PASSED' : 'FAILED'}
              </p>
              <p className="text-sm text-gray-600 mt-2">Grade: {results.grade}</p>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-gray-600 text-sm">Total Questions</p>
              <p className="text-2xl font-bold text-blue-600">{results.totalQuestions}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-gray-600 text-sm">Correct</p>
              <p className="text-2xl font-bold text-green-600">{results.correctAnswers}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-gray-600 text-sm">Wrong</p>
              <p className="text-2xl font-bold text-red-600">{results.wrongAnswers}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-gray-600 text-sm">Score</p>
              <p className="text-2xl font-bold text-purple-600">{results.score}/{results.totalMarks}</p>
            </div>
          </div>

          {/* Download Button */}
          <button
            onClick={downloadReview}
            className="mt-6 flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Download className="w-4 h-4" />
            Download Review
          </button>
        </motion.div>

        {/* Questions Review */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Question Review</h2>

          {questions.map((question, index) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              {/* Question Header */}
              <button
                onClick={() => setExpandedQuestion(expandedQuestion === question.id ? null : question.id)}
                className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-semibold text-gray-700">
                        Q{index + 1}
                      </span>
                      <span className="text-sm text-gray-600">{question.subject}</span>
                      {question.isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <p className="text-gray-900 font-semibold">
                      {question.questionText}
                    </p>
                  </div>
                </div>
              </button>

              {/* Expanded Content */}
              {expandedQuestion === question.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-gray-200 p-6 bg-gray-50"
                >
                  {/* Options */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Options:</h4>
                    <div className="space-y-2">
                      {question.options?.map((option: any, idx: number) => {
                        const label = ['A', 'B', 'C', 'D'][idx]
                        const isStudentAnswer = question.studentAnswer === label
                        const isCorrect = option.isCorrect

                        return (
                          <div
                            key={idx}
                            className={`p-3 rounded-lg border-2 ${
                              isStudentAnswer && isCorrect
                                ? 'border-green-500 bg-green-50'
                                : isStudentAnswer && !isCorrect
                                ? 'border-red-500 bg-red-50'
                                : isCorrect
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-200 bg-white'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <span className="font-bold text-gray-700 min-w-fit">{label}.</span>
                              <div className="flex-1">
                                <p className="text-gray-900">{option.text || option}</p>
                                {isStudentAnswer && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    ✓ Your answer
                                  </p>
                                )}
                                {isCorrect && !isStudentAnswer && (
                                  <p className="text-sm text-green-600 mt-1">
                                    ✓ Correct answer
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Explanation */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Explanation:</h4>
                    <p className="text-blue-800">{question.explanation}</p>
                  </div>

                  {/* Result Badge */}
                  <div className="mt-4">
                    {question.isCorrect ? (
                      <div className="flex items-center gap-2 text-green-600 font-semibold">
                        <CheckCircle className="w-5 h-5" />
                        Correct Answer
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-600 font-semibold">
                        <XCircle className="w-5 h-5" />
                        Incorrect Answer
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex gap-4"
        >
          <button
            onClick={() => navigate('/student/dashboard')}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => navigate('/student/subjects-simple')}
            className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700"
          >
            Take Another Exam
          </button>
        </motion.div>
      </div>
    </Layout>
  )
}
