import { HTMLAttributes, forwardRef } from 'react'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  dot?: boolean
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ 
    className = '', 
    variant = 'primary', 
    size = 'md',
    dot = false,
    children, 
    ...props 
  }, ref) => {
    const baseClasses = 'inline-flex items-center font-medium rounded-full transition-all duration-200'
    
    const variants = {
      success: 'bg-success-100 text-success-800 border border-success-200',
      warning: 'bg-warning-100 text-warning-800 border border-warning-200',
      error: 'bg-error-100 text-error-800 border border-error-200',
      info: 'bg-blue-100 text-blue-800 border border-blue-200',
      primary: 'bg-primary-100 text-primary-800 border border-primary-200',
      secondary: 'bg-secondary-100 text-secondary-800 border border-secondary-200'
    }
    
    const sizes = {
      sm: dot ? 'w-2 h-2' : 'px-2 py-1 text-xs',
      md: dot ? 'w-3 h-3' : 'px-3 py-1 text-sm',
      lg: dot ? 'w-4 h-4' : 'px-4 py-2 text-base'
    }
    
    if (dot) {
      return (
        <span
          ref={ref}
          className={`${baseClasses} rounded-full ${variants[variant]} ${sizes[size]} ${className}`}
          {...props}
        />
      )
    }
    
    return (
      <span
        ref={ref}
        className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'

export default Badge
export { Badge }