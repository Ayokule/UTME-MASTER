import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BookOpen, 
  Play, 
  Clock, 
  Target, 
  Trophy, 
  Zap, 
  Users, 
  Star,
  ArrowLeft,
  Filter,
  Search,
  TrendingUp,
  Award,
  CheckCircle,
  AlertCircle,
  Brain
} from 'lucide-react'
import Layout from '../../components/Layout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Input from '../../components/ui/Input'
import { getSubjects } from '../../api/subjects'
import { startPracticeExam } from '../../api/exams'
import { useAuthStore } from '../../store/auth'
import { showToast } from '../../components/ui/Toast'

interface Subject {
  id: string
  name: string
  code: string
  description: string | null
  questionCount?: number
  difficulty?: 'Easy' | 'Medium' | 'Hard'
  averageScore?: number
  completionRate?: number
  lastAttempt?: string
  bestScore?: number
}

interface ExamType {
  id: string
  name: string
  description: string
  duration: number
  questions: number
  icon: any
  color: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
}

const examTypes: ExamType[] = [
  {
    id: 'practice',
    name: 'Practice Test',
    description: 'Standard practice with detailed explanations',
    duration: 60,
    questions: 40,
    icon: BookOpen,
    color: 'from-blue-500 to-blue-600',
    difficulty: 'Medium'
  },
  {
    id: 'speed',
    name: 'Speed Test',
    description: 'Quick test to improve your speed',
    duration: 20,
    questions: 15,
    icon: Zap,
    color: 'from-yellow-500 to-orange-500',
    difficulty: 'Hard'
  },
  {
    id: 'mock',
    name: 'Mock Exam',
    description: 'Full JAMB simulation experience',
    duration: 180,
    questions: 180,
    icon: Trophy,
    color: 'from-purple-500 to-purple-600',
    difficulty: 'Hard'
  },
  {
    id: 'adaptive',
    name: 'Adaptive Test',
    description: 'AI-powered personalized questions',
    duration: 45,
    questions: 30,
    icon: Brain,
    color: 'from-green-500 to-green-600',
    difficulty: 'Medium'
  }
]

