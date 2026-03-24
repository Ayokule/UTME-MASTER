import { useState, useEffect } from 'react'
import { Flag, CheckCircle, XCircle, Clock, Filter, RefreshCw, AlertTriangle } from 'lucide-react'
import { motion } from 'framer-motion'
import Layout from '../../components/Layout'
import { getFlaggedQuestions, updateFlaggedQuestionStatus } from '../../api/exams'
import { showToast } from '../../components/ui/Toast'

interface FlaggedItem {
  id: string
  status: 'PENDING' | 'REVIEWED' | 'DISMISSED'
  createdAt: string
  reviewedAt?: string
  question: {
    id: string
    questionText: string
    subject: { name: string }
    difficulty: string
    examType: string
  } | null
  student: { id: string; firstName: string; lastName: string; email: string } | null
  exam: { id: string; title: string } | null
}

const STATUS_STYLES = {
  PENDING: 'bg-amber-100 text-amber-700',
  REVIEWED: 'bg-green-100 text-green-700',
  DISMISSED: 'bg-gray-100 text-gray-500'
}

const STATUS_ICONS = {
  PENDING: <Clock className="w-3.5 h-3.5" />,
  REVIEWED: <CheckCircle className="w-3.5 h-3.5" />,
  DISMISSED: <XCircle className="w-3.5 h-3.5" />
}

export default function FlaggedQuestions() {
  const [items, setItems] = useState<FlaggedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('')
  const [updating, setUpdating] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await getFlaggedQuestions(filter ? { status: filter } : undefined)
      setItems(res.data.flaggedQuestions)
    } catch {
      showToast.error('Failed to load flagged questions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [filter])

  const handleAction = async (id: string, status: 'REVIEWED' | 'DISMISSED') => {
    setUpdating(id)
    try {
      await updateFlaggedQuestionStatus(id, status)
      setItems(prev => prev.map(i => i.id === id ? { ...i, status, reviewedAt: new Date().toISOString() } : i))
      showToast.success(`Marked as ${status.toLowerCase()}`)
    } catch {
      showToast.error('Failed to update status')
    } finally {
      setUpdating(null)
    }
  }

  const pending = items.filter(i => i.status === 'PENDING').length

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Flag className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Flagged Questions</h1>
              <p className="text-sm text-gray-500">Questions students reported during exams</p>
            </div>
            {pending > 0 && (
              <span className="ml-2 px-2.5 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">
                {pending} pending
              </span>
            )}
          </div>
          <button onClick={load} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 mb-6">
          <Filter className="w-4 h-4 text-gray-400" />
          {['', 'PENDING', 'REVIEWED', 'DISMISSED'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === s ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <Flag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No flagged questions{filter ? ` with status "${filter}"` : ''}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(item => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Status + meta */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[item.status]}`}>
                        {STATUS_ICONS[item.status]}
                        {item.status}
                      </span>
                      {item.question && (
                        <>
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">{item.question.subject?.name}</span>
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{item.question.difficulty}</span>
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{item.question.examType}</span>
                        </>
                      )}
                    </div>

                    {/* Question preview */}
                    <p className="text-gray-800 text-sm font-medium mb-2 line-clamp-2">
                      {item.question?.questionText || <span className="text-gray-400 italic">Question not found</span>}
                    </p>

                    {/* Student + exam info */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                      {item.student && (
                        <span>
                          Student: <span className="font-medium text-gray-700">{item.student.firstName} {item.student.lastName}</span>
                          <span className="ml-1 text-gray-400">({item.student.email})</span>
                        </span>
                      )}
                      {item.exam && (
                        <span>Exam: <span className="font-medium text-gray-700">{item.exam.title}</span></span>
                      )}
                      <span>{new Date(item.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  {item.status === 'PENDING' && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleAction(item.id, 'REVIEWED')}
                        disabled={updating === item.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Reviewed
                      </button>
                      <button
                        onClick={() => handleAction(item.id, 'DISMISSED')}
                        disabled={updating === item.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-300 disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Dismiss
                      </button>
                    </div>
                  )}

                  {item.status !== 'PENDING' && item.reviewedAt && (
                    <p className="text-xs text-gray-400 flex-shrink-0">
                      {item.status === 'REVIEWED' ? 'Reviewed' : 'Dismissed'} {new Date(item.reviewedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
