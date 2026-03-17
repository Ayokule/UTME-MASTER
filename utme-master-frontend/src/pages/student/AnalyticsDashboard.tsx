import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Award, 
  Calendar,
  Filter,
  Download,
  Share2,
  Printer
} from 'lucide-react'
import Layout from '../../components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs'
import PrintableContainer from '../../components/ui/PrintableContainer'
import PDFProgressModal from '../../components/ui/PDFProgressModal'
import usePDFDownload from '../../hooks/usePDFDownload'
import PerformanceTrendsChart from '../../components/analytics/PerformanceTrendsChart'
import ComparativeAnalysisChart from '../../components/analytics/ComparativeAnalysisChart'
import VisualProgressIndicators from '../../components/analytics/VisualProgressIndicators'
import { showToast } from '../../components/ui/Toast'
import { useAuthStore } from '../../store/auth'

export default function AnalyticsDashboard() {
  const { user } = useAuthStore()
  const printableRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month')
  const [showPDFModal, setShowPDFModal] = useState(false)

  // PDF Download Hook
  const {
    isGenerating,
    progress,
    error: pdfError,
    generateFromElement,
    downloadPDF,
    printPDF,
    reset: resetPDF
  } = usePDFDownload({
    onSuccess: (blob) => {
      setShowPDFModal(true)
    },
    onError: (error) => {
      setShowPDFModal(true)
    }
  })
  
  // Mock data - in real app, this would come from API
  const [performanceData] = useState([
    { date: '2024-01-01', score: 75, percentage: 75, timeSpent: 45, examCount: 2 },
    { date: '2024-01-15', score: 78, percentage: 78, timeSpent: 42, examCount: 3 },
    { date: '2024-02-01', score: 82, percentage: 82, timeSpent: 38, examCount: 2 },
    { date: '2024-02-15', score: 85, percentage: 85, timeSpent: 35, examCount: 4 },
    { date: '2024-03-01', score: 88, percentage: 88, timeSpent: 32, examCount: 3 },
  ])

  const [comparisonData] = useState([
    { category: 'Mathematics', studentScore: 85, classAverage: 72, topPerformer: 95, percentile: 78 },
    { category: 'English', studentScore: 78, classAverage: 75, topPerformer: 92, percentile: 65 },
    { category: 'Physics', studentScore: 92, classAverage: 68, topPerformer: 96, percentile: 89 },
    { category: 'Chemistry', studentScore: 88, classAverage: 70, topPerformer: 94, percentile: 82 },
    { category: 'Biology', studentScore: 75, classAverage: 73, topPerformer: 90, percentile: 58 },
  ])

  const [progressData] = useState({
    overall: 78,
    subjects: [
      { name: 'Mathematics', progress: 85, target: 90, color: '#3B82F6' },
      { name: 'English', progress: 78, target: 85, color: '#10B981' },
      { name: 'Physics', progress: 92, target: 95, color: '#F59E0B' },
      { name: 'Chemistry', progress: 88, target: 90, color: '#EF4444' },
      { name: 'Biology', progress: 75, target: 80, color: '#8B5CF6' },
    ],
    achievements: [
      {
        title: 'First Exam Completed',
        description: 'Complete your first practice exam',
        progress: 1,
        target: 1,
        icon: 'check',
        unlocked: true
      },
      {
        title: 'Study Streak',
        description: 'Study for 7 consecutive days',
        progress: 5,
        target: 7,
        icon: 'zap',
        unlocked: false
      },
      {
        title: 'High Achiever',
        description: 'Score above 90% in any subject',
        progress: 1,
        target: 1,
        icon: 'trophy',
        unlocked: true
      },
      {
        title: 'Time Master',
        description: 'Complete 10 exams under time limit',
        progress: 7,
        target: 10,
        icon: 'clock',
        unlocked: false
      }
    ],
    streaks: {
      current: 5,
      longest: 12,
      target: 14
    },
    goals: [
      { title: 'Weekly Study Hours', current: 8, target: 12, unit: 'hours', color: '#3B82F6' },
      { title: 'Practice Exams', current: 3, target: 5, unit: 'exams', color: '#10B981' },
      { title: 'Average Score', current: 78, target: 85, unit: '%', color: '#F59E0B' }
    ]
  })

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000)
  }, [])

  const handleExportData = async () => {
    if (!printableRef.current) return
    
    try {
      await generateFromElement(printableRef.current, {
        filename: `analytics-report-${user?.firstName || 'student'}-${new Date().toISOString().split('T')[0]}.pdf`,
        format: 'a4',
        orientation: 'portrait',
        includeHeader: true,
        includeFooter: true
      })
    } catch (error) {
      console.error('PDF generation failed:', error)
    }
  }

  const handlePrintReport = async () => {
    if (!printableRef.current) return
    
    try {
      const blob = await generateFromElement(printableRef.current, {
        format: 'a4',
        orientation: 'portrait',
        includeHeader: true,
        includeFooter: true
      })
      await printPDF(blob)
    } catch (error) {
      console.error('PDF print failed:', error)
    }
  }

  const handleShareProgress = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Learning Analytics',
        text: 'Check out my learning progress on UTME Master!',
        url: window.location.href
      }).catch(console.error)
    } else {
      navigator.clipboard.writeText(window.location.href)
      showToast.success('Link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading your analytics...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your Analytics</h1>
              <p className="text-gray-600">Track your learning progress and performance</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
            
            <Button variant="outline" onClick={handleExportData} disabled={isGenerating}>
              <Download className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Export PDF'}
            </Button>
            
            <Button variant="outline" onClick={handlePrintReport} disabled={isGenerating}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            
            <Button variant="outline" onClick={handleShareProgress}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </motion.div>

        {/* Main Content */}
        <PrintableContainer
          ref={printableRef}
          title="Learning Analytics Report"
          subtitle={`Generated for ${user?.firstName || 'Student'} on ${new Date().toLocaleDateString()}`}
          showHeader={true}
          showFooter={true}
        >
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 no-print">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Performance Trends</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <VisualProgressIndicators 
              data={progressData}
              animated={true}
              showAchievements={true}
              showGoals={true}
            />
          </TabsContent>

          {/* Performance Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <PerformanceTrendsChart 
              data={performanceData}
              title="Your Performance Over Time"
              timeRange={timeRange}
              type="area"
            />
            
            <PerformanceTrendsChart 
              data={performanceData}
              title="Detailed Performance Analysis"
              timeRange={timeRange}
              type="composed"
            />
          </TabsContent>

          {/* Comparison Tab */}
          <TabsContent value="comparison" className="space-y-6">
            <ComparativeAnalysisChart 
              data={comparisonData}
              studentName={user?.firstName || 'You'}
              className="Your Class"
              type="radar"
              showPercentiles={true}
            />
            
            <ComparativeAnalysisChart 
              data={comparisonData}
              studentName={user?.firstName || 'You'}
              className="Your Class"
              type="bar"
              showPercentiles={true}
            />
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Learning Goals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {progressData.goals.map((goal, index) => (
                      <div key={goal.title} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{goal.title}</span>
                          <Badge variant="secondary">
                            {goal.current}/{goal.target} {goal.unit}
                          </Badge>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${Math.min((goal.current / goal.target) * 100, 100)}%`,
                              backgroundColor: goal.color
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Recent Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {progressData.achievements
                      .filter(achievement => achievement.unlocked)
                      .map((achievement, index) => (
                        <div key={achievement.title} className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                          <div className="p-2 bg-yellow-100 rounded-lg">
                            <Award className="h-4 w-4 text-yellow-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                            <p className="text-sm text-gray-600">{achievement.description}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        </PrintableContainer>

        {/* PDF Progress Modal */}
        <PDFProgressModal
          isOpen={showPDFModal}
          onClose={() => {
            setShowPDFModal(false)
            resetPDF()
          }}
          progress={progress}
          error={pdfError}
          onRetry={handleExportData}
          onDownload={() => downloadPDF()}
        />
      </div>
    </Layout>
  )
}