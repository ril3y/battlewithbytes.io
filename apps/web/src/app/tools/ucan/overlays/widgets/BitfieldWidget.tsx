/**
 * Bitfield Widget - Visual bit flags display
 *
 * Displays individual bits as LED indicators.
 */

import React from 'react';
import type { BitfieldWidgetConfig } from '../types';
import { BaseWidget } from './BaseWidget';

export interface BitfieldWidgetProps {
  config: BitfieldWidgetConfig;
  value: number;
  valid?: boolean;
}

export const BitfieldWidget: React.FC<BitfieldWidgetProps> = ({ config, value, valid = true }) => {
  const {
    label,
    showLabel = true,
    bitLabels = [],
    orientation = 'horizontal',
  } = config;

  // Extract 8 bits (LSB to MSB)
  const bits = Array.from({ length: 8 }, (_, i) => ((value >> i) & 1) === 1);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: orientation === 'horizontal' ? 'row' : 'column',
    gap: '8px',
    opacity: valid ? 1 : 0.3,
  };

  const bitStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  };

  const ledStyle = (isSet: boolean): React.CSSProperties => ({
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    backgroundColor: isSet ? '#00ff00' : '#003300',
    boxShadow: isSet ? '0 0 8px #00ff00' : 'none',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    transition: 'all 0.2s ease',
  });

  const labelStyle: React.CSSProperties = {
    fontSize: '10px',
    color: '#888888',
    textAlign: 'center',
  };

  return (
    <BaseWidget label={label} showLabel={showLabel}>
      <div style={containerStyle}>
        {bits.map((isSet, i) => (
          <div key={i} style={bitStyle}>
            <div style={ledStyle(isSet)} title={`Bit ${i}: ${isSet ? '1' : '0'}`} />
            {bitLabels[i] && <div style={labelStyle}>{bitLabels[i]}</div>}
          </div>
        ))}
      </div>
    </BaseWidget>
  );
};
