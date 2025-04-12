'use client';

import React, { useState, useRef, useEffect } from 'react';

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
  const childRef = useRef<HTMLDivElement>(null);
  
  // Function to check if child contains an input element that has focus
  const checkChildFocus = () => {
    if (childRef.current) {
      const inputs = childRef.current.querySelectorAll('input, textarea, select');
      const hasFocusedInput = Array.from(inputs).some(input => document.activeElement === input);
      if (hasFocusedInput) {
        setShowTooltip(false);
      }
    }
  };
  
  // Add event listeners for focus and blur events
  useEffect(() => {
    const handleFocus = () => {
      checkChildFocus();
    };
    
    const handleKeyDown = () => {
      setShowTooltip(false);
    };
    
    document.addEventListener('focusin', handleFocus);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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
        ref={childRef}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(false)}
        className="w-full"
      >
        {children}
        {showTooltip && (
          <div 
            className={`
              absolute z-50 p-2 text-sm font-mono
              bg-[#0a0a0a] text-[#ededed]
              rounded-md max-w-xs backdrop-blur-sm
              animate-fadeIn
              ${positionClasses[position]} ${className}
            `}
            style={{
              boxShadow: '0 0 10px rgba(0, 136, 255, 0.4), 0 0 20px rgba(0, 255, 157, 0.2)',
              border: '1px solid #0088ff',
              borderLeft: '3px solid #00ff9d',
              backgroundImage: 'linear-gradient(135deg, rgba(0, 136, 255, 0.05) 25%, transparent 25%, transparent 50%, rgba(0, 136, 255, 0.05) 50%, rgba(0, 136, 255, 0.05) 75%, transparent 75%, transparent)',
              backgroundSize: '20px 20px',
              animation: 'fadeIn 0.2s ease-in-out'
            }}
          >
            <div className="relative z-10">
              {text}
              <span className="absolute -bottom-1 -right-1 h-2 w-2 bg-[#00ff9d]" style={{ clipPath: 'polygon(100% 0, 0% 100%, 100% 100%)' }}></span>
            </div>
            <style jsx>{`
              @keyframes fadeIn {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
              }
            `}</style>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tooltip;
