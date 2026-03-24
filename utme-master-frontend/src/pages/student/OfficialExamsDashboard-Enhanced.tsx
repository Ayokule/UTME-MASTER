/**
 * Official Exams Dashboard
 * 
 * Complete dashboard for official exams including:
 * - Analytics (performance metrics)
 * - Exam List (available exams with quick start buttons)
 * - Exam History (past attempts with resume capability)
 * - Statistics and progress tracking
 */

import { useState, useEffect, memo, useCallback } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  BookOpen, Award, TrendingUp, ArrowLeft, AlertCircle,
  CheckCircle, Play, RotateCcw, Search as SearchIcon
} from 'lucide-react'
import Layout from '../../components/Layout'
import SafePageWrapper from '../../components/SafePageWrapper'
import BlankPageDetector from '../../components/BlankPageDetector'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Input from '../../components/ui/Input'
import Pagination from '../../components/ui/Pagination'
import ErrorState from '../../components/ui/ErrorState'
import StatCard from '../../components/dashboard/StatCard'
import SubjectPerformanceChart from '../../components/dashboard/SubjectPerformanceChart'
import ProgressChart from '../../components/dashboard/ProgressChart'
import StrengthsWeaknesses from '../../components/dashboard/StrengthsWeaknesses'
import ExamListSkeleton from '../../components/skeletons/ExamListSkeleton'
import { showToast } from '../../components/ui/Toast'
import { usePagination } from '../../hooks/usePagination'
import {
  getStudentExams, getExamHistory,
  StudentExam, ExamAttempt, ExamStats
} from '../../api/student'

// ==========================================
// ANIMATION VARIANTS (reduced motion aware)
// ==========================================
const makeVariants = (reduced: boolean) => ({
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: reduced ? { duration: 0 } : { duration: 0.6, staggerChildren: 0.1 }
    }
  },
  item: {
    hidden: reduced ? { opacity: 1 } : { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: reduced ? 0 : 0.5 } }
  }
})

// ==========================================
// FALLBACK MOCK DATA (used if API unavailable)
// ==========================================
const MOCK_EXAMS: StudentExam[] = [
  {
    id: 'jamb-2024-01',
    title: 'JAMB 2024 Mock Exam 1',
    type: 'JAMB',
    subjects: ['English Language', 'Mathematics', 'Physics', 'Chemistry'],
    totalQuestions: 120,
    duration: 180,
    difficulty: 'HARD',
    participants: 1250,
    averageScore: 72,
    status: 'AVAILABLE',
    userAttempts: 0,
    userBestScore: null,
    userLastAttempt: null,
    canRetake: true
  }
]

const MOCK_STATS: ExamStats = {
  totalExams: 0,
  examsCompleted: 0,
  averageScore: 0,
  bestScore: 0,
  improvementTrend: '0%',
  totalHours: 0,
  strongSubjects: [],
  weakSubjects: []
}

// ==========================================
// EXAM CARD COMPONENT
// ==========================================
interface ExamCardProps {
  exam: StudentExam
  onStart: (examId: string) => void
  onResume: (examId: string) => void
  reduced?: boolean
}

