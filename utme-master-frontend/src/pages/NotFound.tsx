import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertCircle, Home, ArrowLeft } from 'lucide-react'
import Button from '../components/ui/Button'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        {/* 404 Illustration */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="inline-block"
          >
            <div className="w-24 h-24 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-12 h-12 text-primary-600" />
            </div>
          </motion.div>
        </div>

        {/* Error Code */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-6"
        >
          <h1 className="text-6xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-2">
            404
          </h1>
          <p className="text-2xl font-bold text-gray-900 mb-2">
            Page Not Found
          </p>
          <p className="text-gray-600">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </motion.div>

        {/* Suggestions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8"
        >
          <p className="text-sm text-blue-900 font-medium mb-2">
            Here are some helpful links:
          </p>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Check the URL for typos</li>
            <li>• Go back to the previous page</li>
            <li>• Return to the home page</li>
            <li>• Contact support if you need help</li>
          </ul>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>

          <Button
            onClick={() => navigate('/')}
            className="w-full bg-gradient-to-r from-primary-600 to-secondary-600"
          >
            <Home className="w-4 h-4 mr-2" />
            Go to Home
          </Button>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xs text-gray-500 text-center mt-8"
        >
          Error Code: 404 | Page Not Found
        </motion.p>
      </motion.div>
    </div>
  )
}
