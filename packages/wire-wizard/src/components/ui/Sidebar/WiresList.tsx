/**
 * Wires List
 * Displays and manages list of wires in the sidebar
 *
 * Refactored to use React contexts for most state/actions.
 */

import React, { useState, useMemo } from 'react';
import type { Wire } from '../../../lib/core/types';
import { WireListItem } from './WireListItem';
import { useDiagram } from '../../../lib/core/contexts/DiagramContext';
import { useSelection } from '../../../lib/core/contexts/SelectionContext';
import { useInteraction } from '../../../lib/core/contexts/InteractionContext';
import { useBusOperations } from '../../../lib/bus/hooks/useBusOperations';

export const WiresList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Get state from contexts
  const {
    wires,
    setWires,
    busGroups,
    setBusGroups,
    saveToHistory
  } = useDiagram();

  const {
    selectedBlockId,
    selectedWireId,
    selectedWireIds,
    setSelectedWireIds
  } = useSelection();

  const {
    isBusGroupMode,
    setBusGroupMode,
    setAddingToBusWireId
  } = useInteraction();

  // Initialize bus operations hook
  const { createBusGroup } = useBusOperations({
    wires,
    setWires,
    busGroups,
    setBusGroups,
    selectedWireIds,
    setSelectedWireIds,
    saveToHistory,
    setBusGroupMode,
    setAddingToBusWireId
  });

  // Filter wires: if block selected, only show wires connected to that block
  const filteredWires = wires.filter(wire => {
    if (!selectedBlockId) return true;
    return wire.fromBlockId === selectedBlockId || wire.toBlockId === selectedBlockId;
  });

  // Deduplicate and Search Logic
  const finalWiresToDisplay = useMemo(() => {
    // If not in bus group mode and a single wire is selected, ONLY show that wire
    if (!isBusGroupMode && selectedWireId) {
      const selectedWire = wires.find(w => w.id === selectedWireId);
      return selectedWire ? [selectedWire] : [];
    }

    // If searching, show all matching wires (expand buses effectively)
    if (searchTerm.trim()) {
      const lowerTerm = searchTerm.toLowerCase();
      return filteredWires.filter(w =>
        (w.netName || '').toLowerCase().includes(lowerTerm) ||
        (w.label || '').toLowerCase().includes(lowerTerm) ||
        (w.busGroupId && busGroups[w.busGroupId]?.name.toLowerCase().includes(lowerTerm))
      );
    } else {
      // Default view: Deduplicate buses
      const seenBuses = new Set<string>();
      const result: Wire[] = [];
      for (const w of filteredWires) {
        if (w.busGroupId) {
          if (!seenBuses.has(w.busGroupId)) {
            seenBuses.add(w.busGroupId);
            result.push(w);
          }
        } else {
          result.push(w);
        }
      }
      return result;
    }
  }, [wires, filteredWires, searchTerm, busGroups, isBusGroupMode, selectedWireId]);

  if (wires.length === 0) {
    return null;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h4 style={{ margin: 0, fontSize: '13px' }}>
          Wires ({filteredWires.length}{selectedBlockId ? ' on block' : ''})
        </h4>
        {!isBusGroupMode ? (
          <button
            onClick={() => {
              setBusGroupMode(true);
              setSelectedWireIds([]);
            }}
            style={{
              background: '#00aaff',
              color: '#fff',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '9px',
              fontWeight: 'bold'
            }}
          >
            Group Bus
          </button>
        ) : (
          <button
            onClick={() => {
              setBusGroupMode(false);
              setSelectedWireIds([]);
            }}
            style={{
              background: '#FF8800',
              color: '#fff',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '9px',
              fontWeight: 'bold'
            }}
          >
            Cancel
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '10px' }}>
        <input
          type="text"
          placeholder="Search wires..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            background: '#111',
            border: '1px solid #333',
            borderRadius: '3px',
            padding: '6px',
            color: '#fff',
            fontSize: '11px'
          }}
        />
      </div>

      {isBusGroupMode && (
        <div style={{
          background: '#1a3a5a',
          padding: '10px',
          borderRadius: '5px',
          marginBottom: '10px',
          fontSize: '10px',
          color: '#00aaff',
          textAlign: 'center'
        }}>
          {selectedWireIds.length === 0 ? (
            'Click wires below to select them for bus grouping'
          ) : selectedWireIds.length === 1 ? (
            'Select at least one more wire to create a bus'
          ) : (
            <button
              onClick={createBusGroup}
              style={{
                width: '100%',
                background: '#00ffa0',
                color: '#000',
                border: 'none',
                padding: '8px',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '10px',
                fontWeight: 'bold'
              }}
            >
              Create Bus ({selectedWireIds.length} wires)
            </button>
          )}
        </div>
      )}
      {finalWiresToDisplay.map(wire => (
        <WireListItem
          key={wire.id}
          wire={wire}
        />
      ))}
    </div>
  );
};
