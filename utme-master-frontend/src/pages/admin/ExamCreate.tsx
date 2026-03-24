import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, ArrowLeft, Save, AlertCircle } from 'lucide-react'
import Layout from '../../components/Layout'
import SafePageWrapper from '../../components/SafePageWrapper'
import Button from '../../components/ui/Button'
import { createExamAdmin } from '../../api/exams'
import { getSubjects } from '../../api/subjects'
import { showToast } from '../../components/ui/Toast'

interface Subject { id: string; name: string }

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

  useEffect(() => {
    getSubjects()
      .then(res => setSubjects(res.data?.subjects ?? []))
      .catch(() => showToast.error('Failed to load subjects'))
  }, [])

  function toggleSubject(id: string) {
    setForm(f => ({
      ...f,
      subjectIds: f.subjectIds.includes(id)
        ? f.subjectIds.filter(s => s !== id)
        : [...f.subjectIds, id]
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!form.title.trim()) return setError('Title is required')
    if (form.subjectIds.length === 0) return setError('Select at least one subject')
    if (form.passMarks > form.totalMarks) return setError('Pass marks cannot exceed total marks')

    try {
      setSaving(true)
      const payload = {
        ...form,
        duration: form.durationMinutes * 60, // convert to seconds for backend
        durationMinutes: undefined,
      }
      const res = await createExamAdmin(payload)
      if (res.success) {
        showToast.success('Exam created successfully')
        navigate('/admin/exams')
      }
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
              <p className="text-gray-500 text-sm">Set up a new official exam</p>
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
                <input
                  type="number"
                  min={5}
                  value={form.durationMinutes}
                  onChange={e => setForm(f => ({ ...f, durationMinutes: Number(e.target.value) }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Total Questions *</label>
                <input
                  type="number"
                  min={1}
                  value={form.totalQuestions}
                  onChange={e => setForm(f => ({ ...f, totalQuestions: Number(e.target.value) }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Total Marks *</label>
                <input
                  type="number"
                  min={1}
                  value={form.totalMarks}
                  onChange={e => setForm(f => ({ ...f, totalMarks: Number(e.target.value) }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Pass Marks *</label>
                <input
                  type="number"
                  min={1}
                  value={form.passMarks}
                  onChange={e => setForm(f => ({ ...f, passMarks: Number(e.target.value) }))}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Subjects */}
            <div>
              <label className={labelClass}>Subjects * (select at least one)</label>
              {subjects.length === 0 ? (
                <p className="text-sm text-gray-400 italic">Loading subjects...</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {subjects.map(s => (
                    <label key={s.id} className="flex items-center gap-2 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        checked={form.subjectIds.includes(s.id)}
                        onChange={() => toggleSubject(s.id)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-gray-700">{s.name}</span>
                    </label>
                  ))}
                </div>
              )}
              {form.subjectIds.length > 0 && (
                <p className="text-xs text-blue-600 mt-1">{form.subjectIds.length} subject(s) selected</p>
              )}
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
              <Button variant="primary" type="submit" disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Creating...' : 'Create Exam'}
              </Button>
            </div>
          </form>
        </motion.div>
      </Layout>
    </SafePageWrapper>
  )
}
