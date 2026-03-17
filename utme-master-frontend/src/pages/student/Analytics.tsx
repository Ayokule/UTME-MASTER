// ==========================================
// STUDENT ANALYTICS DASHBOARD - Phase 4
// ==========================================
// Beautiful analytics dashboard for students
//
// Features:
// - Performance overview cards
// - Subject-wise breakdown (pie chart)
// - Performance trend (line chart)
// - Recent exam history
// - Strengths and weaknesses
// - Comparison with class
// - Progress tracking
//
// ALL WITH BEGINNER-FRIENDLY COMMENTS!

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  TrendingUp,
  Award,
  Target,
  BookOpen,
  AlertCircle,
  BarChart3,
  ArrowLeft,
  Eye
} from 'lucide-react'
import {
  LineChart,
  Line,
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
import * as analyticsAPI from '../../api/analytics'

// ==========================================
// TYPES
// ==========================================
interface DashboardStats {
  totalExams: number
  averageScore: number
  averagePercentage: string
  totalQuestions: number
  totalCorrect: number
  totalWrong: number
  accuracy: string
  passRate: string
  bestSubject: string
  worstSubject: string
  recentExams: any[]
  subjectPerformance: any[]
  performanceTrend: any[]
  strengths: any[]
  weaknesses: any[]
}

// Colors for charts
const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444']

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function StudentAnalytics() {
  const navigate = useNavigate()
  
  // ==========================================
  // STATE
  // ==========================================
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [comparison, setComparison] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'subjects' | 'progress'>('overview')
  
  // ==========================================
  // LOAD DATA
  // ==========================================
  useEffect(() => {
    loadDashboardData()
  }, [])
  
  async function loadDashboardData() {
    setLoading(true)
    
    try {
      // Fetch dashboard stats
      const statsData = await analyticsAPI.getStudentDashboard()
      setStats(statsData.data)
      
      // Fetch comparison data
      try {
        const compData = await analyticsAPI.getPerformanceComparison()
        setComparison(compData.data)
      } catch (error) {
        console.error('Error loading comparison data:', error)
        // Continue without comparison data
      }
      
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
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }
  
  if (!stats || stats.totalExams === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto text-center py-12">
          <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="w-16 h-16 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Analytics Available</h2>
          <p className="text-gray-600 mb-6">
            Take your first exam to see your performance analytics here!
          </p>
          <button
            onClick={() => navigate('/student/exams')}
            className="px-8 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700"
          >
            Browse Exams
          </button>
        </div>
      </div>
    )
  }
  
  // ==========================================
  // RENDER DASHBOARD
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header with Back Button */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <button onClick={() => navigate('/student/dashboard')} className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-4xl font-bold text-gray-900">Performance Analytics</h1>
            </div>
            <p className="text-gray-600 ml-14">Track your progress and identify areas for improvement</p>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Overview
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('subjects')}
            className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'subjects'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              By Subject
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('progress')}
            className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'progress'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Progress
            </div>
          </button>
        </div>
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <>
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              
              {/* Total Exams */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-7 h-7" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">{stats.totalExams}</div>
                    <p className="text-blue-100 text-sm">Exams Taken</p>
                  </div>
                </div>
              </div>
              
              {/* Average Score */}
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Award className="w-7 h-7" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">{stats.averagePercentage}%</div>
                    <p className="text-purple-100 text-sm">Average Score</p>
                  </div>
                </div>
              </div>
              
              {/* Accuracy */}
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Target className="w-7 h-7" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">{stats.accuracy}%</div>
                    <p className="text-green-100 text-sm">Accuracy</p>
                  </div>
                </div>
              </div>
              
              {/* Pass Rate */}
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-7 h-7" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">{stats.passRate}%</div>
                    <p className="text-amber-100 text-sm">Pass Rate</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Comparison with Class */}
            {comparison && (
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-primary-600" />
                  Class Comparison
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary-600 mb-2">
                      {comparison.studentAverage}%
                    </div>
                    <p className="text-gray-600">Your Average</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-600 mb-2">
                      {comparison.classAverage}%
                    </div>
                    <p className="text-gray-600">Class Average</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {comparison.percentile}
                      <span className="text-xl align-super">th</span>
                    </div>
                    <p className="text-gray-600">Percentile</p>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                  <p className="text-blue-900 font-semibold text-center">
                    {comparison.comparison}
                  </p>
                </div>
              </div>
            )}
            
            {/* Performance Trend Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6">Performance Trend</h2>
              
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.performanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="examNumber" 
                    label={{ value: 'Exam Number', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    content={({ active, payload }: { active?: boolean; payload?: any[] }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                            <p className="font-bold">{data.examTitle}</p>
                            <p className="text-primary-600">Score: {data.percentage}%</p>
                            <p className="text-sm text-gray-600">
                              {new Date(data.date).toLocaleDateString()}
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="percentage" 
                    stroke="#6366f1" 
                    strokeWidth={3}
                    dot={{ fill: '#6366f1', r: 6 }}
                    name="Score (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {/* Strengths and Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              
              {/* Strengths */}
              <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
                  <Award className="w-6 h-6" />
                  Strengths (≥80%)
                </h3>
                
                {stats.strengths.length > 0 ? (
                  <div className="space-y-3">
                    {stats.strengths.map((subject, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="font-semibold text-green-900">{subject.subject}</span>
                        <span className="px-3 py-1 bg-green-200 text-green-800 rounded-lg font-bold">
                          {subject.accuracy}%
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-green-700 italic">No subjects with ≥80% accuracy yet</p>
                )}
              </div>
              
              {/* Weaknesses */}
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-6 h-6" />
                  Areas to Improve (&lt;60%)
                </h3>
                
                {stats.weaknesses.length > 0 ? (
                  <div className="space-y-3">
                    {stats.weaknesses.map((subject, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="font-semibold text-red-900">{subject.subject}</span>
                        <span className="px-3 py-1 bg-red-200 text-red-800 rounded-lg font-bold">
                          {subject.accuracy}%
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-red-700 italic">Great job! No weak areas found</p>
                )}
              </div>
            </div>
          </>
        )}
        
        {/* SUBJECTS TAB */}
        {activeTab === 'subjects' && (
          <>
            {/* Subject Performance Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6">Subject-wise Performance</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pie Chart */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-4 text-center">Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={stats.subjectPerformance}
                        dataKey="total"
                        nameKey="subject"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ subject, percentage }) => `${subject}: ${percentage}%`}
                      >
                        {stats.subjectPerformance.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Bar Chart */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-4 text-center">Accuracy Comparison</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.subjectPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="subject" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="percentage" fill="#6366f1" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            {/* Subject Details Table */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6">Detailed Breakdown</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-4 font-bold">Subject</th>
                      <th className="text-center py-3 px-4 font-bold">Total</th>
                      <th className="text-center py-3 px-4 font-bold">Correct</th>
                      <th className="text-center py-3 px-4 font-bold">Wrong</th>
                      <th className="text-center py-3 px-4 font-bold">Accuracy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.subjectPerformance.map((subject, idx) => (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4 font-semibold">{subject.subject}</td>
                        <td className="text-center py-4 px-4">{subject.total}</td>
                        <td className="text-center py-4 px-4 text-green-600 font-semibold">
                          {subject.correct}
                        </td>
                        <td className="text-center py-4 px-4 text-red-600 font-semibold">
                          {subject.wrong}
                        </td>
                        <td className="text-center py-4 px-4">
                          <span className={`px-3 py-1 rounded-lg font-bold ${
                            parseFloat(subject.accuracy) >= 80
                              ? 'bg-green-100 text-green-700'
                              : parseFloat(subject.accuracy) >= 60
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {subject.accuracy}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
        
        {/* PROGRESS TAB */}
        {activeTab === 'progress' && (
          <>
            {/* Recent Exams */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6">Recent Exam History</h2>
              
              <div className="space-y-4">
                {stats.recentExams.slice(0, 5).map((exam, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-primary-300 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{exam.examTitle}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(exam.submittedAt).toLocaleDateString()} • 
                        {exam.timeSpent ? ` ${Math.floor(exam.timeSpent / 60)} mins` : ''}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {exam.score}/{exam.totalMarks}
                        </div>
                        <div className="text-sm text-gray-600">{exam.percentage}%</div>
                      </div>
                      
                      <div className={`px-4 py-2 rounded-lg font-bold ${
                        exam.passed 
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {exam.grade}
                      </div>

                      <button
                        onClick={() => navigate(`/student/exam-review/${exam.id}`)}
                        className="p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg"
                        title="Review answers"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {stats.recentExams.length > 5 && (
                <button
                  onClick={() => setActiveTab('overview')}
                  className="w-full mt-6 px-6 py-3 border-2 border-primary-600 text-primary-600 rounded-xl font-semibold hover:bg-primary-50"
                >
                  View More Exams
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
