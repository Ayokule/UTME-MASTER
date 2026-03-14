import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Edit, ArrowLeft, Eye } from 'lucide-react'
import Layout from '../../components/Layout'
import QuestionForm from '../../components/questions/QuestionForm'
import QuestionCard from '../../components/questions/QuestionCard'
import { useQuestionStore } from '../../store/question'
import { getQuestion } from '../../api/questions'
import { showToast } from '../../components/ui/Toast'
import { Question, UpdateQuestionData } from '../../types/question'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import { SkeletonCard } from '../../components/ui/LoadingSkeleton'

export default function QuestionEdit() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { updateQuestion } = useQuestionStore()
  
  const [question, setQuestion] = useState<Question | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      loadQuestion(id)
    }
  }, [id])

  const loadQuestion = async (questionId: string) => {
    try {
      setLoading(true)
      const questionData = await getQuestion(questionId)
      setQuestion(questionData)
    } catch (error: any) {
      setError(error.message || 'Failed to load question')
      showToast.error('Failed to load question')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: UpdateQuestionData | any) => {
    if (!question) return

    setSubmitting(true)
    try {
      await updateQuestion(question.id, data as UpdateQuestionData)
      showToast.success('Question updated successfully!')
      navigate('/admin/questions')
    } catch (error: any) {
      showToast.error(error.message || 'Failed to update question')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate('/admin/questions')
  }

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <SkeletonCard />
          </div>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </Layout>
    )
  }

  if (error || !question) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Edit className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Question Not Found
            </h3>
            <p className="text-gray-600 mb-6">
              {error || 'The question you are looking for does not exist or has been deleted.'}
            </p>
            <Button onClick={handleCancel}>
              Back to Questions
            </Button>
          </Card>
        </div>
      </Layout>
    )
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
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={handleCancel}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Questions</span>
              </Button>
              
              <div className="w-px h-6 bg-gray-300"></div>
              
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  Edit Question
                </h1>
                <p className="text-gray-600 mt-1">
                  Update question details and content
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowPreview(true)}
                className="flex items-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>Preview</span>
              </Button>
              
              <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl border border-primary-200">
                <Edit className="w-5 h-5 text-primary-600" />
                <span className="text-sm font-medium text-primary-700">
                  Editing
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Question Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-1">
                  Current Question Details
                </h3>
                <div className="flex items-center space-x-4 text-sm text-blue-700">
                  <span>Subject: {question?.subject || 'N/A'}</span>
                  <span>•</span>
                  <span>Difficulty: {question?.difficulty || 'N/A'}</span>
                  <span>•</span>
                  <span>Type: {question?.examType || 'N/A'}</span>
                  {question?.year && (
                    <>
                      <span>•</span>
                      <span>Year: {question.year}</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="text-xs text-blue-600 font-mono">
                ID: {question?.id?.slice?.(-8) || 'N/A'}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <QuestionForm
            question={question}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={submitting}
          />
        </motion.div>

        {/* Preview Modal */}
        <Modal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          title="Question Preview"
          size="lg"
        >
          <QuestionCard question={question} showActions={false} />
        </Modal>
      </div>
    </Layout>
  )
}