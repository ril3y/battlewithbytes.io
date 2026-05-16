import React from 'react';

interface ZoomIndicatorProps {
  zoom: number;
}

export const ZoomIndicator: React.FC<ZoomIndicatorProps> = ({ zoom }) => {
  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      left: '20px',
      background: 'rgba(0, 0, 0, 0.7)',
      color: '#00ffa0',
      padding: '8px 12px',
      borderRadius: '5px',
      fontFamily: 'monospace',
      fontSize: '11px',
      fontWeight: 'bold',
      zIndex: 1000,
      border: '1px solid #00ffa0'
    }}>
      Zoom: {Math.round(zoom * 100)}%
    </div>
  );
};
