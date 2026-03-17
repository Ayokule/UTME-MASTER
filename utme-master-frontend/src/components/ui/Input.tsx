import { InputHTMLAttributes, forwardRef } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
  variant?: 'default' | 'filled' | 'outlined'
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className = '', 
    label, 
    error, 
    icon, 
    variant = 'default',
    type = 'text',
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const [isFocused, setIsFocused] = useState(false)
    
    const baseClasses = 'w-full px-4 py-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1'
    
    const variants = {
      default: `border-2 ${error ? 'border-error-500 focus:border-error-500 focus:ring-error-200' : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'} bg-white`,
      filled: `${error ? 'bg-error-50 border-error-200 focus:border-error-500 focus:ring-error-200' : 'bg-gray-50 border-gray-200 focus:border-primary-500 focus:ring-primary-200'} border-2`,
      outlined: `border-2 ${error ? 'border-error-500 focus:border-error-500 focus:ring-error-200' : 'border-gray-400 focus:border-primary-500 focus:ring-primary-200'} bg-transparent`
    }
    
    const inputType = type === 'password' && showPassword ? 'text' : type
    
    return (
      <div className="space-y-2">
        {label && (
          <label className={`block text-sm font-medium transition-colors ${error ? 'text-error-700' : isFocused ? 'text-primary-700' : 'text-gray-700'}`}>
            {label}
          </label>
        )}
        
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
              {icon}
            </div>
          )}
          
          <input
            ref={ref}
            type={inputType}
            className={`${baseClasses} ${variants[variant]} ${icon ? 'pl-10' : ''} ${type === 'password' ? 'pr-10' : ''} ${className}`}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
          
          {type === 'password' && (
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          )}
        </div>
        
        {error && (
          <p className="text-sm text-error-600 animate-slide-down">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input