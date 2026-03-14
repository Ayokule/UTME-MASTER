import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Target, BookOpen } from 'lucide-react'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import Button from '../ui/Button'

interface Props {
  strengths: string[]
  weaknesses: string[]
  onSubjectClick?: (subject: string) => void
}

export default function StrengthsWeaknesses({ strengths, weaknesses, onSubjectClick }: Props) {
  const recommendations = [
    "Focus on your weak subjects during study sessions",
    "Practice more questions in Mathematics and Physics", 
    "Review past exam questions for better understanding",
    "Set daily study goals for consistent improvement"
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Strengths */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Your Strengths</h3>
              <p className="text-sm text-gray-600">Subjects you excel at</p>
            </div>
          </div>

          <div className="space-y-3">
            {(strengths || []).slice(0, 3).map((subject, index) => (
              <motion.div
                key={subject}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
                className="flex items-center justify-between p-3 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
                onClick={() => onSubjectClick?.(subject)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-green-800">#{index + 1}</span>
                  </div>
                  <span className="font-medium text-gray-900">{subject}</span>
                </div>
                <Badge variant="success">Strong</Badge>
              </motion.div>
            ))}
          </div>

          {strengths.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              <Target className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Complete more exams to identify your strengths</p>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Weaknesses */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.6 }}
      >
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Areas to Improve</h3>
              <p className="text-sm text-gray-600">Focus on these subjects</p>
            </div>
          </div>

          <div className="space-y-3">
            {(weaknesses || []).slice(0, 3).map((subject, index) => (
              <motion.div
                key={subject}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
                className="flex items-center justify-between p-3 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100 transition-colors"
                onClick={() => onSubjectClick?.(subject)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-red-800">#{index + 1}</span>
                  </div>
                  <span className="font-medium text-gray-900">{subject}</span>
                </div>
                <Badge variant="error">Needs Work</Badge>
              </motion.div>
            ))}
          </div>

          {weaknesses.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Great! No major weaknesses identified yet</p>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Study Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.7 }}
        className="lg:col-span-2"
      >
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Study Recommendations</h3>
              <p className="text-sm text-gray-600">Personalized tips to improve your performance</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((recommendation, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
                className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg"
              >
                <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-800">{index + 1}</span>
                </div>
                <p className="text-sm text-gray-700">{recommendation}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 flex justify-center">
            <Button variant="outline" className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4" />
              <span>View Detailed Study Plan</span>
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}