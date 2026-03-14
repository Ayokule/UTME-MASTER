import { HTMLAttributes } from 'react'

interface LoadingSkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  lines?: number
}

export default function LoadingSkeleton({ 
  variant = 'text', 
  width, 
  height, 
  lines = 1,
  className = '',
  ...props 
}: LoadingSkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-200 rounded'
  
  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`} {...props}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} h-4`}
            style={{
              width: index === lines - 1 ? '75%' : '100%'
            }}
          />
        ))}
      </div>
    )
  }
  
  const variants = {
    text: 'h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg'
  }
  
  const style: React.CSSProperties = {}
  if (width) style.width = width
  if (height) style.height = height
  
  return (
    <div
      className={`${baseClasses} ${variants[variant]} ${className}`}
      style={style}
      {...props}
    />
  )
}

// Preset skeleton components
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100">
      <div className="animate-pulse">
        <div className="flex items-center space-x-4 mb-4">
          <LoadingSkeleton variant="circular" width={48} height={48} />
          <div className="flex-1">
            <LoadingSkeleton width="60%" height={16} className="mb-2" />
            <LoadingSkeleton width="40%" height={12} />
          </div>
        </div>
        <LoadingSkeleton lines={3} className="mb-4" />
        <div className="flex space-x-2">
          <LoadingSkeleton width={80} height={32} className="rounded-lg" />
          <LoadingSkeleton width={100} height={32} className="rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <LoadingSkeleton width="30%" height={24} />
      </div>
      <div className="divide-y divide-gray-100">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="p-6 animate-pulse">
            <div className="flex items-center space-x-4">
              <LoadingSkeleton variant="circular" width={40} height={40} />
              <div className="flex-1 grid grid-cols-4 gap-4">
                <LoadingSkeleton height={16} />
                <LoadingSkeleton height={16} />
                <LoadingSkeleton height={16} />
                <LoadingSkeleton width="60%" height={16} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}