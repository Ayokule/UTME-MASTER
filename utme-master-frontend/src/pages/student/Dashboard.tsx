import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { 
  BookOpen, 
  Award, 
  Target, 
  Clock, 
  Calendar,
  Sparkles,
  TrendingUp,
  Play,
  FileText,
  Brain,
  Timer,
  Users,
  Star,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Zap,
  BarChart3
} from 'lucide-react'
import Layout from '../../components/Layout'
import StatCard from '../../components/dashboard/StatCard'
import SubjectPerformanceChart from '../../components/dashboard/SubjectPerformanceChart'
import ProgressChart from '../../components/dashboard/ProgressChart'
import RecentActivity from '../../components/dashboard/RecentActivity'
import StrengthsWeaknesses from '../../components/dashboard/StrengthsWeaknesses'
import PremiumUpgrade from '../../components/dashboard/PremiumUpgrade'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import SafePageWrapper from '../../components/SafePageWrapper'
import BlankPageDetector from '../../components/BlankPageDetector'
import { useAuthStore } from '../../store/auth'
import { getDashboardData } from '../../api/dashboard.js'
import { DashboardData } from '../../types/dashboard'
import { showToast } from '../../components/ui/Toast'

// Types
interface ExamCard {
  id: string
  title: string
  subjects: string[]
  duration: number
  questions: number
  difficulty: string
  type: string
  participants: number
  averageScore: number
  subjectCode?: string
  subjectName?: string
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

const headerVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6
    }
  }
}

const motivationalQuotes = [
  "Success is the sum of small efforts repeated day in and day out.",
  "The expert in anything was once a beginner.",
  "Don't watch the clock; do what it does. Keep going.",
  "Education is the passport to the future.",
  "The beautiful thing about learning is that no one can take it away from you."
]

const studyTools = [
  {
    id: '1',
    title: 'Formula Bank',
    description: 'Quick access to important formulas',
    icon: Brain,
    color: 'from-blue-500 to-blue-600',
    count: '500+ formulas'
  },
  {
    id: '2',
    title: 'Flashcards',
    description: 'Interactive study cards',
    icon: FileText,
    color: 'from-green-500 to-green-600',
    count: '1,200+ cards'
  },
  {
    id: '3',
    title: 'Past Questions',
    description: 'Previous JAMB questions',
    icon: BookOpen,
    color: 'from-purple-500 to-purple-600',
    count: '10,000+ questions'
  },
  {
    id: '4',
    title: 'Study Timer',
    description: 'Pomodoro technique timer',
    icon: Timer,
    color: 'from-orange-500 to-orange-600',
    count: 'Focus sessions'
  }
]

