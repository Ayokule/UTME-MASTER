/**
 * Practice Tests Dashboard
 */

import { useState, useEffect, memo, useCallback } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  TrendingUp, Award, ArrowLeft, AlertCircle,
  CheckCircle, Play, Filter, Search as SearchIcon,
  Flame, BookMarked
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
import TestListSkeleton from '../../components/skeletons/TestListSkeleton'
import { showToast } from '../../components/ui/Toast'
import { usePagination } from '../../hooks/usePagination'
import {
  getStudentTests, getTestHistory,
  StudentTest, TestAttempt, TestStats
} from '../../api/student'

// ==========================================
// ANIMATION VARIANTS (reduced motion aware)
// ==========================================
const makeVariants = (reduced: boolean) => ({
  container: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: reduced ? { duration: 0 } : { duration: 0.6, staggerChildren: 0.1 } }
  },
  item: {
    hidden: reduced ? { opacity: 1 } : { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: reduced ? 0 : 0.5 } }
  }
})

// ==========================================
// FALLBACK MOCK DATA
// ==========================================
const MOCK_STATS: TestStats = {
  totalTests: 0,
  testsCompleted: 0,
  averageScore: 0,
  bestScore: 0,
  improvementTrend: '0%',
  currentStreak: 0,
  totalHours: 0,
  strongSubjects: [],
  weakSubjects: [],
  subjectPerformance: []
}

// ==========================================
// TEST CARD COMPONENT
// ==========================================
interface TestCardProps {
  test: StudentTest
  onStart: (testId: string) => void
  reduced?: boolean
}

