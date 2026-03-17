import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Award, Clock, BookOpen, Target } from 'lucide-react'
import Card from '../ui/Card'
import { StudentPerformanceStats } from '../../api/admin'

interface Props {
  stats: StudentPerformanceStats
}

export default function StudentPerformanceCard({ stats }: Props) {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-600" />
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-red-600" />
    return <Target className="w-4 h-4 text-gray-600" />
  }

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600'
    if (trend < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalExams}</p>
              <p className="text-sm text-gray-600">Total Exams</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Award className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{Math.round(stats.averagePercentage)}%</p>
              <p className="text-sm text-gray-600">Average Score</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatTime(stats.totalTimeSpent)}</p>
              <p className="text-sm text-gray-600">Total Time</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              {getTrendIcon(stats.improvementTrend)}
            </div>
            <div>
              <p className={`text-2xl font-bold ${getTrendColor(stats.improvementTrend)}`}>
                {stats.improvementTrend > 0 ? '+' : ''}{Math.round(stats.improvementTrend)}%
              </p>
              <p className="text-sm text-gray-600">Improvement</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Strong and Weak Subjects */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strong Subjects */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Award className="w-5 h-5 text-green-600 mr-2" />
            Strong Subjects
          </h3>
          <div className="space-y-3">
            {stats.strongSubjects.length > 0 ? (
              stats.strongSubjects.map((subject, index) => (
                <motion.div
                  key={subject.subject}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{subject.subject}</p>
                    <p className="text-sm text-gray-600">{subject.examCount} exams</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      {Math.round(subject.averagePercentage)}%
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No strong subjects yet. Keep practicing!</p>
            )}
          </div>
        </Card>

        {/* Weak Subjects */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="w-5 h-5 text-red-600 mr-2" />
            Areas for Improvement
          </h3>
          <div className="space-y-3">
            {stats.weakSubjects.length > 0 ? (
              stats.weakSubjects.map((subject, index) => (
                <motion.div
                  key={subject.subject}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{subject.subject}</p>
                    <p className="text-sm text-gray-600">{subject.examCount} exams</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">
                      {Math.round(subject.averagePercentage)}%
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Great! No weak subjects identified.</p>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Performance */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Performance</h3>
        <div className="space-y-3">
          {stats.recentPerformance.length > 0 ? (
            stats.recentPerformance.map((exam, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{exam.examTitle}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(exam.completedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{exam.score}</p>
                  <p className={`text-sm font-medium ${
                    exam.percentage >= 70 ? 'text-green-600' : 
                    exam.percentage >= 50 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {Math.round(exam.percentage)}%
                  </p>
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No recent exams completed.</p>
          )}
        </div>
      </Card>
    </motion.div>
  )
}