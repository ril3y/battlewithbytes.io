/**
 * Bus Wire Item
 * Individual wire displayed within bus group details
 */

import React from 'react';
import type { Wire, Block, WireGauge } from '../../../lib/core/types';
import {
  getAvailableGauges,
  AWG_CURRENT_CAPACITY
} from '../../../lib/wires/wireGaugeUtils';

interface BusWireItemProps {
  wire: Wire;
  currentWireId: string;
  isExpanded: boolean;
  wires: Wire[];
  blocks: Block[];
  onToggleExpand: () => void;
  setWires: (wires: Wire[] | ((prev: Wire[]) => Wire[])) => void;
  setBlocks: (blocks: Block[] | ((prev: Block[]) => Block[])) => void;
  removeWire: (wireId: string) => void;
  saveToHistory: () => void;
  updateWireAndConnectionColors: (wireId: string, color: string, wires: Wire[], blocks: Block[]) => {
    updatedWires: Wire[];
    updatedBlocks: Block[];
  };
}

export const BusWireItem: React.FC<BusWireItemProps> = ({
  wire,
  currentWireId,
  isExpanded,
  wires,
  blocks,
  onToggleExpand,
  setWires,
  setBlocks,
  removeWire,
  saveToHistory,
  updateWireAndConnectionColors
}) => {
  const availableGauges = getAvailableGauges();

  // Update wire gauge
  const updateWireGauge = (gauge: WireGauge | '') => {
    setWires(wires.map(w =>
      w.id === wire.id ? { ...w, wireGauge: gauge || undefined } : w
    ));
  };

  return (
    <div style={{
      background: wire.id === currentWireId ? '#2a3a4a' : '#0a1a2a',
      padding: '6px',
      borderRadius: '3px',
      marginBottom: '4px',
      borderLeft: `3px solid ${wire.color}`
    }}>
      {/* Wire header with expand arrow */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer'
        }}
        onClick={(e) => {
          e.stopPropagation();
          onToggleExpand();
        }}
      >
        <span style={{
          fontSize: '11px',
          color: '#aaa',
          marginRight: '5px',
          transition: 'transform 0.2s',
          display: 'inline-block',
          transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'
        }}>
          ▶
        </span>
        <div style={{ flex: 1, fontSize: '10px', color: '#fff' }}>
          {wire.label || 'Wire'}
        </div>
        <div
          style={{
            width: '20px',
            height: '20px',
            background: wire.color,
            border: '1px solid #555',
            borderRadius: '2px',
            marginLeft: '5px'
          }}
        />
      </div>

      {/* Expanded properties */}
      {isExpanded && (
        <div style={{ marginTop: '8px', paddingLeft: '16px' }}>
          <div style={{ marginBottom: '6px' }}>
            <div style={{ fontSize: '9px', color: '#aaa', marginBottom: '2px' }}>
              Wire Name:
            </div>
            <input
              type="text"
              value={wire.label || ''} // Allow empty string for editing
              placeholder="Wire Name"
              onChange={(e) => {
                e.stopPropagation();
                setWires(wires.map(w =>
                  w.id === wire.id ? { ...w, label: e.target.value } : w
                ));
              }}
              onBlur={(e) => {
                if (!e.target.value.trim()) {
                  // Optional: reset to default if left empty?
                  // setWires(wires.map(w => w.id === wire.id ? { ...w, label: 'Wire' } : w));
                }
                saveToHistory()
              }}
              style={{
                background: '#1a2a3a',
                border: '1px solid #555',
                color: '#fff',
                padding: '4px 6px',
                borderRadius: '2px',
                fontSize: '9px',
                width: '100%',
                fontFamily: 'monospace'
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div style={{ marginBottom: '6px' }}>
            <div style={{ fontSize: '9px', color: '#aaa', marginBottom: '2px' }}>
              Wire Color:
            </div>
            <input
              type="color"
              value={wire.color}
              onChange={(e) => {
                e.stopPropagation();
                const { updatedWires, updatedBlocks } = updateWireAndConnectionColors(
                  wire.id,
                  e.target.value,
                  wires,
                  blocks
                );
                setWires(updatedWires);
                setBlocks(updatedBlocks);
                saveToHistory();
              }}
              style={{
                width: '100%',
                height: '24px',
                border: '1px solid #555',
                borderRadius: '2px',
                cursor: 'pointer'
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Gauge Selector for Bus Wire */}
          <div style={{ marginBottom: '6px' }}>
            <div style={{ fontSize: '9px', color: '#aaa', marginBottom: '2px' }}>
              Wire Gauge:
            </div>
            <select
              value={wire.wireGauge || ''}
              onChange={(e) => {
                updateWireGauge(e.target.value as WireGauge | '');
                saveToHistory();
              }}
              style={{
                width: '100%',
                background: '#0a0a0a',
                border: '1px solid #555',
                color: '#fff',
                padding: '4px 6px',
                borderRadius: '2px',
                fontSize: '9px',
                cursor: 'pointer',
                fontFamily: 'monospace'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <option value="">Default (2px)</option>
              {availableGauges.map(gauge => (
                <option key={gauge} value={gauge}>
                  {gauge} ({AWG_CURRENT_CAPACITY[gauge]}A)
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '6px' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Remove this wire from the bus
                const { busGroupId, ...wireWithoutBusGroup } = wire;
                setWires(wires.map(w => w.id === wire.id ? wireWithoutBusGroup : w));
                saveToHistory();
              }}
              style={{
                background: '#FF8800',
                color: '#fff',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '9px',
                fontWeight: 'bold',
                width: '100%'
              }}
            >
              Remove from Bus
            </button>
          </div>
          <div style={{ marginBottom: '6px' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeWire(wire.id);
              }}
              style={{
                background: '#ff4444',
                color: '#fff',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '9px',
                fontWeight: 'bold',
                width: '100%'
              }}
            >
              Delete Wire
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
