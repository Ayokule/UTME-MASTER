import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Users, BookOpen, TrendingUp, Calendar, Filter, LineChart, PieChart } from 'lucide-react'
import Layout from '../../components/Layout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import StudentPerformanceCard from '../../components/analytics/StudentPerformanceCard'
import ProgressChart from '../../components/analytics/ProgressChart'
import ExamStatisticsCard from '../../components/analytics/ExamStatisticsCard'
import PerformanceTrendsChart from '../../components/analytics/PerformanceTrendsChart'
import ComparativeAnalysisChart from '../../components/analytics/ComparativeAnalysisChart'
import VisualProgressIndicators from '../../components/analytics/VisualProgressIndicators'
import { showToast } from '../../components/ui/Toast'
import { 
  getDashboardAnalytics, 
  getStudentPerformanceStats, 
  getProgressTracking,
  getExamStatistics,
  DashboardAnalytics as DashboardAnalyticsType,
  StudentPerformanceStats,
  ProgressTracking,
  ExamStatistics
} from '../../api/admin'

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<DashboardAnalyticsType | null>(null)
  const [selectedStudentId, setSelectedStudentId] = useState<string>('')
  const [selectedExamId, setSelectedExamId] = useState<string>('')
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month')
  
  // Data states
  const [studentStats, setStudentStats] = useState<StudentPerformanceStats | null>(null)
  const [progressData, setProgressData] = useState<ProgressTracking | null>(null)
  const [examStats, setExamStats] = useState<ExamStatistics | null>(null)

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'trends', name: 'Performance Trends', icon: LineChart },
    { id: 'comparison', name: 'Comparative Analysis', icon: PieChart },
    { id: 'students', name: 'Student Performance', icon: Users },
    { id: 'progress', name: 'Progress Tracking', icon: TrendingUp },
    { id: 'exams', name: 'Exam Statistics', icon: BookOpen }
  ]

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const response = await getDashboardAnalytics()
      setDashboardData(response.data.analytics)
    } catch (error: any) {
      showToast.error(error.message || 'Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const loadStudentPerformance = async (studentId: string) => {
    if (!studentId) return
    
    try {
      setLoading(true)
      const response = await getStudentPerformanceStats(studentId)
      setStudentStats(response.data.stats)
    } catch (error: any) {
      showToast.error(error.message || 'Failed to load student performance')
    } finally {
      setLoading(false)
    }
  }

  const loadProgressTracking = async (studentId: string, range: typeof timeRange) => {
    if (!studentId) return
    
    try {
      setLoading(true)
      const response = await getProgressTracking(studentId, range)
      setProgressData(response.data.progress)
    } catch (error: any) {
      showToast.error(error.message || 'Failed to load progress data')
    } finally {
      setLoading(false)
    }
  }

  const loadExamStatistics = async (examId: string) => {
    if (!examId) return
    
    try {
      setLoading(true)
      const response = await getExamStatistics(examId)
      setExamStats(response.data.statistics)
    } catch (error: any) {
      showToast.error(error.message || 'Failed to load exam statistics')
    } finally {
      setLoading(false)
    }
  }

  const renderOverview = () => {
    if (!dashboardData) return null

    return (
      <div className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.overview.totalStudents}</p>
                <p className="text-sm text-gray-600">Students</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.overview.totalExams}</p>
                <p className="text-sm text-gray-600">Exams</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.overview.totalQuestions}</p>
                <p className="text-sm text-gray-600">Questions</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.overview.averagePerformance.toFixed(1)}%</p>
                <p className="text-sm text-gray-600">Avg Performance</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${
                  dashboardData.overview.performanceTrend >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {dashboardData.overview.performanceTrend >= 0 ? '+' : ''}{dashboardData.overview.performanceTrend.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600">Trend</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {dashboardData.recentActivity.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{activity.studentName}</p>
                  <p className="text-sm text-gray-600">{activity.examTitle}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.completedAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{activity.score}</p>
                  <p className={`text-sm font-medium ${
                    (activity.percentage || 0) >= 70 ? 'text-green-600' : 
                    (activity.percentage || 0) >= 50 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {Math.round(activity.percentage || 0)}%
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
    )
  }

  const renderStudentPerformance = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Student Performance Analysis</h3>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Enter Student ID"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <Button 
              onClick={() => loadStudentPerformance(selectedStudentId)}
              disabled={!selectedStudentId || loading}
            >
              Analyze
            </Button>
          </div>
        </div>
      </Card>

      {studentStats && <StudentPerformanceCard stats={studentStats} />}
    </div>
  )

  const renderProgressTracking = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Progress Tracking</h3>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
            <input
              type="text"
              placeholder="Enter Student ID"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <Button 
              onClick={() => loadProgressTracking(selectedStudentId, timeRange)}
              disabled={!selectedStudentId || loading}
            >
              Track Progress
            </Button>
          </div>
        </div>
      </Card>

      {progressData && <ProgressChart progress={progressData} />}
    </div>
  )

  const renderExamStatistics = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Exam Statistics</h3>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Enter Exam ID"
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <Button 
              onClick={() => loadExamStatistics(selectedExamId)}
              disabled={!selectedExamId || loading}
            >
              Analyze Exam
            </Button>
          </div>
        </div>
      </Card>

      {examStats && <ExamStatisticsCard statistics={examStats} />}
    </div>
  )

  const renderPerformanceTrends = () => {
    // Mock data for demonstration - in real app, this would come from API
    const trendsData = [
      { date: '2024-01-01', score: 75, percentage: 75, timeSpent: 45, examCount: 2 },
      { date: '2024-01-15', score: 78, percentage: 78, timeSpent: 42, examCount: 3 },
      { date: '2024-02-01', score: 82, percentage: 82, timeSpent: 38, examCount: 2 },
      { date: '2024-02-15', score: 85, percentage: 85, timeSpent: 35, examCount: 4 },
      { date: '2024-03-01', score: 88, percentage: 88, timeSpent: 32, examCount: 3 },
    ]

    return (
      <div className="space-y-6">
        <PerformanceTrendsChart 
          data={trendsData}
          title="System-wide Performance Trends"
          timeRange={timeRange}
          type="composed"
        />
        
        <PerformanceTrendsChart 
          data={trendsData}
          title="Score Trends Over Time"
          timeRange={timeRange}
          type="area"
        />
      </div>
    )
  }

  const renderComparativeAnalysis = () => {
    // Mock data for demonstration
    const comparisonData = [
      { category: 'Mathematics', studentScore: 85, classAverage: 72, topPerformer: 95, percentile: 78 },
      { category: 'English', studentScore: 78, classAverage: 75, topPerformer: 92, percentile: 65 },
      { category: 'Physics', studentScore: 92, classAverage: 68, topPerformer: 96, percentile: 89 },
      { category: 'Chemistry', studentScore: 88, classAverage: 70, topPerformer: 94, percentile: 82 },
      { category: 'Biology', studentScore: 75, classAverage: 73, topPerformer: 90, percentile: 58 },
    ]

    return (
      <div className="space-y-6">
        <ComparativeAnalysisChart 
          data={comparisonData}
          studentName="System Average"
          className="All Students"
          type="radar"
          showPercentiles={true}
        />
        
        <ComparativeAnalysisChart 
          data={comparisonData}
          studentName="System Average"
          className="All Students"
          type="bar"
          showPercentiles={true}
        />
      </div>
    )
  }

  const renderTabContent = () => {
    if (loading && activeTab === 'overview') {
      return <LoadingSkeleton />
    }

    switch (activeTab) {
      case 'overview':
        return renderOverview()
      case 'trends':
        return renderPerformanceTrends()
      case 'comparison':
        return renderComparativeAnalysis()
      case 'students':
        return renderStudentPerformance()
      case 'progress':
        return renderProgressTracking()
      case 'exams':
        return renderExamStatistics()
      default:
        return null
    }
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="p-3 bg-primary-100 rounded-lg">
            <BarChart3 className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics & Statistics</h1>
            <p className="text-gray-600">Comprehensive performance analysis and insights</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <Card className="p-4 sticky top-24">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-all ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-700 shadow-soft'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.name}</span>
                    </button>
                  )
                })}
              </nav>
            </Card>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            {renderTabContent()}
          </motion.div>
        </div>
      </div>
    </Layout>
  )
}