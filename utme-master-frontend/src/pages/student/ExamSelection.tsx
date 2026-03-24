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
  const [examError, setExamError] = useState<{ examId: string; message: string } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubject, setSelectedSubject] = useState<string>('all')
  const [filterType, setFilterType] = useState<'all' | 'available' | 'scheduled' | 'completed'>('all')

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

  // Filter exams based on search, subject, and type
  const filteredExams = exams.filter(exam => {
    // Search filter
    const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exam.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Subject filter
    const matchesSubject = selectedSubject === 'all' || 
                          exam.subjects?.includes(selectedSubject) ||
                          exam.subjectCode === selectedSubject ||
                          exam.subjectName === selectedSubject
    
    // Type filter
    const matchesType = filterType === 'all' ||
                       (filterType === 'available' && exam.status === 'available') ||
                       (filterType === 'scheduled' && exam.status === 'scheduled') ||
                       (filterType === 'completed' && exam.status === 'completed')
    
    return matchesSearch && matchesSubject && matchesType
  })

  const handleStartExam = async (examId: string) => {
    setExamError(null)
    try {
      setStartingExamId(examId)
      const response = await examAPI.startExam(examId)
      if (response.success && response.data?.studentExamId) {
        navigate(`/student/exam/${response.data.studentExamId}`)
        showToast.success('Exam started!')
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message || 'Failed to start exam'
      // Show inline error on the card instead of a generic toast
      setExamError({ examId, message: msg })
    } finally {
      setStartingExamId(null)
    }
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
            
            {/* Filter Bar */}
            <motion.div 
              variants={itemVariants}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search exams..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                {/* Subject Filter */}
                <div>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Subjects</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Type Filter */}
                <div>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as typeof filterType)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Types</option>
                    <option value="available">Available</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              
              {/* Filter Results Count */}
              <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                <span>Showing {filteredExams.length} of {exams.length} exams</span>
                {(searchQuery || selectedSubject !== 'all' || filterType !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedSubject('all')
                      setFilterType('all')
                    }}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </motion.div>
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
                            {Math.round(exam.duration / 60)} min
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

                      {examError?.examId === exam.id && (
                        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-red-700">{examError.message}</p>
                        </div>
                      )}

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
              <Link to="/student/analytics">
                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                    <h4 className="font-bold text-gray-900">Performance Analytics</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    View your performance analytics, subject breakdown, and progress trends
                  </p>
                </motion.div>
              </Link>
              <Link to="/student/exams?filter=practice">
                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Flame className="w-6 h-6 text-orange-600" />
                    <h4 className="font-bold text-gray-900">Practice Tests</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Browse and take practice tests to improve your skills
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
