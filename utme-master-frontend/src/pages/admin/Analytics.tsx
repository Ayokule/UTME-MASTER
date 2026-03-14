// ==========================================
// ADMIN ANALYTICS DASHBOARD - Phase 4
// ==========================================
// System-wide analytics for administrators
//
// Features:
// - Total users, students, teachers
// - Question bank statistics
// - Exam statistics
// - Performance metrics
// - Recent activity feed
// - Top performers
// - Subject distribution
//
// ALL WITH BEGINNER-FRIENDLY COMMENTS!

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  BookOpen,
  FileText,
  TrendingUp,
  Award,
  Activity,
  Clock,
  CheckCircle
} from 'lucide-react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { useAuthStore } from '../../store/auth'

// ==========================================
// TYPES
// ==========================================
interface AdminStats {
  users: {
    total: number
    students: number
    teachers: number
    activeStudents: number
  }
  questions: {
    total: number
    active: number
    subjectDistribution: any[]
  }
  exams: {
    total: number
    published: number
    totalAttempts: number
    completed: number
    inProgress: number
  }
  performance: {
    averageScore: string
    passRate: string
  }
  recentActivity: any[]
  topPerformers: any[]
}

// Colors
const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444']

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function AdminAnalytics() {
  const navigate = useNavigate()
  const { token } = useAuthStore()
  
  // ==========================================
  // STATE
  // ==========================================
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  
  // ==========================================
  // LOAD DATA
  // ==========================================
  useEffect(() => {
    loadDashboardData()
  }, [])
  
  async function loadDashboardData() {
    setLoading(true)
    
    try {
      const response = await fetch('/api/analytics/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) throw new Error('Failed to fetch stats')
      
      const data = await response.json()
      setStats(data.data)
      
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // ==========================================
  // RENDER LOADING
  // ==========================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }
  
  if (!stats) return null
  
  // ==========================================
  // RENDER DASHBOARD
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">System-wide analytics and performance metrics</p>
        </div>
        
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Total Users */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Users className="w-7 h-7" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.users.total}</div>
                <p className="text-blue-100 text-sm">Total Users</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-100">Students: {stats.users.students}</span>
              <span className="text-blue-100">Teachers: {stats.users.teachers}</span>
            </div>
          </div>
          
          {/* Total Questions */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <BookOpen className="w-7 h-7" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.questions.total}</div>
                <p className="text-purple-100 text-sm">Questions</p>
              </div>
            </div>
            <div className="text-sm text-purple-100">
              Active: {stats.questions.active}
            </div>
          </div>
          
          {/* Total Exams */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <FileText className="w-7 h-7" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.exams.total}</div>
                <p className="text-green-100 text-sm">Total Exams</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-100">Published: {stats.exams.published}</span>
              <span className="text-green-100">Attempts: {stats.exams.totalAttempts}</span>
            </div>
          </div>
          
          {/* Average Score */}
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-7 h-7" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.performance.averageScore}%</div>
                <p className="text-amber-100 text-sm">Avg Score</p>
              </div>
            </div>
            <div className="text-sm text-amber-100">
              Pass Rate: {stats.performance.passRate}%
            </div>
          </div>
        </div>
        
        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Question Distribution by Subject */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-primary-600" />
              Question Bank Distribution
            </h2>
            
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.questions.subjectDistribution}
                  dataKey="count"
                  nameKey="subject"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ subject, count }) => `${subject}: ${count}`}
                >
                  {stats.questions.subjectDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Exam Statistics */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary-600" />
              Exam Statistics
            </h2>
            
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { name: 'Total Exams', value: stats.exams.total },
                  { name: 'Published', value: stats.exams.published },
                  { name: 'Total Attempts', value: stats.exams.totalAttempts },
                  { name: 'Completed', value: stats.exams.completed },
                  { name: 'In Progress', value: stats.exams.inProgress }
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Top Performers */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-500" />
            Top Performers
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-bold">Rank</th>
                  <th className="text-left py-3 px-4 font-bold">Student</th>
                  <th className="text-left py-3 px-4 font-bold">Email</th>
                  <th className="text-center py-3 px-4 font-bold">Average Score</th>
                  <th className="text-center py-3 px-4 font-bold">Exams Taken</th>
                </tr>
              </thead>
              <tbody>
                {stats.topPerformers.map((student, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      {idx < 3 ? (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                          idx === 0 ? 'bg-amber-500' :
                          idx === 1 ? 'bg-gray-400' :
                          'bg-amber-700'
                        }`}>
                          {idx + 1}
                        </div>
                      ) : (
                        <span className="font-semibold text-gray-600">{idx + 1}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 font-semibold">{student.name}</td>
                    <td className="py-4 px-4 text-gray-600">{student.email}</td>
                    <td className="text-center py-4 px-4">
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg font-bold">
                        {student.averageScore}%
                      </span>
                    </td>
                    <td className="text-center py-4 px-4">{student.totalExams}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary-600" />
            Recent Activity
          </h2>
          
          <div className="space-y-4">
            {stats.recentActivity.map((activity, idx) => (
              <div 
                key={idx}
                className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-primary-300 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {activity.passed ? (
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <Clock className="w-6 h-6 text-red-600" />
                    </div>
                  )}
                  
                  <div>
                    <p className="font-semibold text-gray-900">{activity.studentName}</p>
                    <p className="text-sm text-gray-600">{activity.examTitle}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-bold text-gray-900">{activity.percentage}%</div>
                    <div className="text-xs text-gray-600">
                      {new Date(activity.submittedAt).toLocaleString()}
                    </div>
                  </div>
                  
                  <div className={`px-4 py-2 rounded-lg font-bold ${
                    activity.passed 
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {activity.passed ? 'Passed' : 'Failed'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Active Users Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Users className="w-7 h-7 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.users.activeStudents}
                </div>
                <p className="text-gray-600 text-sm">Active Students (7 days)</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.exams.completed}
                </div>
                <p className="text-gray-600 text-sm">Completed Exams</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Clock className="w-7 h-7 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.exams.inProgress}
                </div>
                <p className="text-gray-600 text-sm">Exams In Progress</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