const ExamCard = memo(function ExamCard({ exam, onStart, onResume, reduced }: ExamCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'bg-green-100 text-green-700'
      case 'MEDIUM': return 'bg-orange-100 text-orange-700'
      case 'HARD': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <motion.div variants={makeVariants(!!reduced).item} whileHover={reduced ? {} : { y: -5 }}>
      <Card className="p-6 hover:shadow-lg transition-all">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{exam.title}</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{exam.type}</Badge>
              <Badge className={getDifficultyColor(exam.difficulty)}>
                {exam.difficulty}
              </Badge>
              {exam.status === 'IN_PROGRESS' && (
                <Badge variant="warning">In Progress</Badge>
              )}
            </div>
          </div>
          <div className="text-right">
            {exam.userAttempts > 0 && (
              <div className="text-sm text-gray-600">
                <p className="font-semibold text-lg text-primary-600">{exam.userBestScore}%</p>
                <p className="text-xs text-gray-500">{exam.userAttempts} attempt{exam.userAttempts > 1 ? 's' : ''}</p>
              </div>
            )}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-gray-600 text-xs">Questions</p>
            <p className="font-semibold text-gray-900">{exam.totalQuestions}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-gray-600 text-xs">Duration</p>
            <p className="font-semibold text-gray-900">{exam.duration} min</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-gray-600 text-xs">Participants</p>
            <p className="font-semibold text-gray-900">{exam.participants}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-gray-600 text-xs">Avg Score</p>
            <p className="font-semibold text-gray-900">{exam.averageScore}%</p>
          </div>
        </div>

        {/* Subjects */}
        <div className="mb-4">
          <p className="text-xs text-gray-600 mb-2">Subjects ({exam.subjects.length})</p>
          <div className="flex flex-wrap gap-1">
            {exam.subjects.map((subject) => (
              <span key={subject} className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                {subject}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {exam.status === 'IN_PROGRESS' ? (
            <Button
              onClick={() => onResume(exam.id)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Resume
            </Button>
          ) : (
            <Button
              onClick={() => onStart(exam.id)}
              className="flex-1 bg-primary-600 hover:bg-primary-700 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              Start Exam
            </Button>
          )}
          <Button variant="outline" className="flex-1">
            Preview
          </Button>
        </div>
      </Card>
    </motion.div>
  )
})

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function OfficialExamsDashboard() {
  const navigate = useNavigate()
  const reduced = useReducedMotion() ?? false
  const { container: containerVariants, item: itemVariants } = makeVariants(reduced)

  const [exams, setExams] = useState<StudentExam[]>([])
  const [examHistory, setExamHistory] = useState<ExamAttempt[]>([])
  const [stats, setStats] = useState<ExamStats>(MOCK_STATS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'analytics' | 'exams' | 'history'>('analytics')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'ALL' | 'JAMB' | 'WAEC'>('ALL')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [examData, historyData] = await Promise.all([
        getStudentExams(),
        getExamHistory()
      ])
      // Normalize backend shape to what the component expects
      const normalized: StudentExam[] = (examData.exams || []).map((e: any) => ({
        id: e.id,
        title: e.title ?? 'Untitled Exam',
        type: e.type ?? 'JAMB',
        subjects: Array.isArray(e.subjects) ? e.subjects : [],
        totalQuestions: e.totalQuestions ?? 0,
        duration: e.duration ?? 0,
        difficulty: e.difficulty ?? 'MEDIUM',
        participants: e.participants ?? 0,
        averageScore: e.averageScore ?? 0,
        status: e.status ?? 'AVAILABLE',
        userAttempts: e.userAttempts ?? 0,
        userBestScore: e.userBestScore ?? null,
        userLastAttempt: e.userLastAttempt ?? null,
        canRetake: e.canRetake ?? true
      }))
      setExams(normalized)
      setStats(examData.stats ?? MOCK_STATS)
      setExamHistory(Array.isArray(historyData) ? historyData : [])
    } catch (err: any) {
      setError(err?.message || 'Could not load exams. Please try again.')
      setExams(MOCK_EXAMS)
    } finally {
      setLoading(false)
    }
  }

  const filteredExams = exams.filter(exam => {
    const matchesSearch = (exam.title ?? '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'ALL' || exam.type === filterType
    return matchesSearch && matchesType
  })

  const examPagination = usePagination(filteredExams)

  const handleStartExam = useCallback((examId: string) => {
    showToast.success('Starting exam...')
    navigate(`/student/exam-start/${examId}`)
  }, [navigate])

  const handleResumeExam = useCallback((examId: string) => {
    showToast.success('Resuming exam...')
    navigate(`/student/exam/${examId}?resume=true`)
  }, [navigate])

  return (
    <SafePageWrapper pageName="Official Exams Dashboard">
      <Layout>
        <BlankPageDetector 
          pageName="Official Exams Dashboard" 
          hasContent={!loading && exams.length > 0}
        />
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
        >

          {/* ============================================
              HEADER WITH BACK BUTTON
              ============================================ */}
          <motion.div variants={itemVariants} className="flex items-center gap-4">
            <Link to="/student/dashboard">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Official Exams</h1>
              <p className="text-gray-600">JAMB & WAEC Mock Exams</p>
            </div>
          </motion.div>

          {/* ============================================
              STATS CARDS
              ============================================ */}
          <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div variants={itemVariants}>
              <StatCard
                icon={<BookOpen className="w-6 h-6" />}
                label="Total Exams"
                value={stats.totalExams}
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard
                icon={<CheckCircle className="w-6 h-6" />}
                label="Completed"
                value={stats.examsCompleted}
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard
                icon={<Award className="w-6 h-6" />}
                label="Best Score"
                value={`${stats.bestScore}%`}
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard
                icon={<TrendingUp className="w-6 h-6" />}
                label="Improvement"
                value={stats.improvementTrend}
                trend="up"
              />
            </motion.div>
          </motion.div>

          {/* ============================================
              TABS
              ============================================ */}
          <motion.div variants={itemVariants}>
            <div className="border-b border-gray-200 mb-6">
              <div className="flex gap-8">
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`py-4 px-2 font-medium border-b-2 transition-colors ${
                    activeTab === 'analytics'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📊 Analytics
                </button>
                <button
                  onClick={() => setActiveTab('exams')}
                  className={`py-4 px-2 font-medium border-b-2 transition-colors ${
                    activeTab === 'exams'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📝 Available Exams
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`py-4 px-2 font-medium border-b-2 transition-colors ${
                    activeTab === 'history'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📋 History
                </button>
              </div>
            </div>
          </motion.div>

          {/* ============================================
              TAB: ANALYTICS
              ============================================ */}
          {activeTab === 'analytics' && (
            <motion.div variants={containerVariants} className="space-y-8">
              {/* Charts Row */}
              <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SubjectPerformanceChart data={[
                  { subject: 'English Language', score: 85, tests: 3 },
                  { subject: 'Mathematics', score: 72, tests: 3 },
                  { subject: 'Physics', score: 68, tests: 2 },
                  { subject: 'Chemistry', score: 80, tests: 2 }
                ]} />
                <ProgressChart data={[
                  { date: '2024-02-01', score: 65, exam_title: 'JAMB 2024 Mock 1' },
                  { date: '2024-02-15', score: 72, exam_title: 'JAMB 2024 Mock 1' },
                  { date: '2024-03-01', score: 78, exam_title: 'JAMB 2024 Mock 1' },
                  { date: '2024-03-10', score: 82, exam_title: 'JAMB 2024 Mock 1' }
                ]} />
              </motion.div>

              {/* Strengths & Weaknesses */}
              <motion.div variants={itemVariants}>
                <StrengthsWeaknesses 
                  strengths={stats.strongSubjects}
                  weaknesses={stats.weakSubjects}
                />
              </motion.div>
            </motion.div>
          )}

          {/* ============================================
              TAB: AVAILABLE EXAMS
              ============================================ */}
          {activeTab === 'exams' && (
            <motion.div variants={containerVariants} className="space-y-6">
              {/* Search & Filter */}
              <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    icon={<SearchIcon className="w-5 h-5" />}
                    placeholder="Search exams..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  {(['ALL', 'JAMB', 'WAEC'] as const).map((type) => (
                    <Button
                      key={type}
                      onClick={() => setFilterType(type)}
                      variant={filterType === type ? 'primary' : 'outline'}
                      size="sm"
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </motion.div>

              {/* Exam List */}
              {filteredExams.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {examPagination.paged.map((exam) => (
                      <ExamCard
                        key={exam.id}
                        exam={exam}
                        onStart={handleStartExam}
                        onResume={handleResumeExam}
                        reduced={reduced}
                      />
                    ))}
                  </div>
                  <Pagination
                    {...examPagination}
                    onNext={examPagination.next}
                    onPrev={examPagination.prev}
                    onGoTo={examPagination.goTo}
                    totalItems={filteredExams.length}
                  />
                </>
              ) : loading ? (
                <ExamListSkeleton />
              ) : error ? (
                <ErrorState message={error} onRetry={loadData} />
              ) : (
                <motion.div variants={itemVariants}>
                  <Card className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No exams found matching your criteria</p>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ============================================
              TAB: HISTORY
              ============================================ */}
          {activeTab === 'history' && (
            <motion.div variants={containerVariants} className="space-y-4">
              {examHistory.length > 0 ? (
                examHistory.map((attempt, index) => (
                  <motion.div key={attempt.id} variants={itemVariants}>
                    <Card className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-2">{attempt.examTitle}</h3>
                          <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                            <span>📅 {new Date(attempt.submittedAt).toLocaleDateString()}</span>
                            <span>⏱️ {attempt.duration} min</span>
                            <span>📊 {attempt.correctAnswers}/{attempt.totalQuestions} correct</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-primary-600">{attempt.percentage}%</div>
                          <Link to={`/student/results/${attempt.id}`}>
                            <Button variant="outline" size="sm" className="mt-2 w-full md:w-auto">
                              View Results
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <Card className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No exam history yet. Start an exam to see your results here.</p>
                </Card>
              )}
            </motion.div>
          )}

        </motion.div>
      </Layout>
    </SafePageWrapper>
  )
}
