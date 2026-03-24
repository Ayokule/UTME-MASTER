import { memo } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import Card from '../ui/Card'
import { StatCardProps } from '../../types/dashboard'

const StatCard = memo(function StatCard({ icon, label, value, change, trend }: StatCardProps) {
  const trendIcon =
    !change ? null :
    trend === 'up' ? <TrendingUp className="w-4 h-4 text-green-600" /> :
    trend === 'down' ? <TrendingDown className="w-4 h-4 text-red-600" /> :
    <Minus className="w-4 h-4 text-gray-400" />

  const trendColor =
    trend === 'up' ? 'text-green-600' :
    trend === 'down' ? 'text-red-600' :
    'text-gray-500'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
    >
      <Card className="p-6 hover:shadow-lg transition-all duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-xl">
              <div className="text-primary-600">
                {typeof icon === 'object' && icon !== null ? icon : null}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
          </div>

          {change && (
            <div className={`flex items-center space-x-1 ${trendColor}`}>
              {trendIcon}
              <span className="text-sm font-medium">{change}</span>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  )
})

export default StatCard
