import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, Download, Upload } from 'lucide-react'
import { motion } from 'framer-motion'
import Layout from '../../components/Layout'
import { useQuestionSelectors } from '../../store/question'
import { showToast } from '../../components/ui/Toast'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import Pagination from '../../components/ui/Pagination'
import QuestionFilters from '../../components/questions/QuestionFilters'
import QuestionTable from '../../components/questions/QuestionTable'
import { Question } from '../../types/question'

export default function QuestionList() {
  const navigate = useNavigate()
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
    navigate('/admin/questions/create')
  }

  const handleEditQuestion = (question: Question) => {
    navigate(`/admin/questions/edit/${question.id}`)
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
    navigate('/admin/bulk-import')
  }

  const handleExportQuestions = () => {
    navigate('/admin/bulk-import?tab=export')
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
      </div>
    </Layout>
  )
}