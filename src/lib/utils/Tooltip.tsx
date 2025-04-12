'use client';

import React, { useState } from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

/**
 * A reusable tooltip component that can be used across different tools
 * 
 * @param text The tooltip text to display
 * @param children The element that the tooltip will be attached to
 * @param position The position of the tooltip relative to the element (default: 'top')
 * @param className Additional CSS classes to apply to the tooltip
 */
const Tooltip: React.FC<TooltipProps> = ({ 
  text, 
  children, 
  position = 'top',
  className = ''
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // Position-specific classes
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  return (
    <div className="relative inline-block w-full">
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="w-full"
      >
        {children}
        {showTooltip && (
          <div 
            className={`absolute z-50 p-2 text-sm text-white bg-gray-800 rounded-md shadow-lg max-w-xs border border-gray-700 ${positionClasses[position]} ${className}`}
          >
            {text}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tooltip;
