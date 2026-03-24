import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Plus, Trash2, Download, Upload, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Layout from '../../components/Layout'
import { useQuestionSelectors } from '../../store/question'
import { showToast } from '../../components/ui/Toast'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import Pagination from '../../components/ui/Pagination'
import QuestionFilters from '../../components/questions/QuestionFilters'
import QuestionTable from '../../components/questions/QuestionTable'
import { exportQuestionsCSV } from '../../api/questions'
import { Question } from '../../types/question'

export default function QuestionList() {
  const navigate = useNavigate()
  const location = useLocation()

  // Detect if accessed from teacher routes
  const isTeacher = location.pathname.startsWith('/teacher')
  const basePath = isTeacher ? '/teacher/questions' : '/admin/questions'
  const importPath = isTeacher ? '/admin/bulk-import' : '/admin/bulk-import'
  const {
    questions,
    total,
    page,
    limit,
    totalPages,
    loading,
    error,
    selectedQuestions,
    hasSelection,
    selectedCount,
    fetchQuestions,
    deleteQuestion,
    deleteSelectedQuestions,
    setPage,
    setLimit,
    clearSelection,
    clearError
  } = useQuestionSelectors()

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null)
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState({ fetched: 0, total: 0 })
  const [exportDone, setExportDone] = useState(false)

  // Load questions on mount
  useEffect(() => {
    fetchQuestions()
  }, [])

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      clearError()
    }
  }, [])

  const handleCreateQuestion = () => {
    navigate(`${basePath}/create`)
  }

  const handleEditQuestion = (question: Question) => {
    navigate(`${basePath}/edit/${question.id}`)
  }

  const handleDeleteQuestion = (question: Question) => {
    setQuestionToDelete(question)
    setDeleteConfirmOpen(true)
  }

  const confirmDeleteQuestion = async () => {
    if (!questionToDelete) return

    try {
      await deleteQuestion(questionToDelete.id)
      showToast.success('Question deleted successfully')
      setDeleteConfirmOpen(false)
      setQuestionToDelete(null)
    } catch (error: any) {
      showToast.error(error.message || 'Failed to delete question')
    }
  }

  const handleBulkDelete = () => {
    setBulkDeleteConfirmOpen(true)
  }

  const confirmBulkDelete = async () => {
    try {
      await deleteSelectedQuestions()
      showToast.success(`${selectedCount} questions deleted successfully`)
      setBulkDeleteConfirmOpen(false)
    } catch (error: any) {
      showToast.error(error.message || 'Failed to delete questions')
    }
  }

  const handleImportQuestions = () => {
    navigate(importPath)
  }

  const handleExportQuestions = async () => {
    setExporting(true)
    setExportDone(false)
    setExportProgress({ fetched: 0, total: 0 })
    try {
      await exportQuestionsCSV({}, (fetched, total) => {
        setExportProgress({ fetched, total })
      })
      setExportDone(true)
      showToast.success('Questions exported successfully!')
    } catch (err: any) {
      showToast.error(err.message || 'Export failed')
      setExporting(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Question Management
              </h1>
              <p className="text-gray-600 mt-2">
                Create, edit, and manage exam questions
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handleImportQuestions}
                className="flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Import</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={handleExportQuestions}
                className="flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </Button>
              
              <Button
                onClick={handleCreateQuestion}
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Question</span>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="bg-red-50 border-red-200">
              <div className="flex items-center justify-between">
                <p className="text-red-800">{error}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearError}
                  className="text-red-600 hover:text-red-700"
                >
                  Dismiss
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <QuestionFilters />
        </motion.div>

        {/* Bulk Actions */}
        {hasSelection && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6"
          >
            <Card className="bg-primary-50 border-primary-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <p className="text-primary-800 font-medium">
                    {selectedCount} question{selectedCount !== 1 ? 's' : ''} selected
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSelection}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    Clear Selection
                  </Button>
                  
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleBulkDelete}
                    className="flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Selected</span>
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Question Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <QuestionTable
            onEdit={handleEditQuestion}
            onDelete={handleDeleteQuestion}
          />
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <Card padding="none">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                pageSize={limit}
                onPageSizeChange={setLimit}
                totalItems={total}
              />
            </Card>
          </motion.div>
        )}

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
          title="Delete Question"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              Are you sure you want to delete this question? This action cannot be undone.
            </p>
            
            {questionToDelete && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  Subject: {questionToDelete.subject}
                </p>
                <p className="text-sm text-gray-600">
                  {questionToDelete.questionText.substring(0, 100)}...
                </p>
              </div>
            )}
            
            <div className="flex items-center justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={confirmDeleteQuestion}
                loading={loading}
              >
                Delete Question
              </Button>
            </div>
          </div>
        </Modal>

        {/* Bulk Delete Confirmation Modal */}
        <Modal
          isOpen={bulkDeleteConfirmOpen}
          onClose={() => setBulkDeleteConfirmOpen(false)}
          title="Delete Selected Questions"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              Are you sure you want to delete {selectedCount} selected question{selectedCount !== 1 ? 's' : ''}? 
              This action cannot be undone.
            </p>
            
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 font-medium">
                ⚠️ Warning: This will permanently delete {selectedCount} question{selectedCount !== 1 ? 's' : ''} from the database.
              </p>
            </div>
            
            <div className="flex items-center justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setBulkDeleteConfirmOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={confirmBulkDelete}
                loading={loading}
              >
                Delete {selectedCount} Question{selectedCount !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Export Progress Modal */}
        <Modal
          isOpen={exporting}
          onClose={() => { if (exportDone) setExporting(false) }}
          title="Exporting Questions"
        >
          <div className="space-y-5 py-2">
            {!exportDone ? (
              <>
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin flex-shrink-0" />
                  <p className="text-sm text-gray-700">
                    {exportProgress.total > 0
                      ? `Fetching questions… ${exportProgress.fetched} / ${exportProgress.total}`
                      : 'Starting export…'}
                  </p>
                </div>
                {exportProgress.total > 0 && (
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-2 bg-blue-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round((exportProgress.fetched / exportProgress.total) * 100)}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}
                <p className="text-xs text-gray-400">Please wait, do not close this window.</p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <p className="text-sm text-gray-700 font-medium">
                    {exportProgress.total} questions exported successfully!
                  </p>
                </div>
                <p className="text-xs text-gray-500">Your CSV file has been downloaded.</p>
                <div className="flex justify-end">
                  <Button variant="primary" size="sm" onClick={() => setExporting(false)}>
                    Done
                  </Button>
                </div>
              </>
            )}
          </div>
        </Modal>
      </div>
    </Layout>
  )
}