/**
 * Context Menu Component
 *
 * Reusable context menu component for BattleMagic.
 * Provides a clean, accessible right-click menu system.
 */

'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

/**
 * Context menu item definition
 */
export interface ContextMenuItem {
  /** Display label */
  label: string;

  /** Click handler */
  onClick: () => void;

  /** Optional icon (emoji or component) */
  icon?: React.ReactNode;

  /** Whether item is disabled */
  disabled?: boolean;

  /** Separator after this item */
  separator?: boolean;

  /** Keyboard shortcut hint */
  shortcut?: string;

  /** Submenu items */
  submenu?: ContextMenuItem[];
}

/**
 * Context menu props
 */
interface ContextMenuProps {
  /** X position (screen coordinates) */
  x: number;

  /** Y position (screen coordinates) */
  y: number;

  /** Menu items */
  items: ContextMenuItem[];

  /** Callback when menu should close */
  onClose: () => void;

  /** Optional CSS class */
  className?: string;

  /** Z-index for layering */
  zIndex?: number;
}

/**
 * Context Menu Component
 *
 * Features:
 * - Portal rendering for proper layering
 * - Keyboard navigation
 * - Submenu support
 * - Auto-positioning to stay on screen
 * - Click-outside detection
 */
export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  items,
  onClose,
  className = '',
  zIndex = 1000
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x, y });
  const [activeSubmenu, setActiveSubmenu] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  /**
   * Adjust position to keep menu on screen
   */
  useEffect(() => {
    if (!menuRef.current) return;

    const rect = menuRef.current.getBoundingClientRect();
    const newPosition = { x, y };

    // Adjust horizontal position
    if (x + rect.width > window.innerWidth) {
      newPosition.x = Math.max(0, window.innerWidth - rect.width - 10);
    }

    // Adjust vertical position
    if (y + rect.height > window.innerHeight) {
      newPosition.y = Math.max(0, window.innerHeight - rect.height - 10);
    }

    setPosition(newPosition);
  }, [x, y]);

  /**
   * Handle click outside
   */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Delay adding listeners to prevent immediate close
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  /**
   * Handle keyboard navigation
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const validItems = items.filter(item => !item.disabled);
      const validCount = validItems.length;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % validCount);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + validCount) % validCount);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < validItems.length) {
            const item = validItems[selectedIndex];
            if (!item.disabled) {
              item.onClick();
              onClose();
            }
          }
          break;
        case 'ArrowRight':
          if (selectedIndex >= 0 && validItems[selectedIndex].submenu) {
            setActiveSubmenu(selectedIndex);
          }
          break;
        case 'ArrowLeft':
          setActiveSubmenu(null);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [items, selectedIndex, onClose]);

  /**
   * Handle item click
   */
  const handleItemClick = useCallback((item: ContextMenuItem) => {
    if (item.disabled) return;
    if (item.submenu) {
      // Toggle submenu
      setActiveSubmenu(prev => prev === items.indexOf(item) ? null : items.indexOf(item));
    } else {
      item.onClick();
      onClose();
    }
  }, [items, onClose]);

  /**
   * Render menu item
   */
  const renderItem = useCallback((item: ContextMenuItem, index: number) => {
    const isSelected = index === selectedIndex;
    const hasSubmenu = !!item.submenu;

    return (
      <React.Fragment key={index}>
        <div
          className={`
            flex items-center justify-between px-3 py-2 text-sm
            ${item.disabled ? 'text-gray-500 cursor-not-allowed' : 'text-gray-200 cursor-pointer'}
            ${isSelected && !item.disabled ? 'bg-blue-600' : ''}
            ${!item.disabled && !isSelected ? 'hover:bg-gray-700' : ''}
            transition-colors
          `}
          onClick={() => handleItemClick(item)}
          onMouseEnter={() => !item.disabled && setSelectedIndex(index)}
        >
          <div className="flex items-center gap-2">
            {item.icon && (
              <span className="w-5 text-center">{item.icon}</span>
            )}
            <span>{item.label}</span>
          </div>
          <div className="flex items-center gap-2 ml-4">
            {item.shortcut && (
              <span className="text-xs text-gray-400">{item.shortcut}</span>
            )}
            {hasSubmenu && (
              <span className="text-gray-400">▶</span>
            )}
          </div>
        </div>
        {item.separator && (
          <div className="border-t border-gray-700 my-1" />
        )}
        {hasSubmenu && activeSubmenu === index && item.submenu && (
          <ContextMenu
            x={position.x + 200}
            y={position.y + (index * 32)}
            items={item.submenu}
            onClose={onClose}
            zIndex={zIndex + 1}
          />
        )}
      </React.Fragment>
    );
  }, [selectedIndex, activeSubmenu, position, zIndex, handleItemClick, onClose]);

  // Render menu in portal
  return createPortal(
    <div
      ref={menuRef}
      className={`
        fixed bg-gray-800 border border-gray-600 rounded shadow-lg
        min-w-[180px] py-1 ${className}
      `}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex
      }}
    >
      {items.map((item, index) => renderItem(item, index))}
    </div>,
    document.body
  );
};

/**
 * Hook for managing context menu state
 */
export const useContextMenu = () => {
  const [menuState, setMenuState] = useState<{
    x: number;
    y: number;
    items: ContextMenuItem[];
  } | null>(null);

  const openMenu = useCallback((
    e: React.MouseEvent,
    items: ContextMenuItem[]
  ) => {
    e.preventDefault();
    setMenuState({
      x: e.clientX,
      y: e.clientY,
      items
    });
  }, []);

  const closeMenu = useCallback(() => {
    setMenuState(null);
  }, []);

  return {
    menuState,
    openMenu,
    closeMenu
  };
};