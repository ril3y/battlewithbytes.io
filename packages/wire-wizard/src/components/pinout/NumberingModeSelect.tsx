import React from 'react';
import type { PinNumberingMode, PinoutLayout } from '../../lib/core/types';

interface NumberingModeSelectProps {
  pinout?: PinoutLayout;
  onChange: (next: PinoutLayout) => void;
}

const OPTIONS: { value: PinNumberingMode; label: string }[] = [
  { value: 'manual', label: 'Manual' },
  { value: 'sequential', label: 'Sequential' },
  { value: 'row-col', label: 'Row · Col' },
  { value: 'col-row', label: 'Col · Row' },
];

export const NumberingModeSelect: React.FC<NumberingModeSelectProps> = ({
  pinout,
  onChange,
}) => {
  const mode: PinNumberingMode = pinout?.numberingMode ?? 'manual';
  return (
    <select
      value={mode}
      onChange={(e) => {
        const next: PinoutLayout = {
          shape: pinout?.shape ?? 'auto',
          rows: pinout?.rows,
          cols: pinout?.cols,
          ringRadius: pinout?.ringRadius,
          numberingMode: e.target.value as PinNumberingMode,
        };
        onChange(next);
      }}
      onClick={(e) => e.stopPropagation()}
      title="Pin numbering mode"
      style={{
        background: '#0a0a0a',
        border: '1px solid #2a2a2a',
        color: '#aaa',
        padding: '2px 6px',
        borderRadius: 3,
        fontFamily: 'Roboto Mono, monospace',
        fontSize: 10,
        cursor: 'pointer',
      }}
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          # {o.label}
        </option>
      ))}
    </select>
  );
};
