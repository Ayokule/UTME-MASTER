import React from 'react'
import { motion } from 'framer-motion'
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Clock, 
  BookOpen, 
  Award,
  Star,
  Zap,
  CheckCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Progress } from '../ui/Progress'

// Simple circular progress component
const CircularProgress = ({ 
  value, 
  size = 120, 
  strokeWidth = 8, 
  color = '#3B82F6',
  children 
}: {
  value: number
  size?: number
  strokeWidth?: number
  color?: string
  children?: React.ReactNode
}) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (value / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  )
}

interface ProgressData {
  overall: number
  subjects: Array<{
    name: string
    progress: number
    target: number
    color: string
  }>
  achievements: Array<{
    title: string
    description: string
    progress: number
    target: number
    icon: string
    unlocked: boolean
  }>
  streaks: {
    current: number
    longest: number
    target: number
  }
  goals: Array<{
    title: string
    current: number
    target: number
    unit: string
    color: string
  }>
}

interface Props {
  data: ProgressData
  animated?: boolean
  showAchievements?: boolean
  showGoals?: boolean
}

export default function VisualProgressIndicators({ 
  data, 
  animated = true,
  showAchievements = true,
  showGoals = true
}: Props) {
  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: React.ComponentType<any> } = {
      trophy: Trophy,
      target: Target,
      trending: TrendingUp,
      clock: Clock,
      book: BookOpen,
      award: Award,
      star: Star,
      zap: Zap,
      check: CheckCircle
    }
    return icons[iconName] || Target
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return '#10B981' // green
    if (progress >= 70) return '#3B82F6' // blue
    if (progress >= 50) return '#F59E0B' // yellow
    return '#EF4444' // red
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Overall Progress Circle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Overall Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center">
            <CircularProgress 
              value={data.overall} 
              size={192} 
              strokeWidth={12}
              color={getProgressColor(data.overall)}
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {data.overall.toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600">Complete</div>
              </div>
            </CircularProgress>
          </div>
        </CardContent>
      </Card>
      {/* Subject Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Subject Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.subjects.map((subject, index) => (
              <motion.div
                key={subject.name}
                initial={animated ? { opacity: 0, scale: 0.8 } : {}}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <CircularProgress 
                  value={subject.progress} 
                  size={96} 
                  strokeWidth={8}
                  color={subject.color}
                >
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {subject.progress.toFixed(0)}%
                    </div>
                  </div>
                </CircularProgress>
                <h4 className="font-medium text-gray-900">{subject.name}</h4>
                <p className="text-sm text-gray-600">
                  Target: {subject.target}%
                </p>
                <div className="mt-2">
                  <Progress 
                    value={subject.progress} 
                    max={subject.target}
                    className="h-2"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Study Streak */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Study Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <CircularProgress 
                value={(data.streaks.current / data.streaks.target) * 100} 
                size={80} 
                strokeWidth={6}
                color="#F59E0B"
              >
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">
                    {data.streaks.current}
                  </div>
                </div>
              </CircularProgress>
              <h4 className="font-medium text-gray-900 mt-3">Current Streak</h4>
              <p className="text-sm text-gray-600">days</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-3 flex items-center justify-center bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full">
                <Trophy className="h-8 w-8 text-yellow-600" />
              </div>
              <h4 className="font-medium text-gray-900">Longest Streak</h4>
              <p className="text-2xl font-bold text-yellow-600">{data.streaks.longest}</p>
              <p className="text-sm text-gray-600">days</p>
            </div>
            
            <div className="text-center">
              <CircularProgress 
                value={(data.streaks.current / data.streaks.target) * 100} 
                size={80} 
                strokeWidth={6}
                color="#10B981"
              >
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">
                    {data.streaks.target}
                  </div>
                </div>
              </CircularProgress>
              <h4 className="font-medium text-gray-900 mt-3">Target Streak</h4>
              <p className="text-sm text-gray-600">days</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      {showAchievements && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.achievements.map((achievement, index) => {
                const IconComponent = getIconComponent(achievement.icon)
                const progressPercentage = (achievement.progress / achievement.target) * 100
                
                return (
                  <motion.div
                    key={achievement.title}
                    initial={animated ? { opacity: 0, y: 20 } : {}}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      achievement.unlocked 
                        ? 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        achievement.unlocked 
                          ? 'bg-yellow-100 text-yellow-600' 
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-medium ${
                            achievement.unlocked ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            {achievement.title}
                          </h4>
                          {achievement.unlocked && (
                            <Badge variant="success" size="sm">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Unlocked
                            </Badge>
                          )}
                        </div>
                        <p className={`text-sm mb-2 ${
                          achievement.unlocked ? 'text-gray-600' : 'text-gray-400'
                        }`}>
                          {achievement.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={progressPercentage} 
                            className="h-2 flex-1"
                          />
                          <span className="text-xs text-gray-500">
                            {achievement.progress}/{achievement.target}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Goals */}
      {showGoals && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Current Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.goals.map((goal, index) => {
                const progressPercentage = (goal.current / goal.target) * 100
                
                return (
                  <motion.div
                    key={goal.title}
                    initial={animated ? { opacity: 0, x: -20 } : {}}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{goal.title}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          {goal.current} / {goal.target} {goal.unit}
                        </span>
                        <Badge 
                          variant={progressPercentage >= 100 ? 'success' : 'secondary'}
                          size="sm"
                        >
                          {progressPercentage.toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                    <Progress 
                      value={progressPercentage} 
                      className="h-3"
                    />
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  )
}