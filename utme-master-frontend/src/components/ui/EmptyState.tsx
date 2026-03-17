import { ReactNode } from 'react'
import { BookOpen, Users, FileText, BarChart3, AlertCircle } from 'lucide-react'
import Button from './Button'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary'
  }
  variant?: 'default' | 'error' | 'success' | 'warning'
}

export default function EmptyState({ 
  icon, 
  title, 
  description, 
  action,
  variant = 'default'
}: EmptyStateProps) {
  const variants = {
    
    default: {
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-400',
      titleColor: 'text-gray-900',
      descColor: 'text-gray-600'
    },
    error: {
      iconBg: 'bg-error-100',
      iconColor: 'text-error-500',
      titleColor: 'text-error-900',
      descColor: 'text-error-600'
    },
    success: {
      iconBg: 'bg-success-100',
      iconColor: 'text-success-500',
      titleColor: 'text-success-900',
      descColor: 'text-success-600'
    },
    warning: {
      iconBg: 'bg-warning-100',
      iconColor: 'text-warning-500',
      titleColor: 'text-warning-900',
      descColor: 'text-warning-600'
    }
  }
  
  const colors = variants[variant]
  
  
  return (
    <div className="text-center py-12 px-4 animate-fade-in">
      {/* Icon */}
      <div className={`w-20 h-20 ${colors.iconBg} rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-subtle`}>
        {icon ? (
          <div className={`w-10 h-10 ${colors.iconColor}`}>
            {icon}
          </div>
        ) : (
          <BookOpen className={`w-10 h-10 ${colors.iconColor}`} />
        )}
      </div>
      
      {/* Content */}
      <div className="max-w-md mx-auto">
        <h3 className={`text-xl font-bold ${colors.titleColor} mb-3`}>
          {title}
        </h3>
        <p className={`${colors.descColor} mb-6 leading-relaxed`}>
          {description}
        </p>
        
        {/* Action */}
        {action && (
          <Button
            variant={action.variant || 'primary'}
            onClick={action.onClick}
            className="animate-slide-up"
          >
            {action.label}
          </Button>
        )}
      </div>
    </div>
  )
}

// Preset empty states
export function EmptyQuestions({ onCreateQuestion }: { onCreateQuestion: () => void }) {
  return (
    <EmptyState
      icon={<BookOpen className="w-10 h-10" />}
      title="No questions yet"
      description="Get started by creating your first exam question. You can add multiple choice, true/false, or essay questions."
      action={{
        label: "Create First Question",
        onClick: onCreateQuestion
      }}
    />
  )
}

export function EmptyExams({ onCreateExam }: { onCreateExam: () => void }) {
  return (
    <EmptyState
      icon={<FileText className="w-10 h-10" />}
      title="No exams available"
      description="There are no exams available at the moment. Check back later or contact your administrator."
      action={{
        label: "Refresh",
        onClick: onCreateExam,
        variant: "secondary"
      }}
    />
  )
}

export function EmptyAnalytics() {
  return (
    <EmptyState
      icon={<BarChart3 className="w-10 h-10" />}
      title="No data to display"
      description="Complete some exams to see your performance analytics and progress tracking."
    />
  )
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <EmptyState
      icon={<AlertCircle className="w-10 h-10" />}
      title="Something went wrong"
      description="We encountered an error while loading your data. Please try again or contact support if the problem persists."
      action={{
        label: "Try Again",
        onClick: onRetry,
        variant: "secondary"
      }}
      variant="error"
    />
  )
}
