import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import Card from '../ui/Card'
import { ProgressTracking } from '../../api/admin'

interface Props {
  progress: ProgressTracking
}

export default function ProgressChart({ progress }: Props) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getTimeRangeLabel = (range: string) => {
    switch (range) {
      case 'week': return 'Last 7 Days'
      case 'month': return 'Last 30 Days'
      case 'quarter': return 'Last 3 Months'
      case 'year': return 'Last 12 Months'
      default: return 'Progress Over Time'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Overall Progress Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {getTimeRangeLabel(progress.timeRange)}
        </h3>
        
        {progress.progressData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progress.progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  fontSize={12}
                />
                <YAxis fontSize={12} />
                <Tooltip 
                  labelFormatter={(value) => formatDate(value as string)}
                  formatter={(value: number, name: string) => [
                    name === 'averageScore' ? `${value.toFixed(1)}` : value,
                    name === 'averageScore' ? 'Average Score' : 
                    name === 'examCount' ? 'Exams Taken' : 'Time Spent (min)'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="averageScore" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            No progress data available for this time range
          </div>
        )}
      </Card>

      {/* Subject Progress */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject Progress</h3>
        
        {progress.subjectProgress.length > 0 ? (
          <div className="space-y-6">
            {progress.subjectProgress.map((subject, index) => (
              <motion.div
                key={subject.subject}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 rounded-lg p-4"
              >
                <h4 className="font-medium text-gray-900 mb-3">{subject.subject}</h4>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={subject.data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={formatDate}
                        fontSize={10}
                      />
                      <YAxis fontSize={10} />
                      <Tooltip 
                        labelFormatter={(value) => formatDate(value as string)}
                        formatter={(value: number) => [`${value.toFixed(1)}%`, 'Average Score']}
                      />
                      <Bar 
                        dataKey="averagePercentage" 
                        fill="#10B981"
                        radius={[2, 2, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No subject progress data available
          </div>
        )}
      </Card>

      {/* Milestones */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements & Milestones</h3>
        
        {progress.milestones.length > 0 ? (
          <div className="space-y-4">
            {progress.milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-4 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg"
              >
                <div className="flex-shrink-0 w-3 h-3 bg-primary-600 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{milestone.achievement}</h4>
                    <span className="text-sm text-gray-600">
                      {new Date(milestone.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No milestones achieved yet. Keep studying to unlock achievements!
          </div>
        )}
      </Card>
    </motion.div>
  )
}