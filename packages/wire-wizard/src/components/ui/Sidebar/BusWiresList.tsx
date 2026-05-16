/**
 * Bus Wires List
 * Shows detailed list of wires within a bus group
 */

import React from 'react';
import type { Wire, Block } from '../../../lib/core/types';
import { BusWireItem } from './BusWireItem';

interface BusWiresListProps {
  currentWireId: string;
  busGroupId: string;
  busGroupWires: Wire[];
  busGroups: Record<string, { name: string; rotation?: number }>;
  expandedBusWires: Set<string>;
  wires: Wire[];
  blocks: Block[];
  setExpandedBusWires: (wires: Set<string>) => void;
  setBusGroups: (groups: Record<string, { name: string; rotation?: number }>) => void;
  setWires: (wires: Wire[] | ((prev: Wire[]) => Wire[])) => void;
  setBlocks: (blocks: Block[] | ((prev: Block[]) => Block[])) => void;
  removeWire: (wireId: string) => void;
  saveToHistory: () => void;
  updateWireAndConnectionColors: (wireId: string, color: string, wires: Wire[], blocks: Block[]) => {
    updatedWires: Wire[];
    updatedBlocks: Block[];
  };
}

export const BusWiresList: React.FC<BusWiresListProps> = ({
  currentWireId,
  busGroupId,
  busGroupWires,
  busGroups,
  expandedBusWires,
  wires,
  blocks,
  setExpandedBusWires,
  setBusGroups,
  setWires,
  setBlocks,
  removeWire,
  saveToHistory,
  updateWireAndConnectionColors
}) => {
  return (
    <div style={{
      background: '#1a2a3a',
      padding: '10px',
      borderRadius: '5px',
      marginBottom: '10px',
      border: '1px solid #00aaff'
    }}>
      <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '8px', color: '#00aaff', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>Bus:</span>
        <input
          type="text"
          value={busGroups[busGroupId]?.name || 'Unnamed'}
          onChange={(e) => {
            e.stopPropagation();
            setBusGroups({
              ...busGroups,
              [busGroupId]: { name: e.target.value }
            });
          }}
          onBlur={() => saveToHistory()}
          style={{
            background: '#0a1a2a',
            border: '1px solid #00aaff',
            color: '#00aaff',
            padding: '4px 8px',
            borderRadius: '3px',
            fontSize: '11px',
            fontWeight: 'bold',
            flex: 1,
            fontFamily: 'monospace'
          }}
          onClick={(e) => e.stopPropagation()}
        />
        <span style={{ whiteSpace: 'nowrap' }}>[{busGroupWires.length} wires]</span>
      </div>
      {busGroupWires.map(busWire => {
        const isExpanded = expandedBusWires.has(busWire.id);
        return (
          <BusWireItem
            key={busWire.id}
            wire={busWire}
            currentWireId={currentWireId}
            isExpanded={isExpanded}
            wires={wires}
            blocks={blocks}
            onToggleExpand={() => {
              const newExpanded = new Set(expandedBusWires);
              if (isExpanded) {
                newExpanded.delete(busWire.id);
              } else {
                newExpanded.add(busWire.id);
              }
              setExpandedBusWires(newExpanded);
            }}
            setWires={setWires}
            setBlocks={setBlocks}
            removeWire={removeWire}
            saveToHistory={saveToHistory}
            updateWireAndConnectionColors={updateWireAndConnectionColors}
          />
        );
      })}
    </div>
  );
};
