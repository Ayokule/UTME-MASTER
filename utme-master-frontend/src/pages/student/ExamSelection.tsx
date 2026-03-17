/**
 * Unified Exam Selection Page
 * 
 * Consolidated page for selecting and starting both official exams and practice tests.
 * Replaces: SubjectSelection, ExamStart, SimpleSubjectDashboard, ExamListing
 */

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Play,
  Clock,
  Target,
  Trophy,
  Zap,
  Users,
  ArrowLeft,
  Filter,
  Search,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Flame
} from 'lucide-react'
import Layout from '../../components/Layout'
import SafePageWrapper from '../../components/SafePageWrapper'
import BlankPageDetector from '../../components/BlankPageDetector'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Input from '../../components/ui/Input'
import { getAvailableExams, type Exam } from '../../api/exams'
import * as examAPI from '../../api/exams'
import { getSubjects } from '../../api/subjects'
import { useAuthStore } from '../../store/auth'
import { showToast } from '../../components/ui/Toast'

interface Subject {
  id: string
  name: string
  code: string
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.4
    }
  },
  hover: {
    scale: 1.02,
    y: -5,
    transition: {
      duration: 0.2
    }
  }
}

export default function ExamSelection() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  
  const [exams, setExams] = useState<Exam[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [startingExamId, setStartingExamId] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('🔄 [EXAM SELECTION] Loading exams and subjects...')
      
      const [examsResponse, subjectsResponse] = await Promise.all([
        getAvailableExams(),
        getSubjects()
      ])

      if (examsResponse.success && examsResponse.data?.exams) {
        console.log('✅ [EXAM SELECTION] Exams loaded:', examsResponse.data.exams.length)
        setExams(examsResponse.data.exams)
      }

      if (subjectsResponse.success && subjectsResponse.data?.subjects) {
        console.log('✅ [EXAM SELECTION] Subjects loaded:', subjectsResponse.data.subjects.length)
        setSubjects(subjectsResponse.data.subjects)
      }
    } catch (err: any) {
      console.error('❌ [EXAM SELECTION] Error loading data:', err)
      setError(err.message || 'Failed to load exams and subjects')
      showToast.error('Failed to load exams')
    } finally {
      setLoading(false)
    }
  }

  const handleStartExam = async (examId: string) => {
    try {
      setStartingExamId(examId)
      console.log('🚀 [EXAM SELECTION] Starting exam:', examId)
      
      // Call startExam API to create StudentExam record
      const response = await examAPI.startExam(examId)
      
      if (response.success && response.data?.studentExamId) {
        console.log('✅ [EXAM SELECTION] Exam started, studentExamId:', response.data.studentExamId)
        // Navigate to exam interface with studentExamId
        navigate(`/student/exam/${response.data.studentExamId}`)
        showToast.success('Exam started!')
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (err: any) {
      console.error('❌ [EXAM SELECTION] Error starting exam:', err)
      showToast.error(err.message || 'Failed to start exam')
    } finally {
      setStartingExamId(null)
    }
  }

  // Show all exams
  const filteredExams = exams

  if (loading) {
    return (
      <Layout>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
          <div className="space-y-6">
            {/* Header skeleton */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "300px" }}
                    transition={{ duration: 1 }}
                    className="h-8 bg-white/20 rounded-lg mb-4"
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "200px" }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="h-4 bg-white/15 rounded"
                  />
                </div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full"
                />
              </div>
            </motion.div>

            {/* Exams skeleton */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="bg-white rounded-2xl shadow-lg p-6 animate-pulse"
                >
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-100 rounded mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </Layout>
    )
  }

  return (
    <SafePageWrapper pageName="Exam Selection">
      <Layout>
        <BlankPageDetector 
          pageName="Exam Selection" 
          hasContent={exams.length > 0}
        />
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <Link to="/student/dashboard">
                  <Button variant="outline" size="sm" className="mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
                <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="p-3 bg-blue-100 rounded-lg"
                  >
                    <Play className="w-8 h-8 text-blue-600" />
                  </motion.div>
                  Select & Start Exam
                </h1>
                <p className="text-gray-600 mt-2">
                  Choose from official exams or practice tests to begin your preparation
                </p>
              </div>
            </div>
          </motion.div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-red-700 text-sm font-medium">Error Loading Exams</p>
                  <p className="text-red-600 text-xs mt-1">{error}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadData}
                  className="ml-auto text-red-700 border-red-300 hover:bg-red-100"
                >
                  Retry
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Exams Section */}
          <motion.div variants={itemVariants} className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Available Exams & Tests</h2>
                <p className="text-gray-600 text-sm">Official Exams & Practice Tests</p>
              </div>
            </div>

            {filteredExams.length > 0 ? (
              <motion.div 
                variants={containerVariants}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredExams.map((exam, index) => (
                  <motion.div
                    key={exam.id}
                    variants={cardVariants}
                    whileHover="hover"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="h-full flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="primary" size="sm">
                          EXAM
                        </Badge>
                      </div>

                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                        {exam.title}
                      </h3>

                      {exam.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {exam.description}
                        </p>
                      )}

                      <div className="space-y-2 mb-4 flex-grow">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Duration:</span>
                          <span className="font-medium flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {exam.duration} min
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Questions:</span>
                          <span className="font-medium">{exam.totalQuestions}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Total Marks:</span>
                          <span className="font-medium">{exam.totalMarks}</span>
                        </div>
                      </div>

                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleStartExam(exam.id)}
                        disabled={startingExamId === exam.id}
                      >
                        {startingExamId === exam.id ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity }}
                              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                            />
                            Starting...
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Start
                          </>
                        )}
                      </Button>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                variants={itemVariants}
                className="text-center py-12 bg-gray-50 rounded-lg"
              >
                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Exams Available
                </h3>
                <p className="text-gray-600">
                  Check back soon for new exams
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Dashboard Links */}
          <motion.div variants={itemVariants} className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">View Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link to="/student/dashboard/official-exams">
                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                    <h4 className="font-bold text-gray-900">Official Exams Dashboard</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    View your official exam performance and analytics
                  </p>
                </motion.div>
              </Link>
              <Link to="/student/dashboard/practice-tests">
                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Flame className="w-6 h-6 text-orange-600" />
                    <h4 className="font-bold text-gray-900">Practice Tests Dashboard</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Track your practice progress and improvement trends
                  </p>
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </Layout>
    </SafePageWrapper>
  )
}
