import { cn } from '@/lib/utils/styleUtils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function ButtonVar({
  variant = 'primary',
  size = 'md',
  isLoading,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        // Base styles
        'rounded-lg font-medium transition-colors focus:outline-none focus:ring-2',

        // Size variations
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-4 py-2',
        size === 'lg' && 'px-6 py-3 text-lg',

        // Variant styles
        variant === 'primary' && 'bg-primary text-white hover:bg-blue-600',
        variant === 'secondary' && 'bg-gray-500 text-white hover:bg-gray-600',
        variant === 'outline' && 'border-2 border-gray-300 hover:bg-gray-50',

        // State styles
        disabled && 'opacity-50 cursor-not-allowed',
        isLoading && 'opacity-50 cursor-wait',

        // Allow custom classes to override defaults
        className
      )}
      disabled={disabled || isLoading}
      {...props}>
      {children}
    </button>
  );
}
