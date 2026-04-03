import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { BookOpen, Plus, Edit2, Trash2, Eye, Clock, ArrowLeft, AlertCircle, X, Save, ToggleLeft, ToggleRight, ListChecks, Search, CheckSquare, Square, Loader2, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react'
import Layout from '../../components/Layout'
import SafePageWrapper from '../../components/SafePageWrapper'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { getAdminExams, updateExam, deleteExam, assignQuestionsToExam, getExamQuestionIds } from '../../api/exams'
import { getSubjects } from '../../api/subjects'
import { getQuestions } from '../../api/questions'
import { showToast } from '../../components/ui/Toast'
import apiClient from '../../api/client'

interface Subject { id: string; name: string }

interface SubjectQState {
  loading: boolean
  count: number
  questionIds: string[]
  error?: string
}

interface AdminExam {
  id: string
  title: string
  description: string
  duration: number
  totalQuestions: number
  totalMarks: number
  passMarks: number
  isPublished: boolean
  isActive: boolean
  allowReview: boolean
  allowRetake: boolean
  randomizeQuestions?: boolean
  subjectIds?: any
  createdAt: string
  _count?: { examQuestions: number }
}

interface QuestionRow {
  id: string
  questionText: string
  subject: { name: string; code: string }
  difficulty: string
  examType: string
}

export default function ExamManagement() {
  const [exams, setExams] = useState<AdminExam[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'draft'>('all')
  const [viewExam, setViewExam] = useState<AdminExam | null>(null)
  const [editExam, setEditExam] = useState<AdminExam | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminExam | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editForm, setEditForm] = useState<Partial<AdminExam> & { subjectIds?: string[]; totalQuestions?: number; randomizeQuestions?: boolean }>({})
  const [subjects, setSubjects] = useState<Subject[]>([])
  // Per-subject question state for edit modal
  const [editSubjectQuestions, setEditSubjectQuestions] = useState<Record<string, SubjectQState>>({})
  const [showEditSubjectDetails, setShowEditSubjectDetails] = useState(false)

  // Question assignment panel
  const [assignExam, setAssignExam] = useState<AdminExam | null>(null)
  const [allQuestions, setAllQuestions] = useState<QuestionRow[]>([])
  const [selectedQIds, setSelectedQIds] = useState<Set<string>>(new Set())
  const [qSearch, setQSearch] = useState('')
  const [qLoading, setQLoading] = useState(false)
  const [qSaving, setQSaving] = useState(false)

  useEffect(() => {
    loadExams()
    getSubjects()
      .then(res => setSubjects(res.data?.subjects ?? []))
      .catch(() => {/* subjects optional */})
  }, [])

  async function loadExams() {
    try {
      setLoading(true)
      setError(null)
      const response = await getAdminExams()
      if (response.success && response.data?.exams) {
        setExams(response.data.exams as AdminExam[])
      } else {
        throw new Error('Invalid response structure')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load exams')
      showToast.error('Failed to load exams')
    } finally {
      setLoading(false)
    }
  }

  const filteredExams = exams.filter(exam => {
    if (activeTab === 'published') return exam.isPublished
    if (activeTab === 'draft') return !exam.isPublished
    return true
  })

  function openEdit(exam: AdminExam) {
    // Parse existing subjectIds from the exam (stored as JSON array of IDs)
    let existingSubjectIds: string[] = []
    if (exam.subjectIds) {
      try {
        existingSubjectIds = Array.isArray(exam.subjectIds)
          ? exam.subjectIds
          : JSON.parse(exam.subjectIds)
      } catch { existingSubjectIds = [] }
    }

    setEditForm({
      ...exam,
      duration: Math.round(exam.duration / 60),
      subjectIds: existingSubjectIds,
      totalQuestions: exam._count?.examQuestions ?? exam.totalQuestions,
      randomizeQuestions: exam.randomizeQuestions ?? false
    })
    setEditSubjectQuestions({})
    setShowEditSubjectDetails(false)
    setEditExam(exam)

    // Pre-fetch questions for already-selected subjects
    if (existingSubjectIds.length > 0) {
      existingSubjectIds.forEach(subjectId => {
        const subj = subjects.find(s => s.id === subjectId)
        if (subj) fetchSubjectQuestionsForEdit(subj)
      })
    }
  }

  async function fetchSubjectQuestionsForEdit(subject: Subject) {
    const id = subject.id
    setEditSubjectQuestions(prev => ({ ...prev, [id]: { loading: true, count: 0, questionIds: [] } }))
    try {
      const res = await getQuestions({ subjects: [subject.name], topics: [], page: 1, limit: 1000 })
      const ids = (res.questions ?? []).map((q: any) => q.id)
      setEditSubjectQuestions(prev => ({ ...prev, [id]: { loading: false, count: ids.length, questionIds: ids } }))
    } catch {
      setEditSubjectQuestions(prev => ({ ...prev, [id]: { loading: false, count: 0, questionIds: [], error: 'Failed' } }))
    }
  }

  function toggleEditSubject(subject: Subject) {
    const id = subject.id
    const isSelected = (editForm.subjectIds ?? []).includes(id)
    if (isSelected) {
      setEditForm(f => ({ ...f, subjectIds: (f.subjectIds ?? []).filter((s: string) => s !== id) }))
      setEditSubjectQuestions(prev => { const n = { ...prev }; delete n[id]; return n })
    } else {
      setEditForm(f => ({ ...f, subjectIds: [...(f.subjectIds ?? []), id] }))
      if (!editSubjectQuestions[id]) fetchSubjectQuestionsForEdit(subject)
    }
  }

  async function openAssign(exam: AdminExam) {
    setAssignExam(exam)
    setQSearch('')
    setQLoading(true)
    try {
      const [qRes, assignedRes] = await Promise.all([
        apiClient.get('/questions', { params: { limit: 200, page: 1 } }),
        getExamQuestionIds(exam.id)
      ])
      const questions: QuestionRow[] = qRes.data?.data?.questions ?? []
      setAllQuestions(questions)
      setSelectedQIds(new Set(assignedRes.data?.questionIds ?? []))
    } catch {
      showToast.error('Failed to load questions')
    } finally {
      setQLoading(false)
    }
  }

  async function handleSaveAssign() {
    if (!assignExam) return
    setQSaving(true)
    try {
      const res = await assignQuestionsToExam(assignExam.id, Array.from(selectedQIds))
      if (res.success) {
        setExams(prev => prev.map(e => e.id === assignExam.id
          ? { ...e, _count: { examQuestions: selectedQIds.size }, totalQuestions: selectedQIds.size }
          : e
        ))
        showToast.success(`${selectedQIds.size} questions assigned`)
        setAssignExam(null)
      }
    } catch (err: any) {
      showToast.error(err.message || 'Failed to assign questions')
    } finally {
      setQSaving(false)
    }
  }

  async function handleSaveEdit() {
    if (!editExam) return
    try {
      setSaving(true)
      const payload: any = { ...editForm }
      if (payload.duration) payload.duration = payload.duration * 60

      const res = await updateExam(editExam.id, payload)
      if (!res.success) throw new Error('Failed to update exam')

      // Re-assign questions based on selected subjects + totalQuestions limit
      const selectedSubjectIds = editForm.subjectIds ?? []
      if (selectedSubjectIds.length > 0) {
        const allIds = selectedSubjectIds.flatMap((id: string) => editSubjectQuestions[id]?.questionIds ?? [])
        if (allIds.length > 0) {
          const limit = editForm.totalQuestions ?? allIds.length
          let finalIds: string[]

          if (editForm.randomizeQuestions) {
            // Fisher-Yates shuffle then take limit
            const shuffled = [...allIds]
            for (let i = shuffled.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
            }
            finalIds = shuffled.slice(0, limit)
          } else {
            finalIds = allIds.slice(0, limit)
          }

          try {
            await assignQuestionsToExam(editExam.id, finalIds)
            setExams(prev => prev.map(e => e.id === editExam.id
              ? { ...e, ...editForm, duration: editExam.duration, _count: { examQuestions: finalIds.length }, totalQuestions: finalIds.length } as AdminExam
              : e
            ))
            showToast.success(`Exam updated — ${finalIds.length} questions assigned${editForm.randomizeQuestions ? ' (randomized)' : ''}`)
          } catch {
            showToast.success('Exam updated (question re-assignment failed — use Manage Questions)')
          }
        } else {
          setExams(prev => prev.map(e => e.id === editExam.id ? { ...e, ...editForm } as AdminExam : e))
          showToast.success('Exam updated successfully')
        }
      } else {
        setExams(prev => prev.map(e => e.id === editExam.id ? { ...e, ...editForm } as AdminExam : e))
        showToast.success('Exam updated successfully')
      }

      setEditExam(null)
    } catch (err: any) {
      showToast.error(err.message || 'Failed to update exam')
    } finally {
      setSaving(false)
    }
  }

  async function handleTogglePublish(exam: AdminExam) {
    try {
      const res = await updateExam(exam.id, { isPublished: !exam.isPublished })
      if (res.success) {
        setExams(prev => prev.map(e => e.id === exam.id ? { ...e, isPublished: !exam.isPublished } : e))
        showToast.success(exam.isPublished ? 'Exam unpublished' : 'Exam published')
      }
    } catch (err: any) {
      showToast.error(err.message || 'Failed to update exam')
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      const res = await deleteExam(deleteTarget.id)
      if (res.success) {
        setExams(prev => prev.filter(e => e.id !== deleteTarget.id))
        showToast.success('Exam deleted')
        setDeleteTarget(null)
      }
    } catch (err: any) {
      showToast.error(err.message || 'Failed to delete exam')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-4 w-3/4" />
              <div className="h-8 bg-gray-200 rounded mb-4" />
              <div className="h-3 bg-gray-100 rounded mb-2" />
              <div className="h-3 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </Layout>
    )
  }

  return (
    <SafePageWrapper pageName="Exam Management">
      <Layout>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link to="/admin/dashboard">
                <Button variant="outline" size="sm" className="mb-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BookOpen className="w-8 h-8 text-blue-600" />
                </div>
                Exam Management
              </h1>
              <p className="text-gray-600 mt-2">Create, edit, and manage official exams</p>
            </div>
            <Link to="/admin/exams/create">
              <Button variant="primary" className="flex items-center gap-2">
                <Plus className="w-5 h-5" />Create Exam
              </Button>
            </Link>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-700 text-sm flex-1">{error}</p>
                <Button variant="outline" size="sm" onClick={loadExams} className="text-red-700 border-red-300">Retry</Button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-4 border-b border-gray-200 mb-8">
            {(['all', 'published', 'draft'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-semibold capitalize transition-all ${
                  activeTab === tab
                    ? tab === 'published' ? 'text-green-600 border-b-2 border-green-600'
                      : tab === 'draft' ? 'text-orange-600 border-b-2 border-orange-600'
                      : 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'all' ? `All (${exams.length})`
                  : tab === 'published' ? `Published (${exams.filter(e => e.isPublished).length})`
                  : `Draft (${exams.filter(e => !e.isPublished).length})`}
              </button>
            ))}
          </div>

          {filteredExams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExams.map(exam => (
                <motion.div key={exam.id} whileHover={{ scale: 1.02, y: -4 }} transition={{ duration: 0.2 }}>
                  <Card className="h-full flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant={exam.isPublished ? 'success' : 'warning'} size="sm">
                        {exam.isPublished ? 'PUBLISHED' : 'DRAFT'}
                      </Badge>
                      <button onClick={() => handleTogglePublish(exam)} title={exam.isPublished ? 'Unpublish' : 'Publish'} className="text-gray-400 hover:text-blue-600 transition-colors">
                        {exam.isPublished ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5" />}
                      </button>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{exam.title}</h3>
                    {exam.description && <p className="text-sm text-gray-600 mb-4 line-clamp-2">{exam.description}</p>}
                    <div className="space-y-2 mb-4 flex-grow text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Duration</span>
                        <span className="font-medium flex items-center gap-1"><Clock className="w-3 h-3" />{Math.round(exam.duration / 60)} min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Questions</span>
                        <span className="font-medium">{exam._count?.examQuestions ?? exam.totalQuestions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Pass Marks</span>
                        <span className="font-medium text-green-600">{exam.passMarks}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => setViewExam(exam)}>
                        <Eye className="w-4 h-4 mr-1" />View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(exam)}>
                        <Edit2 className="w-4 h-4 mr-1" />Edit
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 text-red-600 border-red-300 hover:bg-red-50" onClick={() => setDeleteTarget(exam)}>
                        <Trash2 className="w-4 h-4 mr-1" />Delete
                      </Button>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-2 text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => openAssign(exam)}>
                      <ListChecks className="w-4 h-4 mr-2" />Manage Questions ({exam._count?.examQuestions ?? exam.totalQuestions})
                    </Button>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Exams Found</h3>
              <p className="text-gray-600 mb-6">
                {activeTab === 'published' ? 'No published exams yet' : activeTab === 'draft' ? 'No draft exams yet' : 'Create your first exam to get started'}
              </p>
              <Link to="/admin/exams/create">
                <Button variant="primary"><Plus className="w-4 h-4 mr-2" />Create First Exam</Button>
              </Link>
            </div>
          )}
        </motion.div>


        {/* VIEW MODAL */}
        <AnimatePresence>
          {viewExam && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                <div className="flex items-center justify-between p-6 border-b">
                  <h2 className="text-xl font-bold text-gray-900">Exam Details</h2>
                  <button onClick={() => setViewExam(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Title</p>
                    <p className="text-gray-900 font-medium">{viewExam.title}</p>
                  </div>
                  {viewExam.description && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Description</p>
                      <p className="text-gray-700 text-sm">{viewExam.description}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      ['Duration', `${Math.round(viewExam.duration / 60)} min`],
                      ['Questions', String(viewExam._count?.examQuestions ?? viewExam.totalQuestions)],
                      ['Total Marks', String(viewExam.totalMarks)],
                      ['Pass Marks', String(viewExam.passMarks)],
                      ['Allow Review', viewExam.allowReview ? 'Yes' : 'No'],
                      ['Allow Retake', viewExam.allowRetake ? 'Yes' : 'No'],
                    ].map(([label, value]) => (
                      <div key={label as string}>
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">{label}</p>
                        <p className="text-gray-900 font-medium">{value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Badge variant={viewExam.isPublished ? 'success' : 'warning'}>{viewExam.isPublished ? 'Published' : 'Draft'}</Badge>
                    <Badge variant={viewExam.isActive ? 'success' : 'error'}>{viewExam.isActive ? 'Active' : 'Inactive'}</Badge>
                  </div>
                </div>
                <div className="p-6 border-t flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setViewExam(null)}>Close</Button>
                  <Button variant="primary" onClick={() => { setViewExam(null); openEdit(viewExam) }}>
                    <Edit2 className="w-4 h-4 mr-2" />Edit
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* EDIT MODAL */}
        <AnimatePresence>
          {editExam && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
                  <h2 className="text-xl font-bold text-gray-900">Edit Exam</h2>
                  <button onClick={() => setEditExam(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input type="text" value={editForm.title || ''} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea value={editForm.description || ''} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                      <input type="number" value={editForm.duration || ''} onChange={e => setEditForm(f => ({ ...f, duration: Number(e.target.value) }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pass Marks</label>
                      <input type="number" value={editForm.passMarks || ''} onChange={e => setEditForm(f => ({ ...f, passMarks: Number(e.target.value) }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                  {subjects.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-sm font-medium text-gray-700">Subjects — click to load questions</label>
                        {(editForm.subjectIds?.length ?? 0) > 0 && (
                          <button type="button" onClick={() => setShowEditSubjectDetails(v => !v)}
                            className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                            {showEditSubjectDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            {showEditSubjectDetails ? 'Hide' : 'Show'} details
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                        {subjects.map(s => {
                          const selected = (editForm.subjectIds ?? []).includes(s.id)
                          const qs = editSubjectQuestions[s.id]
                          return (
                            <button key={s.id} type="button" onClick={() => toggleEditSubject(s)}
                              className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-sm text-left transition-all ${
                                selected ? 'bg-blue-50 border-blue-400 text-blue-800' : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                              }`}>
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

                      {/* Summary + per-subject breakdown */}
                      {(editForm.subjectIds?.length ?? 0) > 0 && (
                        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-blue-700 font-medium">{editForm.subjectIds!.length} subject(s)</span>
                            <span className="text-blue-800 font-semibold">
                              {editForm.subjectIds!.some((id: string) => editSubjectQuestions[id]?.loading)
                                ? <span className="flex items-center gap-1"><Loader2 className="w-3.5 h-3.5 animate-spin" />Loading...</span>
                                : `${editForm.subjectIds!.reduce((s: number, id: string) => s + (editSubjectQuestions[id]?.count ?? 0), 0)} total questions available`
                              }
                            </span>
                          </div>
                          {showEditSubjectDetails && (
                            <div className="mt-2 space-y-1">
                              {editForm.subjectIds!.map((id: string) => {
                                const subj = subjects.find((s: Subject) => s.id === id)
                                const qs = editSubjectQuestions[id]
                                return (
                                  <div key={id} className="flex items-center justify-between text-xs text-blue-700">
                                    <span>{subj?.name}</span>
                                    <span>
                                      {qs?.loading ? <Loader2 className="w-3 h-3 animate-spin inline" /> :
                                        qs?.error ? <span className="text-red-500">{qs.error}</span> :
                                        <span className="flex items-center gap-1">
                                          <CheckCircle className="w-3 h-3 text-green-500" />{qs?.count ?? 0} questions
                                        </span>
                                      }
                                    </span>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Total questions limit */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total Questions for Exam
                        <span className="text-xs text-gray-400 ml-1">(limits how many get assigned)</span>
                      </label>
                      <input type="number" min={1}
                        value={editForm.totalQuestions || ''}
                        onChange={e => setEditForm(f => ({ ...f, totalQuestions: Number(e.target.value) }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks</label>
                      <input type="number" value={editForm.totalMarks || ''} onChange={e => setEditForm(f => ({ ...f, totalMarks: Number(e.target.value) }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { key: 'isPublished' as keyof AdminExam, label: 'Published' },
                      { key: 'isActive' as keyof AdminExam, label: 'Active' },
                      { key: 'allowReview' as keyof AdminExam, label: 'Allow Review' },
                      { key: 'allowRetake' as keyof AdminExam, label: 'Allow Retake' },
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={!!(editForm as any)[key]} onChange={e => setEditForm(f => ({ ...f, [key]: e.target.checked }))} className="w-4 h-4 text-blue-600 rounded" />
                        <span className="text-sm text-gray-700">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="p-6 border-t flex justify-end gap-3 sticky bottom-0 bg-white">
                  <Button variant="outline" onClick={() => setEditExam(null)}>Cancel</Button>
                  <Button variant="primary" onClick={handleSaveEdit} disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />{saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* DELETE CONFIRM MODAL */}
        <AnimatePresence>
          {deleteTarget && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-100 rounded-lg"><Trash2 className="w-5 h-5 text-red-600" /></div>
                  <h2 className="text-xl font-bold text-gray-900">Delete Exam</h2>
                </div>
                <p className="text-gray-600 mb-2">
                  Are you sure you want to delete <span className="font-semibold text-gray-900">"{deleteTarget.title}"</span>?
                </p>
                <p className="text-sm text-red-600 mb-6">This will also delete all associated exam questions. This action cannot be undone.</p>
                <div className="flex gap-3 justify-end">
                  <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                  <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleConfirmDelete} disabled={deleting}>
                    <Trash2 className="w-4 h-4 mr-2" />{deleting ? 'Deleting...' : 'Delete Exam'}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ASSIGN QUESTIONS DRAWER */}
        <AnimatePresence>
          {assignExam && (() => {
            const filtered = allQuestions.filter(q =>
              !qSearch ||
              q.questionText.toLowerCase().includes(qSearch.toLowerCase()) ||
              q.subject?.name?.toLowerCase().includes(qSearch.toLowerCase())
            )
            const allFilteredSelected = filtered.length > 0 && filtered.every(q => selectedQIds.has(q.id))
            return (
              <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
                <motion.div
                  initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                  transition={{ type: 'tween', duration: 0.25 }}
                  className="bg-white w-full max-w-xl h-full flex flex-col shadow-2xl"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between p-5 border-b shrink-0">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <ListChecks className="w-5 h-5 text-blue-500" />Assign Questions
                      </h2>
                      <p className="text-sm text-gray-500 mt-0.5 truncate max-w-xs">{assignExam.title}</p>
                    </div>
                    <button onClick={() => setAssignExam(null)} className="text-gray-400 hover:text-gray-600 p-1">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Search + select-all */}
                  <div className="p-4 border-b shrink-0 space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by question text or subject..."
                        value={qSearch}
                        onChange={e => setQSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => {
                          if (allFilteredSelected) {
                            setSelectedQIds(prev => { const s = new Set(prev); filtered.forEach(q => s.delete(q.id)); return s })
                          } else {
                            setSelectedQIds(prev => { const s = new Set(prev); filtered.forEach(q => s.add(q.id)); return s })
                          }
                        }}
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                      >
                        {allFilteredSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                        {allFilteredSelected ? 'Deselect all visible' : 'Select all visible'}
                      </button>
                      <span className="text-sm font-semibold text-gray-700">
                        {selectedQIds.size} selected
                      </span>
                    </div>
                  </div>

                  {/* Question list */}
                  <div className="flex-1 overflow-y-auto p-4">
                    {qLoading ? (
                      <div className="space-y-3">
                        {[...Array(8)].map((_, i) => (
                          <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
                        ))}
                      </div>
                    ) : filtered.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p className="text-sm">No questions found</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filtered.map(q => {
                          const checked = selectedQIds.has(q.id)
                          return (
                            <label
                              key={q.id}
                              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                                checked ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => setSelectedQIds(prev => {
                                  const s = new Set(prev)
                                  checked ? s.delete(q.id) : s.add(q.id)
                                  return s
                                })}
                                className="mt-0.5 w-4 h-4 text-blue-600 rounded shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-800 line-clamp-2"
                                  dangerouslySetInnerHTML={{ __html: q.questionText }} />
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-blue-600 font-medium">{q.subject?.name}</span>
                                  <span className="text-xs text-gray-400">·</span>
                                  <span className="text-xs text-gray-400 capitalize">{q.difficulty?.toLowerCase()}</span>
                                  <span className="text-xs text-gray-400">·</span>
                                  <span className="text-xs text-gray-400">{q.examType}</span>
                                </div>
                              </div>
                            </label>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-4 border-t shrink-0 flex items-center justify-between bg-white">
                    <span className="text-sm text-gray-500">{selectedQIds.size} of {allQuestions.length} questions selected</span>
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setAssignExam(null)}>Cancel</Button>
                      <Button variant="primary" onClick={handleSaveAssign} disabled={qSaving}>
                        <Save className="w-4 h-4 mr-2" />{qSaving ? 'Saving...' : 'Save Assignment'}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )
          })()}
        </AnimatePresence>
      </Layout>
    </SafePageWrapper>
  )
}
