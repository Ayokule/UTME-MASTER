// ==========================================
// SECURITY DASHBOARD PAGE
// ==========================================
// Admin interface for monitoring security events and managing security settings

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  Ban, 
  Activity,
  Clock,
  Users,
  Lock,
  Zap,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface SecurityEvent {
  type: 'RATE_LIMIT' | 'BRUTE_FORCE' | 'XSS_ATTEMPT' | 'SQL_INJECTION' | 'CSRF_VIOLATION'
  ip: string
  userAgent?: string
  endpoint: string
  timestamp: string
  details?: any
}

interface SecuritySummary {
  totalEvents: number
  eventsByType: Record<string, number>
  topOffendingIPs: Array<{ ip: string; count: number }>
}

const SecurityDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [securitySummary, setSecuritySummary] = useState<SecuritySummary | null>(null)
  const [recentEvents, setRecentEvents] = useState<SecurityEvent[]>([])
  const [blockedIPs, setBlockedIPs] = useState<string[]>([])

  useEffect(() => {
    loadSecurityData()
  }, [])

  const loadSecurityData = async () => {
    setLoading(true)
    try {
      // Mock data - in real implementation, these would be API calls
      setSecuritySummary({
        totalEvents: 47,
        eventsByType: {
          'RATE_LIMIT': 23,
          'BRUTE_FORCE': 12,
          'XSS_ATTEMPT': 8,
          'SQL_INJECTION': 3,
          'CSRF_VIOLATION': 1
        },
        topOffendingIPs: [
          { ip: '192.168.1.100', count: 15 },
          { ip: '10.0.0.50', count: 12 },
          { ip: '172.16.0.25', count: 8 }
        ]
      })

      setRecentEvents([
        {
          type: 'RATE_LIMIT',
          ip: '192.168.1.100',
          endpoint: '/api/auth/login',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        {
          type: 'BRUTE_FORCE',
          ip: '10.0.0.50',
          endpoint: '/api/auth/login',
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          details: { attempts: 6, email: 'admin@test.com' }
        },
        {
          type: 'XSS_ATTEMPT',
          ip: '172.16.0.25',
          endpoint: '/api/questions',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          details: { payload: '<script>alert("xss")</script>' }
        }
      ])

      setBlockedIPs(['192.168.1.100', '203.0.113.45'])
    } catch (error) {
      toast.error('Failed to load security data')
    } finally {
      setLoading(false)
    }
  }

  const getEventTypeIcon = (type: SecurityEvent['type']) => {
    switch (type) {
      case 'RATE_LIMIT':
        return <Clock className="h-4 w-4" />
      case 'BRUTE_FORCE':
        return <Lock className="h-4 w-4" />
      case 'XSS_ATTEMPT':
        return <Zap className="h-4 w-4" />
      case 'SQL_INJECTION':
        return <AlertTriangle className="h-4 w-4" />
      case 'CSRF_VIOLATION':
        return <Shield className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getEventTypeBadge = (type: SecurityEvent['type']) => {
    const colors = {
      'RATE_LIMIT': 'bg-yellow-100 text-yellow-800',
      'BRUTE_FORCE': 'bg-red-100 text-red-800',
      'XSS_ATTEMPT': 'bg-orange-100 text-orange-800',
      'SQL_INJECTION': 'bg-red-100 text-red-800',
      'CSRF_VIOLATION': 'bg-purple-100 text-purple-800'
    }

    return (
      <Badge variant="outline" className={colors[type]}>
        {type.replace('_', ' ')}
      </Badge>
    )
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return date.toLocaleDateString()
  }

  const handleUnblockIP = async (ip: string) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setBlockedIPs(prev => prev.filter(blockedIP => blockedIP !== ip))
      toast.success(`IP ${ip} has been unblocked`)
    } catch (error) {
      toast.error('Failed to unblock IP')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor security events and manage system protection
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadSecurityData} disabled={loading}>
            <Activity className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Security Overview */}
      {securitySummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Events (24h)</p>
                  <p className="text-2xl font-bold">{securitySummary.totalEvents}</p>
                </div>
                <Activity className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Rate Limits</p>
                  <p className="text-2xl font-bold">{securitySummary.eventsByType['RATE_LIMIT'] || 0}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Brute Force</p>
                  <p className="text-2xl font-bold">{securitySummary.eventsByType['BRUTE_FORCE'] || 0}</p>
                </div>
                <Lock className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Blocked IPs</p>
                  <p className="text-2xl font-bold">{blockedIPs.length}</p>
                </div>
                <Ban className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="events" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="events">Recent Events</TabsTrigger>
          <TabsTrigger value="blocked">Blocked IPs</TabsTrigger>
          <TabsTrigger value="settings">Security Settings</TabsTrigger>
        </TabsList>

        {/* Recent Security Events */}
        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Recent Security Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Loading security events...</p>
                </div>
              ) : recentEvents.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-muted-foreground">No recent security events</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentEvents.map((event, index) => (
                    <div key={index} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {getEventTypeIcon(event.type)}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {getEventTypeBadge(event.type)}
                            <span className="text-sm text-muted-foreground">
                              from {event.ip}
                            </span>
                          </div>
                          <p className="text-sm">
                            <span className="font-medium">Endpoint:</span> {event.endpoint}
                          </p>
                          {event.details && (
                            <p className="text-sm text-muted-foreground">
                              {JSON.stringify(event.details)}
                            </p>
                          )}
                          {event.userAgent && (
                            <p className="text-xs text-muted-foreground truncate max-w-md">
                              {event.userAgent}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {formatTimestamp(event.timestamp)}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => toast.info('Block IP feature - Coming soon')}
                        >
                          <Ban className="h-3 w-3 mr-1" />
                          Block IP
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Blocked IPs */}
        <TabsContent value="blocked">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ban className="h-5 w-5" />
                Blocked IP Addresses
              </CardTitle>
            </CardHeader>
            <CardContent>
              {blockedIPs.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-muted-foreground">No blocked IP addresses</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {blockedIPs.map((ip) => (
                    <div key={ip} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <XCircle className="h-5 w-5 text-red-500" />
                        <div>
                          <p className="font-medium">{ip}</p>
                          <p className="text-sm text-muted-foreground">
                            Blocked due to suspicious activity
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnblockIP(ip)}
                      >
                        Unblock
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="settings">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Rate Limiting Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Rate limiting settings are currently configured in the server code. 
                    A future update will allow dynamic configuration through this interface.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="p-3 border rounded">
                    <h4 className="font-medium">General API</h4>
                    <p className="text-muted-foreground">100 requests / 15 minutes</p>
                  </div>
                  <div className="p-3 border rounded">
                    <h4 className="font-medium">Authentication</h4>
                    <p className="text-muted-foreground">5 requests / 15 minutes</p>
                  </div>
                  <div className="p-3 border rounded">
                    <h4 className="font-medium">Password Reset</h4>
                    <p className="text-muted-foreground">3 requests / 1 hour</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Security Features Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span>Rate Limiting</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span>Brute Force Protection</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span>Input Sanitization</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span>SQL Injection Protection</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span>CSRF Protection</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span>Security Headers</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SecurityDashboard