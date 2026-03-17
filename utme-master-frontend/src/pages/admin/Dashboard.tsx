import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  BookOpen, 
  FileText, 
  Activity, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Plus,
  BarChart3,
  Upload,
  Eye,
  Sparkles,
  Database,
  Server,
  HardDrive,
  Zap,
  UserCheck,
  GraduationCap,
  Target
} from 'lucide-react'
import Layout from '../../components/Layout'
import { getAdminDashboard, AdminDashboardData } from '../../api/admin'
import { useAuthStore } from '../../store/auth'
import { showToast } from '../../components/ui/Toast'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import SafePageWrapper from '../../components/SafePageWrapper'
import BlankPageDetector from '../../components/BlankPageDetector'

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

export default function AdminDashboard() {
  const { user } = useAuthStore()
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔄 [ADMIN DASHBOARD] Loading admin dashboard from /analytics/admin/dashboard...')
      const data = await getAdminDashboard()
      console.log('✅ [ADMIN DASHBOARD] Admin dashboard loaded successfully:', {
        totalStudents: data.stats?.totalStudents,
        totalQuestions: data.stats?.totalQuestions,
        totalExams: data.stats?.totalExams,
        recentActivity: data.recentActivity?.length
      })
      setDashboardData(data)
    } catch (err: any) {
      console.error('❌ [ADMIN DASHBOARD] API Error Details:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        endpoint: '/analytics/admin/dashboard',
        errorData: err.response?.data,
        fullError: err
      })
      setError(err.message || 'Failed to load dashboard data')
      showToast.error('⚠️ Admin Dashboard API failed - showing sample data')
      
      // Fallback to mock data if API fails
      const mockData: AdminDashboardData = {
        stats: {
          totalStudents: 1247,
          totalTeachers: 23,
          totalQuestions: 4580,
          totalExams: 156,
          activeUsers: 89,
          totalSubjects: 10
        },
        recentActivity: [
          {
            id: '1',
            type: 'exam_completed',
            description: 'John Doe completed "Mathematics Practice Test"',
            time: new Date().toISOString(),
            icon: 'exam',
            score: 85
          },
          {
            id: '2',
            type: 'user_registered',
            description: 'Jane Smith registered as student',
            time: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            icon: 'user',
            role: 'STUDENT'
          },
          {
            id: '3',
            type: 'exam_completed',
            description: 'Mike Johnson completed "Physics Quiz"',
            time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            icon: 'exam',
            score: 92
          }
        ],
        subjectDistribution: [
          { subject: 'Mathematics', questions: 850, code: 'MTH' },
          { subject: 'English', questions: 720, code: 'ENG' },
          { subject: 'Physics', questions: 650, code: 'PHY' },
          { subject: 'Chemistry', questions: 580, code: 'CHM' },
          { subject: 'Biology', questions: 520, code: 'BIO' }
        ],
        examStatusStats: {
          completed: 1240,
          in_progress: 45,
          not_started: 12
        },
        performanceChart: [
          { date: '2024-03-01', averageScore: 68, totalExams: 45 },
          { date: '2024-03-02', averageScore: 72, totalExams: 52 },
          { date: '2024-03-03', averageScore: 75, totalExams: 48 }
        ],
        systemHealth: {
          database: 'healthy',
          api: 'healthy',
          storage: 'healthy',
          uptime: '99.9%'
        }
      }
      
      setDashboardData(mockData)
      console.log('⚠️ [ADMIN DASHBOARD] Using fallback/mock data - API failed')
    } finally {
      setLoading(false)
    }
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const getActivityIcon = (type: string) => {
    if (type === 'exam_completed') return <Target className="w-4 h-4" />
    if (type === 'user_registered') return <UserCheck className="w-4 h-4" />
    return <Activity className="w-4 h-4" />
  }

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600'
      case 'warning': return 'text-yellow-600'
      case 'error': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />
      case 'warning': return <AlertCircle className="w-4 h-4" />
      case 'error': return <AlertCircle className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <Layout>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
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
                    animate={{ width: "300px" }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="h-8 bg-white/20 rounded-lg mb-4"
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "200px" }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-4 bg-white/15 rounded"
                  />
                </div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full"
                />
              </div>
            </div>
          </motion.div>

          {/* Loading Cards */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8"
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
                </div>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "80px" }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                  className="h-6 bg-gray-200 rounded mb-2"
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "60px" }}
                  transition={{ duration: 1, delay: i * 0.1 + 0.2 }}
                  className="h-4 bg-gray-100 rounded"
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
            <Button onClick={loadDashboardData}>
              Retry
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  const { stats, recentActivity, subjectDistribution, systemHealth } = dashboardData || {}
  
  // Provide defaults if data is missing
  const safeSystemHealth = systemHealth || {
    database: 'healthy',
    api: 'healthy',
    storage: 'healthy',
    uptime: '99.9%'
  }
  
  const safeStats = stats || {
    totalStudents: 0,
    totalTeachers: 0,
    totalQuestions: 0,
    totalExams: 0,
    activeUsers: 0,
    totalSubjects: 0
  }
  
  const safeRecentActivity = recentActivity || []
  const safeSubjectDistribution = subjectDistribution || []

  return (
    <SafePageWrapper pageName="Admin Dashboard">
      <Layout>
        <BlankPageDetector 
          pageName="Admin Dashboard" 
          hasContent={!!dashboardData && Object.keys(dashboardData).length > 0}
        />
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
        {/* Header */}
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
                  {user?.role === 'TEACHER' ? 'Teacher' : 'Admin'} Dashboard
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                  >
                    ⚡
                  </motion.span>
                </motion.h1>
                <motion.p 
                  className="text-primary-100 mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  Welcome back, {user?.firstName}! Here's your system overview.
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
                    <Activity className="w-5 h-5" />
                    <span className="text-sm">System Status: Online</span>
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
                    <span className="text-sm">Uptime: {safeSystemHealth.uptime}</span>
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
                  <p className="text-sm text-primary-100 mb-1">Quick Actions</p>
                  <div className="flex space-x-2">
                    <Link to="/admin/questions/create">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 bg-white/20 rounded-lg"
                      >
                        <Plus className="w-4 h-4" />
                      </motion.div>
                    </Link>
                    <Link to="/admin/analytics">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 bg-white/20 rounded-lg"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </motion.div>
                    </Link>
                    <Link to="/admin/bulk-import">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 bg-white/20 rounded-lg"
                      >
                        <Upload className="w-4 h-4" />
                      </motion.div>
                    </Link>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
        {/* Stats Cards */}
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8"
        >
          <motion.div variants={cardVariants} whileHover="hover">
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-blue-500 rounded-2xl shadow-lg">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-900">{safeStats.totalStudents.toLocaleString()}</p>
                  <p className="text-sm font-medium text-blue-700">Students</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants} whileHover="hover">
            <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-purple-500 rounded-2xl shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-purple-900">{safeStats.totalTeachers}</p>
                  <p className="text-sm font-medium text-purple-700">Teachers</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants} whileHover="hover">
            <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-green-500 rounded-2xl shadow-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-900">{safeStats.totalQuestions.toLocaleString()}</p>
                  <p className="text-sm font-medium text-green-700">Questions</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants} whileHover="hover">
            <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-yellow-500 rounded-2xl shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-yellow-900">{safeStats.totalExams}</p>
                  <p className="text-sm font-medium text-yellow-700">Exams</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants} whileHover="hover">
            <Card className="p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-indigo-500 rounded-2xl shadow-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-indigo-900">{safeStats.activeUsers}</p>
                  <p className="text-sm font-medium text-indigo-700">Active Users</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants} whileHover="hover">
            <Card className="p-6 bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-pink-500 rounded-2xl shadow-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-pink-900">{safeStats.totalSubjects}</p>
                  <p className="text-sm font-medium text-pink-700">Subjects</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <motion.div variants={cardVariants} whileHover="hover">
            <Link to="/admin/exams">
              <Card className="p-6 bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200 hover:shadow-xl transition-all duration-300 cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-cyan-500 rounded-2xl shadow-lg">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-cyan-900">Manage Exams</h3>
                    <p className="text-sm text-cyan-700">View all exams</p>
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>

          <motion.div variants={cardVariants} whileHover="hover">
            <Link to="/admin/questions/create">
              <Card className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:shadow-xl transition-all duration-300 cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-emerald-500 rounded-2xl shadow-lg">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-emerald-900">Create Question</h3>
                    <p className="text-sm text-emerald-700">Add new questions</p>
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>

          <motion.div variants={cardVariants} whileHover="hover">
            <Link to="/admin/questions">
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-xl transition-all duration-300 cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-500 rounded-2xl shadow-lg">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900">View Questions</h3>
                    <p className="text-sm text-blue-700">Manage question bank</p>
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>

          <motion.div variants={cardVariants} whileHover="hover">
            <Link to="/admin/bulk-import">
              <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-xl transition-all duration-300 cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-orange-500 rounded-2xl shadow-lg">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-orange-900">Bulk Import</h3>
                    <p className="text-sm text-orange-700">Import CSV files</p>
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>

          <motion.div variants={cardVariants} whileHover="hover">
            <Link to="/admin/analytics">
              <Card className="p-6 bg-gradient-to-br from-violet-50 to-violet-100 border-violet-200 hover:shadow-xl transition-all duration-300 cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-violet-500 rounded-2xl shadow-lg">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-violet-900">Analytics</h3>
                    <p className="text-sm text-violet-700">View insights</p>
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Recent Activity */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary-600" />
                  Recent Activity
                </h3>
                <span className="text-sm text-gray-500">{safeRecentActivity.length} activities</span>
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <AnimatePresence>
                  {safeRecentActivity.map((activity, index) => (
                    <motion.div
                      key={activity.id || `activity-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className={`p-2 rounded-lg ${
                        activity.type === 'exam_completed' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500">{getTimeAgo(activity.time)}</p>
                      </div>
                      {activity.score && (
                        <div className="text-right">
                          <p className="text-sm font-bold text-green-600">{activity.score}%</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </Card>
          </motion.div>

          {/* System Health */}
          <motion.div variants={itemVariants}>
            <Card className="p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Server className="w-5 h-5 text-primary-600" />
                System Health
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <Database className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium">Database</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${getHealthColor(safeSystemHealth.database)}`}>
                    {getHealthIcon(safeSystemHealth.database)}
                    <span className="text-sm font-medium capitalize">{safeSystemHealth.database}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <Zap className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium">API</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${getHealthColor(safeSystemHealth.api)}`}>
                    {getHealthIcon(safeSystemHealth.api)}
                    <span className="text-sm font-medium capitalize">{safeSystemHealth.api}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <HardDrive className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium">Storage</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${getHealthColor(safeSystemHealth.storage)}`}>
                    {getHealthIcon(safeSystemHealth.storage)}
                    <span className="text-sm font-medium capitalize">{safeSystemHealth.storage}</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-green-800">System Status</p>
                      <p className="text-xs text-green-600">All systems operational</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-green-700">Online</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Subject Distribution */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary-600" />
                Subject Distribution
              </h3>
              <span className="text-sm text-gray-500">{safeSubjectDistribution.length} subjects</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {safeSubjectDistribution.map((subject, index) => (
                <motion.div
                  key={subject.code || `subject-${index}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{subject.questions}</p>
                    <p className="text-sm font-medium text-gray-700">{subject.subject}</p>
                    <p className="text-xs text-gray-500">{subject.code}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
        </motion.div>
      </Layout>
    </SafePageWrapper>
  )
}