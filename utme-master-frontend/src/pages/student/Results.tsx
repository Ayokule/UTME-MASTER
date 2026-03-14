import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye } from 'lucide-react'
import Layout from '../../components/Layout'
import CelebrationHeader from '../../components/results/CelebrationHeader'
import OverallScoreCard from '../../components/results/OverallScoreCard'
import SubjectBreakdown from '../../components/results/SubjectBreakdown'
import QuestionReview from '../../components/results/QuestionReview'
import PremiumAnalytics from '../../components/results/PremiumAnalytics'
import ResultActions from '../../components/results/ResultActions'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import { useAuthStore } from '../../store/auth'
import { getExamResults, retakeExam, downloadResultsPDF } from '../../api/results.js'
import { ExamResults } from '../../types/results'
import { showToast } from '../../components/ui/Toast'

export default function Results() {
  const { studentExamId } = useParams<{ studentExamId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  
  const [results, setResults] = useState<ExamResults | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retaking, setRetaking] = useState(false)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (studentExamId) {
      loadResults()
    }
  }, [studentExamId])

  const loadResults = async () => {
    if (!studentExamId) return

    try {
      setLoading(true)
      setError(null)
      
      const data = await getExamResults(studentExamId)
      setResults(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load exam results')
      showToast.error('Failed to load exam results')
    } finally {
      setLoading(false)
    }
  }

  const handleRetake = async () => {
    if (!results) return

    try {
      setRetaking(true)
      const { studentExamId: newStudentExamId } = await retakeExam(results.exam.id)
      navigate(`/student/exam/${newStudentExamId}`)
    } catch (error: any) {
      showToast.error(error.message || 'Failed to start retake')
    } finally {
      setRetaking(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!studentExamId) return

    try {
      setDownloading(true)
      const blob = await downloadResultsPDF(studentExamId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `exam-results-${studentExamId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      showToast.success('PDF downloaded successfully')
    } catch (error: any) {
      showToast.error(error.message || 'Failed to download PDF')
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSkeleton />
        </div>
      </Layout>
    )
  }

  if (error || !results) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error || 'Results not found'}</p>
            <button 
              onClick={() => navigate('/student/dashboard')}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Celebration Header */}
        <CelebrationHeader 
          score={results.score} 
          examTitle={results.exam.title}
        />

        {/* Overall Score Card */}
        <div className="mt-8">
          <OverallScoreCard 
            score={results.score}
            totalQuestions={results.exam.totalQuestions}
          />
        </div>

        {/* Subject Breakdown */}
        <div className="mt-8">
          <SubjectBreakdown subjects={results.subjects} />
        </div>

        {/* Premium Analytics */}
        <div className="mt-8">
          <PremiumAnalytics 
            analytics={results.analytics || {
              improvement: 0,
              predictedScore: 0,
              rankingPercentile: 0,
              strengthsChart: [],
              weaknessesChart: [],
              topicBreakdown: []
            }}
            isPremium={user?.licenseTier !== 'TRIAL'}
          />
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(`/student/exam-review/${studentExamId}`)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            <Eye className="w-5 h-5" />
            Review Answers
          </motion.button>
          <div className="flex-1">
            <ResultActions
              studentExamId={studentExamId!}
              examId={results.exam.id}
              canRetake={results.canRetake}
              examTitle={results.exam.title}
              score={results.score.total}
              percentage={results.score.percentage}
              onRetake={handleRetake}
              onDownloadPDF={handleDownloadPDF}
            />
          </div>
        </div>

        {/* Question Review */}
        <div id="question-review" className="mt-8">
          <QuestionReview questions={results.questions} />
        </div>
      </div>
    </Layout>
  )
}