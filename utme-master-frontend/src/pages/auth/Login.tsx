import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Sparkles, GraduationCap } from 'lucide-react'
import { login } from '../../api/auth'
import { useAuthStore } from '../../store/auth'
import { showToast } from '../../components/ui/Toast'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await login(formData)
      
      if (response.success) {
        setAuth(response.data.user, response.data.token)
        showToast.success(`Welcome back, ${response.data.user.firstName}!`)
        
        // Small delay to ensure token is set
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Navigate based on user role
        if (response.data.user.role === 'ADMIN' || response.data.user.role === 'TEACHER') {
          navigate('/admin/dashboard')
        } else {
          navigate('/student/dashboard')
        }
      }
    } catch (err: any) {
      console.error('Login error:', err)
      showToast.error(err.response?.data?.error?.message || 'Login failed. Please try again.')
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

  const handleQuickLogin = async (email: string, password: string) => {
    setFormData({ email, password })
    setLoading(true)

    try {
      const response = await login({ email, password })
      
      if (response.success) {
        setAuth(response.data.user, response.data.token)
        showToast.success(`Welcome back!`)
        
        // Small delay to ensure token is set
        await new Promise(resolve => setTimeout(resolve, 100))
        
        if (response.data.user.role === 'ADMIN' || response.data.user.role === 'TEACHER') {
          navigate('/admin/dashboard')
        } else {
          navigate('/student/dashboard')
        }
      }
    } catch (err: any) {
      showToast.error('Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

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
              <GraduationCap className="w-8 h-8 text-white" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-2"
            >
              UTME Master
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-primary-500" />
              Sign in to your account
            </motion.p>
          </div>

          {/* Login Form */}
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <Input
              type="email"
              name="email"
              label="Email Address"
              value={formData.email}
              onChange={handleChange}
              icon={<Mail className="w-5 h-5" />}
              placeholder="Enter your email"
              required
              variant="filled"
            />

            <Input
              type="password"
              name="password"
              label="Password"
              value={formData.password}
              onChange={handleChange}
              icon={<Lock className="w-5 h-5" />}
              placeholder="Enter your password"
              required
              variant="filled"
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>

              <Link
                to="/forgot-password"
                className="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
            >
              Sign In
            </Button>
          </motion.form>

          {/* Register Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 text-center"
          >
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/role-selection"
                className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
              >
                Sign up here
              </Link>
            </p>
          </motion.div>

         
            {/* Quick Login */}
            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl">
              <p className="text-sm font-semibold text-blue-800 mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Quick Access - Demo Accounts
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => handleQuickLogin('admin@utmemaster.com', 'Admin@123')}
                  disabled={loading}
                  variant="outline"
                  size="sm"
                  className="w-full text-green-700 border-green-300 hover:bg-green-50"
                >
                  👨‍💼 Admin Portal
                </Button>
                <Button
                  onClick={() => handleQuickLogin('student1@test.com', 'Student@123')}
                  disabled={loading}
                  variant="outline"
                  size="sm"
                  className="w-full text-blue-700 border-blue-300 hover:bg-blue-50"
                >
                  🎓 Student 1 Portal
                </Button>
                <Button
                  onClick={() => handleQuickLogin('student2@test.com', 'Student@123')}
                  disabled={loading}
                  variant="outline"
                  size="sm"
                  className="w-full text-blue-700 border-blue-300 hover:bg-blue-50"
                >
                  🎓 Student 2 Portal
                </Button>
              </div>
            </div>

            {/* Credentials Info */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-xs font-semibold text-amber-800 mb-3">📋 Default Credentials:</p>
              <div className="space-y-2 text-xs text-amber-700">
                <div>
                  <p className="font-medium">Admin Account:</p>
                  <p className="text-amber-600">Email: admin@utmemaster.com</p>
                  <p className="text-amber-600">Password: Admin@123</p>
                </div>
                <div>
                  <p className="font-medium">Student Accounts:</p>
                  <p className="text-amber-600">Email: student1@test.com / student2@test.com</p>
                  <p className="text-amber-600">Password: Student@123</p>
                </div>
              </div>
            </div>

          {/* Backend Status */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 text-center"
          >
            <div className="text-xs text-gray-500 flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Backend: localhost:3000 | Frontend: localhost:5173</span>
            </div>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  )
}
