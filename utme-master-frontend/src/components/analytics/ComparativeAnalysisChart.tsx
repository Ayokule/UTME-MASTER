import React from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  LineChart,
  Line
} from 'recharts'
import { Users, TrendingUp, Award, Target } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Badge } from '../ui/Badge'

interface ComparisonData {
  category: string
  studentScore: number
  classAverage: number
  topPerformer: number
  percentile: number
}

interface Props {
  data: ComparisonData[]
  studentName?: string
  className?: string
  type?: 'bar' | 'radar' | 'line'
  showPercentiles?: boolean
}

export default function ComparativeAnalysisChart({ 
  data, 
  studentName = "Student",
  className = "Class",
  type = 'bar',
  showPercentiles = true
}: Props) {
  const overallPercentile = data.length > 0 
    ? data.reduce((sum, item) => sum + item.percentile, 0) / data.length 
    : 0

  const getPercentileColor = (percentile: number) => {
    if (percentile >= 90) return 'text-green-600'
    if (percentile >= 75) return 'text-blue-600'
    if (percentile >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPercentileBadge = (percentile: number) => {
    if (percentile >= 90) return { variant: 'success' as const, label: 'Excellent' }
    if (percentile >= 75) return { variant: 'primary' as const, label: 'Good' }
    if (percentile >= 50) return { variant: 'warning' as const, label: 'Average' }
    return { variant: 'error' as const, label: 'Needs Improvement' }
  }
  const renderChart = () => {
    switch (type) {
      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={data}>
              <PolarGrid />
              <PolarAngleAxis dataKey="category" fontSize={12} />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]} 
                fontSize={10}
                tickCount={6}
              />
              <Radar
                name={studentName}
                dataKey="studentScore"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Radar
                name="Class Average"
                dataKey="classAverage"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.1}
                strokeWidth={2}
                strokeDasharray="5 5"
              />
              <Radar
                name="Top Performer"
                dataKey="topPerformer"
                stroke="#F59E0B"
                fill="#F59E0B"
                fillOpacity={0.1}
                strokeWidth={2}
                strokeDasharray="3 3"
              />
              <Legend />
              <Tooltip 
                formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        )

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="category" 
                fontSize={12}
                stroke="#6B7280"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                fontSize={12}
                stroke="#6B7280"
                domain={[0, 100]}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="studentScore" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 5 }}
                name={studentName}
              />
              <Line 
                type="monotone" 
                dataKey="classAverage" 
                stroke="#10B981" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                name="Class Average"
              />
              <Line 
                type="monotone" 
                dataKey="topPerformer" 
                stroke="#F59E0B" 
                strokeWidth={2}
                strokeDasharray="3 3"
                dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                name="Top Performer"
              />
            </LineChart>
          </ResponsiveContainer>
        )

      default: // bar chart
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="category" 
                fontSize={12}
                stroke="#6B7280"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                fontSize={12}
                stroke="#6B7280"
                domain={[0, 100]}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Bar 
                dataKey="studentScore" 
                fill="#3B82F6" 
                name={studentName}
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="classAverage" 
                fill="#10B981" 
                name="Class Average"
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="topPerformer" 
                fill="#F59E0B" 
                name="Top Performer"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Comparative Analysis
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge 
                variant={getPercentileBadge(overallPercentile).variant}
                className="flex items-center gap-1"
              >
                <Target className="h-3 w-3" />
                {overallPercentile.toFixed(0)}th Percentile
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {data.reduce((sum, item) => sum + item.studentScore, 0) / data.length || 0}%
              </div>
              <div className="text-sm text-blue-600">Your Average</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {data.reduce((sum, item) => sum + item.classAverage, 0) / data.length || 0}%
              </div>
              <div className="text-sm text-green-600">Class Average</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {data.reduce((sum, item) => sum + item.topPerformer, 0) / data.length || 0}%
              </div>
              <div className="text-sm text-yellow-600">Top Score</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className={`text-2xl font-bold ${getPercentileColor(overallPercentile)}`}>
                {overallPercentile.toFixed(0)}th
              </div>
              <div className="text-sm text-purple-600">Percentile</div>
            </div>
          </div>

          {/* Chart */}
          {data.length > 0 ? (
            renderChart()
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No comparison data available</p>
                <p className="text-sm">Complete some exams to see how you compare</p>
              </div>
            </div>
          )}

          {/* Percentile Breakdown */}
          {showPercentiles && data.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Performance by Category</h4>
              <div className="space-y-2">
                {data.map((item, index) => (
                  <motion.div
                    key={item.category}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm font-medium text-gray-700">{item.category}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {item.studentScore.toFixed(1)}%
                      </span>
                      <Badge 
                        variant={getPercentileBadge(item.percentile).variant}
                        size="sm"
                      >
                        {item.percentile.toFixed(0)}th
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}