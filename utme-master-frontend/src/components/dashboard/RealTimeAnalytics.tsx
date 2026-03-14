// ==========================================
// REAL-TIME ANALYTICS COMPONENT
// ==========================================
// Shows live progress during exam
// Updates as student answers questions

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Target, Clock, CheckCircle } from 'lucide-react'

interface RealTimeAnalyticsProps {
  totalQuestions: number
  answeredQuestions: number
  correctAnswers: number
  timeRemaining: number
  currentQuestionIndex: number
}

export default function RealTimeAnalytics({
  totalQuestions,
  answeredQuestions,
  correctAnswers,
  timeRemaining,
  currentQuestionIndex
}: RealTimeAnalyticsProps) {
  const [accuracy, setAccuracy] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Calculate accuracy
    if (answeredQuestions > 0) {
      setAccuracy(Math.round((correctAnswers / answeredQuestions) * 100))
    }

    // Calculate progress
    setProgress(Math.round((answeredQuestions / totalQuestions) * 100))
  }, [answeredQuestions, correctAnswers, totalQuestions])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Progress */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-4 rounded-lg shadow"
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-gray-600 text-sm font-medium">Progress</p>
          <CheckCircle className="w-4 h-4 text-blue-600" />
        </div>
        <p className="text-2xl font-bold text-blue-600">{progress}%</p>
        <p className="text-xs text-gray-500 mt-1">
          {answeredQuestions}/{totalQuestions} answered
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
            className="bg-blue-600 h-2 rounded-full"
          />
        </div>
      </motion.div>

      {/* Accuracy */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-4 rounded-lg shadow"
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-gray-600 text-sm font-medium">Accuracy</p>
          <TrendingUp className="w-4 h-4 text-green-600" />
        </div>
        <p className="text-2xl font-bold text-green-600">{accuracy}%</p>
        <p className="text-xs text-gray-500 mt-1">
          {correctAnswers} correct
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${accuracy}%` }}
            transition={{ duration: 0.5 }}
            className="bg-green-600 h-2 rounded-full"
          />
        </div>
      </motion.div>

      {/* Current Question */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white p-4 rounded-lg shadow"
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-gray-600 text-sm font-medium">Current</p>
          <Target className="w-4 h-4 text-purple-600" />
        </div>
        <p className="text-2xl font-bold text-purple-600">Q{currentQuestionIndex + 1}</p>
        <p className="text-xs text-gray-500 mt-1">
          of {totalQuestions} questions
        </p>
      </motion.div>

      {/* Time Remaining */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`bg-white p-4 rounded-lg shadow ${
          timeRemaining < 300 ? 'border-2 border-red-500' : ''
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-gray-600 text-sm font-medium">Time Left</p>
          <Clock className={`w-4 h-4 ${timeRemaining < 300 ? 'text-red-600' : 'text-orange-600'}`} />
        </div>
        <p className={`text-2xl font-bold ${timeRemaining < 300 ? 'text-red-600' : 'text-orange-600'}`}>
          {formatTime(timeRemaining)}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {Math.ceil(timeRemaining / 60)} minutes
        </p>
      </motion.div>
    </div>
  )
}
