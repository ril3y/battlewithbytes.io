import React from 'react';
import { Pin, ConnectorGender } from '../types'; // Assuming Pin type is needed

// Define props for the renderer
interface ConnectorRendererProps {
  rows: number;
  cols: number;
  pins: Pin[]; // Use the Pin type from types/index.ts
  gender: ConnectorGender;
  centerPins?: boolean;
  pinNumberingMode?: 'continue' | 'skip'; // Primarily for builder preview
  pinSize?: number; // Allow overriding pin size
  name?: string; // Optional: For displaying name inside the connector (like preview)
  renderPinContent?: (pinData: { displayValue: number | string, pin: Pin }) => React.ReactNode; // Allow custom pin content
  getRowStyle?: (rowIndex: number) => React.CSSProperties;
  getPinStyle?: (pinData: { displayValue: number | string, pin: Pin }) => React.CSSProperties;
  pinWrapperClassName?: string; 
}

const DEFAULT_PIN_SIZE = 20;

export const ConnectorRenderer: React.FC<ConnectorRendererProps> = ({
  rows,
  cols,
  pins, // Should be the full layout including invisible pins if available
  gender,
  centerPins = false,
  pinNumberingMode = 'skip', // Default to 'skip' as actual connectors use original numbers
  pinSize = DEFAULT_PIN_SIZE,
  name,
  renderPinContent,
  getRowStyle,
  getPinStyle,
  pinWrapperClassName
}) => {

  // --- Core Rendering Logic (To be moved from ConnectorBuilder Preview) ---
  const renderPinsLayout = () => {
    const pinLayout = pins; // Use the passed pins
    const visiblePins = pinLayout.filter(p => p.visible !== false); // Assume visible if undefined
    const pinsByRow: { [key: number]: { pin: Pin, displayValue: number | string }[] } = {};
    let visiblePinIndex = 0;

    // Group visible pins by row and calculate display value
    pinLayout.forEach((pin) => {
      // Determine row/col. Fallback to grid calculation if row/col missing (shouldn't happen with builder data)
      const pinRow = pin.row ?? Math.floor((pin.pos - 1) / cols);
      const pinCol = pin.col ?? (pin.pos - 1) % cols;

      if (pin.visible === false) return; // Skip invisible pins

      if (pinsByRow[pinRow] === undefined) {
        pinsByRow[pinRow] = [];
      }
      // Calculate display value based on mode (primarily for preview)
      const displayValue = pinNumberingMode === 'continue' ? ++visiblePinIndex : pin.pos;
      pinsByRow[pinRow].push({ pin: { ...pin, row: pinRow, col: pinCol }, displayValue });
    });

    // Render rows
    return Array.from({ length: rows }).map((_, rowIndex) => {
      const rowPins = pinsByRow[rowIndex] || [];
      if (rowPins.length === 0) return null; // Don't render empty rows

      // Sort pins in the row by their original column index for consistent order
      rowPins.sort((a, b) => (a.pin.col ?? 0) - (b.pin.col ?? 0));

      const defaultRowStyle: React.CSSProperties = {
        display: 'flex',
        gap: `${pinSize / 2}px`, // Default gap, can be overridden
        justifyContent: centerPins ? 'center' : 'flex-start',
        width: '100%',
        minHeight: `${pinSize}px`, // Base height
        marginBottom: '4px',
      };

      const calculatedRowStyle = getRowStyle ? getRowStyle(rowIndex) : defaultRowStyle;

      return (
        <div 
          key={`render-row-${rowIndex}`}
          style={calculatedRowStyle}
        >
          {rowPins.map(({ pin, displayValue }) => {
            const defaultPinStyle: React.CSSProperties = {
              width: pinSize,
              height: pinSize,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: `${Math.max(8, pinSize * 0.4)}px`, // Scale font size
              fontWeight: 'bold',
              backgroundColor: gender === 'Female' ? '#111111' : '#333333', // Default colors
              border: `2px solid #00ff9d`,
              boxShadow: `0 0 4px #00ff9d`,
              color: '#e0e0e0',
              margin: '2px 0', // Minimal vertical margin
            };

            const calculatedPinStyle = getPinStyle ? getPinStyle({ displayValue, pin }) : defaultPinStyle;
            
            const pinContent = renderPinContent 
              ? renderPinContent({ displayValue, pin }) 
              : <span>{displayValue}</span>;

            return (
              <div
                key={`render-pin-${pin.pos}`}
                style={calculatedPinStyle}
                className={pinWrapperClassName} // Allow adding classes for hover etc.
                data-pin-pos={String(pin.pos)} // Ensure data attribute value is a string
              >
                {pinContent}
              </div>
            );
          })}
        </div>
      );
    });
  };

  // --- Main Return --- 
  return (
    <div className="flex flex-col items-center w-full">
      {name && (
        <div className="text-green-400 font-mono text-xs mb-2 text-center font-bold">
          {name}
        </div>
      )}
      <div className="flex flex-col w-full">
        {renderPinsLayout()}
      </div>
    </div>
  );
};

// Optional: Export default if it's the primary export
// export default ConnectorRenderer;
