import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, ArrowLeft, Save, AlertCircle, CheckCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import Layout from '../../components/Layout'
import SafePageWrapper from '../../components/SafePageWrapper'
import Button from '../../components/ui/Button'
import { createExamAdmin } from '../../api/exams'
import { assignQuestionsToExam } from '../../api/dataManagement'
import { getSubjects, type Subject } from '../../api/subjects'
import { getQuestions } from '../../api/questions'
import { showToast } from '../../components/ui/Toast'

interface SubjectQuestionState {
  loading: boolean
  count: number
  questionIds: string[]
  error?: string
}

const defaultForm = {
  title: '',
  description: '',
  durationMinutes: 60,
  totalMarks: 100,
  passMarks: 50,
  totalQuestions: 40,
  subjectIds: [] as string[],
  isPublished: false,
  allowReview: true,
  allowRetake: false,
  randomizeQuestions: false,
}

export default function ExamCreate() {
  const navigate = useNavigate()
  const [form, setForm] = useState(defaultForm)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSubjectDetails, setShowSubjectDetails] = useState(false)

  // Per-subject question fetch state
  const [subjectQuestions, setSubjectQuestions] = useState<Record<string, SubjectQuestionState>>({})

  useEffect(() => {
    getSubjects()
      .then(res => setSubjects(res.data?.subjects ?? []))
      .catch(() => showToast.error('Failed to load subjects'))
  }, [])

  // When a subject is toggled on, fetch its questions automatically
  async function toggleSubject(subject: Subject) {
    const id = subject.id
    const isSelected = form.subjectIds.includes(id)

    if (isSelected) {
      // Deselect — remove from form and clear its question state
      setForm(f => ({ ...f, subjectIds: f.subjectIds.filter(s => s !== id) }))
      setSubjectQuestions(prev => {
        const next = { ...prev }
        delete next[id]
        return next
      })
      return
    }

    // Select — add to form and fetch questions
    setForm(f => ({ ...f, subjectIds: [...f.subjectIds, id] }))

    // Already fetched? skip
    if (subjectQuestions[id]) return

    setSubjectQuestions(prev => ({ ...prev, [id]: { loading: true, count: 0, questionIds: [] } }))

    try {
      const res = await getQuestions({ subjects: [subject.name], topics: [], page: 1, limit: 1000 })
      const ids = (res.questions ?? []).map((q: any) => q.id)
      setSubjectQuestions(prev => ({
        ...prev,
        [id]: { loading: false, count: ids.length, questionIds: ids }
      }))
    } catch {
      setSubjectQuestions(prev => ({
        ...prev,
        [id]: { loading: false, count: 0, questionIds: [], error: 'Failed to load' }
      }))
    }
  }

  // Total questions that will be auto-assigned
  const totalAutoQuestions = form.subjectIds.reduce((sum, id) => {
    return sum + (subjectQuestions[id]?.count ?? 0)
  }, 0)

  const loadingSubjects = form.subjectIds.filter(id => subjectQuestions[id]?.loading)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!form.title.trim()) return setError('Title is required')
    if (form.subjectIds.length === 0) return setError('Select at least one subject')
    if (form.passMarks > form.totalMarks) return setError('Pass marks cannot exceed total marks')
    if (loadingSubjects.length > 0) return setError('Still loading questions for some subjects, please wait...')

    try {
      setSaving(true)
      const payload = {
        ...form,
        duration: form.durationMinutes * 60,
        durationMinutes: undefined,
      }
      const res = await createExamAdmin(payload)
      if (!res.success) throw new Error('Failed to create exam')

      const examId = res.data?.exam?.id ?? res.data?.id

      // Auto-assign all fetched questions
      const allQuestionIds = form.subjectIds.flatMap(id => subjectQuestions[id]?.questionIds ?? [])
      if (examId && allQuestionIds.length > 0) {
        try {
        await assignQuestionsToExam(examId, allQuestionIds)
          showToast.success(`Exam created and ${allQuestionIds.length} questions assigned`)
        } catch {
          showToast.success('Exam created (question assignment failed — use Data Management to assign manually)')
        }
      } else {
        showToast.success('Exam created successfully')
      }

      navigate('/admin/exams')
    } catch (err: any) {
      setError(err.message || 'Failed to create exam')
    } finally {
      setSaving(false)
    }
  }

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <SafePageWrapper pageName="Create Exam">
      <Layout>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto px-4 py-8"
        >
          <Link to="/admin/exams">
            <Button variant="outline" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />Back to Exams
            </Button>
          </Link>

          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpen className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Exam</h1>
              <p className="text-gray-500 text-sm">Set up a new official exam — questions are auto-added by subject</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl shadow-lg p-6">
            {/* Title */}
            <div>
              <label className={labelClass}>Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. JAMB 2026 Biology Mock Exam"
                className={inputClass}
              />
            </div>

            {/* Description */}
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
                placeholder="Optional description..."
                className={inputClass}
              />
            </div>

            {/* Numeric fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Duration (minutes) *</label>
                <input type="number" min={5} value={form.durationMinutes}
                  onChange={e => setForm(f => ({ ...f, durationMinutes: Number(e.target.value) }))}
                  className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Total Questions *</label>
                <input type="number" min={1} value={form.totalQuestions}
                  onChange={e => setForm(f => ({ ...f, totalQuestions: Number(e.target.value) }))}
                  className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Total Marks *</label>
                <input type="number" min={1} value={form.totalMarks}
                  onChange={e => setForm(f => ({ ...f, totalMarks: Number(e.target.value) }))}
                  className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Pass Marks *</label>
                <input type="number" min={1} value={form.passMarks}
                  onChange={e => setForm(f => ({ ...f, passMarks: Number(e.target.value) }))}
                  className={inputClass} />
              </div>
            </div>

            {/* Subjects — click to auto-add questions */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={labelClass + ' mb-0'}>Subjects * — click to auto-add questions</label>
                {form.subjectIds.length > 0 && (
                  <button type="button" onClick={() => setShowSubjectDetails(v => !v)}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                    {showSubjectDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    {showSubjectDetails ? 'Hide' : 'Show'} details
                  </button>
                )}
              </div>

              {subjects.length === 0 ? (
                <p className="text-sm text-gray-400 italic">Loading subjects...</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {subjects.map(s => {
                    const selected = form.subjectIds.includes(s.id)
                    const qs = subjectQuestions[s.id]
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleSubject(s)}
                        className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-sm text-left transition-all ${
                          selected
                            ? 'bg-blue-50 border-blue-400 text-blue-800'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        <span className="truncate font-medium">{s.name}</span>
                        <span className="shrink-0">
                          {selected && qs?.loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />}
                          {selected && !qs?.loading && qs?.count !== undefined && (
                            <span className="text-xs bg-blue-600 text-white rounded-full px-1.5 py-0.5">{qs.count}</span>
                          )}
                          {!selected && <span className="w-3.5 h-3.5 rounded border border-gray-300 inline-block" />}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Summary */}
              <AnimatePresence>
                {form.subjectIds.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-blue-700 font-medium">
                        {form.subjectIds.length} subject(s) selected
                      </span>
                      <span className="text-blue-800 font-semibold">
                        {loadingSubjects.length > 0
                          ? <span className="flex items-center gap-1"><Loader2 className="w-3.5 h-3.5 animate-spin" />Loading...</span>
                          : `${totalAutoQuestions} questions will be assigned`
                        }
                      </span>
                    </div>

                    {/* Per-subject breakdown */}
                    {showSubjectDetails && (
                      <div className="mt-2 space-y-1">
                        {form.subjectIds.map(id => {
                          const subj = subjects.find(s => s.id === id)
                          const qs = subjectQuestions[id]
                          return (
                            <div key={id} className="flex items-center justify-between text-xs text-blue-700">
                              <span>{subj?.name}</span>
                              <span>
                                {qs?.loading ? <Loader2 className="w-3 h-3 animate-spin inline" /> :
                                  qs?.error ? <span className="text-red-500">{qs.error}</span> :
                                  <span className="flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3 text-green-500" />
                                    {qs?.count ?? 0} questions
                                  </span>
                                }
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Toggles */}
            <div className="space-y-3">
              {([
                { key: 'isPublished', label: 'Publish immediately' },
                { key: 'allowReview', label: 'Allow answer review after submission' },
                { key: 'allowRetake', label: 'Allow retakes' },
                { key: 'randomizeQuestions', label: 'Randomize question order' },
              ] as { key: keyof typeof form; label: string }[]).map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Link to="/admin/exams">
                <Button variant="outline" type="button">Cancel</Button>
              </Link>
              <Button variant="primary" type="submit" disabled={saving || loadingSubjects.length > 0}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Creating...' : `Create Exam${totalAutoQuestions > 0 ? ` & Assign ${totalAutoQuestions} Questions` : ''}`}
              </Button>
            </div>
          </form>
        </motion.div>
      </Layout>
    </SafePageWrapper>
  )
}
