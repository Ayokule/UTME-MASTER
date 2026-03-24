import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Users, BookOpen, FileText, Activity, Plus, BarChart3,
  Upload, GraduationCap, Target, UserCheck, RefreshCw,
  Database, CheckCircle, AlertCircle, TrendingUp, Eye,
  Settings, Shield, ClipboardList, Flag
} from 'lucide-react'
import Layout from '../../components/Layout'
import { getAdminDashboard, AdminDashboardData } from '../../api/admin'
import { useAuthStore } from '../../store/auth'
import { showToast } from '../../components/ui/Toast'
import Button from '../../components/ui/Button'
import SafePageWrapper from '../../components/SafePageWrapper'

// ---- Stat card ----
function StatCard({ icon: Icon, label, value, color }: {
  icon: any; label: string; value: number | string; color: string
}) {
  return (
    <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{typeof value === 'number' ? value.toLocaleString() : value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </motion.div>
  )
}

// ---- Quick action card ----
function ActionCard({ to, icon: Icon, label, sub, color }: {
  to: string; icon: any; label: string; sub: string; color: string
}) {
  return (
    <Link to={to}>
      <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">{label}</p>
          <p className="text-xs text-gray-500">{sub}</p>
        </div>
      </motion.div>
    </Link>
  )
}

export default function AdminDashboard() {
  const { user } = useAuthStore()
  const [data, setData] = useState<AdminDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const result = await getAdminDashboard()
      setData(result)
    } catch (err: any) {
      showToast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { load() }, [])

  const getTimeAgo = (dateString: string) => {
    const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 60000)
    if (diff < 1) return 'Just now'
    if (diff < 60) return `${diff}m ago`
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
    return `${Math.floor(diff / 1440)}d ago`
  }

  const stats = data?.stats
  const activity = data?.recentActivity ?? []
  const subjects = data?.subjectDistribution ?? []
  const examStatus = data?.examStatusStats
  const health = data?.systemHealth

  const statCards = [
    { icon: GraduationCap, label: 'Students', value: stats?.totalStudents ?? 0, color: 'bg-blue-500' },
    { icon: Users, label: 'Teachers', value: stats?.totalTeachers ?? 0, color: 'bg-purple-500' },
    { icon: BookOpen, label: 'Questions', value: stats?.totalQuestions ?? 0, color: 'bg-green-500' },
    { icon: FileText, label: 'Exams', value: stats?.totalExams ?? 0, color: 'bg-amber-500' },
    { icon: Activity, label: 'Active Users', value: stats?.activeUsers ?? 0, color: 'bg-indigo-500' },
    { icon: Target, label: 'Subjects', value: stats?.totalSubjects ?? 0, color: 'bg-pink-500' },
  ]

  const actionCards = [
    { to: '/admin/exams/create', icon: Plus, label: 'Create Exam', sub: 'New official exam', color: 'bg-blue-500' },
    { to: '/admin/questions/create', icon: BookOpen, label: 'Add Question', sub: 'New question', color: 'bg-green-500' },
    { to: '/admin/questions', icon: Eye, label: 'Question Bank', sub: 'Browse & manage', color: 'bg-purple-500' },
    { to: '/admin/bulk-import', icon: Upload, label: 'Bulk Import', sub: 'CSV upload', color: 'bg-orange-500' },
    { to: '/admin/analytics', icon: BarChart3, label: 'Analytics', sub: 'Performance insights', color: 'bg-indigo-500' },
    { to: '/admin/data-management', icon: Database, label: 'Data Management', sub: 'Health & duplicates', color: 'bg-teal-500' },
    { to: '/admin/licenses', icon: Shield, label: 'Licenses', sub: 'Manage licenses', color: 'bg-red-500' },
    { to: '/admin/users', icon: UserCheck, label: 'Users', sub: 'Manage accounts', color: 'bg-cyan-500' },
    { to: '/admin/flagged-questions', icon: Flag, label: 'Flagged Questions', sub: 'Student reports', color: 'bg-amber-500' },
    { to: '/admin/settings', icon: Settings, label: 'Settings', sub: 'System config', color: 'bg-gray-500' },
  ]

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-24 bg-gray-100 rounded-2xl" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-2xl" />)}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-2xl" />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-80 bg-gray-100 rounded-2xl" />
              <div className="h-80 bg-gray-100 rounded-2xl" />
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <SafePageWrapper pageName="Admin Dashboard">
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user?.role === 'TEACHER' ? 'Teacher' : 'Admin'} Dashboard
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Welcome back, {user?.firstName}. Here's your system overview.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => load(true)} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {statCards.map(s => <StatCard key={s.label} {...s} />)}
          </div>

          {/* Quick Actions */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Actions</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {actionCards.map(a => <ActionCard key={a.to} {...a} />)}
            </div>
          </div>

          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Recent Activity */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-blue-500" />Recent Activity
                </h2>
                <span className="text-xs text-gray-400">{activity.length} recent</span>
              </div>
              {activity.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {activity.map((item, i) => (
                    <motion.div key={item.id || i}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className={`p-2 rounded-lg shrink-0 ${
                        item.type === 'exam_completed' ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'
                      }`}>
                        {item.type === 'exam_completed' ? <Target className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
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
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Right column */}
            <div className="space-y-5">

              {/* Exam Status */}
              {examStatus && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-500" />Exam Status
                  </h2>
                  <div className="space-y-3">
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
                            <span className="font-medium text-gray-900">{value.toLocaleString()}</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8, delay: 0.2 }}
                              className={`h-full rounded-full ${color}`} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* System Health */}
              {health && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-500" />System Health
                  </h2>
                  <div className="space-y-2">
                    {[
                      { label: 'Database', status: health.database },
                      { label: 'API', status: health.api },
                      { label: 'Storage', status: health.storage },
                    ].map(({ label, status }) => (
                      <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <span className="text-sm text-gray-600">{label}</span>
                        <div className={`flex items-center gap-1.5 text-sm font-medium ${status === 'healthy' ? 'text-green-600' : 'text-red-500'}`}>
                          {status === 'healthy'
                            ? <CheckCircle className="w-4 h-4" />
                            : <AlertCircle className="w-4 h-4" />}
                          <span className="capitalize">{status}</span>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm text-gray-600">Uptime</span>
                      <span className="text-sm font-semibold text-green-600">{health.uptime}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Subject Distribution */}
          {subjects.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-500" />Question Bank by Subject
                </h2>
                <Link to="/admin/questions" className="text-xs text-blue-600 hover:underline">View all →</Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {subjects.map(s => {
                  const maxQ = Math.max(...subjects.map(x => x.questions), 1)
                  const pct = Math.round((s.questions / maxQ) * 100)
                  return (
                    <div key={s.code} className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-500 uppercase">{s.code}</span>
                        <span className="text-sm font-bold text-gray-900">{s.questions.toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2 truncate">{s.subject}</p>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: 0.3 }}
                          className="h-full bg-blue-500 rounded-full" />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

        </div>
      </Layout>
    </SafePageWrapper>
  )
}
