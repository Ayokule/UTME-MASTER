// ==========================================
// EXAM START PAGE
// ==========================================
// Student selects exam parameters and starts
// Simple form with clear options

import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, ArrowLeft, Loader } from 'lucide-react'
import Layout from '../../components/Layout'
import { startPracticeExam } from '../../api/exams'
import { showToast } from '../../components/ui/Toast'
import { useAuthStore } from '../../store/auth'

interface LocationState {
  subjectId?:
 string
  subjectName?: string
  subjectCode?: string
}

export default function ExamStart() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()
  
  const state = location.state as LocationState || {}
  const { subjectName = '', subjectCode = '' } = state

  const [examType, setExamType] = useState('JAMB')
  const [difficulty, setDifficulty] = useState('EASY')
  const [questionCount, setQuestionCount] = useState(10)
  const [duration, setDuration] = useState(60)
  const [loading, setLoading] = useState(false)

  const handleStartExam = async () => {
    if (!subjectName) {
      showToast.error('Subject not selected')
      return
    }

    try {
      setLoading(true)
      console.log('Starting exam with params:', {
        subject: subjectName,
        examType,
        difficulty,
        questionCount,
        duration
      })

      const response = await startPracticeExam({
        subject: subjectName,
        examType,
        difficulty,
        questionCount,
        duration
      })

      console.log('Exam started successfully:', response)
      
      if (response.data?.studentExamId) {
        showToast.success('Exam started!')
        navigate('/student/exam', {
          state: {
            studentExamId: response.data.studentExamId
          }
        })
      } else {
        throw new Error('No exam ID returned')
      }
    } catch (err: any) {
      console.error('Error starting exam:', err)
      showToast.error(err.message || 'Failed to start exam')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/student/subjects')}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Subjects
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Start {subjectName} Exam
          </h1>
          <p className="text-gray-600">
            Configure your exam settings below
          </p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-8 border border-gray-100"
        >
          {/* Exam Type */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-900 mb-4">
              Exam Type
            </label>
            <div className="grid grid-cols-3 gap-4">
              {['JAMB', 'WAEC', 'NECO'].map((type) => (
                <button
                  key={type}
                  onClick={() => setExamType(type)}
                  className={`p-4 rounded-lg font-semibold transition-all ${
                    examType === type
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-900 mb-4">
              Difficulty Level
            </label>
            <div className="grid grid-cols-3 gap-4">
              {['EASY', 'MEDIUM', 'HARD'].map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`p-4 rounded-lg font-semibold transition-all ${
                    difficulty === level
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Question Count */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-900 mb-4">
              Number of Questions: <span className="text-primary-600">{questionCount}</span>
            </label>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>5</span>
              <span>100</span>
            </div>
          </div>

          {/* Duration */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-900 mb-4">
              Duration (minutes): <span className="text-primary-600">{duration}</span>
            </label>
            <input
              type="range"
              min="15"
              max="180"
              step="15"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>15 min</span>
              <span>180 min</span>
            </div>
          </div>

          {/* Summary */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Exam Summary</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <span className="font-semibold">Subject:</span> {subjectName}
              </p>
              <p>
                <span className="font-semibold">Exam Type:</span> {examType}
              </p>
              <p>
                <span className="font-semibold">Difficulty:</span> {difficulty}
              </p>
              <p>
                <span className="font-semibold">Questions:</span> {questionCount}
              </p>
              <p>
                <span className="font-semibold">Duration:</span> {duration} minutes
              </p>
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStartExam}
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-all"
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Loader className="w-5 h-5" />
                </motion.div>
                Starting Exam...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Start Exam
              </>
            )}
          </button>
        </motion.div>
      </div>
    </Layout>
  )
}
