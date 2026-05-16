import React from 'react';
import type { ConnectionPoint, PinSignalType } from '../../lib/core/types';
import {
  MODAL_FIELD_STYLE,
  MODAL_LABEL_STYLE,
  MODAL_INPUT_STYLE,
} from '../../lib/core/styles';

interface PinDetailPanelProps {
  blockLabel: string;
  pin: ConnectionPoint;
  /** Called with a partial update; flushes immediately to DiagramContext.updateConnectionPoint. */
  onChange: (updates: Partial<ConnectionPoint>) => void;
}

const SIGNAL_TYPES: PinSignalType[] = [
  'power',
  'ground',
  'signal',
  'data',
  'analog',
  'pwm',
  'rf',
];

export const PinDetailPanel: React.FC<PinDetailPanelProps> = ({
  blockLabel,
  pin,
  onChange,
}) => {
  return (
    <div
      style={{
        padding: '16px',
        background: '#0a0a0a',
        border: '1px solid #2a2a2a',
        borderRadius: 4,
        minWidth: 260,
        fontFamily: 'Roboto Mono, monospace',
        color: '#e5e5e5',
        fontSize: 12,
      }}
    >
      <div style={{ fontSize: 10, color: '#666', marginBottom: 4, letterSpacing: 1 }}>
        {blockLabel.toUpperCase()}
        {pin.pinNumber !== undefined && ` · PIN ${pin.pinNumber}`}
      </div>

      <div style={MODAL_FIELD_STYLE}>
        <label style={MODAL_LABEL_STYLE}>Label</label>
        <input
          type="text"
          value={pin.label}
          onChange={(e) => onChange({ label: e.target.value })}
          style={{ ...MODAL_INPUT_STYLE, color: '#e5e5e5' }}
        />
      </div>

      <div style={MODAL_FIELD_STYLE}>
        <label style={MODAL_LABEL_STYLE}>Color</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="color"
            value={pin.color}
            onChange={(e) => onChange({ color: e.target.value })}
            style={{ width: 40, height: 28, padding: 0, background: 'transparent', border: '1px solid #333' }}
          />
          <input
            type="text"
            value={pin.color}
            onChange={(e) => onChange({ color: e.target.value })}
            style={{ ...MODAL_INPUT_STYLE, color: '#e5e5e5', flex: 1 }}
          />
        </div>
      </div>

      <div style={MODAL_FIELD_STYLE}>
        <label style={MODAL_LABEL_STYLE}>Signal Type</label>
        <select
          value={pin.signalType ?? ''}
          onChange={(e) => {
            const v = e.target.value;
            onChange({ signalType: v ? (v as PinSignalType) : undefined });
          }}
          style={{ ...MODAL_INPUT_STYLE, color: '#e5e5e5' }}
        >
          <option value="">— none —</option>
          {SIGNAL_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ ...MODAL_FIELD_STYLE, flex: 1 }}>
          <label style={MODAL_LABEL_STYLE}>Voltage (V)</label>
          <input
            type="number"
            value={pin.voltage ?? ''}
            onChange={(e) => {
              const v = e.target.value;
              onChange({ voltage: v === '' ? undefined : Number(v) });
            }}
            style={{ ...MODAL_INPUT_STYLE, color: '#e5e5e5' }}
          />
        </div>
        <div style={{ ...MODAL_FIELD_STYLE, flex: 1 }}>
          <label style={MODAL_LABEL_STYLE}>Current (A)</label>
          <input
            type="number"
            value={pin.currentRating ?? ''}
            onChange={(e) => {
              const v = e.target.value;
              onChange({ currentRating: v === '' ? undefined : Number(v) });
            }}
            style={{ ...MODAL_INPUT_STYLE, color: '#e5e5e5' }}
          />
        </div>
      </div>

      <div style={MODAL_FIELD_STYLE}>
        <label style={MODAL_LABEL_STYLE}>Description</label>
        <textarea
          value={pin.description ?? ''}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={3}
          style={{ ...MODAL_INPUT_STYLE, color: '#e5e5e5', resize: 'vertical' }}
        />
      </div>
    </div>
  );
};
