import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/styleUtils';

type LoadingSpinnerProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  return (
    <Loader2
      className={cn(
        'animate-spin',
        size === 'sm' && 'w-4 h-4',
        size === 'md' && 'w-6 h-6',
        size === 'lg' && 'w-8 h-8',
        className
      )}
    />
  );
}

// Loading wrapper component for convenient use
export function LoadingSpinnerPage() {
  return (
    <div className='flex items-center justify-center min-h-[200px]'>
      <LoadingSpinner size='lg' className='text-blue-500' />
    </div>
  );
}
