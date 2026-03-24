import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, Search, TrendingUp, TrendingDown, Award, AlertCircle, Filter } from 'lucide-react'
import Layout from '../../components/Layout'
import SafePageWrapper from '../../components/SafePageWrapper'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Input from '../../components/ui/Input'

const makeVariants = (reduced: boolean) => ({
  container: { hidden: { opacity: 0 }, visible: { opacity: 1, transition: reduced ? { duration: 0 } : { staggerChildren: 0.07 } } },
  item: { hidden: reduced ? { opacity: 1 } : { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: reduced ? 0 : 0.4 } } }
})

const MOCK_STUDENTS = [
  { id: '1', name: 'Amaka Obi', class: 'SS3A', avgScore: 88, exams: 12, trend: 'up', lastScore: 92, subject: 'Mathematics', status: 'EXCELLENT' },
  { id: '2', name: 'Chidi Nwosu', class: 'SS3B', avgScore: 74, exams: 10, trend: 'up', lastScore: 78, subject: 'English', status: 'GOOD' },
  { id: '3', name: 'Fatima Bello', class: 'SS2A', avgScore: 61, exams: 8, trend: 'down', lastScore: 55, subject: 'Physics', status: 'AVERAGE' },
  { id: '4', name: 'Emeka Eze', class: 'SS3A', avgScore: 45, exams: 9, trend: 'down', lastScore: 42, subject: 'Chemistry', status: 'NEEDS_HELP' },
  { id: '5', name: 'Ngozi Adeyemi', class: 'SS2B', avgScore: 82, exams: 11, trend: 'up', lastScore: 85, subject: 'Biology', status: 'GOOD' },
  { id: '6', name: 'Tunde Afolabi', class: 'SS3B', avgScore: 38, exams: 7, trend: 'down', lastScore: 35, subject: 'Mathematics', status: 'NEEDS_HELP' },
  { id: '7', name: 'Blessing Okafor', class: 'SS2A', avgScore: 91, exams: 13, trend: 'up', lastScore: 94, subject: 'English', status: 'EXCELLENT' },
  { id: '8', name: 'Kelechi Ibe', class: 'SS1A', avgScore: 67, exams: 5, trend: 'up', lastScore: 70, subject: 'Physics', status: 'AVERAGE' },
]

const STATUS_CONFIG: Record<string, { label: string; variant: 'success' | 'warning' | 'secondary' | 'danger'; color: string }> = {
  EXCELLENT: { label: 'Excellent', variant: 'success', color: 'text-green-600' },
  GOOD: { label: 'Good', variant: 'success', color: 'text-blue-600' },
  AVERAGE: { label: 'Average', variant: 'warning', color: 'text-orange-600' },
  NEEDS_HELP: { label: 'Needs Help', variant: 'danger', color: 'text-red-600' },
}

export default function StudentProgress() {
  const navigate = useNavigate()
  const reduced = useReducedMotion() ?? false
  const { container, item } = makeVariants(reduced)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [filterClass, setFilterClass] = useState('ALL')

  const classes = ['ALL', ...new Set(MOCK_STUDENTS.map(s => s.class))]
  const statuses = ['ALL', 'EXCELLENT', 'GOOD', 'AVERAGE', 'NEEDS_HELP']

  const filtered = MOCK_STUDENTS.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.subject.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'ALL' || s.status === filterStatus
    const matchClass = filterClass === 'ALL' || s.class === filterClass
    return matchSearch && matchStatus && matchClass
  })

  const needsHelp = MOCK_STUDENTS.filter(s => s.status === 'NEEDS_HELP').length
  const excellent = MOCK_STUDENTS.filter(s => s.status === 'EXCELLENT').length

  return (
    <SafePageWrapper pageName="Student Progress">
      <Layout>
        <motion.div variants={container} initial="hidden" animate="visible"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

          {/* Header */}
          <motion.div variants={item} className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/teacher/dashboard')}
              className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Student Progress</h1>
              <p className="text-gray-500 text-sm">Track performance across all your students</p>
            </div>
          </motion.div>

          {/* Alert: Students needing help */}
          {needsHelp > 0 && (
            <motion.div variants={item}>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">
                  <span className="font-semibold">{needsHelp} student{needsHelp > 1 ? 's' : ''}</span> need immediate attention — scoring below 50%.
                </p>
              </div>
            </motion.div>
          )}

          {/* Summary Cards */}
          <motion.div variants={container} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Students', value: MOCK_STUDENTS.length, color: 'text-primary-600' },
              { label: 'Excellent', value: excellent, color: 'text-green-600' },
              { label: 'Needs Help', value: needsHelp, color: 'text-red-600' },
              { label: 'Class Avg', value: `${Math.round(MOCK_STUDENTS.reduce((s, st) => s + st.avgScore, 0) / MOCK_STUDENTS.length)}%`, color: 'text-blue-600' }
            ].map(stat => (
              <motion.div key={stat.label} variants={item}>
                <Card className="p-4 text-center">
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Filters */}
          <motion.div variants={item} className="space-y-3">
            <Input icon={<Search className="w-5 h-5" />} placeholder="Search students or subjects..."
              value={search} onChange={e => setSearch(e.target.value)} />
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600 flex items-center gap-1 mr-1"><Filter className="w-4 h-4" />Class:</span>
              {classes.map(c => (
                <Button key={c} size="sm" variant={filterClass === c ? 'primary' : 'outline'} onClick={() => setFilterClass(c)}>{c}</Button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600 mr-1">Status:</span>
              {statuses.map(s => (
                <Button key={s} size="sm" variant={filterStatus === s ? 'primary' : 'outline'} onClick={() => setFilterStatus(s)}>
                  {s === 'ALL' ? 'All' : STATUS_CONFIG[s]?.label}
                </Button>
              ))}
            </div>
          </motion.div>

          {/* Student Table */}
          <motion.div variants={container} className="space-y-3">
            {filtered.map(student => (
              <motion.div key={student.id} variants={item}>
                <Card className="p-4 hover:shadow-md transition-all">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">{student.name}</p>
                        <Badge variant={STATUS_CONFIG[student.status]?.variant} size="sm">
                          {STATUS_CONFIG[student.status]?.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500">{student.class} · {student.subject} · {student.exams} exams taken</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className={`text-xl font-bold ${STATUS_CONFIG[student.status]?.color}`}>{student.avgScore}%</p>
                        <p className="text-xs text-gray-500">Average</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-gray-700">{student.lastScore}%</p>
                        <p className="text-xs text-gray-500">Last Score</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {student.trend === 'up'
                          ? <TrendingUp className="w-5 h-5 text-green-500" />
                          : <TrendingDown className="w-5 h-5 text-red-500" />
                        }
                        <span className={`text-sm font-medium ${student.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                          {student.trend === 'up' ? 'Improving' : 'Declining'}
                        </span>
                      </div>
                    </div>
                    <div className="w-32">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{student.avgScore}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${student.avgScore >= 80 ? 'bg-green-500' : student.avgScore >= 60 ? 'bg-blue-500' : student.avgScore >= 40 ? 'bg-orange-500' : 'bg-red-500'}`}
                          style={{ width: `${student.avgScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <Card className="p-12 text-center">
                <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No students match your filters</p>
              </Card>
            )}
          </motion.div>
        </motion.div>
      </Layout>
    </SafePageWrapper>
  )
}
