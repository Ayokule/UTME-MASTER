import { memo, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'
import Card from '../ui/Card'
import { ProgressPoint } from '../../types/dashboard'

interface Props {
  data: ProgressPoint[]
}

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

// Defined outside component — stable reference, no re-creation on render
const ChartTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
      <p className="font-semibold text-gray-900">{formatDate(d.date)}</p>
      <p className="text-sm text-gray-600">
        Score: <span className="font-medium text-primary-600">{d.score}%</span>
      </p>
      {d.exam_title && <p className="text-sm text-gray-600 mt-1">{d.exam_title}</p>}
    </div>
  )
}

const ProgressChart = memo(function ProgressChart({ data }: Props) {
  const chartData = useMemo(
    () => data.map(point => ({ ...point, formattedDate: formatDate(point.date) })),
    [data]
  )

  const { averageScore, trend } = useMemo(() => {
    if (data.length === 0) return { averageScore: 0, trend: 'neutral' as const }
    const avg = Math.round(data.reduce((s, p) => s + p.score, 0) / data.length)
    if (data.length < 2) return { averageScore: avg, trend: 'neutral' as const }
    const recent = data.slice(-3).reduce((s, p) => s + p.score, 0) / Math.min(3, data.length)
    const earlier = data.slice(0, -3).reduce((s, p) => s + p.score, 0) / Math.max(1, data.length - 3)
    const t = recent > earlier + 2 ? 'improving' : recent < earlier - 2 ? 'declining' : 'stable'
    return { averageScore: avg, trend: t as 'improving' | 'declining' | 'stable' }
  }, [data])

  const trendColor = trend === 'improving' ? 'text-green-600' : trend === 'declining' ? 'text-red-600' : 'text-gray-600'
  const trendMsg = {
    improving: '📈 Your scores are improving!',
    declining: '📉 Focus on weak areas',
    stable: '📊 Consistent performance',
    neutral: '📊 No trend data yet'
  }[trend]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      <Card className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Progress Over Time</h3>
              <p className="text-sm text-gray-600">Your score trend in recent exams</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{averageScore}%</p>
              <p className={`text-sm font-medium ${trendColor}`}>{trendMsg}</p>
            </div>
          </div>
        </div>

        {data.length === 0 ? (
          <div className="flex items-center justify-center h-80 text-gray-500">
            <div className="text-center">
              <p className="text-lg font-medium mb-2">No progress data yet</p>
              <p className="text-sm">Complete a few exams to track your progress</p>
            </div>
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="formattedDate" tick={{ fontSize: 12 }} />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ fill: '#6366f1', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: '#6366f1', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </motion.div>
  )
})

export default ProgressChart
