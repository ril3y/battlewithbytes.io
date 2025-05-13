'use client';

import React from 'react';

interface ContextMenuProps {
  x: number;
  y: number;
  options: { label: string; action: () => void; danger?: boolean }[];
  onClose: () => void;
}

const ContextMenu = React.forwardRef<HTMLDivElement, ContextMenuProps>(({ x, y, options, onClose }, ref) => {

  const handleBackgroundClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // If the click target is the menu background itself (not an option item)
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // Adjust position if menu would overflow viewport
  const position = {
    left: Math.min(x, window.innerWidth - 180), // 180px = approximate menu width
    top: Math.min(y, window.innerHeight - (options.length * 30 + 20)), // 30px per item + padding
  };

  return (
    <div
      ref={ref}
      className="absolute z-50 bg-gray-950 border border-gray-800 shadow-lg rounded overflow-hidden context-menu-container"
      style={{ ...position }}
      onClick={handleBackgroundClick} // Add this onClick handler
    >
      <ul className="py-1">
        {options.map((option, index) => (
          <li
            key={index}
            className={`px-4 py-2 hover:bg-gray-700 cursor-pointer ${option.danger ? 'text-red-500 hover:text-red-400' : 'text-gray-300 hover:text-white'}`}
            onClick={(e) => { // Keep this onClick for items
              // e.stopPropagation(); // Prevent click from bubbling to the parent div's handler if desired, but likely not needed here
              option.action();
              // onClose(); // Action should generally handle closing if needed, or let the parent handle it if click is outside.
                         // For this case, the action items don't need to call onClose explicitly.
            }}
          >
            {option.label}
          </li>
        ))}
      </ul>
    </div>
  );
});

ContextMenu.displayName = 'ContextMenu'; // Add display name for debugging

export default ContextMenu;