export default function Dashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔄 [DASHBOARD] Loading dashboard data from /analytics/student/dashboard...')
      const data = await getDashboardData()
      console.log('✅ [DASHBOARD] Dashboard data received successfully:', {
        totalTests: data.stats?.total_tests,
        averageScore: data.stats?.average_score,
        subjects: data.subject_performance?.length,
        recentActivity: data.recent_activity?.length
      })
      
      setDashboardData(data)
    } catch (err: any) {
      console.error('❌ [DASHBOARD] API Error Details:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        endpoint: '/analytics/student/dashboard',
        errorData: err.response?.data,
        fullError: err
      })
      setError(err.message || 'Failed to load dashboard data')
      showToast.error('⚠️ Dashboard API failed - showing sample data')
      
      // Fallback to mock data if API fails
      const mockData: DashboardData = {
        student: {
          name: user?.firstName || 'Student',
          streak_days: 7,
          license_tier: user?.licenseTier || 'TRIAL'
        },
        stats: {
          total_tests: 24,
          average_score: 68.5,
          best_score: 85,
          hours_studied: 12.5
        },
        subject_performance: [
          { subject: 'Mathematics', score: 75, tests: 8 },
          { subject: 'English', score: 82, tests: 6 },
          { subject: 'Physics', score: 68, tests: 5 },
          { subject: 'Chemistry', score: 71, tests: 7 }
        ],
        progress: [
          { date: '2024-03-01', score: 60, exam_title: 'Math Practice' },
          { date: '2024-03-05', score: 68, exam_title: 'English Test' },
          { date: '2024-03-08', score: 75, exam_title: 'Physics Quiz' },
          { date: '2024-03-10', score: 82, exam_title: 'Chemistry Exam' }
        ],
        recent_activity: [
          {
            id: '1',
            exam_title: 'Mathematics Practice Test',
            score: 75,
            percentage: 75,
            date: '2024-03-11T10:30:00Z',
            subjects: ['Mathematics'],
            status: 'COMPLETED'
          },
          {
            id: '2',
            exam_title: 'English Language Assessment',
            score: 68,
            percentage: 68,
            date: '2024-03-10T14:15:00Z',
            subjects: ['English'],
            status: 'COMPLETED'
          },
          {
            id: '3',
            exam_title: 'Physics Practice Test',
            score: 82,
            percentage: 82,
            date: '2024-03-09T09:00:00Z',
            subjects: ['Physics'],
            status: 'COMPLETED'
          }
        ],
        strengths: ['Biology', 'English', 'Chemistry'],
        weaknesses: ['Physics', 'Mathematics'],
        quote_of_day: getRandomQuote()
      }
      
      setDashboardData(mockData)
    } finally {
      setLoading(false)
    }
  }

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getRandomQuote = () => {
    return motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]
  }

  const handleSubjectClick = (subject: string) => {
    showToast.success(`Opening ${subject} analytics...`)
  }

  const handleUpgrade = () => {
    showToast.success('Redirecting to upgrade page...')
  }

  if (loading) {
    return (
      <Layout>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
          {/* Animated Loading Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "200px" }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="h-8 bg-white/20 rounded-lg mb-4"
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "150px" }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-4 bg-white/15 rounded mb-4"
                  />
                  <div className="flex space-x-4">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "120px" }}
                      transition={{ duration: 1, delay: 0.7 }}
                      className="h-4 bg-white/15 rounded"
                    />
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100px" }}
                      transition={{ duration: 1, delay: 0.9 }}
                      className="h-4 bg-white/15 rounded"
                    />
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full"
                />
              </div>
            </div>
          </motion.div>

          {/* Animated Loading Cards */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                    className="w-12 h-12 bg-gray-200 rounded-xl"
                  />
                  <div>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "60px" }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className="h-8 bg-gray-200 rounded mb-2"
                    />
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "80px" }}
                      transition={{ duration: 1, delay: i * 0.1 + 0.2 }}
                      className="h-4 bg-gray-100 rounded"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Loading Charts */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
          >
            {[1, 2].map((i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="bg-white rounded-2xl shadow-lg p-8"
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "150px" }}
                  transition={{ duration: 1, delay: i * 0.2 }}
                  className="h-6 bg-gray-200 rounded mb-6"
                />
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "200px" }}
                  transition={{ duration: 1.5, delay: i * 0.2 + 0.3 }}
                  className="bg-gray-100 rounded-lg"
                />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </Layout>
    )
  }

  if (error || !dashboardData) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error || 'Failed to load dashboard'}</p>
            <button 
              onClick={loadDashboardData}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  const { 
    student = { name: 'Student', streak_days: 0, license_tier: 'TRIAL' }, 
    stats = { total_tests: 0, average_score: 0, best_score: 0, hours_studied: 0 },
    subject_performance = [],
    progress = [],
    recent_activity = [],
    strengths = [],
    weaknesses = [],
    quote_of_day = ''
  } = dashboardData || {}

  return (
    <SafePageWrapper pageName="Student Dashboard">
      <Layout>
        <BlankPageDetector 
          pageName="Student Dashboard" 
          hasContent={!!dashboardData && Object.keys(dashboardData).length > 0}
        />
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
        {/* Welcome Header */}
        <motion.div
          variants={headerVariants}
          className="mb-8"
        >
          <motion.div 
            className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 text-white shadow-2xl"
            whileHover={{ scale: 1.01, y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <motion.h1 
                  className="text-3xl font-bold mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  Welcome back, {student?.name || user?.firstName || 'Student'}! 
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                  >
                    👋
                  </motion.span>
                </motion.h1>
                <motion.p 
                  className="text-primary-100 mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  {getCurrentDate()}
                </motion.p>
                <motion.div 
                  className="flex items-center space-x-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <motion.div 
                    className="flex items-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Calendar className="w-5 h-5" />
                    <span className="text-sm">
                      {student?.streak_days || 0} day study streak
                    </span>
                  </motion.div>
                  <motion.div 
                    className="flex items-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                  >
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                      <Sparkles className="w-5 h-5" />
                    </motion.div>
                    <span className="text-sm capitalize">
                      {(student?.license_tier || 'TRIAL').toLowerCase()} Plan
                    </span>
                  </motion.div>
                </motion.div>
              </motion.div>
              
              <motion.div 
                className="text-right"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <motion.div 
                  className="bg-white/20 backdrop-blur-sm rounded-xl p-4"
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.25)" }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-sm text-primary-100 mb-1">Quote of the Day</p>
                  <p className="text-sm font-medium italic">
                    "{quote_of_day || getRandomQuote()}"
                  </p>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <motion.div variants={cardVariants} whileHover="hover">
            <StatCard
              icon={<BookOpen className="w-6 h-6" />}
              label="Tests Taken"
              value={stats.total_tests}
              change="+5"
              trend="up"
            />
          </motion.div>
          <motion.div variants={cardVariants} whileHover="hover">
            <StatCard
              icon={<Award className="w-6 h-6" />}
              label="Average Score"
              value={`${Math.round(stats.average_score)}%`}
              change="+2.3%"
              trend="up"
            />
          </motion.div>
          <motion.div variants={cardVariants} whileHover="hover">
            <StatCard
              icon={<Target className="w-6 h-6" />}
              label="Best Score"
              value={`${Math.round(stats.best_score)}%`}
            />
          </motion.div>
          <motion.div variants={cardVariants} whileHover="hover">
            <StatCard
              icon={<Clock className="w-6 h-6" />}
              label="Study Hours"
              value={stats.hours_studied.toFixed(1)}
              change="+1.2h"
              trend="up"
            />
          </motion.div>
        </motion.div>

        {/* Charts Row */}
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
        >
          <motion.div variants={cardVariants} whileHover="hover">
            <SubjectPerformanceChart data={subject_performance || []} />
          </motion.div>
          <motion.div variants={cardVariants} whileHover="hover">
            <ProgressChart data={progress || []} />
          </motion.div>
        </motion.div>

        {/* Dashboard Navigation */}
        <motion.div variants={itemVariants} className="mb-8">
          <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Performance Analytics</h2>
                <p className="text-gray-600">View detailed dashboards for official exams and practice tests</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Official Exams Dashboard */}
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-white rounded-xl p-6 border-2 border-blue-200 shadow-md hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Official Exams</h3>
                    <p className="text-sm text-gray-600">JAMB & Mock Exams</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Track your performance on official exams with detailed analytics, subject breakdown, and progress trends.
                </p>
                <Link to="/student/exam-dashboard">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2">
                    View Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </motion.div>

              {/* Practice Tests Dashboard */}
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-white rounded-xl p-6 border-2 border-orange-200 shadow-md hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Zap className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Practice Tests</h3>
                    <p className="text-sm text-gray-600">Subject Practice & Drills</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Monitor your practice progress with improvement trends, strong areas, and topics that need more work.
                </p>
                <Link to="/student/test-dashboard">
                  <Button className="w-full bg-orange-600 hover:bg-orange-700 flex items-center justify-center gap-2">
                    View Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </Card>
        </motion.div>

        {/* Quick Exam Access */}
        <motion.div variants={itemVariants} className="mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Play className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Quick Start</h2>
                  <p className="text-gray-600">Jump into exams and practice tests</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* All Exams Card */}
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-blue-500 rounded-lg">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">All Exams</h3>
                    <p className="text-sm text-gray-600">Official & Practice</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Browse and start official exams or practice tests. Track your progress and improve your scores.
                </p>
                <Link to="/student/exams">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2">
                    View All Exams
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </motion.div>

              {/* Exam Dashboard Card */}
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-purple-500 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Exam Analytics</h3>
                    <p className="text-sm text-gray-600">Performance & Insights</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  View your official exam performance, scores, pass rates, and detailed analytics in one place.
                </p>
                <Link to="/student/exam-dashboard">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center gap-2">
                    View Analytics
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </Card>
        </motion.div>

        {/* Study Tools */}
        <motion.div variants={itemVariants} className="mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-secondary-100 rounded-lg">
                <Brain className="w-6 h-6 text-secondary-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Study Tools</h2>
                <p className="text-gray-600">Enhance your learning with these tools</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {studyTools.map((tool, index) => {
                const Icon = tool.icon
                return (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="relative overflow-hidden rounded-xl cursor-pointer group"
                    onClick={() => showToast.success(`Opening ${tool.title}...`)}
                  >
                    <div className={`bg-gradient-to-br ${tool.color} p-6 text-white`}>
                      <div className="flex items-center justify-between mb-4">
                        <Icon className="w-8 h-8" />
                        <div className="text-right">
                          <p className="text-xs opacity-80">{tool.count}</p>
                        </div>
                      </div>
                      <h3 className="font-semibold mb-2">{tool.title}</h3>
                      <p className="text-sm opacity-90">{tool.description}</p>
                      
                      <motion.div
                        className="absolute inset-0 bg-white/10"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.6 }}
                      />
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </Card>
        </motion.div>

        {/* Today's Goals */}
        <motion.div variants={itemVariants} className="mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Today's Goals</h2>
                <p className="text-gray-600">Track your daily study objectives</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-900">Practice Tests</span>
                  </div>
                  <span className="text-sm text-blue-600 font-medium">2/3</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '67%' }}></div>
                </div>
                <p className="text-sm text-blue-700">1 more test to complete goal</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-900">Study Time</span>
                  </div>
                  <span className="text-sm text-green-600 font-medium">45/60min</span>
                </div>
                <div className="w-full bg-green-200 rounded-full h-2 mb-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <p className="text-sm text-green-700">15 minutes left to reach goal</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-purple-900">Accuracy</span>
                  </div>
                  <span className="text-sm text-purple-600 font-medium">85%</span>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-2 mb-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <p className="text-sm text-purple-700">Great accuracy today!</p>
              </motion.div>
            </div>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants} className="mb-8">
          <RecentActivity activities={recent_activity || []} />
        </motion.div>

        {/* Strengths & Weaknesses */}
        <motion.div variants={itemVariants} className="mb-8">
          <StrengthsWeaknesses
            strengths={strengths || []}
            weaknesses={weaknesses || []}
            onSubjectClick={handleSubjectClick}
          />
        </motion.div>

        {/* Premium Upgrade (for trial users) */}
        <AnimatePresence>
          {student.license_tier === 'TRIAL' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <PremiumUpgrade onUpgrade={handleUpgrade} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Premium Features (for premium users) */}
        <AnimatePresence>
          {(student.license_tier === 'PREMIUM' || student.license_tier === 'BASIC') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {/* Predicted JAMB Score */}
              <motion.div 
                className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 shadow-lg"
                whileHover={{ 
                  scale: 1.02, 
                  y: -5,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                }}
                transition={{ duration: 0.2 }}
              >
                <motion.div 
                  className="flex items-center space-x-3 mb-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.div
                    whileHover={{ rotate: 15, scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </motion.div>
                  <h3 className="font-semibold text-gray-900">Predicted JAMB Score</h3>
                </motion.div>
                <motion.p 
                  className="text-3xl font-bold text-green-600 mb-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                >
                  285
                </motion.p>
                <p className="text-sm text-gray-600">Based on current performance</p>
              </motion.div>

              {/* Percentile Ranking */}
              <motion.div 
                className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-lg"
                whileHover={{ 
                  scale: 1.02, 
                  y: -5,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                }}
                transition={{ duration: 0.2 }}
              >
                <motion.div 
                  className="flex items-center space-x-3 mb-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <motion.div
                    whileHover={{ rotate: -15, scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Award className="w-6 h-6 text-blue-600" />
                  </motion.div>
                  <h3 className="font-semibold text-gray-900">Percentile Ranking</h3>
                </motion.div>
                <motion.p 
                  className="text-3xl font-bold text-blue-600 mb-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                >
                  78th
                </motion.p>
                <p className="text-sm text-gray-600">Better than 78% of students</p>
              </motion.div>

              {/* Time Management */}
              <motion.div 
                className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-xl p-6 shadow-lg"
                whileHover={{ 
                  scale: 1.02, 
                  y: -5,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                }}
                transition={{ duration: 0.2 }}
              >
                <motion.div 
                  className="flex items-center space-x-3 mb-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <Clock className="w-6 h-6 text-purple-600" />
                  </motion.div>
                  <h3 className="font-semibold text-gray-900">Avg. Time per Question</h3>
                </motion.div>
                <motion.p 
                  className="text-3xl font-bold text-purple-600 mb-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                >
                  1.2m
                </motion.p>
                <p className="text-sm text-gray-600">Optimal timing achieved</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      </Layout>
    </SafePageWrapper>
  )
}