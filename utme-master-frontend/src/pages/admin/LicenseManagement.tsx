// ==========================================
// ADMIN LICENSE MANAGEMENT - Phase 5
// ==========================================
// Admin page to manage all licenses
//
// Features:
// - View current license status
// - Create new licenses
// - View all licenses
// - Deactivate licenses
// - View activation history
//
// ALL WITH BEGINNER-FRIENDLY COMMENTS!

import { useState, useEffect } from 'react'
import {
  Key,
  Plus,
  Shield,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  FileText,
  Copy,
  Download
} from 'lucide-react'
import { useAuthStore } from '../../store/auth'

// ==========================================
// TYPES
// ==========================================
interface License {
  id: string
  licenseKey: string
  tier: string
  status: string
  organizationName?: string
  isActivated: boolean
  activatedAt?: string
  trialEndDate?: string
  expiryDate?: string
  maxStudents: number
  maxQuestions: number
  currentStudents: number
  currentQuestions: number
}

interface LicenseInfo {
  hasLicense: boolean
  valid: boolean
  licenseKey?: string
  tier?: string
  status?: string
  features?: any
  warnings?: string[]
}

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function AdminLicenseManagement() {
  const { token } = useAuthStore()
  
  // ==========================================
  // STATE
  // ==========================================
  const [currentLicense, setCurrentLicense] = useState<LicenseInfo | null>(null)
  const [allLicenses, setAllLicenses] = useState<License[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  
  // Create license form
  const [newLicense, setNewLicense] = useState({
    tier: 'TRIAL',
    organizationName: '',
    contactEmail: '',
    contactPhone: ''
  })
  
  // ==========================================
  // LOAD DATA
  // ==========================================
  useEffect(() => {
    loadLicenseData()
  }, [])
  
  async function loadLicenseData() {
    setLoading(true)
    
    try {
      // Get current license info
      const infoResponse = await fetch('/api/license/info', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (infoResponse.ok) {
        const infoData = await infoResponse.json()
        setCurrentLicense(infoData.data)
      }
      
      // Get all licenses (admin only)
      const allResponse = await fetch('/api/license/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (allResponse.ok) {
        const allData = await allResponse.json()
        setAllLicenses(allData.data.licenses)
      }
      
    } catch (error) {
      console.error('Error loading licenses:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // ==========================================
  // CREATE LICENSE
  // ==========================================
  async function handleCreateLicense() {
    try {
      const response = await fetch('/api/license/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newLicense)
      })
      
      if (!response.ok) throw new Error('Failed to create license')
      
      const data = await response.json()
      
      alert(`License created successfully!\n\nLicense Key: ${data.data.licenseKey}\n\nPlease save this key securely.`)
      
      // Reset form
      setNewLicense({
        tier: 'TRIAL',
        organizationName: '',
        contactEmail: '',
        contactPhone: ''
      })
      
      setShowCreateForm(false)
      loadLicenseData()
      
    } catch (error) {
      alert('Failed to create license')
    }
  }
  
  // ==========================================
  // COPY LICENSE KEY
  // ==========================================
  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }
  
  // ==========================================
  // RENDER LOADING
  // ==========================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
      </div>
    )
  }
  
  // ==========================================
  // RENDER PAGE
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">License Management</h1>
          <p className="text-gray-600">Manage UTME Master licenses</p>
        </div>
        
        {/* Current License Status */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary-600" />
            Current System License
          </h2>
          
          {currentLicense?.hasLicense ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">License Key</p>
                  <div className="flex items-center gap-2">
                    <code className="font-mono font-bold text-lg">
                      {currentLicense.licenseKey}
                    </code>
                    <button
                      onClick={() => copyToClipboard(currentLicense.licenseKey!)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-1">License Tier</p>
                  <span className={`inline-block px-4 py-2 rounded-lg font-bold ${
                    currentLicense.tier === 'ENTERPRISE' ? 'bg-purple-100 text-purple-700' :
                    currentLicense.tier === 'PREMIUM' ? 'bg-blue-100 text-blue-700' :
                    currentLicense.tier === 'BASIC' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {currentLicense.tier}
                  </span>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold ${
                    currentLicense.valid 
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {currentLicense.valid ? (
                      <><CheckCircle className="w-4 h-4" /> Active</>
                    ) : (
                      <><XCircle className="w-4 h-4" /> Inactive</>
                    )}
                  </span>
                </div>
              </div>
              
              {/* Warnings */}
              {currentLicense.warnings && currentLicense.warnings.length > 0 && (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                  <p className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Warnings:
                  </p>
                  <ul className="list-disc list-inside text-amber-800">
                    {currentLicense.warnings.map((warning, idx) => (
                      <li key={idx}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              <p className="text-xl font-semibold text-gray-900 mb-2">
                No License Activated
              </p>
              <p className="text-gray-600">
                Please activate a license to use the system
              </p>
            </div>
          )}
        </div>
        
        {/* Create License Button */}
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="mb-6 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create New License
        </button>
        
        {/* Create License Form */}
        {showCreateForm && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h3 className="text-xl font-bold mb-6">Create New License</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold mb-2">License Tier</label>
                <select
                  value={newLicense.tier}
                  onChange={(e) => setNewLicense({...newLicense, tier: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl"
                >
                  <option value="TRIAL">TRIAL (Free)</option>
                  <option value="BASIC">BASIC (₦50,000)</option>
                  <option value="PREMIUM">PREMIUM (₦100,000)</option>
                  <option value="ENTERPRISE">ENTERPRISE (₦200,000)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2">Organization Name</label>
                <input
                  type="text"
                  value={newLicense.organizationName}
                  onChange={(e) => setNewLicense({...newLicense, organizationName: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl"
                  placeholder="School/Institution Name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2">Contact Email</label>
                <input
                  type="email"
                  value={newLicense.contactEmail}
                  onChange={(e) => setNewLicense({...newLicense, contactEmail: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl"
                  placeholder="contact@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2">Contact Phone</label>
                <input
                  type="tel"
                  value={newLicense.contactPhone}
                  onChange={(e) => setNewLicense({...newLicense, contactPhone: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl"
                  placeholder="+234 xxx xxx xxxx"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-6 py-2 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateLicense}
                className="px-6 py-2 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700"
              >
                Generate License
              </button>
            </div>
          </div>
        )}
        
        {/* All Licenses Table */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6">All Licenses ({allLicenses.length})</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-bold">License Key</th>
                  <th className="text-left py-3 px-4 font-bold">Tier</th>
                  <th className="text-left py-3 px-4 font-bold">Status</th>
                  <th className="text-left py-3 px-4 font-bold">Organization</th>
                  <th className="text-center py-3 px-4 font-bold">Activated</th>
                  <th className="text-right py-3 px-4 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allLicenses.map((license) => (
                  <tr key={license.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <code className="font-mono text-sm">{license.licenseKey}</code>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-lg font-semibold text-sm ${
                        license.tier === 'ENTERPRISE' ? 'bg-purple-100 text-purple-700' :
                        license.tier === 'PREMIUM' ? 'bg-blue-100 text-blue-700' :
                        license.tier === 'BASIC' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {license.tier}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-lg font-semibold text-sm ${
                        license.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                        license.status === 'EXPIRED' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {license.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {license.organizationName || '-'}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {license.isActivated ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-400 mx-auto" />
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => copyToClipboard(license.licenseKey)}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold"
                      >
                        Copy Key
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
