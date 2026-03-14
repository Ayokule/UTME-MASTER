import { motion } from 'framer-motion'
import { Trophy, Star, Target, BookOpen } from 'lucide-react'
import { ExamScore } from '../../types/results'

interface Props {
  score: ExamScore
  examTitle: string
}

export default function CelebrationHeader({ score, examTitle }: Props) {
  const getCelebrationConfig = (percentage: number) => {
    if (percentage >= 80) {
      return {
        message: "Excellent! 🎉",
        emoji: "🎉",
        gradient: "from-green-500 to-emerald-600",
        textColor: "text-green-50",
        bgGradient: "from-green-50 to-emerald-50",
        icon: Trophy,
        description: "Outstanding performance! You're ready for JAMB!"
      }
    } else if (percentage >= 60) {
      return {
        message: "Great Job! 👍",
        emoji: "👍",
        gradient: "from-blue-500 to-indigo-600",
        textColor: "text-blue-50",
        bgGradient: "from-blue-50 to-indigo-50",
        icon: Star,
        description: "Good work! Keep practicing to reach excellence!"
      }
    } else if (percentage >= 40) {
      return {
        message: "Good Effort 💪",
        emoji: "💪",
        gradient: "from-yellow-500 to-orange-600",
        textColor: "text-yellow-50",
        bgGradient: "from-yellow-50 to-orange-50",
        icon: Target,
        description: "You're making progress! Focus on your weak areas."
      }
    } else {
      return {
        message: "Keep Practicing 📚",
        emoji: "📚",
        gradient: "from-gray-500 to-slate-600",
        textColor: "text-gray-50",
        bgGradient: "from-gray-50 to-slate-50",
        icon: BookOpen,
        description: "Don't give up! Every expert was once a beginner."
      }
    }
  }

  const config = getCelebrationConfig(score.percentage)
  const Icon = config.icon

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${config.gradient} p-8 text-white shadow-2xl`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-4 -right-4 w-32 h-32 rounded-full bg-white/20"></div>
        <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-white/10"></div>
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="flex items-center space-x-4 mb-4"
            >
              <div className="p-3 bg-white/20 rounded-full">
                <Icon className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{config.message}</h1>
                <p className="text-lg opacity-90">{config.description}</p>
              </div>
            </motion.div>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold opacity-90">{examTitle}</h2>
              <div className="flex items-center space-x-6 text-sm opacity-80">
                <span>Time taken: {formatTime(score.timeTaken)}</span>
                <span>•</span>
                <span>Status: {score.passed ? 'PASSED' : 'FAILED'}</span>
                <span>•</span>
                <span>Grade: {score.grade}</span>
              </div>
            </div>
          </div>

          {/* Score Display */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.4, type: "spring" }}
            className="text-center"
          >
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-4xl font-bold mb-2">
                {score.total}/{score.max}
              </div>
              <div className="text-2xl font-semibold mb-1">
                {Math.round(score.percentage)}%
              </div>
              <div className="text-sm opacity-80">
                Your Score
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Animated Particles */}
      {score.percentage >= 80 && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full"
              initial={{ 
                x: Math.random() * 100 + '%', 
                y: '100%',
                opacity: 0 
              }}
              animate={{ 
                y: '-10%',
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 3,
                delay: i * 0.5,
                repeat: Infinity,
                repeatDelay: 2
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}