/**
 * Bar Widget - Linear bar graph
 *
 * Displays a value as a filled bar with min/max range.
 */

import React from 'react';
import type { BarWidgetConfig } from '../types';
import { BaseWidget } from './BaseWidget';

export interface BarWidgetProps {
  config: BarWidgetConfig;
  value: number;
  unit?: string;
  valid?: boolean;
}

export const BarWidget: React.FC<BarWidgetProps> = ({ config, value, unit, valid = true }) => {
  const {
    label,
    showLabel = true,
    min,
    max,
    unit: configUnit,
    orientation = 'horizontal',
    colorScale = 'green',
    width = 200,
    height = 40,
  } = config;

  const displayUnit = unit || configUnit;

  // Calculate percentage
  const percentage = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  // Determine fill color based on colorScale
  let fillColor = '#00ff00';
  if (colorScale === 'gradient') {
    if (percentage < 33) {
      fillColor = '#ff0000'; // Red for low
    } else if (percentage < 66) {
      fillColor = '#ffaa00'; // Orange for medium
    } else {
      fillColor = '#00ff00'; // Green for high
    }
  } else if (colorScale === 'yellow') {
    fillColor = '#ffff00';
  } else if (colorScale === 'red') {
    fillColor = '#ff0000';
  }

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: orientation === 'horizontal' ? 'column' : 'row',
    gap: '4px',
    alignItems: 'center',
  };

  const barContainerStyle: React.CSSProperties = {
    width: orientation === 'horizontal' ? `${width}px` : '40px',
    height: orientation === 'horizontal' ? '20px' : `${height}px`,
    backgroundColor: '#222222',
    borderRadius: '4px',
    border: '2px solid #444444',
    position: 'relative',
    overflow: 'hidden',
  };

  const fillStyle: React.CSSProperties = {
    position: 'absolute',
    backgroundColor: valid ? fillColor : '#666666',
    transition: 'all 0.3s ease',
    boxShadow: valid ? `0 0 8px ${fillColor}` : 'none',
    ...(orientation === 'horizontal'
      ? {
          left: 0,
          top: 0,
          height: '100%',
          width: `${percentage}%`,
        }
      : {
          left: 0,
          bottom: 0,
          width: '100%',
          height: `${percentage}%`,
        }),
  };

  const valueStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 'bold',
    fontFamily: 'monospace',
    color: valid ? '#ffffff' : '#ff0000',
  };

  const formattedValue =
    typeof value === 'number' && !isNaN(value) ? value.toFixed(1) : '--';

  return (
    <BaseWidget label={label} showLabel={showLabel}>
      <div style={containerStyle}>
        <div style={barContainerStyle}>
          <div style={fillStyle} />
        </div>
        <div style={valueStyle}>
          {formattedValue}
          {displayUnit && ` ${displayUnit}`}
        </div>
      </div>
    </BaseWidget>
  );
};
