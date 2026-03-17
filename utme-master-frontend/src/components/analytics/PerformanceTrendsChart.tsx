import React from 'react'
import { motion } from 'framer-motion'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
  Bar,
  Legend
} from 'recharts'
import { TrendingUp, TrendingDown, Calendar, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Badge } from '../ui/Badge'

interface PerformanceData {
  date: string
  score: number
  percentage: number
  timeSpent: number
  examCount: number
  subject?: string
  difficulty?: string
}

interface Props {
  data: PerformanceData[]
  title?: string
  timeRange?: 'week' | 'month' | 'quarter' | 'year'
  showComparison?: boolean
  comparisonData?: PerformanceData[]
  type?: 'line' | 'area' | 'composed'
}

export default function PerformanceTrendsChart({ 
  data, 
  title = "Performance Trends",
  timeRange = 'month',
  showComparison = false,
  comparisonData = [],
  type = 'line'
}: Props) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    switch (timeRange) {
      case 'week':
        return date.toLocaleDateString('en-US', { weekday: 'short' })
      case 'month':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      case 'quarter':
        return date.toLocaleDateString('en-US', { month: 'short' })
      case 'year':
        return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      default:
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  const calculateTrend = (data: PerformanceData[]) => {
    if (data.length < 2) return 0
    const recent = data.slice(-3).reduce((sum, item) => sum + item.percentage, 0) / Math.min(3, data.length)
    const older = data.slice(0, 3).reduce((sum, item) => sum + item.percentage, 0) / Math.min(3, data.length)
    return recent - older
  }

  const trend = calculateTrend(data)
  const averageScore = data.length > 0 ? data.reduce((sum, item) => sum + item.percentage, 0) / data.length : 0
  const totalExams = data.reduce((sum, item) => sum + item.examCount, 0)
  const totalTime = data.reduce((sum, item) => sum + item.timeSpent, 0)

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const renderChart = () => {
    const chartData = showComparison && comparisonData.length > 0 
      ? data.map((item, index) => ({
          ...item,
          comparisonScore: comparisonData[index]?.percentage || 0
        }))
      : data

    switch (type) {
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                </linearGradient>
                {showComparison && (
                  <linearGradient id="colorComparison" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                  </linearGradient>
                )}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                fontSize={12}
                stroke="#6B7280"
              />
              <YAxis 
                fontSize={12}
                stroke="#6B7280"
                domain={[0, 100]}
              />
              <Tooltip 
                labelFormatter={(value) => formatDate(value as string)}
                formatter={(value: number, name: string) => [
                  `${value.toFixed(1)}%`,
                  name === 'percentage' ? 'Current Performance' : 'Previous Performance'
                ]}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="percentage" 
                stroke="#3B82F6" 
                fillOpacity={1} 
                fill="url(#colorScore)"
                strokeWidth={2}
              />
              {showComparison && (
                <Area 
                  type="monotone" 
                  dataKey="comparisonScore" 
                  stroke="#10B981" 
                  fillOpacity={1} 
                  fill="url(#colorComparison)"
                  strokeWidth={2}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )

      case 'composed':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                fontSize={12}
                stroke="#6B7280"
              />
              <YAxis 
                yAxisId="left"
                fontSize={12}
                stroke="#6B7280"
                domain={[0, 100]}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right"
                fontSize={12}
                stroke="#6B7280"
              />
              <Tooltip 
                labelFormatter={(value) => formatDate(value as string)}
                formatter={(value: number, name: string) => {
                  if (name === 'percentage') return [`${value.toFixed(1)}%`, 'Performance']
                  if (name === 'examCount') return [value, 'Exams Taken']
                  if (name === 'timeSpent') return [formatTime(value), 'Time Spent']
                  return [value, name]
                }}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Bar 
                yAxisId="right"
                dataKey="examCount" 
                fill="#E5E7EB" 
                name="Exams Taken"
                radius={[2, 2, 0, 0]}
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="percentage" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                name="Performance %"
              />
            </ComposedChart>
          </ResponsiveContainer>
        )

      default: // line chart
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                fontSize={12}
                stroke="#6B7280"
              />
              <YAxis 
                fontSize={12}
                stroke="#6B7280"
                domain={[0, 100]}
              />
              <Tooltip 
                labelFormatter={(value) => formatDate(value as string)}
                formatter={(value: number, name: string) => [
                  `${value.toFixed(1)}%`,
                  name === 'percentage' ? 'Current Performance' : 'Previous Performance'
                ]}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="percentage" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2, fill: 'white' }}
              />
              {showComparison && (
                <Line 
                  type="monotone" 
                  dataKey="comparisonScore" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                />
              )}
            </LineChart>
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
              <BarChart3 className="h-5 w-5" />
              {title}
            </CardTitle>
            <div className="flex items-center gap-2">
              {trend > 0 ? (
                <Badge variant="success" className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +{trend.toFixed(1)}%
                </Badge>
              ) : trend < 0 ? (
                <Badge variant="error" className="flex items-center gap-1">
                  <TrendingDown className="h-3 w-3" />
                  {trend.toFixed(1)}%
                </Badge>
              ) : (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Stable
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{averageScore.toFixed(1)}%</div>
              <div className="text-sm text-blue-600">Average Score</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{totalExams}</div>
              <div className="text-sm text-green-600">Total Exams</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{formatTime(totalTime)}</div>
              <div className="text-sm text-purple-600">Study Time</div>
            </div>
          </div>

          {/* Chart */}
          {data.length > 0 ? (
            renderChart()
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No performance data available</p>
                <p className="text-sm">Complete some exams to see your trends</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}