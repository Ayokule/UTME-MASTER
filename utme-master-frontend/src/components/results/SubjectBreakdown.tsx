import { motion } from 'framer-motion'
import Card from '../ui/Card'
import { SubjectScore } from '../../types/results'

interface Props {
  subjects: SubjectScore[]
}

export default function SubjectBreakdown({ subjects }: Props) {
  const getSubjectColor = (subject: string) => {
    const colors = {
      'Mathematics': 'bg-red-500',
      'English': 'bg-blue-500',
      'Physics': 'bg-purple-500',
      'Chemistry': 'bg-green-500',
      'Biology': 'bg-yellow-500',
      'Literature': 'bg-pink-500',
      'Government': 'bg-indigo-500',
      'Economics': 'bg-teal-500',
      'Geography': 'bg-orange-500',
      'History': 'bg-lime-500'
    }
    return colors[subject as keyof typeof colors] || 'bg-gray-500'
  }

  const getPerformanceLevel = (percentage: number) => {
    if (percentage >= 80) return { level: 'Excellent', color: 'text-green-600' }
    if (percentage >= 60) return { level: 'Good', color: 'text-blue-600' }
    if (percentage >= 40) return { level: 'Fair', color: 'text-yellow-600' }
    return { level: 'Needs Work', color: 'text-red-600' }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Subject Breakdown</h3>
          <p className="text-gray-600">Performance analysis by subject</p>
        </div>

        <div className="space-y-6">
          {subjects.map((subject, index) => {
            const performance = getPerformanceLevel(subject.percentage)
            
            return (
              <motion.div
                key={subject.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-gray-50 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${getSubjectColor(subject.name)}`}></div>
                    <h4 className="font-semibold text-gray-900">{subject.name}</h4>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {subject.score}/{subject.max}
                    </p>
                    <p className={`text-sm font-medium ${performance.color}`}>
                      {performance.level}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">
                    {subject.correct}/{subject.total} correct
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {Math.round(subject.percentage)}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${subject.percentage}%` }}
                    transition={{ delay: 0.5 + (index * 0.1), duration: 0.8 }}
                    className={`h-full rounded-full ${getSubjectColor(subject.name)} relative`}
                  >
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                  </motion.div>
                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-gray-200">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Correct</p>
                    <p className="text-sm font-semibold text-green-600">{subject.correct}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Wrong</p>
                    <p className="text-sm font-semibold text-red-600">{subject.total - subject.correct}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Score</p>
                    <p className="text-sm font-semibold text-gray-900">{subject.score}</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Summary */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {subjects.reduce((sum, s) => sum + s.score, 0)}
              </p>
              <p className="text-sm text-gray-600">Total Score</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {subjects.reduce((sum, s) => sum + s.correct, 0)}
              </p>
              <p className="text-sm text-gray-600">Total Correct</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(subjects.reduce((sum, s) => sum + s.percentage, 0) / subjects.length)}%
              </p>
              <p className="text-sm text-gray-600">Average</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {subjects.length}
              </p>
              <p className="text-sm text-gray-600">Subjects</p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}