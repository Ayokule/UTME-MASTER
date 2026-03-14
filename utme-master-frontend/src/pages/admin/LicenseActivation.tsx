// ==========================================
// LICENSE ACTIVATION PAGE - Phase 5
// ==========================================
// First-time setup page where users enter their license key
//
// This page appears when:
// - User first installs the system
// - No license is activated yet
// - License has expired
//
// ALL WITH BEGINNER-FRIENDLY COMMENTS!

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Key, Shield, CheckCircle, AlertCircle, Loader } from 'lucide-react'

// ==========================================
// TYPES
// ==========================================
interface ActivationResult {
  success: boolean
  tier?: string
  message?: string
  features?: any
  trialEndDate?: string
}

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function LicenseActivation() {
  const navigate = useNavigate()
  
  // ==========================================
  // STATE
  // ==========================================
  const [licenseKey, setLicenseKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<ActivationResult | null>(null)
  
  // ==========================================
  // FORMAT LICENSE KEY AS USER TYPES
  // ==========================================
  function handleLicenseKeyChange(value: string) {
    // Remove all non-alphanumeric characters
    let cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    
    // Remove UTME prefix if user typed it
    if (cleaned.startsWith('UTME')) {
      cleaned = cleaned.slice(4)
    }
    
    // Format with dashes: XXXX-XXXX-XXXX-XXXX
    const parts: string[] = []
    for (let i = 0; i < cleaned.length && i < 16; i += 4) {
      parts.push(cleaned.slice(i, i + 4))
    }
    
    // Add UTME prefix
    const formatted = parts.length > 0 ? `UTME-${parts.join('-')}` : ''
    
    setLicenseKey(formatted)
    setError('')
  }
  
  // ==========================================
  // ACTIVATE LICENSE
  // ==========================================
  async function handleActivate() {
    // Validate format
    const regex = /^UTME-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/
    if (!regex.test(licenseKey)) {
      setError('Invalid license key format. Expected: UTME-XXXX-XXXX-XXXX-XXXX')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/license/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ licenseKey })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Activation failed')
      }
      
      // Success!
      setResult(data.data)
      
      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        navigate('/admin/dashboard')
      }, 3000)
      
    } catch (err: any) {
      setError(err.message || 'Failed to activate license')
    } finally {
      setLoading(false)
    }
  }
  
  // ==========================================
  // START TRIAL
  // ==========================================
  async function handleStartTrial() {
    // Request a trial license from admin
    alert('Please contact support to request a trial license')
  }
  
  // ==========================================
  // RENDER SUCCESS STATE
  // ==========================================
  if (result && result.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            License Activated! 🎉
          </h1>
          
          <p className="text-gray-600 mb-6">
            Your UTME Master license has been activated successfully.
          </p>
          
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <div className="grid grid-cols-2 gap-4 text-left">
              <div>
                <p className="text-sm text-gray-600">License Tier</p>
                <p className="font-bold text-lg text-primary-600">{result.tier}</p>
              </div>
              
              {result.trialEndDate && (
                <div>
                  <p className="text-sm text-gray-600">Trial Ends</p>
                  <p className="font-bold text-lg">
                    {new Date(result.trialEndDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <p className="text-sm text-gray-600">
            Redirecting to dashboard...
          </p>
        </div>
      </div>
    )
  }
  
  // ==========================================
  // RENDER ACTIVATION FORM
  // ==========================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-purple-600 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Shield className="w-12 h-12 text-primary-600" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            UTME Master
          </h1>
          <p className="text-white/80">
            Activate your license to get started
          </p>
        </div>
        
        {/* Activation Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Enter License Key
          </h2>
          
          {/* License Key Input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              License Key
            </label>
            <div className="relative">
              <input
                type="text"
                value={licenseKey}
                onChange={(e) => handleLicenseKeyChange(e.target.value)}
                placeholder="UTME-XXXX-XXXX-XXXX-XXXX"
                className={`w-full px-4 py-3 pl-12 border-2 rounded-xl text-lg font-mono ${
                  error 
                    ? 'border-red-500 focus:border-red-600' 
                    : 'border-gray-300 focus:border-primary-600'
                } focus:outline-none`}
                maxLength={24}
              />
              <Key className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            </div>
            
            {error && (
              <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            
            <p className="mt-2 text-xs text-gray-500">
              Format: UTME-XXXX-XXXX-XXXX-XXXX
            </p>
          </div>
          
          {/* Activate Button */}
          <button
            onClick={handleActivate}
            disabled={loading || licenseKey.length !== 24}
            className={`w-full py-3 rounded-xl font-bold text-white transition-all ${
              loading || licenseKey.length !== 24
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-700 shadow-lg hover:shadow-xl'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader className="w-5 h-5 animate-spin" />
                Activating...
              </span>
            ) : (
              'Activate License'
            )}
          </button>
          
          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="text-sm text-gray-500">OR</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>
          
          {/* Trial Button */}
          <button
            onClick={handleStartTrial}
            className="w-full py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
          >
            Request Trial License
          </button>
          
          {/* Help Text */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl">
            <p className="text-sm text-blue-900 font-semibold mb-2">
              📧 Need a license key?
            </p>
            <p className="text-sm text-blue-800">
              Contact us at: <strong>sales@utmemaster.com</strong>
            </p>
          </div>
        </div>
        
        {/* Pricing Info */}
        <div className="mt-8 text-center">
          <p className="text-white/80 text-sm mb-4">
            Available License Tiers:
          </p>
          <div className="grid grid-cols-4 gap-3 text-white">
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur">
              <p className="font-bold">TRIAL</p>
              <p className="text-xs">Free</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur">
              <p className="font-bold">BASIC</p>
              <p className="text-xs">₦50,000</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur">
              <p className="font-bold">PREMIUM</p>
              <p className="text-xs">₦100,000</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur">
              <p className="font-bold">ENTERPRISE</p>
              <p className="text-xs">₦200,000</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
