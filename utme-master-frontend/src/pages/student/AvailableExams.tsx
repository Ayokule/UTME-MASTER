// ==========================================
// AVAILABLE EXAMS PAGE (STUDENT)
// ==========================================
// Student interface to view and start available exams with scheduling

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  Trophy, 
  Play, 
  Pause, 
  CheckCircle, 
  AlertTriangle,
  Info,
  RotateCcw
} from 'lucide-react'
import { toast } from 'sonner'
import * as examAPI from '@/api/exam'

interface AvailableExam {
  id: string
  title: string
  description: string
  duration: number
  totalQuestions: number
  totalMarks: number
  passMarks: number
  startsAt: string | null
  endsAt: string | null
  allowRetake: boolean
  status: 'available' | 'scheduled' | 'expired' | 'in_progress' | 'completed'
  statusMessage: string
  canStart: boolean
  canResume: boolean
  attempts: number
  bestScore: number | null
}

const AvailableExams: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [exams, setExams] = useState<AvailableExam[]>([])
  const [startingExam, setStartingExam] = useState<string | null>(null)

  useEffect(() => {
    loadAvailableExams()
  }, [])

  const loadAvailableExams = async () => {
    setLoading(true)
    try {
      const response = await examAPI.getAvailableExams()
      setExams(response.data.exams)
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Failed to load available exams'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleStartExam = async (examId: string) => {
    setStartingExam(examId)
    try {
      const response = await examAPI.startExam(examId)
      toast.success('Exam started successfully!')
      navigate(`/student/exam/${response.data.studentExamId}`)
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Failed to start exam'
      toast.error(message)
    } finally {
      setStartingExam(null)
    }
  }

  const handleRetakeExam = async (examId: string) => {
    setStartingExam(examId)
    try {
      const response = await examAPI.retakeExam(examId)
      toast.success('Exam retake started!')
      navigate(`/student/exam/${response.data.studentExamId}`)
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Failed to start retake'
      toast.error(message)
    } finally {
      setStartingExam(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge variant="default" className="bg-green-100 text-green-800">Available</Badge>
      case 'scheduled':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Scheduled</Badge>
      case 'in_progress':
        return <Badge variant="default" className="bg-orange-100 text-orange-800">In Progress</Badge>
      case 'completed':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Completed</Badge>
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleString()
  }

  const getActionButton = (exam: AvailableExam) => {
    const isStarting = startingExam === exam.id

    if (exam.canResume) {
      return (
        <Button 
          onClick={() => handleStartExam(exam.id)}
          disabled={isStarting}
          className="w-full"
        >
          {isStarting ? (
            <>
              <Clock className="mr-2 h-4 w-4 animate-spin" />
              Resuming...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Resume Exam
            </>
          )}
        </Button>
      )
    }

    if (exam.canStart) {
      return (
        <Button 
          onClick={() => handleStartExam(exam.id)}
          disabled={isStarting}
          className="w-full"
        >
          {isStarting ? (
            <>
              <Clock className="mr-2 h-4 w-4 animate-spin" />
              Starting...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Start Exam
            </>
          )}
        </Button>
      )
    }

    if (exam.status === 'completed' && exam.allowRetake) {
      return (
        <Button 
          variant="outline"
          onClick={() => handleRetakeExam(exam.id)}
          disabled={isStarting}
          className="w-full"
        >
          {isStarting ? (
            <>
              <Clock className="mr-2 h-4 w-4 animate-spin" />
              Starting Retake...
            </>
          ) : (
            <>
              <RotateCcw className="mr-2 h-4 w-4" />
              Retake Exam
            </>
          )}
        </Button>
      )
    }

    return (
      <Button variant="outline" disabled className="w-full">
        <Pause className="mr-2 h-4 w-4" />
        Not Available
      </Button>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Available Exams</h1>
          <p className="text-muted-foreground">
            View and start your scheduled exams
          </p>
        </div>
        <Button variant="outline" onClick={loadAvailableExams} disabled={loading}>
          <Calendar className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Exams List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading available exams...</p>
        </div>
      ) : exams.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Exams Available</h3>
            <p className="text-muted-foreground mb-4">
              There are currently no exams scheduled or available for you to take.
            </p>
            <Button variant="outline" onClick={loadAvailableExams}>
              Check Again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {exams.map((exam) => (
            <Card key={exam.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">{exam.title}</CardTitle>
                      {getStatusBadge(exam.status)}
                    </div>
                    {exam.description && (
                      <p className="text-muted-foreground">{exam.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    {exam.bestScore !== null && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Trophy className="h-4 w-4" />
                        Best: {exam.bestScore}/{exam.totalMarks}
                      </div>
                    )}
                    {exam.attempts > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {exam.attempts} attempt{exam.attempts !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Exam Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{exam.duration} minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span>{exam.totalQuestions} questions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                    <span>{exam.totalMarks} marks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    <span>Pass: {exam.passMarks}</span>
                  </div>
                </div>

                {/* Scheduling Information */}
                {(exam.startsAt || exam.endsAt) && (
                  <Alert>
                    <Calendar className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        {exam.startsAt && (
                          <p><strong>Available from:</strong> {formatDateTime(exam.startsAt)}</p>
                        )}
                        {exam.endsAt && (
                          <p><strong>Available until:</strong> {formatDateTime(exam.endsAt)}</p>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Status Message */}
                <Alert className={
                  exam.status === 'available' ? 'border-green-200 bg-green-50' :
                  exam.status === 'scheduled' ? 'border-blue-200 bg-blue-50' :
                  exam.status === 'expired' ? 'border-red-200 bg-red-50' :
                  'border-gray-200 bg-gray-50'
                }>
                  <Info className="h-4 w-4" />
                  <AlertDescription className={
                    exam.status === 'available' ? 'text-green-800' :
                    exam.status === 'scheduled' ? 'text-blue-800' :
                    exam.status === 'expired' ? 'text-red-800' :
                    'text-gray-800'
                  }>
                    {exam.statusMessage}
                  </AlertDescription>
                </Alert>

                {/* Action Button */}
                <div className="pt-2">
                  {getActionButton(exam)}
                </div>

                {/* Additional Info */}
                {exam.status === 'completed' && !exam.allowRetake && (
                  <p className="text-sm text-muted-foreground text-center">
                    You have completed this exam. Retakes are not allowed.
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default AvailableExams