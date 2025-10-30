/**
 * Graph Widget - Time-series line graph
 *
 * Displays a value over time as a line graph.
 */

import React, { useEffect, useRef } from 'react';
import type { GraphWidgetConfig } from '../types';
import { BaseWidget } from './BaseWidget';

export interface GraphWidgetProps {
  config: GraphWidgetConfig;
  value: number;
  valid?: boolean;
}

export const GraphWidget: React.FC<GraphWidgetProps> = ({ config, value, valid = true }) => {
  const {
    label,
    showLabel = true,
    historyLength = 50,
    min,
    max,
    autoScale = true,
    lineColor = '#00ff00',
    width = 300,
    height = 150,
  } = config;

  const historyRef = useRef<Array<{ timestamp: number; value: number }>>([]);

  // Add new value to history
  useEffect(() => {
    if (valid && typeof value === 'number' && !isNaN(value)) {
      historyRef.current.push({ timestamp: Date.now(), value });

      // Trim history to max length
      if (historyRef.current.length > historyLength) {
        historyRef.current.shift();
      }
    }
  }, [value, valid, historyLength]);

  const history = historyRef.current;

  // Calculate min/max for scaling
  let scaleMin = min ?? 0;
  let scaleMax = max ?? 100;

  if (autoScale && history.length > 0) {
    const values = history.map((h) => h.value);
    scaleMin = Math.min(...values);
    scaleMax = Math.max(...values);

    // Add 10% padding
    const range = scaleMax - scaleMin;
    scaleMin -= range * 0.1;
    scaleMax += range * 0.1;
  }

  // Generate SVG path
  const generatePath = (): string => {
    if (history.length < 2) return '';

    const points = history.map((h, i) => {
      const x = (i / (historyLength - 1)) * (width || 300);
      const y =
        (height || 150) - ((h.value - scaleMin) / (scaleMax - scaleMin)) * (height || 150);
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  };

  const svgStyle: React.CSSProperties = {
    width: `${width}px`,
    height: `${height}px`,
    backgroundColor: '#111111',
    border: '1px solid #333333',
    borderRadius: '4px',
  };

  return (
    <BaseWidget label={label} showLabel={showLabel} width={width} height={height}>
      <div>
        <svg style={svgStyle}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
            const y = fraction * (height || 150);
            return (
              <line
                key={fraction}
                x1={0}
                y1={y}
                x2={width}
                y2={y}
                stroke="#333333"
                strokeWidth={1}
                strokeDasharray="2,2"
              />
            );
          })}

          {/* Data line */}
          {history.length > 1 && (
            <path
              d={generatePath()}
              stroke={valid ? lineColor : '#666666'}
              strokeWidth={2}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Current value indicator */}
          {history.length > 0 && (
            <circle
              cx={(history.length - 1) * ((width || 300) / (historyLength - 1))}
              cy={
                (height || 150) -
                ((history[history.length - 1].value - scaleMin) / (scaleMax - scaleMin)) *
                  (height || 150)
              }
              r={4}
              fill={valid ? lineColor : '#666666'}
            />
          )}
        </svg>

        {/* Value display */}
        <div
          style={{
            marginTop: '4px',
            fontSize: '12px',
            color: '#888888',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>Min: {scaleMin.toFixed(1)}</span>
          <span style={{ color: valid ? lineColor : '#ff0000', fontWeight: 'bold' }}>
            {history.length > 0 ? history[history.length - 1].value.toFixed(1) : '--'}
          </span>
          <span>Max: {scaleMax.toFixed(1)}</span>
        </div>
      </div>
    </BaseWidget>
  );
};
