/**
 * Admin Exam Management Dashboard
 * 
 * Manage official exams and practice tests
 * Create, edit, delete, and monitor exams
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Users,
  Clock,
  Target,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Zap
} from 'lucide-react'
import Layout from '../../components/Layout'
import SafePageWrapper from '../../components/SafePageWrapper'
import BlankPageDetector from '../../components/BlankPageDetector'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { getAvailableExams } from '../../api/exams'
import { showToast } from '../../components/ui/Toast'

interface Exam {
  id: string
  title: string
  description: string
  duration: number
  totalQuestions: number
  totalMarks: number
  passMarks: number
  isPublished: boolean
  allowReview: boolean
  allowRetake: boolean
  createdAt: string
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

export default function ExamManagement() {
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'draft'>('all')

  useEffect(() => {
    loadExams()
  }, [])

  const loadExams = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('🔄 [EXAM MANAGEMENT] Loading exams...')
      
      const response = await getAvailableExams()
      
      if (response.success && response.data?.exams) {
        console.log('✅ [EXAM MANAGEMENT] Exams loaded:', response.data.exams.length)
        setExams(response.data.exams)
      } else {
        throw new Error('Invalid response structure')
      }
    } catch (err: any) {
      console.error('❌ [EXAM MANAGEMENT] Error loading exams:', err)
      setError(err.message || 'Failed to load exams')
      showToast.error('Failed to load exams')
    } finally {
      setLoading(false)
    }
  }

  // Filter exams based on tab
  const filteredExams = exams.filter(exam => {
    if (activeTab === 'published') return exam.isPublished
    if (activeTab === 'draft') return !exam.isPublished
    return true
  })

  const handleEdit = (examId: string) => {
    showToast.info('Edit functionality coming soon')
  }

  const handleDelete = (examId: string) => {
    showToast.info('Delete functionality coming soon')
  }

  const handleView = (examId: string) => {
    showToast.info('View functionality coming soon')
  }

  if (loading) {
    return (
      <Layout>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
          <div className="space-y-6">
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
                  <div className="h-3 bg-gray-100 rounded"></div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </Layout>
    )
  }

  return (
    <SafePageWrapper pageName="Exam Management">
      <Layout>
        <BlankPageDetector 
          pageName="Exam Management" 
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
                <Link to="/admin/dashboard">
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
                    <BookOpen className="w-8 h-8 text-blue-600" />
                  </motion.div>
                  Exam Management
                </h1>
                <p className="text-gray-600 mt-2">
                  Create, edit, and manage official exams and practice tests
                </p>
              </div>
              <Link to="/admin/questions/create">
                <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Create Exam
                </Button>
              </Link>
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
                  onClick={loadExams}
                  className="ml-auto text-red-700 border-red-300 hover:bg-red-100"
                >
                  Retry
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tabs */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="flex gap-4 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-6 py-3 font-semibold transition-all ${
                  activeTab === 'all'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All Exams ({exams.length})
              </button>
              <button
                onClick={() => setActiveTab('published')}
                className={`px-6 py-3 font-semibold transition-all ${
                  activeTab === 'published'
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Published ({exams.filter(e => e.isPublished).length})
              </button>
              <button
                onClick={() => setActiveTab('draft')}
                className={`px-6 py-3 font-semibold transition-all ${
                  activeTab === 'draft'
                    ? 'text-orange-600 border-b-2 border-orange-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Draft ({exams.filter(e => !e.isPublished).length})
              </button>
            </div>
          </motion.div>

          {/* Exams Grid */}
          {filteredExams.length > 0 ? (
            <motion.div 
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredExams.map((exam, index) => (
                <motion.div
                  key={exam.id || `exam-${index}`}
                  variants={cardVariants}
                  whileHover="hover"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="h-full flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <Badge 
                        variant={exam.isPublished ? 'success' : 'warning'}
                        size="sm"
                      >
                        {exam.isPublished ? 'PUBLISHED' : 'DRAFT'}
                      </Badge>
                    </div>

                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                      {exam.title}
                    </h3>

                    {exam.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
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
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Pass Marks:</span>
                        <span className="font-medium text-green-600">{exam.passMarks}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleView(exam.id)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEdit(exam.id)}
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                        onClick={() => handleDelete(exam.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              variants={itemVariants}
              className="text-center py-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="flex justify-center mb-4"
              >
                <AlertCircle className="w-12 h-12 text-gray-300" />
              </motion.div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Exams Found
              </h3>
              <p className="text-gray-600 mb-6">
                {activeTab === 'published' 
                  ? 'No published exams yet'
                  : activeTab === 'draft'
                  ? 'No draft exams yet'
                  : 'Create your first exam to get started'}
              </p>
              <Link to="/admin/questions/create">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Exam
                </Button>
              </Link>
            </motion.div>
          )}
        </motion.div>
      </Layout>
    </SafePageWrapper>
  )
}
