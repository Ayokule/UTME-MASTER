import { HTMLAttributes, forwardRef } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'glass'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  hover?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className = '', 
    variant = 'default', 
    padding = 'md', 
    hover = false,
    children, 
    ...props 
  }, ref) => {
    const baseClasses = 'rounded-2xl transition-all duration-300'
    
    const variants = {
      default: 'bg-white border border-gray-100 shadow-soft',
      elevated: 'bg-white shadow-medium',
      outlined: 'bg-white border-2 border-gray-200',
      glass: 'bg-white/80 backdrop-blur-sm border border-white/20 shadow-soft'
    }
    
    const paddings = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-10'
    }
    
    const hoverClasses = hover ? 'hover:shadow-strong hover:scale-[1.02] cursor-pointer' : ''
    
    return (
      <div
        ref={ref}
        className={`${baseClasses} ${variants[variant]} ${paddings[padding]} ${hoverClasses} ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

// Card sub-components
interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex flex-col space-y-1.5 p-6 ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)

CardHeader.displayName = 'CardHeader'

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

const CardTitle = forwardRef<HTMLParagraphElement, CardTitleProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={`text-2xl font-semibold leading-none tracking-tight ${className}`}
        {...props}
      >
        {children}
      </h3>
    )
  }
)

CardTitle.displayName = 'CardTitle'

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`p-6 pt-0 ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)

CardContent.displayName = 'CardContent'

export default Card
export { Card, CardHeader, CardTitle, CardContent }