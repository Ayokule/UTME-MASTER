import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function LoginSimple() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simple demo login without API
    setTimeout(() => {
      if (formData.email.includes('admin')) {
        navigate('/admin/dashboard')
      } else {
        navigate('/student/dashboard')
      }
      setLoading(false)
    }, 1000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleDemoLogin = (email: string) => {
    setFormData({ email, password: 'password123' })
    setLoading(true)
    
    setTimeout(() => {
      if (email.includes('admin')) {
        navigate('/admin/dashboard')
      } else {
        navigate('/student/dashboard')
      }
      setLoading(false)
    }, 500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="card max-w-md w-full mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">UTME Master</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Register Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
              Sign up here
            </Link>
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-800 mb-3">Quick Demo Login:</p>
          <div className="space-y-2">
            <button
              onClick={() => handleDemoLogin('student@demo.com')}
              disabled={loading}
              className="w-full text-xs bg-blue-100 text-blue-700 px-3 py-2 rounded hover:bg-blue-200 transition-colors disabled:opacity-50"
            >
              Login as Student (student@demo.com)
            </button>
            <button
              onClick={() => handleDemoLogin('admin@demo.com')}
              disabled={loading}
              className="w-full text-xs bg-green-100 text-green-700 px-3 py-2 rounded hover:bg-green-200 transition-colors disabled:opacity-50"
            >
              Login as Admin (admin@demo.com)
            </button>
          </div>
        </div>

        {/* Status */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Frontend Working ✅ | Backend: http://localhost:3000
          </p>
        </div>
      </div>
    </div>
  )
}