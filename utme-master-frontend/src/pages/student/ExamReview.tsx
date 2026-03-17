// ==========================================
// EXAM REVIEW PAGE
// ==========================================
// Comprehensive exam review with detailed explanations and performance analysis

import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import PrintableContainer from '@/components/ui/PrintableContainer'
import PDFProgressModal from '@/components/ui/PDFProgressModal'
import usePDFDownload from '@/hooks/usePDFDownload'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Target,
  BookOpen,
  TrendingUp,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Eye,
  AlertCircle,
  Lightbulb,
  BarChart3,
  Download,
  Printer,
  Share2
} from 'lucide-react'
import { showToast } from '@/components/ui/Toast'
import * as examAPI from '@/api/exam'

interface ReviewQuestion {
  id: string
  questionText: string
  questionType: string
  options: Array<{ label: string; text: string }>
  selectedAnswer: string | null
  correctAnswer: string
  isCorrect: boolean
  explanation: string
  subject: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  timeSpent: number
  topic: string
}
interface ExamResults {
  studentExamId: string
  examTitle: string
  totalQuestions: number
  answeredQuestions: number
  correctAnswers: number
  wrongAnswers: number
  score: number
  totalMarks: number
  scorePercentage: string
  passed: boolean
  grade: string
  submittedAt: string
  timeSpent: number
}

interface PerformanceAnalysis {
  subjectBreakdown: Array<{
    subject: string
    total: number
    correct: number
    accuracy: number
    averageTime: number
  }>
  difficultyBreakdown: Array<{
    difficulty: string
    total: number
    correct: number
    accuracy: number
  }>
  topicBreakdown: Array<{
    topic: string
    total: number
    correct: number
    accuracy: number
  }>
  timeAnalysis: {
    totalTime: number
    averagePerQuestion: number
    fastestQuestion: number
    slowestQuestion: number
  }
}

