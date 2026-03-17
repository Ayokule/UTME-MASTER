import { motion } from 'framer-motion'
import { Users, Clock, TrendingUp, Award, Target, BookOpen } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import Card from '../ui/Card'
import { ExamStatistics } from '../../api/admin'

interface Props {
  statistics: ExamStatistics
}

export default function ExamStatisticsCard({ statistics }: Props) {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    } else {
      return `${minutes}m`
    }
  }

  const difficultyData = [
    { name: 'Easy', value: statistics.difficultyAnalysis.easy.percentage, color: '#10B981' },
    { name: 'Medium', value: statistics.difficultyAnalysis.medium.percentage, color: '#F59E0B' },
    { name: 'Hard', value: statistics.difficultyAnalysis.hard.percentage, color: '#EF4444' }
  ]

  const subjectData = statistics.subjectPerformance.map(subject => ({
    subject: subject.subject,
    percentage: subject.averagePercentage,
    questions: subject.questionCount
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{statistics.examTitle}</h2>
        <p className="text-gray-600">Comprehensive exam performance analysis</p>
      </Card>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{statistics.totalAttempts}</p>
              <p className="text-sm text-gray-600">Total Attempts</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{Math.round(statistics.averagePercentage)}%</p>
              <p className="text-sm text-gray-600">Average Score</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{Math.round(statistics.passRate)}%</p>
              <p className="text-sm text-gray-600">Pass Rate</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatTime(statistics.averageTimeSpent)}</p>
              <p className="text-sm text-gray-600">Avg. Time</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Difficulty Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="w-5 h-5 text-gray-600 mr-2" />
            Difficulty Analysis
          </h3>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={difficultyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {difficultyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4">
            {difficultyData.map((item, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm font-medium text-gray-700">{item.name}</span>
                </div>
                <p className="text-lg font-bold text-gray-900">{item.value.toFixed(1)}%</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Subject Performance */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BookOpen className="w-5 h-5 text-gray-600 mr-2" />
            Subject Performance
          </h3>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} fontSize={12} />
                <YAxis type="category" dataKey="subject" fontSize={12} width={80} />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Average Score']}
                />
                <Bar dataKey="percentage" fill="#3B82F6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Top Performers */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Award className="w-5 h-5 text-yellow-600 mr-2" />
          Top Performers
        </h3>
        
        {statistics.topPerformers.length > 0 ? (
          <div className="space-y-3">
            {statistics.topPerformers.map((performer, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{performer.studentName}</p>
                    <p className="text-sm text-gray-600">Score: {performer.score}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{Math.round(performer.percentage)}%</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No performance data available
          </div>
        )}
      </Card>
    </motion.div>
  )
}