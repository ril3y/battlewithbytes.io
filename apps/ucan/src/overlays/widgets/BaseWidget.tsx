/**
 * Base Widget Component
 *
 * Provides common wrapper functionality for all widgets:
 * - Label display
 * - Error/invalid state handling
 * - Consistent styling
 */

import React from "react";

export interface BaseWidgetProps {
  label?: string;
  showLabel?: boolean;
  width?: number;
  height?: number;
  className?: string;
  error?: string;
  children: React.ReactNode;
}

export const BaseWidget: React.FC<BaseWidgetProps> = ({
  label,
  showLabel = true,
  width,
  height,
  className = "",
  error,
  children,
}) => {
  const style: React.CSSProperties = {
    width: width ? `${width}px` : undefined,
    height: height ? `${height}px` : undefined,
  };

  return (
    <div className={`widget-container ${className}`} style={style}>
      {showLabel && label && (
        <div className="widget-label text-xs text-gray-400 mb-1">{label}</div>
      )}
      <div className="widget-content">
        {error ? (
          <div className="widget-error text-red-500 text-sm">⚠️ {error}</div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};