const ExamReview: React.FC = () => {
  const { studentExamId } = useParams<{ studentExamId: string }>()
  const navigate = useNavigate()
  const printableRef = useRef<HTMLDivElement>(null)
  
  const [loading, setLoading] = useState(false)
  const [examResults, setExamResults] = useState<ExamResults | null>(null)
  const [reviewQuestions, setReviewQuestions] = useState<ReviewQuestion[]>([])
  const [performanceAnalysis, setPerformanceAnalysis] = useState<PerformanceAnalysis | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [filterType, setFilterType] = useState<'all' | 'correct' | 'incorrect' | 'unanswered'>('all')
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

  useEffect(() => {
    if (studentExamId) {
      loadExamReview()
    }
  }, [studentExamId])

  const loadExamReview = async () => {
    if (!studentExamId) return
    
    setLoading(true)
    try {
      // Load exam results
      const resultsResponse = await examAPI.getExamResults(studentExamId)
      setExamResults(resultsResponse.data)

      // Load review questions
      const reviewResponse = await examAPI.getReviewQuestions(studentExamId)
      setReviewQuestions(reviewResponse.data.questions)

      // Load performance analysis
      const analysisResponse = await examAPI.getQuestionPerformanceAnalysis(studentExamId)
      setPerformanceAnalysis(analysisResponse.data.analysis)
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Failed to load exam review'
      showToast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const generatePerformanceAnalysis = (questions: ReviewQuestion[]): PerformanceAnalysis => {
    // Subject breakdown
    const subjectMap = new Map<string, { total: number; correct: number; timeSpent: number }>()
    questions.forEach(q => {
      const current = subjectMap.get(q.subject) || { total: 0, correct: 0, timeSpent: 0 }
      current.total++
      if (q.isCorrect) current.correct++
      current.timeSpent += q.timeSpent || 0
      subjectMap.set(q.subject, current)
    })

    const subjectBreakdown = Array.from(subjectMap.entries()).map(([subject, data]) => ({
      subject,
      total: data.total,
      correct: data.correct,
      accuracy: data.total > 0 ? (data.correct / data.total) * 100 : 0,
      averageTime: data.total > 0 ? data.timeSpent / data.total : 0
    }))

    // Difficulty breakdown
    const difficultyMap = new Map<string, { total: number; correct: number }>()
    questions.forEach(q => {
      const current = difficultyMap.get(q.difficulty) || { total: 0, correct: 0 }
      current.total++
      if (q.isCorrect) current.correct++
      difficultyMap.set(q.difficulty, current)
    })

    const difficultyBreakdown = Array.from(difficultyMap.entries()).map(([difficulty, data]) => ({
      difficulty,
      total: data.total,
      correct: data.correct,
      accuracy: data.total > 0 ? (data.correct / data.total) * 100 : 0
    }))

    // Topic breakdown
    const topicMap = new Map<string, { total: number; correct: number }>()
    questions.forEach(q => {
      const topic = q.topic || 'General'
      const current = topicMap.get(topic) || { total: 0, correct: 0 }
      current.total++
      if (q.isCorrect) current.correct++
      topicMap.set(topic, current)
    })

    const topicBreakdown = Array.from(topicMap.entries()).map(([topic, data]) => ({
      topic,
      total: data.total,
      correct: data.correct,
      accuracy: data.total > 0 ? (data.correct / data.total) * 100 : 0
    }))

    // Time analysis
    const times = questions.map(q => q.timeSpent || 0).filter(t => t > 0)
    const totalTime = times.reduce((sum, time) => sum + time, 0)
    const averagePerQuestion = times.length > 0 ? totalTime / times.length : 0
    const fastestQuestion = times.length > 0 ? Math.min(...times) : 0
    const slowestQuestion = times.length > 0 ? Math.max(...times) : 0

    return {
      subjectBreakdown,
      difficultyBreakdown,
      topicBreakdown,
      timeAnalysis: {
        totalTime,
        averagePerQuestion,
        fastestQuestion,
        slowestQuestion
      }
    }
  }

  const getFilteredQuestions = () => {
    switch (filterType) {
      case 'correct':
        return reviewQuestions.filter(q => q.isCorrect)
      case 'incorrect':
        return reviewQuestions.filter(q => !q.isCorrect && q.selectedAnswer)
      case 'unanswered':
        return reviewQuestions.filter(q => !q.selectedAnswer)
      default:
        return reviewQuestions
    }
  }

  const filteredQuestions = getFilteredQuestions()
  const currentQuestion = filteredQuestions[currentQuestionIndex]

  const getOptionStyle = (option: { label: string; text: string }) => {
    if (!currentQuestion) return 'border-gray-200'
    
    const isSelected = currentQuestion.selectedAnswer === option.label
    const isCorrect = currentQuestion.correctAnswer === option.label
    
    if (isCorrect) {
      return 'border-green-500 bg-green-50 text-green-800'
    } else if (isSelected && !isCorrect) {
      return 'border-red-500 bg-red-50 text-red-800'
    }
    return 'border-gray-200'
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'bg-green-100 text-green-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'HARD': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // PDF Download Functions
  const handleDownloadPDF = async () => {
    if (!printableRef.current || !examResults) return
    
    try {
      await generateFromElement(printableRef.current, {
        filename: `exam-review-${examResults.studentExamId}.pdf`,
        format: 'a4',
        orientation: 'portrait',
        includeHeader: true,
        includeFooter: true
      })
    } catch (error) {
      console.error('PDF generation failed:', error)
    }
  }

  const handlePrintPDF = async () => {
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

  const handleShareResults = () => {
    if (navigator.share && examResults) {
      navigator.share({
        title: `Exam Review - ${examResults.examTitle}`,
        text: `I scored ${examResults.scorePercentage}% on ${examResults.examTitle}`,
        url: window.location.href
      }).catch(console.error)
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      showToast.success('Link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading exam review...</p>
        </div>
      </div>
    )
  }

  if (!examResults || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No exam data found</p>
          <Button onClick={() => navigate('/student/dashboard')} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Exam Review</h1>
            <p className="text-muted-foreground">{examResults.examTitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={examResults.passed ? 'default' : 'destructive'}>
            {examResults.grade}
          </Badge>
          <Badge variant="outline">
            {examResults.scorePercentage}%
          </Badge>
          
          {/* Download Actions */}
          <div className="flex items-center gap-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="no-print"
            >
              <Download className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Download PDF'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrintPDF}
              disabled={isGenerating}
              className="no-print"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleShareResults}
              className="no-print"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Printable Content */}
      <PrintableContainer
        ref={printableRef}
        title={`Exam Review - ${examResults.examTitle}`}
        subtitle={`Score: ${examResults.scorePercentage}% | Grade: ${examResults.grade}`}
        showHeader={true}
        showFooter={true}
      >
      <Tabs defaultValue="review" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="review">Question Review</TabsTrigger>
          <TabsTrigger value="analysis">Performance Analysis</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        {/* Question Review Tab */}
        <TabsContent value="review" className="space-y-6">
          {/* Question Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant={filterType === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('all')}
                  >
                    All ({reviewQuestions.length})
                  </Button>
                  <Button
                    variant={filterType === 'correct' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('correct')}
                  >
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Correct ({reviewQuestions.filter(q => q.isCorrect).length})
                  </Button>
                  <Button
                    variant={filterType === 'incorrect' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('incorrect')}
                  >
                    <XCircle className="mr-1 h-3 w-3" />
                    Incorrect ({reviewQuestions.filter(q => !q.isCorrect && q.selectedAnswer).length})
                  </Button>
                  <Button
                    variant={filterType === 'unanswered' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('unanswered')}
                  >
                    <AlertCircle className="mr-1 h-3 w-3" />
                    Unanswered ({reviewQuestions.filter(q => !q.selectedAnswer).length})
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {filteredQuestions.length}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question Display */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Question Content */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Question {currentQuestionIndex + 1}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getDifficultyColor(currentQuestion.difficulty)}>
                        {currentQuestion.difficulty}
                      </Badge>
                      <Badge variant="outline">
                        {currentQuestion.subject}
                      </Badge>
                      {currentQuestion.timeSpent > 0 && (
                        <Badge variant="outline">
                          <Clock className="mr-1 h-3 w-3" />
                          {formatTime(currentQuestion.timeSpent)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-lg">{currentQuestion.questionText}</div>
                  
                  <div className="space-y-2">
                    {currentQuestion.options.map((option) => (
                      <div
                        key={option.label}
                        className={`p-3 border rounded-lg ${getOptionStyle(option)}`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="font-medium">{option.label}.</span>
                          <span className="flex-1">{option.text}</span>
                          {currentQuestion.selectedAnswer === option.label && (
                            <Eye className="h-4 w-4 text-blue-500" />
                          )}
                          {currentQuestion.correctAnswer === option.label && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Answer Status */}
                  <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Your Answer:</span>
                      {currentQuestion.selectedAnswer ? (
                        <Badge variant={currentQuestion.isCorrect ? 'default' : 'destructive'}>
                          {currentQuestion.selectedAnswer}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Not Answered</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Correct Answer:</span>
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        {currentQuestion.correctAnswer}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {currentQuestion.isCorrect ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm font-medium">
                        {currentQuestion.isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Explanation */}
              {currentQuestion.explanation && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5" />
                      Explanation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {currentQuestion.explanation}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Navigation & Stats */}
            <div className="space-y-4">
              {/* Navigation */}
              <Card>
                <CardHeader>
                  <CardTitle>Navigation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                      disabled={currentQuestionIndex === 0}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentQuestionIndex(Math.min(filteredQuestions.length - 1, currentQuestionIndex + 1))}
                      disabled={currentQuestionIndex === filteredQuestions.length - 1}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-5 gap-1">
                    {filteredQuestions.map((question, index) => (
                      <Button
                        key={question.id}
                        variant={index === currentQuestionIndex ? 'default' : 'outline'}
                        size="sm"
                        className={`h-8 w-8 p-0 ${
                          question.isCorrect ? 'border-green-500' : 
                          question.selectedAnswer ? 'border-red-500' : 'border-gray-300'
                        }`}
                        onClick={() => setCurrentQuestionIndex(index)}
                      >
                        {index + 1}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Score:</span>
                    <span className="font-medium">{examResults.score}/{examResults.totalMarks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Accuracy:</span>
                    <span className="font-medium">{examResults.scorePercentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Correct:</span>
                    <span className="font-medium text-green-600">{examResults.correctAnswers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Wrong:</span>
                    <span className="font-medium text-red-600">{examResults.wrongAnswers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Time:</span>
                    <span className="font-medium">{formatTime(examResults.timeSpent)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        {/* Performance Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          {performanceAnalysis && (
            <div className="grid gap-6">
              {/* Subject Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Subject Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {performanceAnalysis.subjectBreakdown.map((subject) => (
                      <div key={subject.subject} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{subject.subject}</span>
                          <div className="flex items-center gap-4 text-sm">
                            <span>{subject.correct}/{subject.total}</span>
                            <span className="font-medium">{subject.accuracy.toFixed(1)}%</span>
                            <span className="text-muted-foreground">
                              Avg: {formatTime(Math.round(subject.averageTime))}
                            </span>
                          </div>
                        </div>
                        <Progress value={subject.accuracy} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Difficulty Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Difficulty Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {performanceAnalysis.difficultyBreakdown.map((difficulty) => (
                      <div key={difficulty.difficulty} className="text-center p-4 border rounded-lg">
                        <div className={`inline-flex px-2 py-1 rounded text-sm font-medium mb-2 ${getDifficultyColor(difficulty.difficulty)}`}>
                          {difficulty.difficulty}
                        </div>
                        <div className="space-y-1">
                          <div className="text-2xl font-bold">{difficulty.accuracy.toFixed(1)}%</div>
                          <div className="text-sm text-muted-foreground">
                            {difficulty.correct}/{difficulty.total} correct
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Topic Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Topic Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {performanceAnalysis.topicBreakdown
                      .sort((a, b) => b.accuracy - a.accuracy)
                      .map((topic) => (
                        <div key={topic.topic} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{topic.topic}</div>
                            <div className="text-sm text-muted-foreground">
                              {topic.correct}/{topic.total} questions
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-medium ${topic.accuracy >= 70 ? 'text-green-600' : topic.accuracy >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {topic.accuracy.toFixed(1)}%
                            </div>
                            <Progress value={topic.accuracy} className="h-1 w-20" />
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Time Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Time Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-lg font-bold">{formatTime(performanceAnalysis.timeAnalysis.totalTime)}</div>
                      <div className="text-sm text-muted-foreground">Total Time</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-lg font-bold">{formatTime(Math.round(performanceAnalysis.timeAnalysis.averagePerQuestion))}</div>
                      <div className="text-sm text-muted-foreground">Average/Question</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-lg font-bold">{formatTime(performanceAnalysis.timeAnalysis.fastestQuestion)}</div>
                      <div className="text-sm text-muted-foreground">Fastest</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-lg font-bold">{formatTime(performanceAnalysis.timeAnalysis.slowestQuestion)}</div>
                      <div className="text-sm text-muted-foreground">Slowest</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-6">
          <div className="grid gap-6">
            {/* Overall Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Overall Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className={`text-4xl font-bold mb-2 ${examResults.passed ? 'text-green-600' : 'text-red-600'}`}>
                      {examResults.scorePercentage}%
                    </div>
                    <div className="text-muted-foreground">Final Score</div>
                    <Badge variant={examResults.passed ? 'default' : 'destructive'} className="mt-2">
                      {examResults.passed ? 'PASSED' : 'FAILED'}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">{examResults.grade}</div>
                    <div className="text-muted-foreground">Grade</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">{examResults.correctAnswers}</div>
                    <div className="text-muted-foreground">Correct Answers</div>
                    <div className="text-sm text-muted-foreground">
                      out of {examResults.totalQuestions}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceAnalysis && (
                    <>
                      {/* Weak Areas */}
                      {performanceAnalysis.subjectBreakdown
                        .filter(s => s.accuracy < 60)
                        .map(subject => (
                          <div key={subject.subject} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-start gap-3">
                              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                              <div>
                                <div className="font-medium text-red-800">
                                  Focus on {subject.subject}
                                </div>
                                <div className="text-sm text-red-600">
                                  Only {subject.accuracy.toFixed(1)}% accuracy. Practice more questions in this subject.
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                      {/* Strong Areas */}
                      {performanceAnalysis.subjectBreakdown
                        .filter(s => s.accuracy >= 80)
                        .map(subject => (
                          <div key={subject.subject} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-start gap-3">
                              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                              <div>
                                <div className="font-medium text-green-800">
                                  Excellent work in {subject.subject}
                                </div>
                                <div className="text-sm text-green-600">
                                  {subject.accuracy.toFixed(1)}% accuracy. Keep up the good work!
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                      {/* Time Management */}
                      {performanceAnalysis.timeAnalysis.averagePerQuestion > 120 && (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-start gap-3">
                            <Clock className="h-5 w-5 text-yellow-500 mt-0.5" />
                            <div>
                              <div className="font-medium text-yellow-800">
                                Work on Time Management
                              </div>
                              <div className="text-sm text-yellow-600">
                                Average {formatTime(Math.round(performanceAnalysis.timeAnalysis.averagePerQuestion))} per question. 
                                Try to answer faster while maintaining accuracy.
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => navigate('/student/exams')}>
                    <BookOpen className="mr-2 h-4 w-4" />
                    Take Another Exam
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/student/progress')}>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Progress
                  </Button>
                  {examResults.passed && (
                    <Button variant="outline" onClick={() => window.print()}>
                      <Target className="mr-2 h-4 w-4" />
                      Print Certificate
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => navigate(`/student/exams/${examResults.studentExamId}/retake`)}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Retake Exam
                  </Button>
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
        onRetry={handleDownloadPDF}
        onDownload={() => downloadPDF()}
      />
    </div>
  )
}

export default ExamReview