import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Database, ArrowLeft, AlertTriangle, CheckCircle, RefreshCw,
  Trash2, BookOpen, ClipboardList, Search, X, Plus, Minus,
  FileText, Activity, ChevronDown, ChevronUp
} from 'lucide-react'
import Layout from '../../components/Layout'
import SafePageWrapper from '../../components/SafePageWrapper'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { showToast } from '../../components/ui/Toast'
import {
  getHealthReport, getDuplicates, removeDuplicates,
  getExamQuestions, assignQuestionsToExam, removeQuestionsFromExam,
  getAuditLogs, getImportHistory,
  type HealthReport, type DuplicateGroup, type AuditLog
} from '../../api/dataManagement'
import { getAdminExams } from '../../api/exams'
import { getQuestions } from '../../api/questions'

type Tab = 'health' | 'duplicates' | 'examQuestions' | 'auditLog' | 'imports'

export default function DataManagement() {
  const [tab, setTab] = useState<Tab>('health')
  const [health, setHealth] = useState<HealthReport | null>(null)
  const [healthLoading, setHealthLoading] = useState(false)

  // Duplicates
  const [dupLoading, setDupLoading] = useState(false)
  const [dupData, setDupData] = useState<{ totalDuplicateGroups: number; totalDuplicateQuestions: number; duplicates: DuplicateGroup[] } | null>(null)
  const [selectedToDelete, setSelectedToDelete] = useState<Set<string>>(new Set())
  const [expandedGroup, setExpandedGroup] = useState<number | null>(null)

  // Exam question assignment
  const [exams, setExams] = useState<any[]>([])
  const [selectedExam, setSelectedExam] = useState<string>('')
  const [examQuestions, setExamQuestions] = useState<any[]>([])
  const [allQuestions, setAllQuestions] = useState<any[]>([])
  const [qSearch, setQSearch] = useState('')
  const [selectedToAssign, setSelectedToAssign] = useState<Set<string>>(new Set())
  const [selectedToRemove, setSelectedToRemove] = useState<Set<string>>(new Set())
  const [eqLoading, setEqLoading] = useState(false)

  // Audit log
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [auditLoading, setAuditLoading] = useState(false)
  const [auditPage, setAuditPage] = useState(1)
  const [auditTotal, setAuditTotal] = useState(0)

  // Imports
  const [imports, setImports] = useState<any[]>([])
  const [importsLoading, setImportsLoading] = useState(false)

  // ---- Loaders ----
  const loadHealth = useCallback(async () => {
    setHealthLoading(true)
    try {
      const res = await getHealthReport()
      setHealth(res.data)
    } catch { showToast.error('Failed to load health report') }
    finally { setHealthLoading(false) }
  }, [])

  const loadDuplicates = useCallback(async () => {
    setDupLoading(true)
    try {
      const res = await getDuplicates()
      setDupData(res.data)
      setSelectedToDelete(new Set())
    } catch { showToast.error('Failed to scan duplicates') }
    finally { setDupLoading(false) }
  }, [])

  const loadExams = useCallback(async () => {
    try {
      const res = await getAdminExams()
      setExams(res.data?.exams ?? [])
    } catch { showToast.error('Failed to load exams') }
  }, [])

  const loadExamQuestions = useCallback(async (examId: string) => {
    if (!examId) return
    setEqLoading(true)
    try {
      const [eqRes, qRes] = await Promise.all([
        getExamQuestions(examId),
        getQuestions({ page: 1, limit: 100 })
      ])
      setExamQuestions(eqRes.data?.questions ?? [])
      setAllQuestions(qRes.questions ?? [])
    } catch { showToast.error('Failed to load questions') }
    finally { setEqLoading(false) }
  }, [])

  const loadAuditLogs = useCallback(async (page = 1) => {
    setAuditLoading(true)
    try {
      const res = await getAuditLogs({ page, limit: 30 })
      setAuditLogs(res.data?.logs ?? [])
      setAuditTotal(res.data?.total ?? 0)
      setAuditPage(page)
    } catch { showToast.error('Failed to load audit logs') }
    finally { setAuditLoading(false) }
  }, [])

  const loadImports = useCallback(async () => {
    setImportsLoading(true)
    try {
      const res = await getImportHistory()
      setImports(res.data?.imports ?? [])
    } catch { showToast.error('Failed to load import history') }
    finally { setImportsLoading(false) }
  }, [])

  useEffect(() => { loadHealth() }, [loadHealth])
  useEffect(() => { if (tab === 'duplicates' && !dupData) loadDuplicates() }, [tab, dupData, loadDuplicates])
  useEffect(() => { if (tab === 'examQuestions') loadExams() }, [tab, loadExams])
  useEffect(() => { if (tab === 'auditLog') loadAuditLogs() }, [tab, loadAuditLogs])
  useEffect(() => { if (tab === 'imports') loadImports() }, [tab, loadImports])
  useEffect(() => { if (selectedExam) loadExamQuestions(selectedExam) }, [selectedExam, loadExamQuestions])

  // ---- Actions ----
  async function handleRemoveDuplicates() {
    if (selectedToDelete.size === 0) return showToast.error('Select questions to delete first')
    try {
      const res = await removeDuplicates(Array.from(selectedToDelete))
      showToast.success(`Removed ${res.data.removed} duplicate questions`)
      loadDuplicates()
      loadHealth()
    } catch (e: any) { showToast.error(e.message) }
  }

  async function handleAssign() {
    if (!selectedExam || selectedToAssign.size === 0) return
    try {
      const res = await assignQuestionsToExam(selectedExam, Array.from(selectedToAssign))
      showToast.success(`Assigned ${res.data.assigned} questions (${res.data.skipped} already assigned)`)
      setSelectedToAssign(new Set())
      loadExamQuestions(selectedExam)
    } catch (e: any) { showToast.error(e.message) }
  }

  async function handleRemoveFromExam() {
    if (!selectedExam || selectedToRemove.size === 0) return
    try {
      const res = await removeQuestionsFromExam(selectedExam, Array.from(selectedToRemove))
      showToast.success(`Removed ${res.data.removed} questions from exam`)
      setSelectedToRemove(new Set())
      loadExamQuestions(selectedExam)
    } catch (e: any) { showToast.error(e.message) }
  }

  // ---- Helpers ----
  const assignedIds = new Set(examQuestions.map((q: any) => q.question.id))
  const filteredQuestions = allQuestions.filter(q =>
    !assignedIds.has(q.id) &&
    (qSearch === '' || q.questionText?.toLowerCase().includes(qSearch.toLowerCase()))
  )

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'health', label: 'Health Report', icon: Activity },
    { key: 'duplicates', label: 'Duplicates', icon: AlertTriangle },
    { key: 'examQuestions', label: 'Assign Questions', icon: BookOpen },
    { key: 'auditLog', label: 'Audit Log', icon: ClipboardList },
    { key: 'imports', label: 'Import History', icon: FileText },
  ]

  return (
    <SafePageWrapper pageName="Data Management">
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link to="/admin/dashboard">
            <Button variant="outline" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Database className="w-7 h-7 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Data Management</h1>
              <p className="text-gray-500 text-sm">Health checks, duplicate detection, exam question assignment, audit logs</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-gray-200 mb-8 overflow-x-auto">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all ${
                  tab === t.key ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-800'
                }`}>
                <t.icon className="w-4 h-4" />{t.label}
              </button>
            ))}
          </div>

          {/* ===== HEALTH REPORT ===== */}
          {tab === 'health' && (
            <div>
              <div className="flex justify-end mb-4">
                <Button variant="outline" size="sm" onClick={loadHealth} disabled={healthLoading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${healthLoading ? 'animate-spin' : ''}`} />Refresh
                </Button>
              </div>
              {health ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Search className="w-4 h-4 text-blue-500" />Questions
                    </h3>
                    <div className="space-y-2 text-sm">
                      {[
                        ['Total Active', health.questions.total, 'text-green-600'],
                        ['Inactive / Deleted', health.questions.inactive, 'text-gray-500'],
                        ['Duplicate Groups', health.questions.duplicateGroups, health.questions.duplicateGroups > 0 ? 'text-red-600' : 'text-green-600'],
                        ['Total Duplicates', health.questions.duplicateCount, health.questions.duplicateCount > 0 ? 'text-red-600' : 'text-green-600'],
                      ].map(([label, val, cls]) => (
                        <div key={label as string} className="flex justify-between">
                          <span className="text-gray-600">{label}</span>
                          <span className={`font-semibold ${cls}`}>{val}</span>
                        </div>
                      ))}
                    </div>
                    {health.questions.duplicateGroups > 0 && (
                      <button onClick={() => setTab('duplicates')} className="mt-3 text-xs text-red-600 underline">
                        View & fix duplicates →
                      </button>
                    )}
                  </Card>
                  <Card>
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-500" />Exams
                    </h3>
                    <div className="space-y-2 text-sm">
                      {[
                        ['Total Active', health.exams.total, 'text-green-600'],
                        ['Exams with No Questions', health.exams.emptyExams, health.exams.emptyExams > 0 ? 'text-orange-600' : 'text-green-600'],
                      ].map(([label, val, cls]) => (
                        <div key={label as string} className="flex justify-between">
                          <span className="text-gray-600">{label}</span>
                          <span className={`font-semibold ${cls}`}>{val}</span>
                        </div>
                      ))}
                    </div>
                    {health.exams.emptyExams > 0 && (
                      <div className="mt-3 space-y-1">
                        {health.exams.emptyExamList.map(e => (
                          <div key={e.id} className="text-xs text-orange-600 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />{e.title}
                          </div>
                        ))}
                        <button onClick={() => setTab('examQuestions')} className="text-xs text-blue-600 underline">
                          Assign questions →
                        </button>
                      </div>
                    )}
                  </Card>
                  <Card className="md:col-span-2">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500" />Recent Imports
                    </h3>
                    {health.recentImports.length === 0 ? (
                      <p className="text-sm text-gray-400 italic">No imports yet</p>
                    ) : (
                      <div className="space-y-2">
                        {health.recentImports.map(i => (
                          <div key={i.id} className="flex items-center justify-between text-sm border-b pb-2">
                            <span className="text-gray-700">{i.fileName}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-green-600">{i.imported} imported</span>
                              {i.failed > 0 && <span className="text-red-600">{i.failed} failed</span>}
                              <Badge variant={i.status === 'DONE' ? 'success' : i.status === 'FAILED' ? 'error' : 'warning'} size="sm">
                                {i.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                </div>
              ) : (
                <div className="text-center py-16 text-gray-400">
                  {healthLoading ? 'Loading health report...' : 'Click Refresh to load report'}
                </div>
              )}
            </div>
          )}

          {/* ===== DUPLICATES ===== */}
          {tab === 'duplicates' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                  {dupData ? `${dupData.totalDuplicateGroups} duplicate groups, ${dupData.totalDuplicateQuestions} total duplicates` : 'Scan to find duplicates'}
                </p>
                <div className="flex gap-2">
                  {selectedToDelete.size > 0 && (
                    <Button className="bg-red-600 hover:bg-red-700 text-white" size="sm" onClick={handleRemoveDuplicates}>
                      <Trash2 className="w-4 h-4 mr-2" />Delete {selectedToDelete.size} selected
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={loadDuplicates} disabled={dupLoading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${dupLoading ? 'animate-spin' : ''}`} />
                    {dupLoading ? 'Scanning...' : 'Scan'}
                  </Button>
                </div>
              </div>
              {dupData?.duplicates.length === 0 && (
                <div className="text-center py-16">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">No duplicates found</p>
                </div>
              )}
              <div className="space-y-3">
                {dupData?.duplicates.map((group, gi) => (
                  <Card key={gi}>
                    <button className="w-full flex items-center justify-between text-left"
                      onClick={() => setExpandedGroup(expandedGroup === gi ? null : gi)}>
                      <div>
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{group.normalizedText}</p>
                        <p className="text-xs text-red-600 mt-0.5">{group.count} duplicates</p>
                      </div>
                      {expandedGroup === gi ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </button>
                    <AnimatePresence>
                      {expandedGroup === gi && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="mt-3 space-y-2 border-t pt-3">
                            <p className="text-xs text-gray-500 mb-2">Check questions to DELETE (keep the first one unchecked):</p>
                            {group.questions.map((q, qi) => (
                              <label key={q.id} className="flex items-start gap-3 cursor-pointer text-sm">
                                <input type="checkbox"
                                  checked={selectedToDelete.has(q.id)}
                                  disabled={qi === 0} // protect first (oldest)
                                  onChange={e => {
                                    const next = new Set(selectedToDelete)
                                    e.target.checked ? next.add(q.id) : next.delete(q.id)
                                    setSelectedToDelete(next)
                                  }}
                                  className="mt-0.5 w-4 h-4 text-red-600 rounded"
                                />
                                <div>
                                  <span className={qi === 0 ? 'text-green-700 font-medium' : 'text-gray-700'}>
                                    {qi === 0 ? '✓ Keep (oldest)' : 'Delete?'} — {q.subject?.name} · {q.examType} {q.year ? `· ${q.year}` : ''}
                                  </span>
                                  <p className="text-xs text-gray-400">{new Date(q.createdAt).toLocaleDateString()}</p>
                                </div>
                              </label>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* ===== EXAM QUESTION ASSIGNMENT ===== */}
          {tab === 'examQuestions' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Exam</label>
                <select value={selectedExam} onChange={e => { setSelectedExam(e.target.value); setSelectedToAssign(new Set()); setSelectedToRemove(new Set()) }}
                  className="w-full max-w-md border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="">-- Choose an exam --</option>
                  {exams.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                </select>
              </div>

              {selectedExam && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Assigned questions */}
                  <Card>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">Assigned ({examQuestions.length})</h3>
                      {selectedToRemove.size > 0 && (
                        <Button className="bg-red-600 hover:bg-red-700 text-white" size="sm" onClick={handleRemoveFromExam}>
                          <Minus className="w-4 h-4 mr-1" />Remove {selectedToRemove.size}
                        </Button>
                      )}
                    </div>
                    {eqLoading ? <p className="text-sm text-gray-400">Loading...</p> : (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {examQuestions.length === 0 && <p className="text-sm text-gray-400 italic">No questions assigned yet</p>}
                        {examQuestions.map((eq: any) => (
                          <label key={eq.examQuestionId} className="flex items-start gap-2 cursor-pointer text-sm border rounded-lg p-2 hover:bg-gray-50">
                            <input type="checkbox" checked={selectedToRemove.has(eq.question.id)}
                              onChange={e => {
                                const next = new Set(selectedToRemove)
                                e.target.checked ? next.add(eq.question.id) : next.delete(eq.question.id)
                                setSelectedToRemove(next)
                              }}
                              className="mt-0.5 w-4 h-4 text-red-500 rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-gray-800 line-clamp-2" dangerouslySetInnerHTML={{ __html: eq.question.questionText }} />
                              <p className="text-xs text-gray-400 mt-0.5">{eq.question.subject} · {eq.question.difficulty}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </Card>

                  {/* Available questions */}
                  <Card>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">Available ({filteredQuestions.length})</h3>
                      {selectedToAssign.size > 0 && (
                        <Button variant="primary" size="sm" onClick={handleAssign}>
                          <Plus className="w-4 h-4 mr-1" />Assign {selectedToAssign.size}
                        </Button>
                      )}
                    </div>
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="text" value={qSearch} onChange={e => setQSearch(e.target.value)}
                        placeholder="Search questions..."
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      {qSearch && <button onClick={() => setQSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-gray-400" /></button>}
                    </div>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {filteredQuestions.length === 0 && <p className="text-sm text-gray-400 italic">No questions available</p>}
                      {filteredQuestions.slice(0, 50).map((q: any) => (
                        <label key={q.id} className="flex items-start gap-2 cursor-pointer text-sm border rounded-lg p-2 hover:bg-gray-50">
                          <input type="checkbox" checked={selectedToAssign.has(q.id)}
                            onChange={e => {
                              const next = new Set(selectedToAssign)
                              e.target.checked ? next.add(q.id) : next.delete(q.id)
                              setSelectedToAssign(next)
                            }}
                            className="mt-0.5 w-4 h-4 text-purple-600 rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-800 line-clamp-2" dangerouslySetInnerHTML={{ __html: q.questionText }} />
                            <p className="text-xs text-gray-400 mt-0.5">{q.subject} · {q.difficulty}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* ===== AUDIT LOG ===== */}
          {tab === 'auditLog' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-600">{auditTotal} total entries</p>
                <Button variant="outline" size="sm" onClick={() => loadAuditLogs(1)} disabled={auditLoading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${auditLoading ? 'animate-spin' : ''}`} />Refresh
                </Button>
              </div>
              <div className="space-y-2">
                {auditLogs.map(log => (
                  <div key={log.id} className="flex items-start gap-3 p-3 bg-white border border-gray-100 rounded-lg text-sm">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="info" size="sm">{log.action}</Badge>
                        <span className="text-gray-500">{log.entityType}{log.entityId ? ` · ${log.entityId.slice(0, 8)}...` : ''}</span>
                      </div>
                      <p className="text-gray-600 mt-1">{log.user.firstName} {log.user.lastName} <span className="text-gray-400">({log.user.role})</span></p>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                ))}
                {auditLogs.length === 0 && !auditLoading && (
                  <p className="text-center text-gray-400 py-12">No audit logs yet</p>
                )}
              </div>
              {auditTotal > 30 && (
                <div className="flex justify-center gap-3 mt-6">
                  <Button variant="outline" size="sm" disabled={auditPage === 1} onClick={() => loadAuditLogs(auditPage - 1)}>Previous</Button>
                  <span className="text-sm text-gray-600 self-center">Page {auditPage} of {Math.ceil(auditTotal / 30)}</span>
                  <Button variant="outline" size="sm" disabled={auditPage >= Math.ceil(auditTotal / 30)} onClick={() => loadAuditLogs(auditPage + 1)}>Next</Button>
                </div>
              )}
            </div>
          )}

          {/* ===== IMPORT HISTORY ===== */}
          {tab === 'imports' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-600">{imports.length} import jobs</p>
                <Button variant="outline" size="sm" onClick={loadImports} disabled={importsLoading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${importsLoading ? 'animate-spin' : ''}`} />Refresh
                </Button>
              </div>
              {imports.length === 0 ? (
                <div className="text-center py-16 text-gray-400">No imports yet. Use Bulk Import to add questions.</div>
              ) : (
                <div className="space-y-3">
                  {imports.map(imp => (
                    <Card key={imp.id}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{imp.fileName}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            By {imp.importer?.firstName} {imp.importer?.lastName} · {new Date(imp.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-500">Total: {imp.totalRows}</span>
                          <span className="text-green-600">✓ {imp.imported}</span>
                          <span className="text-yellow-600">⊘ {imp.skipped}</span>
                          {imp.failed > 0 && <span className="text-red-600">✗ {imp.failed}</span>}
                          <Badge variant={imp.status === 'DONE' ? 'success' : imp.status === 'FAILED' ? 'error' : 'warning'} size="sm">
                            {imp.status}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Layout>
    </SafePageWrapper>
  )
}
