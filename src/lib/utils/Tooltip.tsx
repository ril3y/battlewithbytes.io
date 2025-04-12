'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

// Create a global state to track the active tooltip
let activeTooltipId: string | null = null;

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
  const tooltipId = useRef(`tooltip-${Math.random().toString(36).substr(2, 9)}`).current;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
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

  const handleShowTooltip = () => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set a timeout to show the tooltip
    timeoutRef.current = setTimeout(() => {
      // Close any other open tooltips
      if (activeTooltipId && activeTooltipId !== tooltipId) {
        // This will trigger a re-render for any other open tooltip
        document.dispatchEvent(new CustomEvent('closeOtherTooltips', {
          detail: { currentTooltipId: tooltipId }
        }));
      }
      
      // Set this as the active tooltip
      activeTooltipId = tooltipId;
      setShowTooltip(true);
    }, 500); // 500ms delay
  };
  
  const handleHideTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (activeTooltipId === tooltipId) {
      activeTooltipId = null;
    }
    
    setShowTooltip(false);
  }, [tooltipId]);
  
  // Add event listeners for focus, blur, and keyboard events
  useEffect(() => {
    const handleFocus = () => {
      checkChildFocus();
    };
    
    const handleKeyDown = () => {
      handleHideTooltip();
    };
    
    const handleCloseOtherTooltips = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail.currentTooltipId !== tooltipId) {
        setShowTooltip(false);
      }
    };
    
    document.addEventListener('focusin', handleFocus);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('closeOtherTooltips', handleCloseOtherTooltips as EventListener);
    
    // Clean up event listeners on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('closeOtherTooltips', handleCloseOtherTooltips as EventListener);
      
      // Clear active tooltip if this component is unmounted while active
      if (activeTooltipId === tooltipId) {
        activeTooltipId = null;
      }
    };
  }, [tooltipId, handleHideTooltip]);

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
        onMouseEnter={handleShowTooltip}
        onMouseLeave={handleHideTooltip}
        onFocus={() => handleHideTooltip()}
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