export default function SubjectSelection() {
  const navigate = useNavigate()
  const location = useLocation()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedExamType, setSelectedExamType] = useState<string>('practice')
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all')
  const [startingExam, setStartingExam] = useState<string | null>(null)
  const { user } = useAuthStore()

  // Get pre-selected subject from navigation state
  const preSelectedSubject = location.state?.preSelectedSubject
  const preSelectedExamType = location.state?.examType || 'practice'

  useEffect(() => {
    fetchSubjects()
    
    // Set pre-selected exam type if provided
    if (preSelectedExamType) {
      setSelectedExamType(preSelectedExamType)
    }
    
    // Set search term to pre-selected subject if provided
    if (preSelectedSubject) {
      setSearchTerm(preSelectedSubject)
    }
  }, [])

  const fetchSubjects = async () => {
    try {
      const response = await getSubjects()
      if (response.success) {
        setSubjects(response.data.subjects)
      }
    } catch (err: any) {
      console.error('Error fetching subjects:', err)
      setError('Failed to load subjects. Please try again.')
      
      // Enhanced fallback data
      setSubjects([
        {
          id: '1',
          name: 'Mathematics',
          code: 'MTH',
          description: 'Algebra, Geometry, Calculus, Statistics',
          questionCount: 1250,
          difficulty: 'Hard',
          averageScore: 68,
          completionRate: 85,
          lastAttempt: '2024-03-10',
          bestScore: 82
        },
        {
          id: '2',
          name: 'English Language',
          code: 'ENG',
          description: 'Grammar, Comprehension, Literature',
          questionCount: 980,
          difficulty: 'Medium',
          averageScore: 75,
          completionRate: 92,
          lastAttempt: '2024-03-09',
          bestScore: 88
        },
        {
          id: '3',
          name: 'Physics',
          code: 'PHY',
          description: 'Mechanics, Waves, Electricity, Modern Physics',
          questionCount: 850,
          difficulty: 'Hard',
          averageScore: 62,
          completionRate: 78,
          lastAttempt: '2024-03-08',
          bestScore: 75
        },
        {
          id: '4',
          name: 'Chemistry',
          code: 'CHM',
          description: 'Organic, Inorganic, Physical Chemistry',
          questionCount: 920,
          difficulty: 'Medium',
          averageScore: 71,
          completionRate: 88,
          lastAttempt: '2024-03-07',
          bestScore: 79
        },
        {
          id: '5',
          name: 'Biology',
          code: 'BIO',
          description: 'Botany, Zoology, Ecology, Genetics',
          questionCount: 780,
          difficulty: 'Easy',
          averageScore: 78,
          completionRate: 95,
          lastAttempt: '2024-03-06',
          bestScore: 85
        },
        {
          id: '6',
          name: 'Economics',
          code: 'ECO',
          description: 'Microeconomics, Macroeconomics, Development',
          questionCount: 650,
          difficulty: 'Medium',
          averageScore: 73,
          completionRate: 82,
          lastAttempt: '2024-03-05',
          bestScore: 81
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subject.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDifficulty = filterDifficulty === 'all' || subject.difficulty === filterDifficulty
    return matchesSearch && matchesDifficulty
  })

  const selectedExam = examTypes.find(exam => exam.id === selectedExamType)

  const handleStartExam = async (subjectId: string, subjectName: string) => {
    if (!selectedExam) return
    
    try {
      setStartingExam(subjectId)
      
      console.log('Starting exam with params:', {
        subjectId,
        subjectName,
        examType: selectedExam.id,
        difficulty: filterDifficulty,
        questionCount: selectedExam.questions,
        duration: selectedExam.duration
      })
      
      showToast.success(`Starting ${selectedExam.name} for ${subjectName}...`)
      
      // Start the practice exam
      const response = await startPracticeExam({
        subject: subjectName,
        examType: selectedExam.id,
        difficulty: filterDifficulty === 'all' ? undefined : filterDifficulty,
        questionCount: selectedExam.questions,
        duration: selectedExam.duration
      })
      
      console.log('Exam started successfully:', {
        studentExamId: response.data.studentExamId,
        totalQuestions: response.data.totalQuestions,
        questionsCount: response.data.questions?.length
      })
      
      if (response.success) {
        // Navigate to exam interface with the student exam ID
        navigate(`/student/exam/${response.data.studentExamId}`)
      } else {
        showToast.error('Failed to start exam')
      }
    } catch (error: any) {
      console.error('Error starting exam:', {
        message: error.message,
        response: error.response?.data
      })
      showToast.error(error.message || 'Failed to start exam')
    } finally {
      setStartingExam(null)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full mx-auto mb-4"
            />
            <p className="text-gray-600">Loading subjects...</p>
          </motion.div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link to="/student/dashboard">
                <Button variant="outline" className="p-2">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Choose Your Subject</h1>
                <p className="text-gray-600">Select a subject and exam type to begin your practice</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Welcome back,</p>
              <p className="font-semibold text-gray-900">{user?.firstName}!</p>
            </div>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-yellow-700 text-sm font-medium">{error}</p>
                  <p className="text-yellow-600 text-xs mt-1">Showing sample data. Please check your backend connection.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Exam Type Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Target className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Select Exam Type</h2>
                <p className="text-gray-600">Choose the type of test that suits your goals</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {examTypes.map((examType, index) => {
                const Icon = examType.icon
                const isSelected = selectedExamType === examType.id
                return (
                  <motion.div
                    key={examType.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedExamType(examType.id)}
                    className={`relative cursor-pointer rounded-xl p-4 border-2 transition-all ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${examType.color}`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <Badge
                        variant={examType.difficulty === 'Hard' ? 'error' : examType.difficulty === 'Medium' ? 'warning' : 'success'}
                        size="sm"
                      >
                        {examType.difficulty}
                      </Badge>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-2">{examType.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{examType.description}</p>
                    
                    <div className="space-y-1 text-xs text-gray-500">
                      <div className="flex items-center justify-between">
                        <span>Duration:</span>
                        <span className="font-medium">{examType.duration}min</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Questions:</span>
                        <span className="font-medium">{examType.questions}</span>
                      </div>
                    </div>

                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center"
                      >
                        <CheckCircle className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search subjects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Difficulties</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Selected Exam Info */}
        {selectedExam && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <Card className={`p-4 bg-gradient-to-r ${selectedExam.color} text-white`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <selectedExam.icon className="w-6 h-6" />
                  <div>
                    <h3 className="font-semibold">{selectedExam.name} Selected</h3>
                    <p className="text-sm opacity-90">{selectedExam.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm opacity-90">Duration: {selectedExam.duration} minutes</p>
                  <p className="text-sm opacity-90">Questions: {selectedExam.questions}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Subjects Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredSubjects.map((subject, index) => (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="group"
              >
                <Card className="p-6 h-full hover:shadow-xl transition-all duration-300">
                  {/* Subject Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-lg">{subject.code}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                          {subject.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {subject.questionCount?.toLocaleString()} questions
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={subject.difficulty === 'Hard' ? 'error' : subject.difficulty === 'Medium' ? 'warning' : 'success'}
                      size="sm"
                    >
                      {subject.difficulty}
                    </Badge>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {subject.description || 'No description available'}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium text-gray-900">
                          {subject.bestScore || 0}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">Best Score</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-gray-900">
                          {subject.averageScore || 0}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">Average</p>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Completion Rate</span>
                      <span>{subject.completionRate || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${subject.completionRate || 0}%` }}
                        transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                        className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <Button
                      onClick={() => handleStartExam(subject.id, subject.name)}
                      disabled={startingExam === subject.id}
                      className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700"
                    >
                      {startingExam === subject.id ? (
                        <>
                          <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Starting...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Start {selectedExam?.name}
                        </>
                      )}
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => showToast.success(`Opening ${subject.name} analytics...`)}
                      >
                        <TrendingUp className="w-4 h-4 mr-1" />
                        Analytics
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => showToast.success(`Opening ${subject.name} past questions...`)}
                      >
                        <BookOpen className="w-4 h-4 mr-1" />
                        Past Q's
                      </Button>
                    </div>
                  </div>

                  {/* Last Attempt */}
                  {subject.lastAttempt && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        Last attempt: {new Date(subject.lastAttempt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* No Results */}
        <AnimatePresence>
          {filteredSubjects.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No subjects found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12"
        >
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Exam Guidelines</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      Questions are randomly selected from our database
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      Each exam can be retaken to improve your score
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      Detailed explanations provided after completion
                    </li>
                  </ul>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      Progress is automatically saved
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      Performance analytics available after each test
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      Adaptive difficulty based on your performance
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </Layout>
  )
}