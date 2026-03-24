import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import {
  Plus, Users, TrendingUp, BarChart3,
  FileText, BookOpen, AlertCircle, CheckCircle,
  Clock, Zap, Award, Activity
} from 'lucide-react'
import Layout from '../../components/Layout'
import SafePageWrapper from '../../components/SafePageWrapper'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import StatCard from '../../components/dashboard/StatCard'
import { useAuthStore } from '../../store/auth'
import { showToast } from '../../components/ui/Toast'

// ==========================================
// ANIMATION VARIANTS
// ==========================================
const makeVariants = (reduced: boolean) => ({
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: reduced ? { duration: 0 } : { duration: 0.6, staggerChildren: 0.1 }
    }
  },
  item: {
    hidden: reduced ? { opacity: 1 } : { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: reduced ? 0 : 0.4 } }
  }
})

// ==========================================
// MOCK DATA
// ==========================================
const mockStats = {
  activeClasses: 5,
  totalStudents: 142,
  examsCreated: 23,
  avgClassScore: 75,
  improvementTrend: '+5%'
}

const mockClasses = [
  { id: '1', name: 'SS3A', students: 45, avgScore: 78, status: 'ACTIVE' },
  { id: '2', name: 'SS3B', students: 38, avgScore: 72, status: 'ACTIVE' },
  { id: '3', name: 'SS2A', students: 32, avgScore: 68, status: 'ACTIVE' },
  { id: '4', name: 'SS2B', students: 27, avgScore: 81, status: 'ACTIVE' },
  { id: '5', name: 'SS1A', students: 0, avgScore: 0, status: 'DRAFT' }
]

const mockActivity = [
  { id: '1', timestamp: '2 hours ago', type: 'SUBMISSION', description: 'John Doe submitted Biology Test', score: 85, status: 'COMPLETED' },
  { id: '2', timestamp: '4 hours ago', type: 'EXAM', description: 'Chemistry Mock Exam completed by 12 students', score: null, status: 'COMPLETED' },
  { id: '3', timestamp: 'Yesterday', type: 'SUBMISSION', description: 'Amaka Obi submitted Mathematics Quiz', score: 92, status: 'COMPLETED' },
  { id: '4', timestamp: 'Yesterday', type: 'PENDING', description: 'Physics Assignment pending review', score: null, status: 'PENDING' },
  { id: '5', timestamp: '2 days ago', type: 'SUBMISSION', description: 'Chidi Nwosu submitted English Test', score: 61, status: 'COMPLETED' }
]

