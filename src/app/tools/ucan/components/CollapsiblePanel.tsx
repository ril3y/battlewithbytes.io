'use client';

/**
 * Collapsible Panel Component
 *
 * Reusable panel with expand/collapse functionality
 */

import React, { useState, ReactNode } from 'react';

interface CollapsiblePanelProps {
  title: string;
  icon?: string;
  children: ReactNode;
  defaultCollapsed?: boolean;
  headerActions?: ReactNode;
}

export default function CollapsiblePanel({
  title,
  icon,
  children,
  defaultCollapsed = false,
  headerActions
}: CollapsiblePanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span className={`transition-transform text-gray-400 ${isCollapsed ? '' : 'rotate-90'}`}>▶</span>
          {icon && <span>{icon}</span>}
          <span>{title}</span>
        </h3>

        {!isCollapsed && headerActions && (
          <div onClick={(e) => e.stopPropagation()}>
            {headerActions}
          </div>
        )}
      </div>

      {!isCollapsed && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  );
}
