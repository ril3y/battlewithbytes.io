/**
 * Gauge Widget - Circular gauge (speedometer style)
 *
 * Displays a value as a circular gauge with optional danger/warning zones.
 */

import React from 'react';
import type { GaugeWidgetConfig } from '../types';
import { BaseWidget } from './BaseWidget';

export interface GaugeWidgetProps {
  config: GaugeWidgetConfig;
  value: number;
  unit?: string;
  valid?: boolean;
}

export const GaugeWidget: React.FC<GaugeWidgetProps> = ({ config, value, unit, valid = true }) => {
  const {
    label,
    showLabel = true,
    min,
    max,
    unit: configUnit,
    dangerZone,
    warningZone,
    segments = 10,
    width = 200,
    height = 200,
  } = config;

  const displayUnit = unit || configUnit;

  // Calculate angle (-135° to +135° = 270° total arc)
  const percentage = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const angle = -135 + percentage * 270;

  const size = Math.min(width || 200, height || 200);
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.35;

  // Generate arc path for gauge background
  const createArc = (startAngle: number, endAngle: number, color: string) => {
    const start = ((startAngle - 90) * Math.PI) / 180;
    const end = ((endAngle - 90) * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(start);
    const y1 = centerY + radius * Math.sin(start);
    const x2 = centerX + radius * Math.cos(end);
    const y2 = centerY + radius * Math.sin(end);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return (
      <path
        d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`}
        stroke={color}
        strokeWidth={size * 0.08}
        fill="none"
        strokeLinecap="round"
      />
    );
  };

  // Needle rotation
  const needleRotation = `rotate(${angle} ${centerX} ${centerY})`;

  const formattedValue =
    typeof value === 'number' && !isNaN(value) ? value.toFixed(1) : '--';

  return (
    <BaseWidget label={label} showLabel={showLabel} width={width} height={height}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <svg width={size} height={size} style={{ filter: 'drop-shadow(0 0 4px rgba(0,255,0,0.3))' }}>
          {/* Background arc */}
          {createArc(-135, 135, '#333333')}

          {/* Warning zone */}
          {warningZone && (
            <>
              {createArc(
                -135 + ((warningZone[0] - min) / (max - min)) * 270,
                -135 + ((warningZone[1] - min) / (max - min)) * 270,
                '#ffaa0044'
              )}
            </>
          )}

          {/* Danger zone */}
          {dangerZone && (
            <>
              {createArc(
                -135 + ((dangerZone[0] - min) / (max - min)) * 270,
                -135 + ((dangerZone[1] - min) / (max - min)) * 270,
                '#ff000044'
              )}
            </>
          )}

          {/* Active arc */}
          {valid && createArc(-135, angle, '#00ff00')}

          {/* Tick marks */}
          {Array.from({ length: segments + 1 }).map((_, i) => {
            const tickAngle = -135 + (i * 270) / segments;
            const tickRad = ((tickAngle - 90) * Math.PI) / 180;
            const innerRadius = radius * 0.85;
            const outerRadius = radius * 1.0;

            const x1 = centerX + innerRadius * Math.cos(tickRad);
            const y1 = centerY + innerRadius * Math.sin(tickRad);
            const x2 = centerX + outerRadius * Math.cos(tickRad);
            const y2 = centerY + outerRadius * Math.sin(tickRad);

            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#666666"
                strokeWidth={2}
                strokeLinecap="round"
              />
            );
          })}

          {/* Needle */}
          <g transform={needleRotation}>
            <line
              x1={centerX}
              y1={centerY}
              x2={centerX}
              y2={centerY - radius * 0.7}
              stroke={valid ? '#ffffff' : '#ff0000'}
              strokeWidth={3}
              strokeLinecap="round"
            />
          </g>

          {/* Center dot */}
          <circle cx={centerX} cy={centerY} r={size * 0.03} fill="#ffffff" />
        </svg>

        {/* Value display */}
        <div
          style={{
            fontSize: `${size * 0.12}px`,
            fontWeight: 'bold',
            fontFamily: 'monospace',
            color: valid ? '#00ff00' : '#ff0000',
          }}
        >
          {formattedValue}
          {displayUnit && <span style={{ fontSize: '0.7em', color: '#888888' }}> {displayUnit}</span>}
        </div>
      </div>
    </BaseWidget>
  );
};
