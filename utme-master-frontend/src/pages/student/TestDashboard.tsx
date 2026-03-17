/**
 * Test Dashboard
 * 
 * Dedicated dashboard for practice tests
 * Shows practice test performance, improvement trends, and analytics
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Zap,
  TrendingUp,
  Target,
  Award,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Flame,
  Sparkles
} from 'lucide-react'
import Layout from '../../components/Layout'
import SafePageWrapper from '../../components/SafePageWrapper'
import BlankPageDetector from '../../components/BlankPageDetector'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { getPracticeTestsDashboard } from '../../api/student-dashboard'
import { showToast } from '../../components/ui/Toast'

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.4 }
  },
  hover: {
    scale: 1.02,
    y: -5,
    transition: { duration: 0.2 }
  }
}

const headerVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6 }
  }
}

export default function TestDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('🔄 [TEST DASHBOARD] Loading practice tests data...')
      
      const response = await getPracticeTestsDashboard()
      
      if (response.success && response.data) {
        console.log('✅ [TEST DASHBOARD] Data loaded successfully')
        setData(response.data)
      } else {
        throw new Error('Invalid response structure')
      }
    } catch (err: any) {
      console.error('❌ [TEST DASHBOARD] Error:', err)
      setError(err.message || 'Failed to load test dashboard')
      showToast.error('Failed to load test dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-8 text-white"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "300px" }}
                    transition={{ duration: 1 }}
                    className="h-8 bg-white/20 rounded-lg mb-4"
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "200px" }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="h-4 bg-white/15 rounded"
                  />
                </div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full"
                />
              </div>
            </motion.div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {[1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="bg-white rounded-2xl shadow-lg p-6 animate-pulse"
                >
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded"></div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </Layout>
    )
  }

  if (error || !data) {
    return (
      <Layout>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
          <Card className="p-8">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="flex justify-center mb-4"
              >
                <AlertCircle className="w-12 h-12 text-red-500" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Failed to Load Dashboard
              </h2>
              <p className="text-gray-600 mb-6">
                {error || 'An unexpected error occurred'}
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={loadDashboard} className="bg-orange-600 hover:bg-orange-700">
                  Try Again
                </Button>
                <Link to="/student/dashboard">
                  <Button variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>
      </Layout>
    )
  }

  const stats = data?.stats || {
    total_tests: 0,
    average_score: 0,
    best_score: 0,
    improvement_trend: 0,
    strong_areas: [],
    weak_areas: []
  }

  return (
    <SafePageWrapper pageName="Test Dashboard">
      <Layout>
        <BlankPageDetector 
          pageName="Test Dashboard" 
          hasContent={!!data && Object.keys(data).length > 0}
        />
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
          {/* Header */}
          <motion.div variants={headerVariants} className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <Link to="/student/dashboard">
                  <Button variant="outline" size="sm" className="mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                </Link>
                <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="p-3 bg-orange-100 rounded-lg"
                  >
                    <Zap className="w-8 h-8 text-orange-600" />
                  </motion.div>
                  Practice Tests
                </h1>
                <p className="text-gray-600 mt-2">
                  Track your practice test performance and improvement
                </p>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="text-right"
              >
                <Badge variant="secondary" size="lg">
                  {stats.total_tests || 0} Tests Taken
                </Badge>
              </motion.div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <motion.div variants={cardVariants} whileHover="hover">
              <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600 font-medium">Total Tests</p>
                    <p className="text-3xl font-bold text-orange-900 mt-2">
                      {stats.total_tests || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-500 rounded-lg">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants} whileHover="hover">
              <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Average Score</p>
                    <p className="text-3xl font-bold text-green-900 mt-2">
                      {Math.round(stats.average_score || 0)}%
                    </p>
                  </div>
                  <div className="p-3 bg-green-500 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants} whileHover="hover">
              <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Best Score</p>
                    <p className="text-3xl font-bold text-purple-900 mt-2">
                      {Math.round(stats.best_score || 0)}%
                    </p>
                  </div>
                  <div className="p-3 bg-purple-500 rounded-lg">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants} whileHover="hover">
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Improvement</p>
                    <p className="text-3xl font-bold text-blue-900 mt-2">
                      {stats.improvement_trend || 0}%
                    </p>
                  </div>
                  <div className="p-3 bg-blue-500 rounded-lg">
                    <Flame className="w-6 h-6 text-white" />
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>

          {/* Strong and Weak Areas */}
          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
          >
            <motion.div variants={cardVariants} whileHover="hover">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Strong Areas</h2>
                </div>
                <div className="space-y-3">
                  {stats.strong_areas && stats.strong_areas.length > 0 ? (
                    stats.strong_areas.map((area: any, idx: number) => (
                      <div key={idx} className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm font-medium text-green-900">{area}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No data yet</p>
                  )}
                </div>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants} whileHover="hover">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-orange-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Areas to Improve</h2>
                </div>
                <div className="space-y-3">
                  {stats.weak_areas && stats.weak_areas.length > 0 ? (
                    stats.weak_areas.map((area: any, idx: number) => (
                      <div key={idx} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <p className="text-sm font-medium text-orange-900">{area}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No data yet</p>
                  )}
                </div>
              </Card>
            </motion.div>
          </motion.div>

          {/* Performance Insight */}
          <motion.div variants={itemVariants} className="mb-8">
            <Card className="p-6 bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Sparkles className="w-6 h-6 text-orange-600" />
                </motion.div>
                <h2 className="text-xl font-bold text-gray-900">Performance Insight</h2>
              </div>
              <p className="text-gray-700">
                You're making great progress! Keep practicing to improve your weak areas and maintain your strengths.
              </p>
            </Card>
          </motion.div>

          {/* Navigation Footer */}
          <motion.div 
            variants={itemVariants}
            className="flex gap-4 justify-center"
          >
            <Link to="/student/dashboard">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
            </Link>
            <Link to="/student/exam-dashboard">
              <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                View Official Exams
                <BarChart3 className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </Layout>
    </SafePageWrapper>
  )
}
