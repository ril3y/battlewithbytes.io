import React from 'react';
import type { Conductor, ConnectionPoint, WireGauge } from '../../lib/core/types';
import { getAvailableGauges } from '../../lib/wires/wireGaugeUtils';

interface ConductorListProps {
  conductors: Conductor[];
  /** Map of internal pin id → ConnectionPoint, for resolving labels of each end of the conductor. */
  leftPinMap: Map<string, ConnectionPoint>;
  rightPinMap: Map<string, ConnectionPoint>;
  /** Conductors are stored relative to the wire's from/to ends. Use this to know which side is "left". */
  fromIsLeft: boolean;
  focusedConductorId: string | null;
  onFocus: (conductorId: string | null) => void;
  onUpdate: (conductorId: string, updates: Partial<Conductor>) => void;
  onRemove: (conductorId: string) => void;
}

const GAUGES = getAvailableGauges();

const ROW_STYLE: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '28px 1fr 90px 24px',
  alignItems: 'center',
  gap: 8,
  padding: '8px 10px',
  fontFamily: 'Roboto Mono, monospace',
  fontSize: 11,
  color: '#e5e5e5',
};

const NET_ROW_STYLE: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '28px 1fr',
  alignItems: 'center',
  gap: 8,
  padding: '0 10px 8px 10px',
};

const INPUT_STYLE: React.CSSProperties = {
  background: '#0a0a0a',
  border: '1px solid #2a2a2a',
  color: '#e5e5e5',
  padding: '4px 6px',
  borderRadius: 3,
  fontFamily: 'inherit',
  fontSize: 11,
  width: '100%',
};

export const ConductorList: React.FC<ConductorListProps> = ({
  conductors,
  leftPinMap,
  rightPinMap,
  fromIsLeft,
  focusedConductorId,
  onFocus,
  onUpdate,
  onRemove,
}) => {
  return (
    <div
      style={{
        background: '#0f0f0f',
        border: '1px solid #1a1a1a',
        borderRadius: 6,
        overflow: 'hidden',
        fontFamily: 'Roboto Mono, monospace',
        color: '#e5e5e5',
        fontSize: 11,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        style={{
          padding: '10px 12px',
          background: '#0a0a0a',
          borderBottom: '1px solid #1a1a1a',
          letterSpacing: 1.5,
          fontSize: 10,
          color: '#00aaff',
        }}
      >
        CONDUCTORS [{conductors.length}]
      </div>

      {conductors.length === 0 ? (
        <div style={{ padding: 14, color: '#666', fontSize: 11, lineHeight: 1.6 }}>
          No conductors yet.
          <div style={{ marginTop: 8, color: '#888' }}>
            <strong style={{ color: '#FF8800' }}>Shift+click</strong> a pin on one side, then
            click a pin on the other to create a conductor.
          </div>
        </div>
      ) : (
        <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {conductors.map((c, i) => {
            const lp = leftPinMap.get(fromIsLeft ? c.fromInternalPinId : c.toInternalPinId);
            const rp = rightPinMap.get(fromIsLeft ? c.toInternalPinId : c.fromInternalPinId);
            const focused = focusedConductorId === c.id;
            const swatch = c.color || lp?.color || rp?.color || '#888';
            const placeholder = `${lp?.label ?? '?'} ↔ ${rp?.label ?? '?'}`;
            return (
              <div
                key={c.id}
                onClick={() => onFocus(focused ? null : c.id)}
                style={{
                  background: focused ? 'rgba(0,170,255,0.12)' : i % 2 ? '#0c0c0c' : 'transparent',
                  borderBottom: '1px solid #1a1a1a',
                  borderLeft: focused ? '3px solid #00aaff' : '3px solid transparent',
                  cursor: 'pointer',
                }}
              >
                <div style={ROW_STYLE}>
                <input
                  type="color"
                  value={
                    /^#[0-9a-fA-F]{6}$/.test(swatch) ? swatch : '#888888'
                  }
                  onChange={(e) => onUpdate(c.id, { color: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  title="Conductor color"
                  style={{
                    width: 24,
                    height: 24,
                    padding: 0,
                    background: 'transparent',
                    border: '1px solid #2a2a2a',
                    borderRadius: 3,
                    cursor: 'pointer',
                  }}
                />
                <input
                  type="text"
                  value={c.label ?? ''}
                  placeholder={placeholder}
                  onChange={(e) => onUpdate(c.id, { label: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  style={INPUT_STYLE}
                />
                <select
                  value={c.gauge ?? ''}
                  onChange={(e) =>
                    onUpdate(c.id, { gauge: (e.target.value || undefined) as WireGauge | undefined })
                  }
                  onClick={(e) => e.stopPropagation()}
                  style={INPUT_STYLE}
                >
                  <option value="">— AWG —</option>
                  {GAUGES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(c.id);
                  }}
                  title="Remove conductor"
                  style={{
                    width: 24,
                    height: 24,
                    background: 'transparent',
                    border: '1px solid #333',
                    color: '#ff4444',
                    borderRadius: 3,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: 12,
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
                </div>
                {focused && (
                  <div style={NET_ROW_STYLE}>
                    <span style={{ fontSize: 9, color: '#666', textAlign: 'right' }}>net</span>
                    <input
                      type="text"
                      placeholder="net name (cascades)"
                      value={c.netName ?? ''}
                      onChange={(e) => onUpdate(c.id, { netName: e.target.value || undefined })}
                      onClick={(e) => e.stopPropagation()}
                      style={INPUT_STYLE}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
