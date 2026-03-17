// ==========================================
// STUDENT PROGRESS DASHBOARD
// ==========================================
// Comprehensive progress tracking with performance trends and subject-wise metrics

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  BookOpen, 
  Clock, 
  Trophy,
  BarChart3,
  Calendar,
  Award,
  Activity,
  CheckCircle,
  AlertCircle,
  Zap
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { toast } from 'sonner'
import * as progressAPI from '@/api/progress'

interface SubjectProgress {
  subjectId: string
  subjectName: string
  totalQuestions: number
  correctAnswers: number
  wrongAnswers: number
  averageScore: number
  accuracy: number
  timeSpent: number
  lastPracticeDate: string
  improvement: number
  trend: 'up' | 'down' | 'stable'
  weakTopics: string[]
  strongTopics: string[]
}

interface PerformanceTrend {
  date: string
  score: number
  accuracy: number
  timeSpent: number
  subject: string
}

interface StudyStreak {
  currentStreak: number
  longestStreak: number
  lastStudyDate: string
  totalStudyDays: number
}

interface ProgressSummary {
  totalExamsTaken: number
  totalQuestionsAnswered: number
  overallAccuracy: number
  averageScore: number
  totalTimeSpent: number
  improvementRate: number
  currentLevel: string
  nextLevelProgress: number
}

const ProgressDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [progressSummary, setProgressSummary] = useState<ProgressSummary | null>(null)
  const [subjectProgress, setSubjectProgress] = useState<SubjectProgress[]>([])
  const [performanceTrends, setPerformanceTrends] = useState<PerformanceTrend[]>([])
  const [studyStreak, setStudyStreak] = useState<StudyStreak | null>(null)
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')

  useEffect(() => {
    loadProgressData()
  }, [selectedTimeRange])

  const loadProgressData = async () => {
    setLoading(true)
    try {
      // Mock data - in real implementation, these would be API calls
      setProgressSummary({
        totalExamsTaken: 24,
        totalQuestionsAnswered: 1250,
        overallAccuracy: 78.5,
        averageScore: 82.3,
        totalTimeSpent: 4320, // minutes
        improvementRate: 12.5,
        currentLevel: 'Intermediate',
        nextLevelProgress: 65
      })

      setSubjectProgress([
        {
          subjectId: '1',
          subjectName: 'Mathematics',
          totalQuestions: 450,
          correctAnswers: 342,
          wrongAnswers: 108,
          averageScore: 76.0,
          accuracy: 76.0,
          timeSpent: 1680,
          lastPracticeDate: '2024-03-16',
          improvement: 8.5,
          trend: 'up',
          weakTopics: ['Calculus', 'Statistics'],
          strongTopics: ['Algebra', 'Geometry']
        },
        {
          subjectId: '2',
          subjectName: 'English Language',
          totalQuestions: 380,
          correctAnswers: 312,
          wrongAnswers: 68,
          averageScore: 82.1,
          accuracy: 82.1,
          timeSpent: 1420,
          lastPracticeDate: '2024-03-17',
          improvement: 15.2,
          trend: 'up',
          weakTopics: ['Comprehension'],
          strongTopics: ['Grammar', 'Vocabulary']
        },
        {
          subjectId: '3',
          subjectName: 'Physics',
          totalQuestions: 220,
          correctAnswers: 165,
          wrongAnswers: 55,
          averageScore: 75.0,
          accuracy: 75.0,
          timeSpent: 890,
          lastPracticeDate: '2024-03-15',
          improvement: -2.1,
          trend: 'down',
          weakTopics: ['Electricity', 'Waves'],
          strongTopics: ['Mechanics', 'Thermodynamics']
        },
        {
          subjectId: '4',
          subjectName: 'Chemistry',
          totalQuestions: 200,
          correctAnswers: 168,
          wrongAnswers: 32,
          averageScore: 84.0,
          accuracy: 84.0,
          timeSpent: 750,
          lastPracticeDate: '2024-03-17',
          improvement: 6.8,
          trend: 'up',
          weakTopics: ['Organic Chemistry'],
          strongTopics: ['Inorganic Chemistry', 'Physical Chemistry']
        }
      ])

      setPerformanceTrends([
        { date: '2024-03-10', score: 72, accuracy: 70, timeSpent: 45, subject: 'Mathematics' },
        { date: '2024-03-11', score: 78, accuracy: 75, timeSpent: 50, subject: 'English' },
        { date: '2024-03-12', score: 75, accuracy: 73, timeSpent: 42, subject: 'Physics' },
        { date: '2024-03-13', score: 82, accuracy: 80, timeSpent: 38, subject: 'Chemistry' },
        { date: '2024-03-14', score: 79, accuracy: 77, timeSpent: 44, subject: 'Mathematics' },
        { date: '2024-03-15', score: 85, accuracy: 83, timeSpent: 41, subject: 'English' },
        { date: '2024-03-16', score: 81, accuracy: 79, timeSpent: 46, subject: 'Physics' },
        { date: '2024-03-17', score: 87, accuracy: 85, timeSpent: 39, subject: 'Chemistry' }
      ])

      setStudyStreak({
        currentStreak: 12,
        longestStreak: 18,
        lastStudyDate: '2024-03-17',
        totalStudyDays: 45
      })
    } catch (error) {
      toast.error('Failed to load progress data')
    } finally {
      setLoading(false)
    }
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-600'
    if (accuracy >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00']

  const radarData = subjectProgress.map(subject => ({
    subject: subject.subjectName.substring(0, 8),
    accuracy: subject.accuracy,
    fullMark: 100
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Progress Dashboard</h1>
          <p className="text-muted-foreground">
            Track your learning journey and performance improvements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={selectedTimeRange === '7d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTimeRange('7d')}
          >
            7 Days
          </Button>
          <Button
            variant={selectedTimeRange === '30d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTimeRange('30d')}
          >
            30 Days
          </Button>
          <Button
            variant={selectedTimeRange === '90d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTimeRange('90d')}
          >
            90 Days
          </Button>
        </div>
      </div>

      {/* Progress Summary Cards */}
      {progressSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Overall Accuracy</p>
                  <p className={`text-2xl font-bold ${getAccuracyColor(progressSummary.overallAccuracy)}`}>
                    {progressSummary.overallAccuracy}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    +{progressSummary.improvementRate}% this month
                  </p>
                </div>
                <Target className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Questions Answered</p>
                  <p className="text-2xl font-bold">{progressSummary.totalQuestionsAnswered.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">
                    Across {progressSummary.totalExamsTaken} exams
                  </p>
                </div>
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Study Time</p>
                  <p className="text-2xl font-bold">{formatTime(progressSummary.totalTimeSpent)}</p>
                  <p className="text-xs text-muted-foreground">
                    Average: {Math.round(progressSummary.totalTimeSpent / progressSummary.totalExamsTaken)}m per exam
                  </p>
                </div>
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current Level</p>
                  <p className="text-2xl font-bold">{progressSummary.currentLevel}</p>
                  <div className="mt-2">
                    <Progress value={progressSummary.nextLevelProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {progressSummary.nextLevelProgress}% to Advanced
                    </p>
                  </div>
                </div>
                <Trophy className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Study Streak */}
      {studyStreak && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-full">
                  <Zap className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Study Streak</h3>
                  <p className="text-sm text-muted-foreground">Keep up the momentum!</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-2xl font-bold text-orange-600">{studyStreak.currentStreak}</p>
                    <p className="text-sm text-muted-foreground">Current Streak</p>
                  </div>
                  <div>
                    <p className="text-xl font-semibold">{studyStreak.longestStreak}</p>
                    <p className="text-sm text-muted-foreground">Best Streak</p>
                  </div>
                  <div>
                    <p className="text-xl font-semibold">{studyStreak.totalStudyDays}</p>
                    <p className="text-sm text-muted-foreground">Total Days</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subjects">Subject Analysis</TabsTrigger>
          <TabsTrigger value="trends">Performance Trends</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Radar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Subject Performance Radar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="Accuracy"
                      dataKey="accuracy"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Subject Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Questions by Subject
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={subjectProgress}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ subjectName, totalQuestions }) => `${subjectName}: ${totalQuestions}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="totalQuestions"
                    >
                      {subjectProgress.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Subject Analysis Tab */}
        <TabsContent value="subjects" className="space-y-6">
          <div className="grid gap-6">
            {subjectProgress.map((subject) => (
              <Card key={subject.subjectId}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      {subject.subjectName}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(subject.trend)}
                      <Badge variant={subject.improvement > 0 ? 'default' : 'destructive'}>
                        {subject.improvement > 0 ? '+' : ''}{subject.improvement.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{subject.totalQuestions}</p>
                      <p className="text-sm text-muted-foreground">Total Questions</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-2xl font-bold ${getAccuracyColor(subject.accuracy)}`}>
                        {subject.accuracy.toFixed(1)}%
                      </p>
                      <p className="text-sm text-muted-foreground">Accuracy</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{subject.correctAnswers}</p>
                      <p className="text-sm text-muted-foreground">Correct</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">{subject.wrongAnswers}</p>
                      <p className="text-sm text-muted-foreground">Wrong</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{subject.accuracy.toFixed(1)}%</span>
                    </div>
                    <Progress value={subject.accuracy} className="h-2" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-green-600 mb-2 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        Strong Topics
                      </h4>
                      <div className="space-y-1">
                        {subject.strongTopics.map((topic, index) => (
                          <Badge key={index} variant="outline" className="mr-2 mb-1 bg-green-50 text-green-700">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-red-600 mb-2 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        Areas for Improvement
                      </h4>
                      <div className="space-y-1">
                        {subject.weakTopics.map((topic, index) => (
                          <Badge key={index} variant="outline" className="mr-2 mb-1 bg-red-50 text-red-700">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                    <span>Time spent: {formatTime(subject.timeSpent)}</span>
                    <span>Last practice: {new Date(subject.lastPracticeDate).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Performance Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid gap-6">
            {/* Score Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Score Trends Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="accuracy" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Time Efficiency Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Time Efficiency by Subject
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={subjectProgress}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subjectName" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="timeSpent" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Performance Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">🎉 Strengths</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Chemistry shows excellent performance with 84% accuracy</li>
                    <li>• English Language has improved by 15.2% this month</li>
                    <li>• Consistent study streak of 12 days</li>
                  </ul>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">⚠️ Areas for Focus</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Physics performance has declined by 2.1% - review Electricity and Waves</li>
                    <li>• Mathematics Calculus and Statistics need more practice</li>
                    <li>• Consider spending more time on weaker subjects</li>
                  </ul>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">📈 Recommendations</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Maintain current study schedule to keep your streak</li>
                    <li>• Focus 30% more time on Physics to improve declining performance</li>
                    <li>• Practice more Mathematics problems in weak areas</li>
                    <li>• You're 35% away from Advanced level - keep pushing!</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ProgressDashboard