const teacherQuotes = [
  "The art of teaching is the art of assisting discovery.",
  "Education is not the filling of a pail, but the lighting of a fire.",
  "A good teacher can inspire hope, ignite the imagination, and instill a love of learning.",
  "Teaching is the greatest act of optimism."
]

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function TeacherDashboard() {
  const navigate = useNavigate()
  const reduced = useReducedMotion() ?? false
  const { container: containerVariants, item: itemVariants } = makeVariants(reduced)
  const { user } = useAuthStore()

  const [activeTab, setActiveTab] = useState<'overview' | 'classes' | 'reports'>('overview')
  const [loading, setLoading] = useState(false)
  const [classSearch, setClassSearch] = useState('')

  const teacherName = user ? `${(user as any).firstName ?? ''} ${(user as any).lastName ?? ''}`.trim() || user.email : 'Teacher'
  const shouldShowUpgrade = (user as any)?.licenseTier === 'TRIAL'
  const quote = teacherQuotes[new Date().getDay() % teacherQuotes.length]
  const formattedDate = new Date().toLocaleDateString('en-NG', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  const handleNav = (path: string, label: string) => {
    showToast.success(`Opening ${label}...`)
    navigate(path)
  }

  const filteredClasses = mockClasses.filter(c =>
    c.name.toLowerCase().includes(classSearch.toLowerCase())
  )

  return (
    <SafePageWrapper pageName="Teacher Dashboard">
      <Layout>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
        >

          {/* ==========================================
              SECTION 1: HEADER
              ========================================== */}
          <motion.div variants={itemVariants}>
            <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 text-white">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold mb-1">Welcome back, {teacherName} 👋</h1>
                  <p className="text-primary-100 text-sm mb-3">{formattedDate}</p>
                  <p className="text-primary-200 italic text-sm">"{quote}"</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 rounded-xl px-4 py-3 text-center">
                    <p className="text-2xl font-bold">{mockStats.activeClasses}</p>
                    <p className="text-xs text-primary-100">Active Classes</p>
                  </div>
                  <div className="bg-white/20 rounded-xl px-4 py-3 text-center">
                    <p className="text-2xl font-bold">{mockStats.totalStudents}</p>
                    <p className="text-xs text-primary-100">Students</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ==========================================
              SECTION 2: QUICK STATS
              ========================================== */}
          <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div variants={itemVariants}>
              <StatCard icon={<Users className="w-6 h-6" />} label="Active Classes" value={mockStats.activeClasses} />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard icon={<Users className="w-6 h-6" />} label="Total Students" value={mockStats.totalStudents} />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard icon={<FileText className="w-6 h-6" />} label="Exams Created" value={mockStats.examsCreated} />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard
                icon={<TrendingUp className="w-6 h-6" />}
                label="Class Avg Score"
                value={`${mockStats.avgClassScore}%`}
                change={mockStats.improvementTrend}
                trend="up"
              />
            </motion.div>
          </motion.div>

          {/* ==========================================
              SECTION 3: QUICK ACTIONS
              ========================================== */}
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Create Exam', icon: <Plus className="w-5 h-5" />, path: '/teacher/exam-creation', color: 'bg-primary-600 hover:bg-primary-700' },
                { label: 'View Classes', icon: <Users className="w-5 h-5" />, path: '/teacher/classes', color: 'bg-purple-600 hover:bg-purple-700' },
                { label: 'Student Progress', icon: <TrendingUp className="w-5 h-5" />, path: '/teacher/students', color: 'bg-green-600 hover:bg-green-700' },
                { label: 'Analytics', icon: <BarChart3 className="w-5 h-5" />, path: '/teacher/analytics', color: 'bg-cyan-600 hover:bg-cyan-700' }
              ].map(action => (
                <motion.button
                  key={action.label}
                  whileHover={reduced ? {} : { scale: 1.02 }}
                  whileTap={reduced ? {} : { scale: 0.98 }}
                  onClick={() => handleNav(action.path, action.label)}
                  className={`${action.color} text-white rounded-xl p-4 flex flex-col items-center gap-2 transition-all shadow-sm hover:shadow-md`}
                >
                  {action.icon}
                  <span className="text-sm font-medium text-center">{action.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* ==========================================
              SECTION 4: TABBED PERFORMANCE SECTION
              ========================================== */}
          <motion.div variants={itemVariants}>
            <Card className="overflow-hidden">
              {/* Tab Headers */}
              <div className="border-b border-gray-200 px-6">
                <div className="flex gap-8 overflow-x-auto">
                  {[
                    { id: 'overview', label: '📊 Overview' },
                    { id: 'classes', label: '🏫 Classes' },
                    { id: 'reports', label: '📈 Reports' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`py-4 px-2 font-medium border-b-2 transition-colors whitespace-nowrap text-sm ${
                        activeTab === tab.id
                          ? 'border-primary-600 text-primary-600'
                          : 'border-transparent text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <p className="text-xs text-green-600 font-medium mb-1">Top Performing Class</p>
                        <p className="text-xl font-bold text-green-800">SS2B</p>
                        <p className="text-sm text-green-700">Avg Score: 81%</p>
                      </div>
                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                        <p className="text-xs text-orange-600 font-medium mb-1">Needs Attention</p>
                        <p className="text-xl font-bold text-orange-800">SS2A</p>
                        <p className="text-sm text-orange-700">Avg Score: 68%</p>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <p className="text-xs text-blue-600 font-medium mb-1">Total Submissions</p>
                        <p className="text-xl font-bold text-blue-800">347</p>
                        <p className="text-sm text-blue-700">This month</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {mockClasses.filter(c => c.status === 'ACTIVE').map(cls => (
                        <div key={cls.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-xs">
                              {cls.name.slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{cls.name}</p>
                              <p className="text-xs text-gray-500">{cls.students} students</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-primary-600 h-2 rounded-full"
                                style={{ width: `${cls.avgScore}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-gray-700 w-10 text-right">{cls.avgScore}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* CLASSES TAB */}
                {activeTab === 'classes' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <input
                      type="text"
                      placeholder="Search classes..."
                      value={classSearch}
                      onChange={e => setClassSearch(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <div className="space-y-3">
                      {filteredClasses.map(cls => (
                        <div key={cls.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-primary-300 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-primary-700 font-bold text-sm">
                              {cls.name.slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{cls.name}</p>
                              <p className="text-xs text-gray-500">{cls.students} students · Avg: {cls.avgScore}%</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={cls.status === 'ACTIVE' ? 'success' : 'secondary'} size="sm">
                              {cls.status}
                            </Badge>
                            <Button variant="outline" size="sm" onClick={() => handleNav(`/teacher/classes/${cls.id}`, cls.name)}>
                              View
                            </Button>
                          </div>
                        </div>
                      ))}
                      {filteredClasses.length === 0 && (
                        <p className="text-center text-gray-500 py-8">No classes found</p>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* REPORTS TAB */}
                {activeTab === 'reports' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm font-semibold text-gray-700 mb-3">Performance by Subject</p>
                        {[
                          { subject: 'Mathematics', score: 74 },
                          { subject: 'English', score: 81 },
                          { subject: 'Physics', score: 68 },
                          { subject: 'Chemistry', score: 72 },
                          { subject: 'Biology', score: 79 }
                        ].map(s => (
                          <div key={s.subject} className="flex items-center gap-3 mb-2">
                            <span className="text-xs text-gray-600 w-24">{s.subject}</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${s.score}%` }} />
                            </div>
                            <span className="text-xs font-semibold text-gray-700 w-8 text-right">{s.score}%</span>
                          </div>
                        ))}
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm font-semibold text-gray-700 mb-3">Score Distribution</p>
                        {[
                          { range: '80-100%', count: 38, color: 'bg-green-500' },
                          { range: '60-79%', count: 61, color: 'bg-blue-500' },
                          { range: '40-59%', count: 29, color: 'bg-orange-500' },
                          { range: '0-39%', count: 14, color: 'bg-red-500' }
                        ].map(d => (
                          <div key={d.range} className="flex items-center gap-3 mb-2">
                            <span className="text-xs text-gray-600 w-20">{d.range}</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div className={`${d.color} h-2 rounded-full`} style={{ width: `${(d.count / 142) * 100}%` }} />
                            </div>
                            <span className="text-xs font-semibold text-gray-700 w-8 text-right">{d.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button variant="outline" size="sm" onClick={() => showToast.success('Export coming soon')}>
                        Export Report
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* ==========================================
              SECTION 5: RECENT ACTIVITY
              ========================================== */}
          <motion.div variants={itemVariants}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {mockActivity.map(activity => (
                <Card key={activity.id} className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                        activity.status === 'COMPLETED' ? 'bg-green-100' :
                        activity.status === 'PENDING' ? 'bg-orange-100' : 'bg-gray-100'
                      }`}>
                        {activity.status === 'COMPLETED'
                          ? <CheckCircle className="w-4 h-4 text-green-600" />
                          : activity.status === 'PENDING'
                          ? <Clock className="w-4 h-4 text-orange-600" />
                          : <AlertCircle className="w-4 h-4 text-gray-600" />
                        }
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500">{activity.timestamp}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {activity.score !== null && (
                        <span className={`text-sm font-bold ${activity.score >= 70 ? 'text-green-600' : activity.score >= 50 ? 'text-orange-600' : 'text-red-600'}`}>
                          {activity.score}%
                        </span>
                      )}
                      <Badge
                        variant={activity.status === 'COMPLETED' ? 'success' : activity.status === 'PENDING' ? 'warning' : 'secondary'}
                        size="sm"
                      >
                        {activity.status}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* ==========================================
              SECTION 6: QUICK TOOLS GRID (2x2)
              ========================================== */}
          <motion.div variants={itemVariants}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Tools</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  icon: <Users className="w-6 h-6 text-purple-600" />,
                  bg: 'bg-purple-100',
                  title: 'Manage Classes',
                  description: 'Create, edit, or delete classes',
                  action: () => handleNav('/teacher/classes', 'Classes')
                },
                {
                  icon: <BookOpen className="w-6 h-6 text-blue-600" />,
                  bg: 'bg-blue-100',
                  title: 'Question Bank',
                  description: 'Create and manage questions',
                  action: () => handleNav('/teacher/questions', 'Question Bank')
                },
                {
                  icon: <FileText className="w-6 h-6 text-green-600" />,
                  bg: 'bg-green-100',
                  title: 'Create Exams',
                  description: 'Design new exams from questions',
                  action: () => handleNav('/teacher/exam-creation', 'Exam Creation')
                },
                {
                  icon: <BarChart3 className="w-6 h-6 text-cyan-600" />,
                  bg: 'bg-cyan-100',
                  title: 'Analytics',
                  description: 'View detailed performance reports',
                  action: () => handleNav('/teacher/analytics', 'Analytics')
                }
              ].map(tool => (
                <motion.div
                  key={tool.title}
                  whileHover={reduced ? {} : { scale: 1.02 }}
                  whileTap={reduced ? {} : { scale: 0.98 }}
                >
                  <Card className="p-5 hover:shadow-lg transition-all cursor-pointer" onClick={tool.action}>
                    <div className="flex items-start gap-4">
                      <div className={`${tool.bg} p-3 rounded-xl flex-shrink-0`}>
                        {tool.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{tool.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">{tool.description}</p>
                        <Button variant="outline" size="sm" onClick={e => { e.stopPropagation(); tool.action() }}>
                          Open
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ==========================================
              SECTION 7: UPGRADE CARD (TRIAL only)
              ========================================== */}
          {shouldShowUpgrade && (
            <motion.div variants={itemVariants}>
              <div className="border-2 border-dashed border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-5 h-5 text-yellow-600" />
                      <h3 className="text-lg font-bold text-gray-900">Upgrade Your Plan</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Get more classes, students, and advanced features</p>
                    <ul className="space-y-1">
                      {['Unlimited classes', 'Advanced analytics', 'Video integration', 'API access'].map(f => (
                        <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="text-center md:text-right">
                    <p className="text-sm text-gray-500 mb-1">Starting at</p>
                    <p className="text-2xl font-bold text-gray-900 mb-3">₦50,000<span className="text-sm font-normal text-gray-500">/month</span></p>
                    <Button
                      variant="primary"
                      onClick={() => showToast.success('Redirecting to upgrade...')}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white"
                    >
                      Upgrade Now
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </motion.div>
      </Layout>
    </SafePageWrapper>
  )
}
