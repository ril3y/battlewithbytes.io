import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center rounded-full font-mono font-medium';
    
    const variants = {
      default: 'bg-gray-800 text-gray-300 border border-gray-700',
      primary: 'bg-green-600/20 text-green-400 border border-green-600/30',
      secondary: 'bg-blue-600/20 text-blue-400 border border-blue-600/30',
      success: 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30',
      warning: 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/30',
      danger: 'bg-red-600/20 text-red-400 border border-red-600/30'
    };
    
    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-3 py-1 text-sm',
      lg: 'px-4 py-1.5 text-base'
    };
    
    return (
      <div
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };