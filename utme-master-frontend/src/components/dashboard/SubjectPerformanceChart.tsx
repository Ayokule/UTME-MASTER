import { memo, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'
import Card from '../ui/Card'
import { SubjectPerformance } from '../../types/dashboard'

interface Props {
  data: SubjectPerformance[]
}

const SUBJECT_COLORS: Record<string, string> = {
  'Mathematics': '#ef4444',
  'English': '#3b82f6',
  'Physics': '#8b5cf6',
  'Chemistry': '#10b981',
  'Biology': '#f59e0b',
  'Literature': '#ec4899',
  'Government': '#6366f1',
  'Economics': '#14b8a6',
  'Geography': '#f97316',
  'History': '#84cc16'
}

// Defined outside component — never recreated on re-render
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
      <p className="font-semibold text-gray-900">{label}</p>
      <p className="text-sm text-gray-600">
        Average Score: <span className="font-medium text-primary-600">{d.score}%</span>
      </p>
      <p className="text-sm text-gray-600">
        Tests Taken: <span className="font-medium">{d.tests}</span>
      </p>
    </div>
  )
}

const SubjectPerformanceChart = memo(function SubjectPerformanceChart({ data }: Props) {
  const chartData = useMemo(
    () => data.map(item => ({
      ...item,
      color: SUBJECT_COLORS[item.subject] ?? '#6b7280'
    })),
    [data]
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Subject Performance</h3>
          <p className="text-sm text-gray-600">Average scores across different subjects</p>
        </div>

        {data.length === 0 ? (
          <div className="flex items-center justify-center h-80 text-gray-500">
            <div className="text-center">
              <p className="text-lg font-medium mb-2">No performance data yet</p>
              <p className="text-sm">Take some exams to see your subject performance</p>
            </div>
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                  label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar
                  dataKey="score"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                  className="hover:opacity-80 transition-opacity"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </motion.div>
  )
})

export default SubjectPerformanceChart
