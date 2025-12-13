'use client';

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export interface ContextMenuOption {
  label: string;
  action: () => void;
  danger?: boolean;
  disabled?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  options: ContextMenuOption[];
  onClose: () => void;
}

export function ContextMenu({ x, y, options, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Adjust position to avoid overflow
  let adjustedX = x;
  let adjustedY = y;

  if (typeof window !== 'undefined') {
    const menuWidth = 180;
    const menuHeight = options.length * 36 + 8;

    if (x + menuWidth > window.innerWidth) {
      adjustedX = window.innerWidth - menuWidth - 10;
    }
    if (y + menuHeight > window.innerHeight) {
      adjustedY = window.innerHeight - menuHeight - 10;
    }
  }

  const menuContent = (
    <div
      ref={menuRef}
      className="bf-context-menu"
      style={{
        position: 'fixed',
        top: adjustedY,
        left: adjustedX,
        zIndex: 10000,
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <ul className="bf-context-menu-list">
        {options.map((option, index) => (
          <li key={index}>
            <button
              type="button"
              className={`bf-context-menu-option ${option.danger ? 'danger' : ''} ${option.disabled ? 'disabled' : ''}`}
              onClick={() => {
                if (!option.disabled) {
                  option.action();
                  onClose();
                }
              }}
              disabled={option.disabled}
            >
              {option.label}
            </button>
          </li>
        ))}
      </ul>

      <style jsx>{`
        .bf-context-menu {
          background: #1a1a1a;
          border: 1px solid #444;
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
          min-width: 160px;
          padding: 4px 0;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
        }

        .bf-context-menu-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .bf-context-menu-option {
          display: block;
          width: 100%;
          background: none;
          border: none;
          text-align: left;
          padding: 8px 16px;
          font-size: 0.85rem;
          color: #ccc;
          cursor: pointer;
          transition: background-color 0.15s, color 0.15s;
        }

        .bf-context-menu-option:hover:not(.disabled) {
          background: #333;
          color: #00ff9d;
        }

        .bf-context-menu-option.danger {
          color: #f56565;
        }

        .bf-context-menu-option.danger:hover:not(.disabled) {
          background: rgba(245, 101, 101, 0.15);
          color: #ff6b6b;
        }

        .bf-context-menu-option.disabled {
          color: #555;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );

  if (typeof window === 'undefined') {
    return null;
  }

  return createPortal(menuContent, document.body);
}
