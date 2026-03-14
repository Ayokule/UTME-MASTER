import { motion } from 'framer-motion'
import { Crown, Star, TrendingUp, Target, Clock, Award } from 'lucide-react'
import Card from '../ui/Card'
import Button from '../ui/Button'

interface Props {
  onUpgrade: () => void
}

export default function PremiumUpgrade({ onUpgrade }: Props) {
  const premiumFeatures = [
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: "Predicted JAMB Score",
      description: "AI-powered score prediction based on your performance"
    },
    {
      icon: <Target className="w-5 h-5" />,
      title: "Detailed Topic Breakdown", 
      description: "See exactly which topics need more attention"
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: "Time Management Insights",
      description: "Optimize your exam timing and speed"
    },
    {
      icon: <Award className="w-5 h-5" />,
      title: "Percentile Ranking",
      description: "Compare your performance with other students"
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.8 }}
    >
      <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Unlock Advanced Analytics
          </h3>
          <p className="text-gray-600">
            Get deeper insights into your performance and accelerate your learning
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {premiumFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
              className="flex items-start space-x-3 p-3 bg-white rounded-lg"
            >
              <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                {feature.icon}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">
                  {feature.title}
                </h4>
                <p className="text-xs text-gray-600">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Star className="w-4 h-4 text-amber-500 fill-current" />
            <span className="text-sm font-medium text-gray-700">
              Join 10,000+ premium students
            </span>
            <Star className="w-4 h-4 text-amber-500 fill-current" />
          </div>
          
          <Button
            onClick={onUpgrade}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <Crown className="w-4 h-4 mr-2" />
            Upgrade to Premium
          </Button>
          
          <p className="text-xs text-gray-500 mt-2">
            Starting from ₦2,000/month • Cancel anytime
          </p>
        </div>
      </Card>
    </motion.div>
  )
}