import { motion } from 'framer-motion'
import { Clock, CheckCircle, XCircle, } from 'lucide-react'
import Card from '../ui/Card'
import { ExamScore } from '../../types/results'

interface Props {
  score: ExamScore
  totalQuestions: number
}

export default function OverallScoreCard({ score, totalQuestions }: Props) {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-100'
      case 'B': return 'text-blue-600 bg-blue-100'
      case 'C': return 'text-yellow-600 bg-yellow-100'
      case 'D': return 'text-orange-600 bg-orange-100'
      case 'F': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const correctAnswers = Math.round((score.percentage / 100) * totalQuestions)
  const wrongAnswers = totalQuestions - correctAnswers

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Overall Performance</h2>
          <p className="text-gray-600">Your detailed exam results</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Score */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="text-center"
          >
            <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-6 mb-4">
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {score.total}
              </div>
              <div className="text-lg text-gray-600">
                out of {score.max}
              </div>
            </div>
            <p className="text-sm font-medium text-gray-700">Total Score</p>
          </motion.div>

          {/* Percentage */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
            className="text-center"
          >
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 mb-4">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {Math.round(score.percentage)}%
              </div>
              <div className="text-lg text-gray-600">
                accuracy
              </div>
            </div>
            <p className="text-sm font-medium text-gray-700">Percentage</p>
          </motion.div>

          {/* Grade */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="text-center"
          >
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-4">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-2xl font-bold ${getGradeColor(score.grade)}`}>
                {score.grade}
              </div>
              <div className="text-lg text-gray-600 mt-2">
                grade
              </div>
            </div>
            <p className="text-sm font-medium text-gray-700">Letter Grade</p>
          </motion.div>

          {/* Status */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: "spring" }}
            className="text-center"
          >
            <div className={`bg-gradient-to-br rounded-2xl p-6 mb-4 ${
              score.passed 
                ? 'from-green-50 to-emerald-50' 
                : 'from-red-50 to-rose-50'
            }`}>
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${
                score.passed 
                  ? 'text-green-600 bg-green-100' 
                  : 'text-red-600 bg-red-100'
              }`}>
                {score.passed ? (
                  <CheckCircle className="w-8 h-8" />
                ) : (
                  <XCircle className="w-8 h-8" />
                )}
              </div>
              <div className="text-lg text-gray-600 mt-2">
                {score.passed ? 'passed' : 'failed'}
              </div>
            </div>
            <p className="text-sm font-medium text-gray-700">Status</p>
          </motion.div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">{correctAnswers}</p>
              <p className="text-sm text-gray-600">Correct Answers</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">{wrongAnswers}</p>
              <p className="text-sm text-gray-600">Wrong Answers</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">{formatTime(score.timeTaken)}</p>
              <p className="text-sm text-gray-600">Time Taken</p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}