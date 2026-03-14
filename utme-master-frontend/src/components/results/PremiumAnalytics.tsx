import { motion } from 'framer-motion'
import { TrendingUp, Award, Target, BarChart3, Crown } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import { ExamAnalytics } from '../../types/results'

interface Props {
  analytics: ExamAnalytics
  isPremium: boolean
}

export default function PremiumAnalytics({ analytics, isPremium }: Props) {
  if (!isPremium) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="p-8 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full mb-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              🔒 Unlock Detailed Analytics
            </h3>
            <p className="text-gray-600 mb-6">
              Get deeper insights into your performance with premium analytics
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start space-x-3 p-3 bg-white rounded-lg">
                <TrendingUp className="w-5 h-5 text-amber-600 mt-0.5" />
                <div className="text-left">
                  <h4 className="font-semibold text-gray-900 text-sm">Performance Trends</h4>
                  <p className="text-xs text-gray-600">Track improvement over time</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-white rounded-lg">
                <Award className="w-5 h-5 text-amber-600 mt-0.5" />
                <div className="text-left">
                  <h4 className="font-semibold text-gray-900 text-sm">JAMB Prediction</h4>
                  <p className="text-xs text-gray-600">AI-powered score prediction</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-white rounded-lg">
                <Target className="w-5 h-5 text-amber-600 mt-0.5" />
                <div className="text-left">
                  <h4 className="font-semibold text-gray-900 text-sm">Ranking System</h4>
                  <p className="text-xs text-gray-600">Compare with other students</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-white rounded-lg">
                <BarChart3 className="w-5 h-5 text-amber-600 mt-0.5" />
                <div className="text-left">
                  <h4 className="font-semibold text-gray-900 text-sm">Topic Analysis</h4>
                  <p className="text-xs text-gray-600">Detailed topic breakdown</p>
                </div>
              </div>
            </div>

            <button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
              <Crown className="w-4 h-4 mr-2 inline" />
              Upgrade to Premium - ₦2,000/month
            </button>
            
            <p className="text-xs text-gray-500 mt-2">
              Cancel anytime • 30-day money-back guarantee
            </p>
          </div>
        </Card>
      </motion.div>
    )
  }

  const getTrendColor = (improvement: number) => {
    if (improvement > 0) return 'text-green-600'
    if (improvement < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getTrendIcon = (improvement: number) => {
    if (improvement > 0) return '📈'
    if (improvement < 0) return '📉'
    return '➡️'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
    >
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Premium Analytics</h3>
            <p className="text-gray-600">Advanced performance insights</p>
          </div>
          <Badge variant="success" className="flex items-center space-x-1">
            <Crown className="w-3 h-3" />
            <span>Premium</span>
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Improvement */}
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
            <div className="text-2xl mb-2">{getTrendIcon(analytics.improvement)}</div>
            <div className={`text-2xl font-bold ${getTrendColor(analytics.improvement)}`}>
              {analytics.improvement > 0 ? '+' : ''}{analytics.improvement}%
            </div>
            <p className="text-sm text-gray-600">vs Last Attempt</p>
          </div>

          {/* Predicted Score */}
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
            <div className="text-2xl mb-2">🎯</div>
            <div className="text-2xl font-bold text-green-600">
              {analytics.predictedScore}%
            </div>
            <p className="text-sm text-gray-600">Predicted JAMB Score</p>
          </div>

          {/* Ranking */}
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl">
            <div className="text-2xl mb-2">🏆</div>
            <div className="text-2xl font-bold text-purple-600">
              Top {analytics.rankingPercentile}%
            </div>
            <p className="text-sm text-gray-600">Among All Users</p>
          </div>
        </div>

        {/* Strengths Chart */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Subject Strengths</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.strengthsChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis 
                  dataKey="subject" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Accuracy (%)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Accuracy']}
                  labelStyle={{ color: '#374151' }}
                />
                <Bar 
                  dataKey="accuracy" 
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Topic Breakdown */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Topic-Level Analysis</h4>
          <div className="space-y-3">
            {(analytics?.topicBreakdown || []).slice(0, 5).map((topic, index) => (
              <motion.div
                key={topic.topic}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <h5 className="font-medium text-gray-900">{topic.topic}</h5>
                  <p className="text-sm text-gray-600">{topic.subject}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {topic.correct}/{topic.total}
                  </p>
                  <p className={`text-sm ${
                    topic.accuracy >= 80 ? 'text-green-600' :
                    topic.accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {Math.round(topic.accuracy)}%
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <h5 className="font-semibold text-blue-900 mb-2">📚 Study Recommendations</h5>
          <ul className="text-sm text-blue-800 space-y-1">
            {analytics.improvement < 0 && (
              <li>• Focus on reviewing your mistakes from this exam</li>
            )}
            {analytics.weaknessesChart.length > 0 && (
              <li>• Spend extra time on {analytics.weaknessesChart[0].subject} - your weakest subject</li>
            )}
            <li>• Practice more questions in topics where you scored below 70%</li>
            <li>• Review explanations for all incorrect answers</li>
          </ul>
        </div>
      </Card>
    </motion.div>
  )
}