const TestCard = memo(function TestCard({ test, onStart, reduced }: TestCardProps) {  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'bg-green-100 text-green-700'
      case 'MEDIUM': return 'bg-orange-100 text-orange-700'
      case 'HARD': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getProgressPercentage = () => {
    if (test.userAttempts === 0) return 0
    return (test.questions_passed / test.totalQuestions) * 100
  }

  return (
    <motion.div variants={makeVariants(!!reduced).item} whileHover={reduced ? {} : { y: -5 }}>
      <Card className="p-5 hover:shadow-lg transition-all">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-base font-bold text-gray-900 mb-1">{test.title}</h3>
            <p className="text-sm text-gray-600 mb-2">{test.description}</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" size="sm">{test.subject}</Badge>
              <Badge className={getDifficultyColor(test.difficulty)} size="sm">
                {test.difficulty}
              </Badge>
            </div>
          </div>
          {test.userAttempts > 0 && (
            <div className="text-right ml-4">
              <p className="text-2xl font-bold text-primary-600">{test.userBestScore}%</p>
              <p className="text-xs text-gray-500">{test.userAttempts} attempt{test.userAttempts > 1 ? 's' : ''}</p>
            </div>
          )}
        </div>

        {test.userAttempts > 0 && (
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-600">Mastery</span>
              <span className="text-xs font-semibold text-primary-600">{Math.round(getProgressPercentage())}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
          <div className="bg-gray-50 p-2 rounded">
            <p className="text-gray-600">Questions</p>
            <p className="font-semibold text-gray-900">{test.totalQuestions}</p>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <p className="text-gray-600">Time</p>
            <p className="font-semibold text-gray-900">{test.duration}m</p>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <p className="text-gray-600">Avg Score</p>
            <p className="font-semibold text-gray-900">{test.averageScore}%</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => onStart(test.id)}
            size="sm"
            className="flex-1 bg-primary-600 hover:bg-primary-700 flex items-center justify-center gap-1"
          >
            <Play className="w-3 h-3" />
            Start
          </Button>
        </div>
      </Card>
    </motion.div>
  )
})

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function PracticeTestsDashboard() {
  const navigate = useNavigate()
  const reduced = useReducedMotion() ?? false
  const { container: containerVariants, item: itemVariants } = makeVariants(reduced)

  const [tests, setTests] = useState<StudentTest[]>([])
  const [testHistory, setTestHistory] = useState<TestAttempt[]>([])
  const [stats, setStats] = useState<TestStats>(MOCK_STATS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'analytics' | 'tests' | 'history'>('analytics')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterSubject, setFilterSubject] = useState<string>('ALL')
  const [filterDifficulty, setFilterDifficulty] = useState<string>('ALL')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [testData, historyData] = await Promise.all([
        getStudentTests(),
        getTestHistory()
      ])
      // Normalize backend shape { id, subject, code, questionCount, type }
      // into the StudentTest shape the component expects
      const normalized: StudentTest[] = (testData.tests || []).map((t: any) => ({
        id: t.id,
        title: t.title ?? t.subject ?? 'Practice Test',
        subject: t.subject ?? '',
        topic: t.topic ?? t.code ?? '',
        description: t.description ?? `Practice questions for ${t.subject ?? 'this subject'}`,
        totalQuestions: t.totalQuestions ?? t.questionCount ?? 0,
        duration: t.duration ?? 30,
        difficulty: t.difficulty ?? 'MEDIUM',
        participants: t.participants ?? 0,
        averageScore: t.averageScore ?? 0,
        status: t.status ?? 'AVAILABLE',
        userAttempts: t.userAttempts ?? 0,
        userBestScore: t.userBestScore ?? null,
        userLastAttempt: t.userLastAttempt ?? null,
        canRetake: t.canRetake ?? true,
        questions_passed: t.questions_passed ?? 0
      }))
      setTests(normalized)
      setStats(testData.stats)
      setTestHistory(historyData)
    } catch (err: any) {
      setError(err?.message || 'Could not load tests. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const subjects = ['ALL', ...new Set(tests.map(t => t.subject))]
  const difficulties = ['ALL', 'EASY', 'MEDIUM', 'HARD']

  const filteredTests = tests.filter(test => {
    const matchesSearch = (test.title ?? '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSubject = filterSubject === 'ALL' || test.subject === filterSubject
    const matchesDifficulty = filterDifficulty === 'ALL' || test.difficulty === filterDifficulty
    return matchesSearch && matchesSubject && matchesDifficulty
  })

  const testPagination = usePagination(filteredTests)

  const handleStartTest = useCallback((testId: string) => {
    showToast.success('Starting test...')
    navigate(`/student/test/${testId}`)
  }, [navigate])

  return (
    <SafePageWrapper pageName="Practice Tests Dashboard">
      <Layout>
        <BlankPageDetector
          pageName="Practice Tests Dashboard"
          hasContent={!loading && tests.length > 0}
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
        >

          {/* HEADER */}
          <motion.div variants={itemVariants} className="flex items-center gap-4">
            <Link to="/student/dashboard">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Practice Tests</h1>
              <p className="text-gray-600">Subject-based drills & topic mastery</p>
            </div>
            <div className="ml-auto">
              <Badge variant="success" className="flex items-center gap-2 px-4 py-2">
                <Flame className="w-4 h-4" />
                {stats.currentStreak} day streak! 🔥
              </Badge>
            </div>
          </motion.div>

          {/* STATS CARDS */}
          <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <motion.div variants={itemVariants}>
              <StatCard icon={<BookMarked className="w-6 h-6" />} label="Tests Available" value={stats.totalTests} />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard icon={<CheckCircle className="w-6 h-6" />} label="Completed" value={stats.testsCompleted} />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard icon={<Award className="w-6 h-6" />} label="Best Score" value={`${stats.bestScore}%`} />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard icon={<TrendingUp className="w-6 h-6" />} label="Avg Score" value={`${stats.averageScore}%`} />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard icon={<Flame className="w-6 h-6" />} label="Streak" value={`${stats.currentStreak}d`} />
            </motion.div>
          </motion.div>

          {/* TABS */}
          <motion.div variants={itemVariants}>
            <div className="border-b border-gray-200 mb-6">
              <div className="flex gap-8 overflow-x-auto">
                {[
                  { id: 'analytics', label: '📊 Analytics' },
                  { id: 'tests', label: '📝 Available Tests' },
                  { id: 'history', label: '📋 History' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* TAB: ANALYTICS */}
          {activeTab === 'analytics' && (
            <motion.div variants={containerVariants} className="space-y-8">
              <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SubjectPerformanceChart data={stats.subjectPerformance} />
                <ProgressChart data={testHistory.slice(0, 10).map(h => ({
                  date: h.completedAt,
                  score: h.percentage,
                  exam_title: h.testTitle
                }))} />
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Performance Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-white rounded-lg">
                      <p className="text-3xl font-bold text-green-600">{stats.strongSubjects.length}</p>
                      <p className="text-sm text-gray-600">Strong Subjects</p>
                      <div className="mt-2 space-y-1">
                        {stats.strongSubjects.map(s => <p key={s} className="text-xs text-gray-700">{s}</p>)}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg">
                      <p className="text-3xl font-bold text-primary-600">{stats.averageScore}%</p>
                      <p className="text-sm text-gray-600">Average Score</p>
                      <p className="text-xs text-green-600 mt-2">{stats.improvementTrend}</p>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg">
                      <p className="text-3xl font-bold text-orange-600">{stats.weakSubjects.length}</p>
                      <p className="text-sm text-gray-600">Need Practice</p>
                      <div className="mt-2 space-y-1">
                        {stats.weakSubjects.map(s => <p key={s} className="text-xs text-gray-700">{s}</p>)}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          )}

          {/* TAB: AVAILABLE TESTS */}
          {activeTab === 'tests' && (
            <motion.div variants={containerVariants} className="space-y-6">
              <motion.div variants={itemVariants} className="space-y-4">
                <Input
                  icon={<SearchIcon className="w-5 h-5" />}
                  placeholder="Search tests by title or topic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />

                <div className="flex flex-wrap gap-2">
                  <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Subject:
                  </span>
                  {subjects.map(subject => (
                    <Button
                      key={subject}
                      onClick={() => setFilterSubject(subject)}
                      variant={filterSubject === subject ? 'primary' : 'outline'}
                      size="sm"
                    >
                      {subject}
                    </Button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="text-sm font-medium text-gray-700">Difficulty:</span>
                  {difficulties.map(difficulty => (
                    <Button
                      key={difficulty}
                      onClick={() => setFilterDifficulty(difficulty)}
                      variant={filterDifficulty === difficulty ? 'primary' : 'outline'}
                      size="sm"
                    >
                      {difficulty}
                    </Button>
                  ))}
                </div>
              </motion.div>

              {filteredTests.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {testPagination.paged.map((test) => (
                      <TestCard key={test.id} test={test} onStart={handleStartTest} reduced={reduced} />
                    ))}
                  </div>
                  <Pagination
                    {...testPagination}
                    onNext={testPagination.next}
                    onPrev={testPagination.prev}
                    onGoTo={testPagination.goTo}
                    totalItems={filteredTests.length}
                  />
                </>
              ) : loading ? (
                <TestListSkeleton />
              ) : error ? (
                <ErrorState message={error} onRetry={loadData} />
              ) : (
                <motion.div variants={itemVariants}>
                  <Card className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      No tests found matching your criteria
                    </p>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* TAB: HISTORY */}
          {activeTab === 'history' && (
            <motion.div variants={containerVariants} className="space-y-4">
              {testHistory.length > 0 ? (
                testHistory.map((attempt) => (
                  <motion.div key={attempt.id} variants={itemVariants}>
                    <Card className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{attempt.testTitle}</h3>
                          <div className="flex flex-wrap gap-3 text-sm text-gray-600 mt-2">
                            <span>📅 {new Date(attempt.completedAt).toLocaleDateString()}</span>
                            <span>⏱️ {attempt.duration} min</span>
                            <span>📊 {attempt.correctAnswers}/{attempt.totalQuestions}</span>
                            <Badge variant="secondary" size="sm">{attempt.subject}</Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-primary-600">{attempt.percentage}%</div>
                          <Button variant="outline" size="sm" className="mt-2">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <Card className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No test history yet. Start a test to see your results here.</p>
                </Card>
              )}
            </motion.div>
          )}

        </motion.div>
      </Layout>
    </SafePageWrapper>
  )
}
