// ==========================================
// SIMPLE STUDENT SUBJECT DASHBOARD
// ==========================================
// Shows available subjects from database
// Students click to start exam
// Clean, minimal design

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, BookOpen, Loader } from 'lucide-react'
import Layout from '../../components/Layout'
import { getSubjects } from '../../api/subjects'
import { showToast } from '../../components/ui/Toast'

interface Subject {
  id: string
  name: string
  code: string
  description?: string | null
  questionCount?: number
}

export default function SimpleSubjectDashboard() {
  const navigate = useNavigate()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSubjects()
  }, [])

  const loadSubjects = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Loading subjects...')
      const response = await getSubjects()
      
      if (response.success && response.data?.subjects) {
        console.log('Subjects loaded:', response.data.subjects)
        setSubjects(response.data.subjects)
      } else {
        throw new Error('Invalid response')
      }
    } catch (err: any) {
      console.error('Error loading subjects:', err)
      setError(err.message || 'Failed to load subjects')
      showToast.error('Failed to load subjects')
    } finally {
      setLoading(false)
    }
  }

  const handleStartExam = (subject: Subject) => {
    console.log('Starting exam for subject:', subject.name)
    
    // Navigate to exam start page with subject pre-selected
    navigate('/student/exam-start', {
      state: {
        subjectId: subject.id,
        subjectName: subject.name,
        subjectCode: subject.code
      }
    })
  }

  if (loading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full mx-auto mb-4"
              />
              <p className="text-gray-600">Loading subjects...</p>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Select a Subject
          </h1>
          <p className="text-gray-600">
            Choose a subject to start your practice exam
          </p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <p className="text-red-700">{error}</p>
            <button
              onClick={loadSubjects}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </motion.div>
        )}

        {/* Subjects Grid */}
        {subjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No subjects available</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {subjects.map((subject, index) => (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 cursor-pointer border border-gray-100"
                onClick={() => handleStartExam(subject)}
              >
                {/* Subject Icon/Code */}
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-white font-bold text-lg">
                    {subject.code.charAt(0)}
                  </span>
                </div>

                {/* Subject Name */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {subject.name}
                </h3>

                {/* Subject Code */}
                <p className="text-sm text-gray-500 mb-4">
                  Code: {subject.code}
                </p>

                {/* Description */}
                {subject.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {subject.description}
                  </p>
                )}

                {/* Question Count */}
                {subject.questionCount && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold text-gray-900">
                        {subject.questionCount}
                      </span>{' '}
                      questions available
                    </p>
                  </div>
                )}

                {/* Start Button */}
                <button
                  className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
                  onClick={() => handleStartExam(subject)}
                >
                  <Play className="w-5 h-5" />
                  Start Exam
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </Layout>
  )
}
