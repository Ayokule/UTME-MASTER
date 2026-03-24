import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, ArrowLeft } from 'lucide-react'
import Layout from '../../components/Layout'
import QuestionForm from '../../components/questions/QuestionForm'
import { useQuestionStore } from '../../store/question'
import { showToast } from '../../components/ui/Toast'
import { CreateQuestionData } from '../../types/question'
import Button from '../../components/ui/Button'


export default function QuestionCreate() {
  const navigate = useNavigate()
  const location = useLocation()
  const isTeacher = location.pathname.startsWith('/teacher')
  const listPath = isTeacher ? '/teacher/questions' : '/admin/questions'

  const { createQuestion } = useQuestionStore()
  const [loading, setLoading] = useState(false)
  

  const handleSubmit = async (data: CreateQuestionData | any) => {
    setLoading(true)
    try {
      await createQuestion(data as CreateQuestionData)
      showToast.success('Question created successfully!')
      navigate(listPath)
    } catch (error: any) {
      showToast.error(error.message || 'Failed to create question')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate(listPath)
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
                  Create New Question
                </h1>
                <p className="text-gray-600 mt-1">
                  Add a new question to the question bank
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl border border-primary-200">
              <Plus className="w-5 h-5 text-primary-600" />
              <span className="text-sm font-medium text-primary-700">
                New Question
              </span>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <QuestionForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        </motion.div>
      </div>
    </Layout>
  )
}