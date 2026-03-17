// ==========================================
// EXAM SCHEDULING PAGE
// ==========================================
// Admin interface for managing exam schedules and availability windows

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Calendar, 
  Clock, 
  Users, 
  Settings, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Play,
  Pause,
  Edit,
  Eye
} from 'lucide-react'
import { toast } from 'sonner'
import * as examAPI from '@/api/exam'

interface ScheduledExam {
  id: string
  title: string
  description: string
  startsAt: string | null
  endsAt: string | null
  isPublished: boolean
  isActive: boolean
  status: 'scheduled' | 'active' | 'expired'
  statusMessage: string
  creator: {
    firstName: string
    lastName: string
    email: string
  }
  totalAttempts: number
  activeAttempts: number
  createdAt: string
}

interface ExamScheduleForm {
  examId: string
  startsAt: string
  endsAt: string
  autoActivate: boolean
  autoDeactivate: boolean
}

const ExamScheduling: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [scheduledExams, setScheduledExams] = useState<ScheduledExam[]>([])
  const [selectedExam, setSelectedExam] = useState<ScheduledExam | null>(null)
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  
  const [scheduleForm, setScheduleForm] = useState<ExamScheduleForm>({
    examId: '',
    startsAt: '',
    endsAt: '',
    autoActivate: true,
    autoDeactivate: true
  })

  // Load scheduled exams
  useEffect(() => {
    loadScheduledExams()
  }, [])

  const loadScheduledExams = async () => {
    setLoading(true)
    try {
      const response = await examAPI.getScheduledExams()
      setScheduledExams(response.data.exams)
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Failed to load scheduled exams'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleScheduleExam = async () => {
    if (!scheduleForm.examId) {
      toast.error('Please select an exam')
      return
    }

    if (!scheduleForm.startsAt && !scheduleForm.endsAt) {
      toast.error('Please set at least a start time or end time')
      return
    }

    if (scheduleForm.startsAt && scheduleForm.endsAt) {
      const startDate = new Date(scheduleForm.startsAt)
      const endDate = new Date(scheduleForm.endsAt)
      
      if (startDate >= endDate) {
        toast.error('Start time must be before end time')
        return
      }
    }

    setLoading(true)
    try {
      await examAPI.scheduleExam(scheduleForm.examId, {
        startsAt: scheduleForm.startsAt || undefined,
        endsAt: scheduleForm.endsAt || undefined,
        autoActivate: scheduleForm.autoActivate,
        autoDeactivate: scheduleForm.autoDeactivate
      })
      
      toast.success('Exam scheduled successfully!')
      setShowScheduleForm(false)
      setScheduleForm({
        examId: '',
        startsAt: '',
        endsAt: '',
        autoActivate: true,
        autoDeactivate: true
      })
      loadScheduledExams()
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Failed to schedule exam'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleEditSchedule = (exam: ScheduledExam) => {
    setSelectedExam(exam)
    setScheduleForm({
      examId: exam.id,
      startsAt: exam.startsAt ? new Date(exam.startsAt).toISOString().slice(0, 16) : '',
      endsAt: exam.endsAt ? new Date(exam.endsAt).toISOString().slice(0, 16) : '',
      autoActivate: true,
      autoDeactivate: true
    })
    setShowScheduleForm(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Scheduled</Badge>
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Exam Scheduling</h1>
          <p className="text-muted-foreground">
            Manage exam availability windows and automatic activation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowScheduleForm(true)}>
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Exam
          </Button>
          <Button variant="outline" onClick={loadScheduledExams}>
            <Settings className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Schedule Form */}
      {showScheduleForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {selectedExam ? 'Edit Schedule' : 'Schedule Exam'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedExam && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Editing schedule for: <strong>{selectedExam.title}</strong>
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startsAt">Start Date & Time</Label>
                <Input
                  id="startsAt"
                  type="datetime-local"
                  value={scheduleForm.startsAt}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, startsAt: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  When the exam becomes available to students
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endsAt">End Date & Time</Label>
                <Input
                  id="endsAt"
                  type="datetime-local"
                  value={scheduleForm.endsAt}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, endsAt: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  When the exam becomes unavailable
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Auto-activate exam</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically activate exam at start time
                  </p>
                </div>
                <Switch
                  checked={scheduleForm.autoActivate}
                  onCheckedChange={(checked) => setScheduleForm(prev => ({ ...prev, autoActivate: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Auto-deactivate exam</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically deactivate exam at end time
                  </p>
                </div>
                <Switch
                  checked={scheduleForm.autoDeactivate}
                  onCheckedChange={(checked) => setScheduleForm(prev => ({ ...prev, autoDeactivate: checked }))}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleScheduleExam} disabled={loading}>
                {loading ? 'Scheduling...' : selectedExam ? 'Update Schedule' : 'Schedule Exam'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowScheduleForm(false)
                  setSelectedExam(null)
                  setScheduleForm({
                    examId: '',
                    startsAt: '',
                    endsAt: '',
                    autoActivate: true,
                    autoDeactivate: true
                  })
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scheduled Exams List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Scheduled Exams
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading scheduled exams...</p>
            </div>
          ) : scheduledExams.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No scheduled exams found</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setShowScheduleForm(true)}
              >
                Schedule Your First Exam
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {scheduledExams.map((exam) => (
                <div key={exam.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{exam.title}</h3>
                        {getStatusBadge(exam.status)}
                        {exam.isPublished ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            Published
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                            Draft
                          </Badge>
                        )}
                      </div>
                      
                      {exam.description && (
                        <p className="text-sm text-muted-foreground">{exam.description}</p>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Start Time:</span>
                          <br />
                          <span className="text-muted-foreground">
                            {formatDateTime(exam.startsAt)}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">End Time:</span>
                          <br />
                          <span className="text-muted-foreground">
                            {formatDateTime(exam.endsAt)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {exam.totalAttempts} attempts
                        </span>
                        <span className="flex items-center gap-1">
                          <Play className="h-4 w-4" />
                          {exam.activeAttempts} active
                        </span>
                        <span>
                          Created by {exam.creator.firstName} {exam.creator.lastName}
                        </span>
                      </div>
                      
                      <p className="text-sm font-medium text-blue-600">
                        {exam.statusMessage}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditSchedule(exam)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // TODO: View exam details
                          toast.info('View exam details - Coming soon')
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scheduling Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Scheduling Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Automatic Processing:</strong> The system automatically activates and deactivates exams based on their scheduled times. This process runs every minute.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium">Exam States:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <strong>Scheduled:</strong> Exam will start at the specified time</li>
                <li>• <strong>Active:</strong> Exam is currently available to students</li>
                <li>• <strong>Expired:</strong> Exam has ended and is no longer available</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Automatic Actions:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Auto-activation at start time (if enabled)</li>
                <li>• Auto-deactivation at end time (if enabled)</li>
                <li>• Auto-submission of active student exams when exam ends</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ExamScheduling