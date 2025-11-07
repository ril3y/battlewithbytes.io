'use client';

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ContextMenuOption } from '../types';
import './context-menu.css';

interface ContextMenuProps {
  x: number;
  y: number;
  options: ContextMenuOption[];
  onClose: () => void;
  // Optional: To adjust menu position if it overflows viewport
  // We can add more sophisticated viewport collision detection later if needed
  containerRef?: React.RefObject<HTMLElement | null>; 
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, options, onClose, containerRef }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  let adjustedX = x;
  let adjustedY = y;

  // Basic viewport collision adjustment
  if (menuRef.current) {
    const menuRect = menuRef.current.getBoundingClientRect();
    const container = containerRef?.current ?? document.documentElement; // Use documentElement as fallback
    const containerRect = container.getBoundingClientRect();

    // Adjust X if menu overflows right edge of container
    if (x + menuRect.width > containerRect.right) {
      adjustedX = containerRect.right - menuRect.width - 5; // 5px buffer
    }
    // Adjust X if menu overflows left edge of container (less common for context menus)
    if (x < containerRect.left) {
      adjustedX = containerRect.left + 5; // 5px buffer
    }

    // Adjust Y if menu overflows bottom edge of container
    if (y + menuRect.height > containerRect.bottom) {
      adjustedY = containerRect.bottom - menuRect.height - 5; // 5px buffer
    }
    // Adjust Y if menu overflows top edge of container
    if (y < containerRect.top) {
      adjustedY = containerRect.top + 5; // 5px buffer
    }
  }

  const menuContent = (
    <div
      ref={menuRef}
      className="context-menu-container"
      style={{
        top: `${adjustedY}px`,
        left: `${adjustedX}px`,
      }}
      // Prevent context menu from triggering another context menu if right-clicked on itself
      onContextMenu={(e) => e.preventDefault()} 
    >
      <ul className="context-menu-list">
        {options.map((option, index) => (
          <li key={index}>
            <button
              type="button"
              className={`context-menu-option ${
                option.danger ? 'danger' : ''
              } ${option.disabled ? 'disabled' : ''}`}
              onClick={() => {
                if (!option.disabled) {
                  option.action();
                  onClose(); // Close menu after action
                }
              }}
              disabled={option.disabled}
            >
              {option.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
  
  // Use createPortal to render the menu directly to document.body
  // This prevents any positioning or z-index issues within the React Flow canvas
  return createPortal(menuContent, document.body);
};
