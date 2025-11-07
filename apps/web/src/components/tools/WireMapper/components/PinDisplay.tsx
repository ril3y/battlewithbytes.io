import React from 'react';
import classNames from 'classnames';
import { Pin } from '../types';
import { PIN_SIZE } from '../constants'; // Assuming PIN_SIZE might be needed

// --- PinDisplay Component ---
export interface PinDisplayProps {
  pin: Pin;
  isSelected: boolean;
  isHovered: boolean;
  isConnected: boolean;
  darkMode: boolean;
  size?: number;
  gender: 'male' | 'female';
  onClick?: (pinPos: number) => void;
  onContextMenu?: (e: React.MouseEvent, pinPos: number) => void;
  onMouseEnter?: (pinPos: number) => void;
  onMouseLeave?: (pinPos: number) => void;
  children?: React.ReactNode; // To allow embedding things like React Flow Handles
}

export const PinDisplay: React.FC<PinDisplayProps> = ({
  pin,
  isSelected,
  isHovered,
  isConnected,
  darkMode,
  size = PIN_SIZE, // Default size
  gender,
  onClick,
  onContextMenu,
  onMouseEnter,
  onMouseLeave,
  children,
}) => {
  // --- Dynamic Class Calculation ---
  const pinClasses = classNames(
    'connector-pin-display',
    {
      'female': gender === 'female',
      'selected': isSelected,
      'connected': isConnected,
      'hovered': isHovered, // Add hovered class
      'dark-theme': darkMode, // Add dark-theme class when darkMode is true
    }
  );

  // --- Inline Styles (Only for dynamic values or overrides) ---
  const inlineStyle: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    fontSize: `${size * 0.45}px`,
  };

  // Apply pin-specific color override *only* if it exists
  // Restore original check: Apply config color if it exists
  if (pin.config?.color) { 
    inlineStyle.backgroundColor = pin.config.color;
  }
  
  // If this pin has a netName, show that as the background
  if (pin.netName && pin.netColor) {
    inlineStyle.backgroundColor = pin.netColor;
  }

  // --- Event Handlers ---
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(pin.pos);
  };
  
  const handleContextMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('PinDisplay context menu triggered:', pin.pos, 'Event:', e.clientX, e.clientY);
    if (onContextMenu) {
      onContextMenu(e, pin.pos);
    }
  };

  const handleMouseEnter = () => {
    onMouseEnter?.(pin.pos);
  };

  const handleMouseLeave = () => {
    onMouseLeave?.(pin.pos);
  };

  return (
    <div
      className={pinClasses} // Apply dynamic classes
      style={inlineStyle} // Apply necessary inline styles
      onClick={onClick ? handleClick : undefined}
      onContextMenu={onContextMenu ? handleContextMenu : undefined}
      onMouseEnter={onMouseEnter ? handleMouseEnter : undefined}
      onMouseLeave={onMouseLeave ? handleMouseLeave : undefined}
      title={`Pin ${pin.pos}${pin.name ? ': ' + pin.name : ''}${pin.netName ? ' | Net: ' + pin.netName : ''}`}
      data-pin-pos={pin.pos} // Add data attribute for the global context menu handler
    >
      {pin.pos} {/* Display pin number/position */}
      {children} {/* Render children, e.g., React Flow Handle */}
    </div>
  );
};
