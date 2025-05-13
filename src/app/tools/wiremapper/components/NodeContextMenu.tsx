'use client';

import React, { useEffect, useRef } from 'react';

interface ContextMenuProps {
  x: number;
  y: number;
  options: { label: string; action: () => void; danger?: boolean }[];
  onClose: () => void;
}

export const NodeContextMenu: React.FC<ContextMenuProps> = ({ x, y, options, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Close menu when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Adjust position if menu would overflow viewport
  const position = {
    left: Math.min(x, window.innerWidth - 180), // 180px = approximate menu width
    top: Math.min(y, window.innerHeight - options.length * 40) // 40px per option
  };

  return (
    <div
      ref={menuRef}
      className="absolute z-50 bg-gray-950 border border-gray-800 shadow-lg rounded overflow-hidden"
      style={{ ...position }}
    >
      <div className="py-1">
        {options.map((option, i) => (
          <div
            key={i}
            className={`px-4 py-2 font-mono text-sm cursor-pointer hover:bg-gray-800 
              ${option.danger ? 'text-red-500' : 'text-green-400'}`}
            onClick={() => {
              option.action();
              onClose();
            }}
          >
            {option.label}
          </div>
        ))}
      </div>
    </div>
  );
};
