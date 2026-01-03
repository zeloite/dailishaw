import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'dark' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  children: React.ReactNode
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  className = '',
  disabled = false,
  ...props
}) => {
  const baseStyles = 'rounded-full inline-flex items-center justify-center text-center font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 border border-blue-600 hover:border-blue-700',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 border border-gray-600 hover:border-gray-700',
    dark: 'bg-gray-900 text-white hover:bg-gray-800 border border-gray-900 hover:border-gray-800',
    outline: 'bg-transparent text-gray-900 hover:bg-gray-100 border border-gray-300 hover:border-gray-400'
  }
  
  const sizes = {
    sm: 'py-2 px-4 text-sm',
    md: 'py-3 px-7 text-base',
    lg: 'py-4 px-9 text-lg'
  }
  
  const widthClass = fullWidth ? 'w-full' : ''
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
