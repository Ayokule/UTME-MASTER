import { AlertCircle, RefreshCw } from 'lucide-react'
import Button from './Button'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
  className?: string
}

export default function ErrorState({
  message = 'Something went wrong. Please try again.',
  onRetry,
  className = ''
}: ErrorStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load</h3>
      <p className="text-gray-500 text-sm mb-6 max-w-sm">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          onClick={onRetry}
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Try again
        </Button>
      )}
    </div>
  )
}
