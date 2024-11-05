// src/components/ui/button.tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'primary' | 'secondary' | 'danger';
  size?: 'default' | 'lg';
  icon?: React.ReactNode;
}

export function Button({ 
  children, 
  className = '', 
  variant = 'default',
  size = 'default',
  icon,
  ...props 
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variantStyles = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    danger: 'bg-yellow-600 text-black hover:bg-yellow-700'
  };
  
  const sizeStyles = {
    default: 'h-10 px-4 py-2',
    lg: 'h-12 px-6 py-3'
  };

  return (
    <button 
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
}

export default Button;
