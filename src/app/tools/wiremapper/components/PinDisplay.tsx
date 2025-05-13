import React from 'react';
import { Pin } from '../types';
import { PIN_SIZE } from '../constants'; // Assuming PIN_SIZE might be needed

// --- Style Calculation Logic (Extracted from ConnectorNode) ---
const getPinStyle = (
  pin: Pin, 
  isSelected: boolean, 
  isHovered: boolean, 
  isConnected: boolean, 
  darkMode: boolean, 
  size: number, 
  gender: 'male' | 'female'
): React.CSSProperties => {
  let borderColor = (darkMode ? '#6b7280' : '#9ca3af');
  let boxShadow = 'none';
  let pinBackgroundColor = (darkMode ? '#374151' : '#e5e7eb'); 
  let borderRadius = '50%'; 

  if (gender === 'female') {
    pinBackgroundColor = darkMode ? '#111827' : '#f0f0f0'; 
    borderColor = (darkMode ? '#00ff9d' : '#059669'); 
    // borderRadius = '2px'; // Optional: make female sockets square
  }

  if (isSelected) {
    borderColor = darkMode ? '#00ff9d' : '#059669'; 
    boxShadow = `0 0 8px ${borderColor}`;
  } else if (isConnected) {
    borderColor = darkMode ? '#34d399' : '#10b981'; 
    boxShadow = `0 0 5px ${borderColor}`;
  } else if (isHovered) {
    borderColor = darkMode ? '#60a5fa' : '#3b82f6'; 
    boxShadow = `0 0 4px ${borderColor}`;
  }

  return {
    width: `${size}px`,
    height: `${size}px`,
    backgroundColor: pinBackgroundColor,
    border: `2px solid ${borderColor}`,
    borderRadius: borderRadius, 
    boxShadow: boxShadow,
    transition: 'all 0.2s ease',
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    fontSize: `${size * 0.45}px`, // Scale font size with pin size
    fontWeight: 'bold',
    color: darkMode ? '#e5e7eb' : '#1f2937', 
    cursor: 'crosshair', 
    boxSizing: 'border-box', 
    position: 'relative', // Added for potential absolute children (like Handle)
  };
};

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
  onMouseEnter,
  onMouseLeave,
  children,
}) => {
  const style = getPinStyle(pin, isSelected, isHovered, isConnected, darkMode, size, gender);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(pin.pos);
  };

  const handleMouseEnter = () => {
    onMouseEnter?.(pin.pos);
  };

  const handleMouseLeave = () => {
    onMouseLeave?.(pin.pos);
  };

  return (
    <div
      style={style}
      onClick={onClick ? handleClick : undefined}
      onMouseEnter={onMouseEnter ? handleMouseEnter : undefined}
      onMouseLeave={onMouseLeave ? handleMouseLeave : undefined}
      title={`Pin ${pin.pos}${pin.name ? ': ' + pin.name : ''}`}
      className="connector-pin-display"
    >
      {pin.pos} {/* Display pin number/position */}
      {children} {/* Render children, e.g., React Flow Handle */}
    </div>
  );
};
