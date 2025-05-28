import React from 'react';
import { cn } from '@/lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helpText?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helpText, options, id, ...props }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    
    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={selectId} 
            className="block text-sm font-medium mb-2 font-mono text-green-400"
          >
            {label}
          </label>
        )}
        <select
          id={selectId}
          className={cn(
            'w-full px-4 py-3 bg-gray-900/70 border border-gray-700',
            'focus:border-green-400 focus:ring-1 focus:ring-green-400',
            'rounded-md shadow-sm font-mono text-white',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            className
          )}
          ref={ref}
          {...props}
        >
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value} 
              disabled={option.disabled}
              className="bg-gray-900 text-white"
            >
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1 text-sm text-red-400 font-mono">{error}</p>
        )}
        {helpText && !error && (
          <p className="mt-1 text-sm text-gray-400 font-mono">{helpText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };