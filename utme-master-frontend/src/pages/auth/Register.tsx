import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Phone, Sparkles, GraduationCap, Users, BookOpen } from 'lucide-react'
import { register } from '../../api/auth'
import { useAuthStore } from '../../store/auth'
import { showToast } from '../../components/ui/Toast'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'

export default function Register() {
  const [searchParams] = useSearchParams()
  const role = searchParams.get('role') || 'student'
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: role.toUpperCase() as 'STUDENT' | 'TEACHER'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      role: role.toUpperCase() as 'STUDENT' | 'TEACHER'
    }))
  }, [role])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Clean up the form data before sending
      const cleanedData = {
        ...formData,
        // Remove phone if it's empty to avoid validation issues
        phone: formData.phone.trim() || undefined
      }
      
      const response = await register(cleanedData)
      
      if (response.success) {
        setAuth(response.data.user, response.data.token)
        showToast.success(`Welcome, ${response.data.user.firstName}! Your account has been created.`)
        
        // Small delay to ensure token is set
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Navigate based on role
        if (formData.role === 'TEACHER') {
          navigate('/admin/dashboard')
        } else {
          navigate('/student/dashboard')
        }
      }
    } catch (err: any) {
      console.error('Registration error:', err)
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.'
      setError(errorMessage)
      showToast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const getRoleInfo = () => {
    if (formData.role === 'TEACHER') {
      return {
        title: 'Create Teacher Account',
        subtitle: 'Join as an educator and help students succeed',
        icon: <Users className="w-8 h-8 text-white" />,
        description: 'Create questions, monitor progress, and guide students'
      }
    }
    return {
      title: 'Create Student Account',
      subtitle: 'Join thousands of students preparing for JAMB',
      icon: <BookOpen className="w-8 h-8 text-white" />,
      description: 'Practice tests, track progress, and improve your scores'
    }
  }

  const roleInfo = getRoleInfo()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card variant="glass" className="backdrop-blur-sm border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow"
            >
              {roleInfo.icon}
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-2">
                UTME Master
              </h1>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary-500" />
                <span className="text-sm text-gray-600 font-medium">{roleInfo.title}</span>
                <Sparkles className="w-4 h-4 text-secondary-500" />
              </div>
              <p className="text-gray-500 text-sm">{roleInfo.description}</p>
              
              {/* Role Switch Link */}
              <div className="mt-4">
                <Link 
                  to={`/register?role=${formData.role === 'STUDENT' ? 'teacher' : 'student'}`}
                  className="text-xs text-primary-600 hover:text-primary-500 transition-colors"
                >
                  {formData.role === 'STUDENT' ? 'Register as Teacher instead' : 'Register as Student instead'}
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
            >
              <p className="text-red-600 text-sm text-center">{error}</p>
            </motion.div>
          )}

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <Input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First name"
                  icon={<User className="w-5 h-5" />}
                  required
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <Input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last name"
                  icon={<User className="w-5 h-5" />}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                icon={<Mail className="w-5 h-5" />}
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number (Optional)
              </label>
              <Input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                icon={<Phone className="w-5 h-5" />}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <Input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                icon={<Lock className="w-5 h-5" />}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700"
              size="lg"
            >
              {loading ? 'Creating Account...' : `Create ${formData.role === 'TEACHER' ? 'Teacher' : 'Student'} Account`}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-primary-600 hover:text-primary-500 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}