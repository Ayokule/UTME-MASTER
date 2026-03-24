import { useState, useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { 
  BookOpen, Award, Target, Clock, Play, Brain, 
  Zap, ArrowRight, CheckCircle, BarChart3, Calendar, Sparkles 
} from 'lucide-react'
import Layout from '../../components/Layout'
import SafePageWrapper from '../../components/SafePageWrapper'
import BlankPageDetector from '../../components/BlankPageDetector'
import StatCard from '../../components/dashboard/StatCard'
import SubjectPerformanceChart from '../../components/dashboard/SubjectPerformanceChart'
import ProgressChart from '../../components/dashboard/ProgressChart'
import RecentActivity from '../../components/dashboard/RecentActivity'
import StrengthsWeaknesses from '../../components/dashboard/StrengthsWeaknesses'
import PremiumUpgrade from '../../components/dashboard/PremiumUpgrade'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import ErrorState from '../../components/ui/ErrorState'
import DashboardSkeleton from '../../components/skeletons/DashboardSkeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs'
import { useAuthStore } from '../../store/auth'
import { getDashboardData } from '../../api/dashboard'
import { DashboardData } from '../../types/dashboard'
import { showToast } from '../../components/ui/Toast'

// ==========================================
// ANIMATION VARIANTS (reduced motion aware — built inside component)
// ==========================================

// ==========================================
// STUDY TOOLS DATA
// ==========================================
const studyTools = [
  {
    id: 'flashcards',
    title: 'Flashcards',
    description: 'Learn with spaced repetition',
    icon: BookOpen,
    color: 'from-blue-500 to-blue-600',
    count: '3.2K'
  },
  {
    id: 'timer',
    title: 'Study Timer',
    description: 'Pomodoro technique built-in',
    icon: Clock,
    color: 'from-orange-500 to-orange-600',
    count: '∞'
  },
  {
    id: 'notes',
    title: 'Quick Notes',
    description: 'Save important points',
    icon: Brain,
    color: 'from-purple-500 to-purple-600',
    count: '15'
  },
  {
    id: 'drills',
    title: 'Subject Drills',
    description: 'Focused practice sessions',
    icon: Target,
    color: 'from-green-500 to-green-600',
    count: '42'
  }
]

// ==========================================
// MAIN DASHBOARD COMPONENT
// ==========================================
export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const reduced = useReducedMotion() ?? false

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: reduced ? { duration: 0 } : { duration: 0.6, staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: reduced ? { opacity: 1 } : { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: reduced ? 0 : 0.5 } }
  }
  
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getDashboardData()
      setDashboardData(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard')
      showToast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <DashboardSkeleton />
      </Layout>
    )
  }

  if (error || !dashboardData) {
    return (
      <Layout>
        <ErrorState
          message={error || 'Dashboard data unavailable.'}
          onRetry={loadDashboardData}
          className="min-h-[60vh]"
        />
      </Layout>
    )
  }

  const { 
    student = { name: 'Student', streak_days: 0, license_tier: 'TRIAL' },
    stats = { total_tests: 0, average_score: 0, best_score: 0, hours_studied: 0 },
    subject_performance = [],
    progress = [],
    recent_activity = [],
    strengths = [],
    weaknesses = [],
    quote_of_day = ''
  } = dashboardData

  return (
    <SafePageWrapper pageName="Student Dashboard">
      <Layout>
        <BlankPageDetector 
          pageName="Student Dashboard" 
          hasContent={!!dashboardData && Object.keys(dashboardData).length > 0}
        />
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
        >

          {/* ============================================
              SECTION 1: HERO BANNER
              ============================================ */}
          <motion.div variants={itemVariants}>
            <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-6 md:p-8 text-white">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">
                    Welcome back, {student?.name || 'Student'} 👋
                  </h1>
                  <p className="text-primary-100 text-sm">
                    {new Date().toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <div className="flex flex-wrap gap-6 text-sm mt-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{student?.streak_days || 0} day study streak</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span className="capitalize">{(student?.license_tier || 'TRIAL').toLowerCase()} Plan</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 md:text-right">
                  <p className="text-xs text-primary-100 mb-1">Quote of the Day</p>
                  <p className="text-sm font-medium italic">"{quote_of_day}"</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ============================================
              SECTION 2: QUICK STATS (Key Metrics)
              ============================================ */}
          <motion.div variants={itemVariants}>
            <motion.div 
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {[
                { icon: BookOpen, label: 'Tests Taken', value: stats.total_tests, change: '+5', trend: 'up' },
                { icon: Award, label: 'Average Score', value: `${Math.round(stats.average_score)}%`, change: '+2.3%', trend: 'up' },
                { icon: Target, label: 'Best Score', value: `${Math.round(stats.best_score)}%`, change: undefined, trend: undefined },
                { icon: Clock, label: 'Study Hours', value: stats.hours_studied.toFixed(1), change: '+1.2h', trend: 'up' }
              ].map((stat, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <StatCard
                    icon={<stat.icon className="w-6 h-6" />}
                    label={stat.label}
                    value={stat.value}
                    change={stat.change}
                    trend={stat.trend as any}
                  />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* ============================================
              SECTION 3: IMMEDIATE ACTIONS (Quick Access)
              ============================================ */}
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                onClick={() => navigate('/student/exams')}
                className="h-20 flex flex-col items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Play className="w-5 h-5" />
                <span className="text-xs font-medium">Start Exam</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => navigate('/student/practice')}
                className="h-20 flex flex-col items-center justify-center gap-2"
              >
                <BookOpen className="w-5 h-5" />
                <span className="text-xs font-medium">Continue Practice</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => navigate('/student/exam-dashboard')}
                className="h-20 flex flex-col items-center justify-center gap-2"
              >
                <BarChart3 className="w-5 h-5" />
                <span className="text-xs font-medium">View Results</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => showToast.success('Study tools coming soon')}
                className="h-20 flex flex-col items-center justify-center gap-2"
              >
                <Brain className="w-5 h-5" />
                <span className="text-xs font-medium">Study Tools</span>
              </Button>
            </div>
          </motion.div>

          {/* ============================================
              SECTION 4: PERFORMANCE ANALYSIS (Tabbed)
              ============================================ */}
          <motion.div variants={itemVariants}>
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">📊 Overview</TabsTrigger>
                <TabsTrigger value="progress">📈 Progress</TabsTrigger>
                <TabsTrigger value="goals">🎯 Goals</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="space-y-6 py-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <SubjectPerformanceChart data={subject_performance || []} />
                    </div>
                    <div>
                      <StrengthsWeaknesses 
                        strengths={strengths} 
                        weaknesses={weaknesses} 
                      />
                    </div>
                  </div>
                  
                  {recent_activity && recent_activity.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                      <RecentActivity activities={recent_activity.slice(0, 4)} />
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="progress">
                <div className="space-y-6 py-6">
                  <ProgressChart data={progress || []} />
                  
                  <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Improvement Insights</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-white rounded-lg">
                        <p className="text-3xl font-bold text-green-600">+7%</p>
                        <p className="text-sm text-gray-600">Average improvement</p>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg">
                        <p className="text-3xl font-bold text-blue-600">4</p>
                        <p className="text-sm text-gray-600">Weeks tracked</p>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg">
                        <p className="text-3xl font-bold text-purple-600">↗️</p>
                        <p className="text-sm text-gray-600">Positive trend</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="goals">
                <div className="space-y-6 py-6">
                  <Card className="p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Today's Objectives</h4>
                    <div className="space-y-3">
                      {[
                        { title: 'Take 1 practice test', done: false },
                        { title: 'Review weak topics', done: false },
                        { title: 'Study for 2 hours', done: true }
                      ].map((goal, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <CheckCircle className={`w-5 h-5 ${goal.done ? 'text-green-600' : 'text-gray-300'}`} />
                          <span className={goal.done ? 'line-through text-gray-500' : 'text-gray-900'}>
                            {goal.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Weekly Target</h4>
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">Study 10 hours this week</p>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-purple-600 h-3 rounded-full" style={{ width: '60%' }}></div>
                      </div>
                      <p className="text-sm font-medium text-gray-700">6.0 of 10 hours</p>
                    </div>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* ============================================
              SECTION 5: DASHBOARD SELECTION
              ============================================ */}
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 border-blue-200 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Official Exams</h3>
                    <p className="text-sm text-gray-600">JAMB & Mock Exams</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Track performance on official exams with detailed analytics and subject breakdown.
                </p>
                <Link to="/student/exam-dashboard">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2">
                    View Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </Card>

              <Card className="p-6 border-orange-200 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Zap className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Practice Tests</h3>
                    <p className="text-sm text-gray-600">Subject Practice & Drills</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Monitor practice progress with improvement trends and topics needing work.
                </p>
                <Link to="/student/test-dashboard">
                  <Button className="w-full bg-orange-600 hover:bg-orange-700 flex items-center justify-center gap-2">
                    View Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </Card>
            </div>
          </motion.div>

          {/* ============================================
              SECTION 6: STUDY TOOLS
              ============================================ */}
          <motion.div variants={itemVariants}>
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Study Tools</h2>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {studyTools.map((tool) => {
                  const Icon = tool.icon
                  return (
                    <motion.div
                      key={tool.id}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => showToast.success(`Opening ${tool.title}...`)}
                      className={`bg-gradient-to-br ${tool.color} rounded-xl p-4 text-white cursor-pointer group`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <Icon className="w-6 h-6" />
                        <span className="text-xs opacity-80">{tool.count}</span>
                      </div>
                      <h3 className="font-semibold text-sm mb-1">{tool.title}</h3>
                      <p className="text-xs opacity-90">{tool.description}</p>
                    </motion.div>
                  )
                })}
              </div>
            </Card>
          </motion.div>

          {/* ============================================
              SECTION 7: PREMIUM UPGRADE (if TRIAL)
              ============================================ */}
          {user?.licenseTier === 'TRIAL' && (
            <motion.div variants={itemVariants}>
              <PremiumUpgrade onUpgrade={() => showToast.success('Upgrade coming soon!')} />
            </motion.div>
          )}

        </motion.div>
      </Layout>
    </SafePageWrapper>
  )
}
