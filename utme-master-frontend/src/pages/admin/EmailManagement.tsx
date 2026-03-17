// ==========================================
// EMAIL MANAGEMENT PAGE
// ==========================================
// Admin interface for managing email notifications and templates

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Mail, 
  Send, 
  Settings, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'
import * as emailAPI from '@/api/email'

interface EmailTemplate {
  id: string
  name: string
  subject: string
  description: string
  lastUsed?: string
}

interface BulkEmailResult {
  successful: number
  failed: number
  results: Array<{
    email: string
    success: boolean
    error?: string
  }>
}

const EmailManagement: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  
  // Custom email form
  const [customEmail, setCustomEmail] = useState({
    to: '',
    subject: '',
    html: '',
    text: ''
  })
  
  // Bulk email
  const [bulkEmails, setBulkEmails] = useState('')
  const [bulkSubject, setBulkSubject] = useState('')
  const [bulkContent, setBulkContent] = useState('')
  const [bulkResult, setBulkResult] = useState<BulkEmailResult | null>(null)

  // Email templates (mock data - in real app, fetch from API)
  const templates: EmailTemplate[] = [
    {
      id: 'welcome',
      name: 'Welcome Email',
      subject: 'Welcome to UTME Master!',
      description: 'Sent to new users after registration',
      lastUsed: '2024-03-15'
    },
    {
      id: 'password-reset',
      name: 'Password Reset',
      subject: 'Reset Your Password',
      description: 'Sent when user requests password reset',
      lastUsed: '2024-03-14'
    },
    {
      id: 'exam-completion',
      name: 'Exam Completion',
      subject: 'Exam Results Available',
      description: 'Sent after student completes an exam',
      lastUsed: '2024-03-16'
    },
    {
      id: 'exam-reminder',
      name: 'Exam Reminder',
      subject: 'Upcoming Exam Reminder',
      description: 'Sent to remind students of scheduled exams',
      lastUsed: '2024-03-13'
    }
  ]

  // Test email configuration
  const handleTestEmail = async () => {
    if (!testEmail.trim()) {
      toast.error('Please enter a test email address')
      return
    }

    setLoading(true)
    setTestResult(null)

    try {
      const response = await emailAPI.testEmailConfiguration(testEmail)
      setTestResult({ success: true, message: response.message })
      toast.success('Test email sent successfully!')
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Failed to send test email'
      setTestResult({ success: false, message })
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  // Send custom email
  const handleSendCustomEmail = async () => {
    if (!customEmail.to || !customEmail.subject || (!customEmail.html && !customEmail.text)) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      await emailAPI.sendCustomEmail(customEmail)
      toast.success('Email sent successfully!')
      setCustomEmail({ to: '', subject: '', html: '', text: '' })
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Failed to send email'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  // Send bulk emails
  const handleSendBulkEmails = async () => {
    if (!bulkEmails.trim() || !bulkSubject.trim() || !bulkContent.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    const emailList = bulkEmails
      .split('\n')
      .map(email => email.trim())
      .filter(email => email && email.includes('@'))

    if (emailList.length === 0) {
      toast.error('Please enter valid email addresses')
      return
    }

    if (emailList.length > 100) {
      toast.error('Cannot send more than 100 emails at once')
      return
    }

    setLoading(true)
    setBulkResult(null)

    try {
      const emails = emailList.map(email => ({
        to: email,
        subject: bulkSubject,
        html: bulkContent.replace(/\n/g, '<br>'),
        text: bulkContent
      }))

      const response = await emailAPI.sendBulkEmails(emails)
      setBulkResult(response.data)
      toast.success(`Bulk email completed: ${response.data.successful} successful, ${response.data.failed} failed`)
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Failed to send bulk emails'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Email Management</h1>
          <p className="text-muted-foreground">
            Manage email notifications, templates, and send custom emails
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Mail className="h-8 w-8 text-primary" />
        </div>
      </div>

      <Tabs defaultValue="test" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="test">Test Configuration</TabsTrigger>
          <TabsTrigger value="templates">Email Templates</TabsTrigger>
          <TabsTrigger value="custom">Send Custom Email</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Email</TabsTrigger>
        </TabsList>

        {/* Test Email Configuration */}
        <TabsContent value="test">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Test Email Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="testEmail">Test Email Address</Label>
                <Input
                  id="testEmail"
                  type="email"
                  placeholder="admin@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
              </div>

              <Button 
                onClick={handleTestEmail} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Sending Test Email...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Test Email
                  </>
                )}
              </Button>

              {testResult && (
                <Alert className={testResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                  <div className="flex items-center gap-2">
                    {testResult.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription className={testResult.success ? 'text-green-800' : 'text-red-800'}>
                      {testResult.message}
                    </AlertDescription>
                  </div>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Templates */}
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {templates.map((template) => (
                  <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{template.name}</h3>
                        <Badge variant="secondary">{template.id}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                      <p className="text-xs text-muted-foreground">
                        Subject: {template.subject}
                      </p>
                      {template.lastUsed && (
                        <p className="text-xs text-muted-foreground">
                          Last used: {template.lastUsed}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        Preview
                      </Button>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Send Custom Email */}
        <TabsContent value="custom">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Send Custom Email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customTo">To (Email Address)</Label>
                <Input
                  id="customTo"
                  type="email"
                  placeholder="recipient@example.com"
                  value={customEmail.to}
                  onChange={(e) => setCustomEmail(prev => ({ ...prev, to: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customSubject">Subject</Label>
                <Input
                  id="customSubject"
                  placeholder="Email subject"
                  value={customEmail.subject}
                  onChange={(e) => setCustomEmail(prev => ({ ...prev, subject: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customContent">Message Content</Label>
                <Textarea
                  id="customContent"
                  placeholder="Enter your email message here..."
                  rows={8}
                  value={customEmail.text}
                  onChange={(e) => setCustomEmail(prev => ({ 
                    ...prev, 
                    text: e.target.value,
                    html: e.target.value.replace(/\n/g, '<br>')
                  }))}
                />
              </div>

              <Button 
                onClick={handleSendCustomEmail} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Sending Email...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Email
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bulk Email */}
        <TabsContent value="bulk">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Bulk Email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Maximum 100 emails per batch. Enter one email address per line.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="bulkEmails">Email Addresses (one per line)</Label>
                <Textarea
                  id="bulkEmails"
                  placeholder="user1@example.com&#10;user2@example.com&#10;user3@example.com"
                  rows={6}
                  value={bulkEmails}
                  onChange={(e) => setBulkEmails(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bulkSubject">Subject</Label>
                <Input
                  id="bulkSubject"
                  placeholder="Bulk email subject"
                  value={bulkSubject}
                  onChange={(e) => setBulkSubject(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bulkContent">Message Content</Label>
                <Textarea
                  id="bulkContent"
                  placeholder="Enter your bulk email message here..."
                  rows={8}
                  value={bulkContent}
                  onChange={(e) => setBulkContent(e.target.value)}
                />
              </div>

              <Button 
                onClick={handleSendBulkEmails} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Sending Bulk Emails...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Bulk Emails
                  </>
                )}
              </Button>

              {bulkResult && (
                <div className="space-y-4">
                  <Alert className="border-blue-200 bg-blue-50">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      Bulk email completed: {bulkResult.successful} successful, {bulkResult.failed} failed
                    </AlertDescription>
                  </Alert>

                  {bulkResult.results.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Detailed Results:</h4>
                      <div className="max-h-60 overflow-y-auto space-y-1">
                        {bulkResult.results.map((result, index) => (
                          <div key={index} className="flex items-center justify-between text-sm p-2 border rounded">
                            <span>{result.email}</span>
                            <div className="flex items-center gap-2">
                              {result.success ? (
                                <Badge variant="default" className="bg-green-100 text-green-800">
                                  Success
                                </Badge>
                              ) : (
                                <Badge variant="destructive">
                                  Failed
                                </Badge>
                              )}
                              {result.error && (
                                <span className="text-xs text-red-600">{result.error}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default EmailManagement