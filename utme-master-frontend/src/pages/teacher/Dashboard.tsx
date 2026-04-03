import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import {
  Plus, Users, TrendingUp, BarChart3,
  FileText, BookOpen, CheckCircle,
  Clock, Zap, Activity, RefreshCw, AlertCircle
} from 'lucide-react'
import Layout from '../../components/Layout'
import SafePageWrapper from '../../components/SafePageWrapper'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { useAuthStore } from '../../store/auth'
import { showToast } from '../../components/ui/Toast'
import { getAdminDashboard, type AdminDashboardData } from '../../api/admin'

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

const teacherQuotes = [
  "The art of teaching is the art of assisting discovery.",
  "Education is not the filling of a pail, but the lighting of a fire.",
  "A good teacher can inspire hope, ignite the imagination, and instill a love of learning.",
  "Teaching is the greatest act of optimism."
]

export default function TeacherDashboard() {
  const navigate = useNavigate()
  const reduced = useReducedMotion() ?? false
  const { container: containerVariants, item: itemVariants } = makeVariants(reduced)
  const { user } = useAuthStore()

  const [data, setData] = useState<AdminDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'subjects'>('overview')

  const teacherName = user ? `${(user as any).firstName ?? ''} ${(user as any).lastName ?? ''}`.trim() || user.email : 'Teacher'
  const shouldShowUpgrade = (user as any)?.licenseTier === 'TRIAL'
  const quote = teacherQuotes[new Date().getDay() % teacherQuotes.length]
  const formattedDate = new Date().toLocaleDateString('en-NG', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  const load = async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const result = await getAdminDashboard()
      setData(result)
      setLastUpdated(new Date())
    } catch {
      showToast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    load()
    const interval = setInterval(() => load(true), 60_000)
    return () => clearInterval(interval)
  }, [])

  const handleNav = (path: string, label: string) => {
    navigate(path)
  }

  const stats = data?.stats
  const activity = data?.recentActivity ?? []
  const subjects = data?.subjectDistribution ?? []
  const examStatus = data?.examStatusStats

  const getTimeAgo = (dateString: string) => {
    const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 60000)
    if (diff < 1) return 'Just now'
    if (diff < 60) return `${diff}m ago`
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
    return `${Math.floor(diff / 1440)}d ago`
  }

  if (loading) {
    return (
      <SafePageWrapper pageName="Teacher Dashboard">
        <Layout>
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="animate-pulse space-y-6">
              <div className="h-32 bg-gray-100 rounded-2xl" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-2xl" />)}
              </div>
              <div className="h-64 bg-gray-100 rounded-2xl" />
            </div>
          </div>
        </Layout>
      </SafePageWrapper>
    )
  }

  return (
    <SafePageWrapper pageName="Teacher Dashboard">
      <Layout>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
        >

          {/* Header */}
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
                    <p className="text-2xl font-bold">{stats?.totalStudents ?? 0}</p>
                    <p className="text-xs text-primary-100">Students</p>
                  </div>
                  <div className="bg-white/20 rounded-xl px-4 py-3 text-center">
                    <p className="text-2xl font-bold">{stats?.totalExams ?? 0}</p>
                    <p className="text-xs text-primary-100">Exams</p>
                  </div>
                  <div className="bg-white/20 rounded-xl px-4 py-3 text-center">
                    <p className="text-2xl font-bold">{stats?.totalQuestions ?? 0}</p>
                    <p className="text-xs text-primary-100">Questions</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats row */}
          <motion.div variants={containerVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Users, label: 'Total Students', value: stats?.totalStudents ?? 0, color: 'bg-blue-100 text-blue-600' },
              { icon: FileText, label: 'Total Exams', value: stats?.totalExams ?? 0, color: 'bg-amber-100 text-amber-600' },
              { icon: BookOpen, label: 'Questions', value: stats?.totalQuestions ?? 0, color: 'bg-green-100 text-green-600' },
              { icon: TrendingUp, label: 'Exams Completed', value: examStatus?.completed ?? 0, color: 'bg-purple-100 text-purple-600' },
            ].map(s => (
              <motion.div key={s.label} variants={itemVariants}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
                <div className={`p-3 rounded-xl ${s.color}`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{s.value.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">{s.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Create Exam', icon: Plus, path: '/teacher/exam-creation', color: 'bg-primary-600 hover:bg-primary-700' },
                { label: 'Question Bank', icon: BookOpen, path: '/teacher/questions', color: 'bg-green-600 hover:bg-green-700' },
                { label: 'Student Progress', icon: TrendingUp, path: '/teacher/students', color: 'bg-purple-600 hover:bg-purple-700' },
                { label: 'Analytics', icon: BarChart3, path: '/teacher/analytics', color: 'bg-cyan-600 hover:bg-cyan-700' }
              ].map(action => (
                <motion.button
                  key={action.label}
                  whileHover={reduced ? {} : { scale: 1.02 }}
                  whileTap={reduced ? {} : { scale: 0.98 }}
                  onClick={() => handleNav(action.path, action.label)}
                  className={`${action.color} text-white rounded-xl p-4 flex flex-col items-center gap-2 transition-all shadow-sm hover:shadow-md`}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-sm font-medium text-center">{action.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Tabbed section */}
          <motion.div variants={itemVariants}>
            <Card className="overflow-hidden">
              <div className="border-b border-gray-200 px-6 flex items-center justify-between">
                <div className="flex gap-6 overflow-x-auto">
                  {[
                    { id: 'overview', label: '📊 Overview' },
                    { id: 'activity', label: '🕐 Recent Activity' },
                    { id: 'subjects', label: '📚 Subjects' },
                  ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                      className={`py-4 px-1 font-medium border-b-2 transition-colors whitespace-nowrap text-sm ${
                        activeTab === tab.id
                          ? 'border-primary-600 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-800'
                      }`}>
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 pl-4 shrink-0">
                  {lastUpdated && (
                    <span className="text-xs text-gray-400 hidden md:block">
                      {lastUpdated.toLocaleTimeString()}
                    </span>
                  )}
                  <button onClick={() => load(true)} disabled={refreshing}
                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* OVERVIEW */}
                {activeTab === 'overview' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    {/* Exam status bars */}
                    {examStatus && (
                      <div className="space-y-3">
                        <p className="text-sm font-semibold text-gray-700">Exam Status</p>
                        {[
                          { label: 'Completed', value: examStatus.completed, color: 'bg-green-500' },
                          { label: 'In Progress', value: examStatus.in_progress, color: 'bg-blue-500' },
                          { label: 'Not Started', value: examStatus.not_started, color: 'bg-gray-300' },
                        ].map(({ label, value, color }) => {
                          const total = examStatus.completed + examStatus.in_progress + examStatus.not_started
                          const pct = total > 0 ? Math.round((value / total) * 100) : 0
                          return (
                            <div key={label}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">{label}</span>
                                <span className="font-medium">{value.toLocaleString()} ({pct}%)</span>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                                  transition={{ duration: 0.8 }}
                                  className={`h-full rounded-full ${color}`} />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ACTIVITY */}
                {activeTab === 'activity' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                    {activity.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <Activity className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p className="text-sm">No recent activity</p>
                      </div>
                    ) : (
                      activity.map((item, i) => (
                        <div key={item.id || i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                          <div className={`p-2 rounded-lg shrink-0 ${
                            item.type === 'exam_completed' ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'
                          }`}>
                            {item.type === 'exam_completed'
                              ? <CheckCircle className="w-4 h-4" />
                              : <Users className="w-4 h-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-800 truncate">{item.description}</p>
                            <p className="text-xs text-gray-400">{getTimeAgo(item.time)}</p>
                          </div>
                          {item.score != null && item.score > 0 && (
                            <span className={`text-sm font-bold shrink-0 ${item.score >= 50 ? 'text-green-600' : 'text-red-500'}`}>
                              {item.score}%
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </motion.div>
                )}

                {/* SUBJECTS */}
                {activeTab === 'subjects' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {subjects.length === 0 ? (
                      <p className="text-center text-gray-400 py-8 text-sm">No subjects found</p>
                    ) : (
                      <div className="space-y-2">
                        {subjects.map(s => {
                          const maxQ = Math.max(...subjects.map(x => x.questions), 1)
                          const pct = Math.round((s.questions / maxQ) * 100)
                          return (
                            <div key={s.code} className="flex items-center gap-3">
                              <span className="text-xs font-bold text-gray-500 w-10 shrink-0">{s.code}</span>
                              <span className="text-sm text-gray-700 w-28 shrink-0 truncate">{s.subject}</span>
                              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                                  transition={{ duration: 0.6 }}
                                  className="h-full bg-blue-500 rounded-full" />
                              </div>
                              <span className="text-sm font-semibold text-gray-700 w-12 text-right shrink-0">
                                {s.questions.toLocaleString()}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Quick Tools */}
          <motion.div variants={itemVariants}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Tools</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: BookOpen, bg: 'bg-blue-100', color: 'text-blue-600', title: 'Question Bank', description: 'Create and manage questions', path: '/teacher/questions' },
                { icon: FileText, bg: 'bg-green-100', color: 'text-green-600', title: 'Create Exams', description: 'Design new exams from questions', path: '/teacher/exam-creation' },
                { icon: TrendingUp, bg: 'bg-purple-100', color: 'text-purple-600', title: 'Student Progress', description: 'Track student performance', path: '/teacher/students' },
                { icon: BarChart3, bg: 'bg-cyan-100', color: 'text-cyan-600', title: 'Analytics', description: 'View detailed performance reports', path: '/teacher/analytics' }
              ].map(tool => (
                <motion.div key={tool.title} whileHover={reduced ? {} : { scale: 1.02 }} whileTap={reduced ? {} : { scale: 0.98 }}>
                  <Card className="p-5 hover:shadow-lg transition-all cursor-pointer" onClick={() => handleNav(tool.path, tool.title)}>
                    <div className="flex items-start gap-4">
                      <div className={`${tool.bg} p-3 rounded-xl shrink-0`}>
                        <tool.icon className={`w-6 h-6 ${tool.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{tool.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">{tool.description}</p>
                        <Button variant="outline" size="sm" onClick={e => { e.stopPropagation(); handleNav(tool.path, tool.title) }}>
                          Open
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Upgrade card (trial only) */}
          {shouldShowUpgrade && (
            <motion.div variants={itemVariants}>
              <div className="border-2 border-dashed border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-5 h-5 text-yellow-600" />
                      <h3 className="text-lg font-bold text-gray-900">Upgrade Your Plan</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Get more features and advanced analytics</p>
                    <ul className="space-y-1">
                      {['Unlimited questions', 'Advanced analytics', 'Video integration', 'API access'].map(f => (
                        <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />{f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="text-center md:text-right">
                    <p className="text-sm text-gray-500 mb-1">Starting at</p>
                    <p className="text-2xl font-bold text-gray-900 mb-3">₦50,000<span className="text-sm font-normal text-gray-500">/month</span></p>
                    <Button variant="primary" onClick={() => showToast.success('Redirecting to upgrade...')}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white">
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
