import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings, 
  Save, 
  AlertCircle, 
  Database, 
  Zap, 
  Shield, 
  Mail, 
  Bell, 
  Server, 
  Key, 
  BarChart3, 
  Monitor,
  HardDrive,
  Clock,
  UserCheck,
  Eye,
  Download
} from 'lucide-react'
import Layout from '../../components/Layout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { showToast } from '../../components/ui/Toast'

export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState({
    // General Settings
    siteName: 'UTME Master',
    siteDescription: 'Professional UTME Examination System',
    maintenanceMode: false,
    maxUploadSize: 5,
    sessionTimeout: 30,
    timezone: 'Africa/Lagos',
    
    // Security Settings
    enableTwoFactor: true,
    passwordMinLength: 8,
    passwordExpiry: 90,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    enableAuditLog: true,
    
    // Email Settings
    enableNotifications: true,
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: '',
    fromEmail: 'noreply@utmemaster.com'
  })

  const [saving, setSaving] = useState(false)
  const tabs = [
    { id: 'general', name: 'General', icon: Zap },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'system', name: 'System', icon: Server },
    { id: 'license', name: 'License', icon: Key },
    { id: 'backup', name: 'Backup', icon: Database },
    { id: 'monitoring', name: 'Monitoring', icon: Monitor }
  ]

  const handleSave = async () => {
    try {
      setSaving(true)
      await new Promise(resolve => setTimeout(resolve, 1500))
      showToast.success('Settings saved successfully')
    } catch (error) {
      showToast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setSettings({
      siteName: 'UTME Master',
      siteDescription: 'Professional UTME Examination System',
      maintenanceMode: false,
      maxUploadSize: 5,
      sessionTimeout: 30,
      timezone: 'Africa/Lagos',
      enableTwoFactor: true,
      passwordMinLength: 8,
      passwordExpiry: 90,
      maxLoginAttempts: 5,
      lockoutDuration: 15,
      enableAuditLog: true,
      enableNotifications: true,
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUsername: '',
      smtpPassword: '',
      fromEmail: 'noreply@utmemaster.com'
    })
    showToast.success('Settings reset to defaults')
  }

  const handleTestEmail = async () => {
    try {
      showToast.loading('Sending test email...')
      await new Promise(resolve => setTimeout(resolve, 2000))
      showToast.success('Test email sent successfully!')
    } catch (error) {
      showToast.error('Failed to send test email')
    }
  }

  const handleBackupNow = async () => {
    try {
      showToast.loading('Starting backup...')
      await new Promise(resolve => setTimeout(resolve, 3000))
      showToast.success('Backup completed successfully!')
    } catch (error) {
      showToast.error('Backup failed')
    }
  }
  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                <select
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-gray-900">Maintenance Mode</p>
                  <p className="text-sm text-gray-600">Disable access for all users except admins</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                className="w-5 h-5 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Upload Size (MB)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={settings.maxUploadSize}
                  onChange={(e) => setSettings({ ...settings, maxUploadSize: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                <input
                  type="number"
                  min="5"
                  max="480"
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )
      case 'security':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password Min Length</label>
                <input
                  type="number"
                  min="6"
                  max="20"
                  value={settings.passwordMinLength}
                  onChange={(e) => setSettings({ ...settings, passwordMinLength: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
                <input
                  type="number"
                  min="3"
                  max="10"
                  value={settings.maxLoginAttempts}
                  onChange={(e) => setSettings({ ...settings, maxLoginAttempts: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <UserCheck className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-600">Require 2FA for all admin accounts</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enableTwoFactor}
                  onChange={(e) => setSettings({ ...settings, enableTwoFactor: e.target.checked })}
                  className="w-5 h-5 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Audit Logging</p>
                    <p className="text-sm text-gray-600">Track all user actions and system events</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enableAuditLog}
                  onChange={(e) => setSettings({ ...settings, enableAuditLog: e.target.checked })}
                  className="w-5 h-5 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )
      case 'email':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-600">Send email notifications to users</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.enableNotifications}
                onChange={(e) => setSettings({ ...settings, enableNotifications: e.target.checked })}
                className="w-5 h-5 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Host</label>
                <input
                  type="text"
                  value={settings.smtpHost}
                  onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="smtp.gmail.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From Email</label>
                <input
                  type="email"
                  value={settings.fromEmail}
                  onChange={(e) => setSettings({ ...settings, fromEmail: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleTestEmail} variant="outline">
                <Mail className="w-4 h-4 mr-2" />
                Send Test Email
              </Button>
            </div>
          </div>
        )

      case 'backup':
        return (
          <div className="space-y-6">
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Database className="w-6 h-6 text-green-600" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Database Backup</h3>
                    <p className="text-sm text-gray-600">Last backup: 2 hours ago</p>
                  </div>
                </div>
                <Button onClick={handleBackupNow} className="bg-green-600 hover:bg-green-700">
                  <Download className="w-4 h-4 mr-2" />
                  Backup Now
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <HardDrive className="w-5 h-5 text-blue-600" />
                  <h4 className="font-medium">Storage Usage</h4>
                </div>
                <p className="text-2xl font-bold text-gray-900">2.4 GB</p>
                <p className="text-sm text-gray-600">of 100 GB used</p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-green-600" />
                  <h4 className="font-medium">Backup Status</h4>
                </div>
                <p className="text-2xl font-bold text-green-600">Active</p>
                <p className="text-sm text-gray-600">Next: in 22 hours</p>
              </Card>
            </div>
          </div>
        )

      default:
        return <div>Tab content for {activeTab}</div>
    }
  }
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="p-3 bg-primary-100 rounded-lg">
            <Settings className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
            <p className="text-gray-600">Configure application settings and preferences</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <Card className="p-4 sticky top-24">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-all ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-700 shadow-soft'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.name}</span>
                    </button>
                  )
                })}
              </nav>
            </Card>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                {(() => {
                  const activeTabData = tabs.find(tab => tab.id === activeTab)
                  const Icon = activeTabData?.icon || Settings
                  return (
                    <>
                      <Icon className="w-6 h-6 text-primary-600" />
                      <h2 className="text-2xl font-bold text-gray-900">{activeTabData?.name} Settings</h2>
                    </>
                  )
                })()}
              </div>

              {renderTabContent()}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                <Button variant="outline" onClick={handleReset}>
                  Reset to Defaults
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="bg-gradient-to-r from-primary-600 to-secondary-600"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  )
}