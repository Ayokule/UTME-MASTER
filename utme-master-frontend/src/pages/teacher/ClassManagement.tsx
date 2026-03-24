import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Users, Plus, Search, ArrowLeft, TrendingUp, BookOpen, Trash2, Edit2 } from 'lucide-react'
import Layout from '../../components/Layout'
import SafePageWrapper from '../../components/SafePageWrapper'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Input from '../../components/ui/Input'
import { showToast } from '../../components/ui/Toast'

const makeVariants = (reduced: boolean) => ({
  container: { hidden: { opacity: 0 }, visible: { opacity: 1, transition: reduced ? { duration: 0 } : { staggerChildren: 0.08 } } },
  item: { hidden: reduced ? { opacity: 1 } : { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: reduced ? 0 : 0.4 } } }
})

const MOCK_CLASSES = [
  { id: '1', name: 'SS3A', subject: 'Mathematics', students: 45, avgScore: 78, exams: 8, status: 'ACTIVE', lastActivity: '2 hours ago' },
  { id: '2', name: 'SS3B', subject: 'English Language', students: 38, avgScore: 72, exams: 6, status: 'ACTIVE', lastActivity: '1 day ago' },
  { id: '3', name: 'SS2A', subject: 'Physics', students: 32, avgScore: 68, exams: 5, status: 'ACTIVE', lastActivity: '3 hours ago' },
  { id: '4', name: 'SS2B', subject: 'Chemistry', students: 27, avgScore: 81, exams: 7, status: 'ACTIVE', lastActivity: 'Yesterday' },
  { id: '5', name: 'SS1A', subject: 'Biology', students: 0, avgScore: 0, exams: 0, status: 'DRAFT', lastActivity: 'Never' },
]

export default function ClassManagement() {
  const navigate = useNavigate()
  const reduced = useReducedMotion() ?? false
  const { container, item } = makeVariants(reduced)
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [newClass, setNewClass] = useState({ name: '', subject: '' })

  const filtered = MOCK_CLASSES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.subject.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = () => {
    if (!newClass.name || !newClass.subject) {
      showToast.error('Please fill in all fields')
      return
    }
    showToast.success(`Class "${newClass.name}" created!`)
    setShowCreate(false)
    setNewClass({ name: '', subject: '' })
  }

  return (
    <SafePageWrapper pageName="Class Management">
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
              <h1 className="text-2xl font-bold text-gray-900">Class Management</h1>
              <p className="text-gray-500 text-sm">Manage your classes and student groups</p>
            </div>
            <Button variant="primary" onClick={() => setShowCreate(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> New Class
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div variants={container} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Classes', value: MOCK_CLASSES.length, color: 'text-primary-600' },
              { label: 'Active', value: MOCK_CLASSES.filter(c => c.status === 'ACTIVE').length, color: 'text-green-600' },
              { label: 'Total Students', value: MOCK_CLASSES.reduce((s, c) => s + c.students, 0), color: 'text-blue-600' },
              { label: 'Avg Score', value: `${Math.round(MOCK_CLASSES.filter(c => c.avgScore > 0).reduce((s, c) => s + c.avgScore, 0) / MOCK_CLASSES.filter(c => c.avgScore > 0).length)}%`, color: 'text-purple-600' }
            ].map(stat => (
              <motion.div key={stat.label} variants={item}>
                <Card className="p-4 text-center">
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Create Class Form */}
          {showCreate && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-6 border-2 border-primary-200 bg-primary-50">
                <h3 className="font-semibold text-gray-900 mb-4">Create New Class</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <Input label="Class Name" placeholder="e.g. SS3A" value={newClass.name}
                    onChange={e => setNewClass(p => ({ ...p, name: e.target.value }))} />
                  <Input label="Subject" placeholder="e.g. Mathematics" value={newClass.subject}
                    onChange={e => setNewClass(p => ({ ...p, subject: e.target.value }))} />
                </div>
                <div className="flex gap-3">
                  <Button variant="primary" onClick={handleCreate}>Create Class</Button>
                  <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Search */}
          <motion.div variants={item}>
            <Input icon={<Search className="w-5 h-5" />} placeholder="Search classes or subjects..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </motion.div>

          {/* Class List */}
          <motion.div variants={container} className="space-y-3">
            {filtered.map(cls => (
              <motion.div key={cls.id} variants={item}>
                <Card className="p-5 hover:shadow-md transition-all">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-700 font-bold flex-shrink-0">
                      {cls.name.slice(0, 2)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{cls.name}</h3>
                        <Badge variant={cls.status === 'ACTIVE' ? 'success' : 'secondary'} size="sm">{cls.status}</Badge>
                      </div>
                      <p className="text-sm text-gray-500">{cls.subject} · Last activity: {cls.lastActivity}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-lg font-bold text-gray-900">{cls.students}</p>
                        <p className="text-xs text-gray-500 flex items-center justify-center gap-1"><Users className="w-3 h-3" />Students</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-900">{cls.exams}</p>
                        <p className="text-xs text-gray-500 flex items-center justify-center gap-1"><BookOpen className="w-3 h-3" />Exams</p>
                      </div>
                      <div>
                        <p className={`text-lg font-bold ${cls.avgScore >= 70 ? 'text-green-600' : cls.avgScore >= 50 ? 'text-orange-600' : 'text-gray-400'}`}>
                          {cls.avgScore > 0 ? `${cls.avgScore}%` : '—'}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center justify-center gap-1"><TrendingUp className="w-3 h-3" />Avg</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => showToast.success(`Editing ${cls.name}`)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/teacher/students?class=${cls.id}`)}>
                        View
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => showToast.error(`Delete ${cls.name}?`)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <Card className="p-12 text-center">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No classes found</p>
              </Card>
            )}
          </motion.div>
        </motion.div>
      </Layout>
    </SafePageWrapper>
  )
}
