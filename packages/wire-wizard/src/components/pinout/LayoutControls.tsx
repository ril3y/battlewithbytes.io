import React from 'react';
import type { PinNumberingMode, PinoutLayout } from '../../lib/core/types';

interface LayoutControlsProps {
  pinCount: number;
  pinout?: PinoutLayout;
  onChange: (next: PinoutLayout) => void;
}

const SHAPES: { value: PinoutLayout['shape']; label: string }[] = [
  { value: 'rectangle', label: 'Grid' },
  { value: 'circle', label: 'Circle' },
  { value: 'auto', label: 'Auto' },
];

const NUMBERING: { value: PinNumberingMode; label: string }[] = [
  { value: 'manual', label: 'Manual #' },
  { value: 'sequential', label: 'Seq 1..N' },
  { value: 'row-col', label: 'Row · Col' },
  { value: 'col-row', label: 'Col · Row' },
];

const SELECT: React.CSSProperties = {
  background: '#0a0a0a',
  border: '1px solid #2a2a2a',
  color: '#aaa',
  padding: '2px 6px',
  borderRadius: 3,
  fontFamily: 'Roboto Mono, monospace',
  fontSize: 10,
  cursor: 'pointer',
};

const NUMINPUT: React.CSSProperties = {
  ...SELECT,
  width: 38,
  textAlign: 'center',
};

/**
 * Per-side layout + numbering picker for a connector pinout. Writes to
 * `Block.pinout`. Defaults all shape-specific fields when switching shapes
 * so the renderer always has something sane to work with.
 */
export const LayoutControls: React.FC<LayoutControlsProps> = ({
  pinCount,
  pinout,
  onChange,
}) => {
  const shape: PinoutLayout['shape'] = pinout?.shape ?? 'auto';
  const mode: PinNumberingMode = pinout?.numberingMode ?? 'manual';
  const cols = pinout?.cols ?? Math.ceil(Math.sqrt(pinCount));
  const rows = pinout?.rows ?? Math.ceil(pinCount / Math.max(cols, 1));

  const emit = (patch: Partial<PinoutLayout>) => {
    onChange({
      shape,
      rows,
      cols,
      ringRadius: pinout?.ringRadius,
      numberingMode: mode,
      ...pinout,
      ...patch,
    });
  };

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 6,
        background: '#0a0a0a',
        border: '1px solid #1a1a1a',
        borderRadius: 4,
        padding: '4px 6px',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <select
        value={shape}
        onChange={(e) => emit({ shape: e.target.value as PinoutLayout['shape'] })}
        title="Connector shape"
        style={SELECT}
      >
        {SHAPES.map((s) => (
          <option key={s.value} value={s.value}>
            ▦ {s.label}
          </option>
        ))}
      </select>

      {shape === 'rectangle' && (
        <>
          <input
            type="number"
            min={1}
            max={20}
            value={rows}
            onChange={(e) => emit({ rows: Math.max(1, Math.min(20, parseInt(e.target.value || '1', 10))) })}
            title="Rows"
            style={NUMINPUT}
          />
          <span style={{ color: '#444', fontSize: 10 }}>×</span>
          <input
            type="number"
            min={1}
            max={20}
            value={cols}
            onChange={(e) => emit({ cols: Math.max(1, Math.min(20, parseInt(e.target.value || '1', 10))) })}
            title="Columns"
            style={NUMINPUT}
          />
        </>
      )}

      {shape === 'circle' && (
        <input
          type="number"
          min={20}
          max={300}
          step={10}
          value={pinout?.ringRadius ?? Math.max(60, pinCount * 8)}
          onChange={(e) => emit({ ringRadius: Math.max(20, Math.min(300, parseInt(e.target.value || '60', 10))) })}
          title="Ring radius"
          style={{ ...NUMINPUT, width: 50 }}
        />
      )}

      <select
        value={mode}
        onChange={(e) => emit({ numberingMode: e.target.value as PinNumberingMode })}
        title="Pin numbering mode"
        style={SELECT}
      >
        {NUMBERING.map((n) => (
          <option key={n.value} value={n.value}>
            # {n.label}
          </option>
        ))}
      </select>
    </div>
  );
};
