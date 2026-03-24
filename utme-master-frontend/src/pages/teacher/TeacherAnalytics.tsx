import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, TrendingUp, Award, BarChart3, Users, BookOpen } from 'lucide-react'
import Layout from '../../components/Layout'
import SafePageWrapper from '../../components/SafePageWrapper'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

const makeVariants = (reduced: boolean) => ({
  container: { hidden: { opacity: 0 }, visible: { opacity: 1, transition: reduced ? { duration: 0 } : { staggerChildren: 0.08 } } },
  item: { hidden: reduced ? { opacity: 1 } : { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: reduced ? 0 : 0.4 } } }
})

const SUBJECT_PERFORMANCE = [
  { subject: 'Mathematics', avgScore: 74, students: 83, exams: 15, trend: '+3%' },
  { subject: 'English Language', avgScore: 81, students: 65, exams: 12, trend: '+5%' },
  { subject: 'Physics', avgScore: 68, students: 59, exams: 10, trend: '-2%' },
  { subject: 'Chemistry', avgScore: 72, students: 45, exams: 11, trend: '+1%' },
  { subject: 'Biology', avgScore: 79, students: 38, exams: 9, trend: '+4%' },
]

const MONTHLY_TREND = [
  { month: 'Oct', avg: 65, exams: 18 },
  { month: 'Nov', avg: 68, exams: 22 },
  { month: 'Dec', avg: 71, exams: 15 },
  { month: 'Jan', avg: 69, exams: 20 },
  { month: 'Feb', avg: 74, exams: 25 },
  { month: 'Mar', avg: 76, exams: 28 },
]

const SCORE_DISTRIBUTION = [
  { range: '80–100%', count: 52, color: 'bg-green-500' },
  { range: '60–79%', count: 78, color: 'bg-blue-500' },
  { range: '40–59%', count: 34, color: 'bg-orange-500' },
  { range: '0–39%', count: 18, color: 'bg-red-500' },
]

const total = SCORE_DISTRIBUTION.reduce((s, d) => s + d.count, 0)

export default function TeacherAnalytics() {
  const navigate = useNavigate()
  const reduced = useReducedMotion() ?? false
  const { container, item } = makeVariants(reduced)
  const [period, setPeriod] = useState<'week' | 'month' | 'term'>('month')

  const maxMonthly = Math.max(...MONTHLY_TREND.map(m => m.avg))

  return (
    <SafePageWrapper pageName="Teacher Analytics">
      <Layout>
        <motion.div variants={container} initial="hidden" animate="visible"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

          {/* Header */}
          <motion.div variants={item} className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/teacher/dashboard')}
              className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
              <p className="text-gray-500 text-sm">Performance insights across your classes</p>
            </div>
            <div className="flex gap-2">
              {(['week', 'month', 'term'] as const).map(p => (
                <Button key={p} size="sm" variant={period === p ? 'primary' : 'outline'} onClick={() => setPeriod(p)}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Button>
              ))}
            </div>
          </motion.div>

          {/* KPI Cards */}
          <motion.div variants={container} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <Users className="w-5 h-5" />, label: 'Total Students', value: '142', color: 'bg-blue-500', bg: 'from-blue-50 to-blue-100' },
              { icon: <BookOpen className="w-5 h-5" />, label: 'Exams Given', value: '57', color: 'bg-purple-500', bg: 'from-purple-50 to-purple-100' },
              { icon: <Award className="w-5 h-5" />, label: 'Class Average', value: '75%', color: 'bg-green-500', bg: 'from-green-50 to-green-100' },
              { icon: <TrendingUp className="w-5 h-5" />, label: 'Improvement', value: '+4%', color: 'bg-cyan-500', bg: 'from-cyan-50 to-cyan-100' },
            ].map(kpi => (
              <motion.div key={kpi.label} variants={item}>
                <Card className={`p-5 bg-gradient-to-br ${kpi.bg}`}>
                  <div className="flex items-center gap-3">
                    <div className={`${kpi.color} p-2 rounded-xl text-white`}>{kpi.icon}</div>
                    <div>
                      <p className="text-xl font-bold text-gray-900">{kpi.value}</p>
                      <p className="text-xs text-gray-600">{kpi.label}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Trend Chart */}
            <motion.div variants={item}>
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary-600" /> Score Trend ({period})
                </h3>
                <div className="flex items-end gap-3 h-40">
                  {MONTHLY_TREND.map(m => (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs font-semibold text-gray-700">{m.avg}%</span>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(m.avg / maxMonthly) * 100}%` }}
                        transition={{ duration: reduced ? 0 : 0.6, delay: reduced ? 0 : 0.1 }}
                        className="w-full bg-primary-500 rounded-t-md min-h-[4px]"
                        style={{ height: `${(m.avg / maxMonthly) * 100}%` }}
                      />
                      <span className="text-xs text-gray-500">{m.month}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Score Distribution */}
            <motion.div variants={item}>
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Score Distribution</h3>
                <div className="space-y-3">
                  {SCORE_DISTRIBUTION.map(d => (
                    <div key={d.range}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{d.range}</span>
                        <span className="font-semibold text-gray-900">{d.count} students ({Math.round((d.count / total) * 100)}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(d.count / total) * 100}%` }}
                          transition={{ duration: reduced ? 0 : 0.7 }}
                          className={`${d.color} h-3 rounded-full`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Subject Performance Table */}
          <motion.div variants={item}>
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Performance by Subject</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 text-gray-600 font-medium">Subject</th>
                      <th className="text-center py-3 text-gray-600 font-medium">Students</th>
                      <th className="text-center py-3 text-gray-600 font-medium">Exams</th>
                      <th className="text-center py-3 text-gray-600 font-medium">Avg Score</th>
                      <th className="text-center py-3 text-gray-600 font-medium">Trend</th>
                      <th className="text-left py-3 text-gray-600 font-medium">Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SUBJECT_PERFORMANCE.map(s => (
                      <tr key={s.subject} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 font-medium text-gray-900">{s.subject}</td>
                        <td className="py-3 text-center text-gray-600">{s.students}</td>
                        <td className="py-3 text-center text-gray-600">{s.exams}</td>
                        <td className={`py-3 text-center font-bold ${s.avgScore >= 75 ? 'text-green-600' : s.avgScore >= 60 ? 'text-blue-600' : 'text-orange-600'}`}>
                          {s.avgScore}%
                        </td>
                        <td className={`py-3 text-center font-medium ${s.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                          {s.trend}
                        </td>
                        <td className="py-3 w-32">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${s.avgScore}%` }} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>

        </motion.div>
      </Layout>
    </SafePageWrapper>
  )
}
