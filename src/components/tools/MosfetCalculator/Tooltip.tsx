'use client';

import React, { useState } from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative inline-block w-full">
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="w-full"
      >
        {children}
        {showTooltip && (
          <div className="absolute z-10 p-2 mt-1 text-sm text-white bg-gray-800 rounded-md shadow-lg max-w-xs border border-gray-700 left-0 right-0">
            {text}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tooltip;
