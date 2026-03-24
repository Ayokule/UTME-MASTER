import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Download, RotateCcw, Share2 } from 'lucide-react'
import Layout from '../../components/Layout'
import SafePageWrapper from '../../components/SafePageWrapper'
import BlankPageDetector from '../../components/BlankPageDetector'
import CelebrationHeader from '../../components/results/CelebrationHeader'
import OverallScoreCard from '../../components/results/OverallScoreCard'
import SubjectBreakdown from '../../components/results/SubjectBreakdown'
import QuestionReview from '../../components/results/QuestionReview'
import PremiumAnalytics from '../../components/results/PremiumAnalytics'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs'
import { useAuthStore } from '../../store/auth'
import { getExamResults, retakeExam, downloadResultsPDF } from '../../api/results'
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
    if (!results || !studentExamId) return

    try {
      setRetaking(true)
      const { studentExamId: newStudentExamId } = await retakeExam(studentExamId)
      showToast.success('Retake started! Redirecting...')
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

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/student/results/${studentExamId}`
    const shareText = `I just scored ${results?.score.total} (${Math.round(results?.score.percentage || 0)}%) on "${results?.exam.title}" on UTME Master! 🎯`
    
    if (navigator.share) {
      navigator.share({
        title: 'UTME Master Results',
        text: shareText,
        url: shareUrl
      })
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
      showToast.success('Link copied to clipboard!')
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
          <Card className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Results Not Found</h3>
            <p className="text-gray-600 mb-6">{error || 'Unable to load exam results'}</p>
            <Button 
              onClick={() => navigate('/student/dashboard')}
              className="inline-block"
            >
              Back to Dashboard
            </Button>
          </Card>
        </div>
      </Layout>
    )
  }

  return (
    <SafePageWrapper pageName="Exam Results">
      <Layout>
        <BlankPageDetector 
          pageName="Exam Results" 
          hasContent={!!results}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          
          {/* ============================================
              SECTION 1: CELEBRATION HEADER (Top Impact)
              ============================================ */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <CelebrationHeader 
              score={results.score} 
              examTitle={results.exam.title}
            />
          </motion.div>

          {/* ============================================
              SECTION 2: QUICK ACTIONS BAR (Sticky)
              ============================================ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="sticky top-4 z-30 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-4 border border-gray-200"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="info" size="lg">
                  Attempt #{results.attemptNumber}
                </Badge>
                <Badge variant="secondary" size="lg">
                  {new Date(results.submittedAt).toLocaleDateString()}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 flex-wrap justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadPDF}
                  disabled={downloading}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {downloading ? 'Downloading...' : 'PDF'}
                </Button>
                
                {results.canRetake && (
                  <Button
                    size="sm"
                    onClick={handleRetake}
                    disabled={retaking}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <RotateCcw className="w-4 h-4" />
                    {retaking ? 'Starting...' : 'Retake'}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>

          {/* ============================================
              SECTION 3: TABBED CONTENT AREA
              ============================================ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">📊 Performance Overview</TabsTrigger>
                <TabsTrigger value="review">👁️ Question Review</TabsTrigger>
                <TabsTrigger value="analytics">
                  📈 {user?.licenseTier === 'TRIAL' ? '🔒 Premium Analytics' : 'Advanced Analytics'}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="space-y-8 py-6">
                  <OverallScoreCard 
                    score={results.score}
                    totalQuestions={results.exam.totalQuestions}
                  />
                  <SubjectBreakdown subjects={results.subjects} />
                  <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">📈 Key Insights</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-primary-600">
                          {results.subjects.filter(s => s.percentage >= 70).length}
                        </p>
                        <p className="text-sm text-gray-600">Strong Subjects</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-orange-600">
                          {results.subjects.filter(s => s.percentage < 60).length}
                        </p>
                        <p className="text-sm text-gray-600">Need Work</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-green-600">
                          {Math.round(results.score.timeTaken / 60)}
                        </p>
                        <p className="text-sm text-gray-600">Minutes Taken</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="review">
                <div className="py-6">
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      💡 <strong>Tip:</strong> Review your answers to understand where you went wrong. 
                      This is the best way to improve!
                    </p>
                  </div>
                  <QuestionReview questions={results.questions} />
                </div>
              </TabsContent>

              <TabsContent value="analytics">
                <div className="py-6">
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
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* ============================================
              SECTION 4: RECOMMENDATIONS
              ============================================ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">🎯 Recommendations for Next Steps</h4>
              <div className="space-y-3 text-sm text-gray-700">
                {results.score.percentage >= 80 ? (
                  <p>✅ <strong>Excellent performance!</strong> You're well-prepared for JAMB. Keep practicing to maintain this level.</p>
                ) : results.score.percentage >= 60 ? (
                  <p>📚 <strong>Good progress!</strong> Focus on your weak subjects to improve further. Practice similar questions.</p>
                ) : results.score.percentage >= 40 ? (
                  <p>💪 <strong>Keep going!</strong> Identify your weak areas and practice targeted questions. You'll improve with consistency.</p>
                ) : (
                  <p>🔄 <strong>Start fresh!</strong> Review the fundamental concepts in your weak subjects. Success requires consistent practice.</p>
                )}
                
                <p>
                  📌 <strong>Next action:</strong> {
                    results.canRetake 
                      ? 'Take the retake to improve your score!'
                      : 'Try other exams to strengthen different topics.'
                  }
                </p>
              </div>
            </Card>
          </motion.div>

          {/* ============================================
              SECTION 5: NAVIGATION FOOTER
              ============================================ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-4 justify-between pt-6 border-t border-gray-200"
          >
            <Button
              variant="outline"
              onClick={() => navigate('/student/dashboard')}
            >
              ← Back to Dashboard
            </Button>
            
            <Button
              onClick={() => navigate('/student/exam-selection')}
              className="bg-primary-600 hover:bg-primary-700"
            >
              Try Another Exam →
            </Button>
          </motion.div>

        </div>
      </Layout>
    </SafePageWrapper>
  )
}
