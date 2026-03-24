import { memo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, Award, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import { RecentActivity as RecentActivityType } from '../../types/dashboard'

interface Props {
  activities: RecentActivityType[]
}

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })

const getScoreColor = (percentage: number) =>
  percentage >= 80 ? 'text-green-600' : percentage >= 60 ? 'text-yellow-600' : 'text-red-600'

const StatusBadge = memo(function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'COMPLETED': return <Badge variant="success">Completed</Badge>
    case 'IN_PROGRESS': return <Badge variant="warning">In Progress</Badge>
    case 'ABANDONED': return <Badge variant="error">Abandoned</Badge>
    default: return <Badge variant="secondary">{status}</Badge>
  }
})

const RecentActivity = memo(function RecentActivity({ activities }: Props) {
  const navigate = useNavigate()

  const handleViewResults = useCallback(
    (id: string) => navigate(`/student/results/${id}`),
    [navigate]
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
    >
      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Recent Activity</h3>
          <p className="text-sm text-gray-600">Your latest exam attempts</p>
        </div>

        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Award className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No recent activity</p>
            <p className="text-sm">Start taking exams to see your activity here</p>
            <Button className="mt-4" onClick={() => navigate('/student/subjects')}>
              Take Your First Exam
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Award className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">{activity.exam_title}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(activity.date)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{activity.subjects.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className={`text-lg font-bold ${getScoreColor(activity.percentage)}`}>
                      {activity.percentage}%
                    </p>
                    <p className="text-sm text-gray-600">{activity.score} points</p>
                  </div>
                  <StatusBadge status={activity.status} />
                  {activity.status === 'COMPLETED' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewResults(activity.id)}
                      className="flex items-center space-x-1"
                    >
                      <span>View</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </motion.div>
  )
})

export default RecentActivity
