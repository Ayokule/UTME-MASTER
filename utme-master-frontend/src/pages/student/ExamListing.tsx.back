import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Clock,
  Users,
  Award,
  Play,
  Lock,
  CheckCircle,
  ArrowRight,
  Search,
  Filter,
  AlertCircle,
  Loader
} from 'lucide-react'
import Layout from '../../components/Layout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Input from '../../components/ui/Input'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import { getAvailableExams, startExam } from '../../api/exams'
import { useAuthStore } from '../../store/auth'
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
  startsAt?: string
  endsAt?: string
  createdAt: string
}

interface ExamWithStatus extends Exam {
  status: 'coming-soon' | 'active' | 'ended' | 'available'
  daysRemaining?: number
  completedCount?: number
}

export default function ExamListing() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [exams, setExams] = useState<ExamWithStatus[]>([])
  const [filteredExams, setFilteredExams] = useState<ExamWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'upcoming'>('all')
  const [startingExamId, setStartingExamId] = useState<string | null>(null)

  useEffect(() => {
    loadExams()
  }, [])

  useEffect(() => {
    filterExams()
  }, [exams, searchTerm, filterStatus])

  const loadExams = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getAvailableExams()
      const examsWithStatus = enrichExamsWithStatus(response.data.exams || [])
      setExams(examsWithStatus)
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to load exams'
      setError(errorMsg)
      showToast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const enrichExamsWithStatus = (exams: Exam[]): ExamWithStatus[] => {
    const now = new Date()

    return exams.map(exam => {
      let status: 'coming-soon' | 'active' | 'ended' | 'available'
      let daysRemaining: number | undefined

      if (exam.startsAt && new Date(exam.startsAt) > now) {
        status = 'coming-soon'
        daysRemaining = Math.ceil(
          (new Date(exam.startsAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )
      } else if (exam.endsAt && new Date(exam.endsAt) < now) {
        status = 'ended'
      } else if (exam.isPublished) {
        status = 'active'
      } else {
        status = 'available'
      }

      return { ...exam, status, daysRemaining }
    })
  }

  const filterExams = () => {
    let filtered = exams

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(exam =>
        exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(exam => {
        if (filterStatus === 'active') return exam.status === 'active'
        if (filterStatus === 'upcoming') return exam.status === 'coming-soon'
        if (filterStatus === 'completed') return exam.status === 'ended'
        return true
      })
    }

    setFilteredExams(filtered)
  }

  const handleStartExam = async (examId: string) => {
    try {
      setStartingExamId(examId)
      const response = await startExam(examId)
      navigate(`/student/exam/${response.data.studentExamId}`)
    } catch (error: any) {
      showToast.error(error.message || 'Failed to start exam')
    } finally {
      setStartingExamId(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'coming-soon':
        return 'bg-yellow-100 text-yellow-800'
      case 'ended':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  const getStatusLabel = (exam: ExamWithStatus) => {
    switch (exam.status) {
      case 'active':
        return 'Available Now'
      case 'coming-soon':
        return `Starts in ${exam.daysRemaining} day${exam.daysRemaining !== 1 ? 's' : ''}`
      case 'ended':
        return 'Ended'
      default:
        return 'Available'
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSkeleton />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <BookOpen className="w-10 h-10 text-blue-600" />
            Available Exams
          </h1>
          <p className="text-gray-600">
            Browse and take the exams available to you
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 flex gap-4 flex-col sm:flex-row"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search exams..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'active', 'upcoming', 'completed'] as const).map(status => (
              <motion.button
                key={status}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Filter className="w-4 h-4 inline mr-2" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Error loading exams</h3>
              <p className="text-red-700 text-sm">{error}</p>
              <Button
                onClick={loadExams}
                size="sm"
                variant="outline"
                className="mt-2 border-red-300 text-red-700 hover:bg-red-50"
              >
                Try Again
              </Button>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {filteredExams.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No exams found
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? 'Try adjusting your search'
                : 'No exams are available at the moment'}
            </p>
          </motion.div>
        )}

        {/* Exam Cards Grid */}
        <AnimatePresence>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExams.map((exam, index) => (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
                  {/* Card Header */}
                  <div className="p-6 pb-4 border-b border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-gray-900 flex-1">
                        {exam.title}
                      </h3>
                      <Badge className={getStatusColor(exam.status)}>
                        {getStatusLabel(exam)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {exam.description}
                    </p>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex-1">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span className="text-gray-700">{exam.duration} mins</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <BookOpen className="w-4 h-4 text-green-600" />
                        <span className="text-gray-700">{exam.totalQuestions} Qs</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Award className="w-4 h-4 text-purple-600" />
                        <span className="text-gray-700">{exam.totalMarks} marks</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-orange-600" />
                        <span className="text-gray-700">Pass: {exam.passMarks}</span>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-2">
                      {exam.allowRetake && (
                        <div className="text-xs text-gray-600 flex items-center gap-1">
                          <ArrowRight className="w-3 h-3" />
                          Can be retaken
                        </div>
                      )}
                      {exam.allowReview && (
                        <div className="text-xs text-gray-600 flex items-center gap-1">
                          <ArrowRight className="w-3 h-3" />
                          Review after submission
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="p-6 pt-4 border-t border-gray-200">
                    {exam.status === 'active' ? (
                      <Button
                        onClick={() => handleStartExam(exam.id)}
                        disabled={startingExamId === exam.id}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        {startingExamId === exam.id ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin mr-2" />
                            Starting...
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Start Exam
                          </>
                        )}
                      </Button>
                    ) : exam.status === 'coming-soon' ? (
                      <Button disabled className="w-full bg-gray-300 text-gray-600">
                        <Lock className="w-4 h-4 mr-2" />
                        Coming {exam.startsAt ? new Date(exam.startsAt).toLocaleDateString() : 'Soon'}
                      </Button>
                    ) : (
                      <Button disabled className="w-full bg-gray-300 text-gray-600">
                        Exam Ended
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </div>
    </Layout>
  )
}
