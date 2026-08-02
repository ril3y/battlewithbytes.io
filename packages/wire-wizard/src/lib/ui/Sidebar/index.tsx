/**
 * Main Sidebar Component (Context-based)
 *
 * Uses contexts to dramatically reduce prop drilling:
 * - DiagramContext: blocks, wires, busGroups
 * - SelectionContext: selection state
 * - DisplayContext: display settings
 *
 * Props reduced from 57 to ~10
 */

import React from 'react';
import { useDiagram } from '../../core/contexts/DiagramContext';
import { useSelection } from '../../core/contexts/SelectionContext';
import { useDisplay } from '../../core/contexts/DisplayContext';
import { BlockEditor } from './BlockEditor';

// Props that still need to be passed (complex operations not in contexts)
export interface SidebarProps {
  // Bus group operations (complex logic - keep as props for now)
  isBusGroupMode: boolean;
  setIsBusGroupMode: (mode: boolean) => void;
  createBusGroup: () => void;
  ungroupBus: (busGroupId: string) => void;

  // Expanded bus wires UI state
  expandedBusWires: Set<string>;
  setExpandedBusWires: (wires: Set<string> | ((prev: Set<string>) => Set<string>)) => void;

  // History
  saveToHistory: () => void;

  // Connection point placement mode
  placementMode?: boolean;
  onStartPlacement?: (blockId: string) => void;
  onStopPlacement?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isBusGroupMode,
  setIsBusGroupMode,
  createBusGroup,
  ungroupBus,
  saveToHistory,
  placementMode,
  onStartPlacement,
  onStopPlacement
}) => {
  // Get state from contexts
  const { blocks, wires, busGroups, removeWire } = useDiagram();
  const { selectedBlockId, selectedWireId, selectedWireIds, toggleWireSelection, setSelectedWireIds, selectWire } = useSelection();
  const { sidebarOpen } = useDisplay();

  return (
    <div style={{
      width: '350px',
      background: '#0a0a0a',
      borderRight: '1px solid #333',
      overflowY: 'auto',
      padding: '20px',
      color: '#00ffa0',
      fontFamily: 'monospace',
      fontSize: '11px',
      transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
      transition: 'transform 0.3s ease-in-out',
      position: 'fixed',
      left: 0,
      top: '60px',
      bottom: 0,
      zIndex: 1000,
      boxShadow: sidebarOpen ? '5px 0 15px rgba(0,0,0,0.5)' : 'none'
    }}>
      {/* Selection Info */}
      {selectedBlockId && (
        <div style={{
          background: '#1a1a1a',
          padding: '10px',
          borderRadius: '5px',
          border: '1px solid #00ffa0',
          marginBottom: '15px'
        }}>
          <div style={{ fontSize: '10px', color: '#888' }}>Selected</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '3px' }}>Block</div>
        </div>
      )}
      {selectedWireId && (
        <div style={{
          background: '#1a1a1a',
          padding: '10px',
          borderRadius: '5px',
          border: '1px solid #00ffa0',
          marginBottom: '15px'
        }}>
          <div style={{ fontSize: '10px', color: '#888' }}>Selected</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '3px' }}>Wire</div>
        </div>
      )}

      {/* Block Editor - now uses contexts */}
      <BlockEditor
        placementMode={placementMode}
        onStartPlacement={onStartPlacement}
        onStopPlacement={onStopPlacement}
      />

      {/* Wires Section - simplified for now */}
      <div style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h4 style={{ margin: 0, fontSize: '13px' }}>Wires ({wires.length})</h4>
          {!isBusGroupMode ? (
            <button
              onClick={() => setIsBusGroupMode(true)}
              style={{
                background: '#4488ff',
                color: '#fff',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '10px'
              }}
            >
              Create Bus
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '5px' }}>
              <button
                onClick={createBusGroup}
                disabled={selectedWireIds.length < 2}
                style={{
                  background: selectedWireIds.length >= 2 ? '#00ffa0' : '#333',
                  color: selectedWireIds.length >= 2 ? '#000' : '#666',
                  border: 'none',
                  padding: '4px 8px',
                  borderRadius: '3px',
                  cursor: selectedWireIds.length >= 2 ? 'pointer' : 'not-allowed',
                  fontSize: '10px'
                }}
              >
                Group ({selectedWireIds.length})
              </button>
              <button
                onClick={() => {
                  setIsBusGroupMode(false);
                  setSelectedWireIds([]);
                }}
                style={{
                  background: '#ff4444',
                  color: '#fff',
                  border: 'none',
                  padding: '4px 8px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '10px'
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Wire list */}
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {wires.map(wire => {
            const fromBlock = blocks.find(b => b.id === wire.fromBlockId);
            const toBlock = blocks.find(b => b.id === wire.toBlockId);
            const isSelected = selectedWireId === wire.id;
            const isInMultiSelect = selectedWireIds.includes(wire.id);

            return (
              <div
                key={wire.id}
                onClick={() => {
                  if (isBusGroupMode) {
                    toggleWireSelection(wire.id);
                  } else {
                    selectWire(wire.id);
                  }
                }}
                style={{
                  background: isSelected ? '#1a3320' : isInMultiSelect ? '#2a2a4a' : '#1a1a1a',
                  padding: '8px',
                  borderRadius: '5px',
                  marginBottom: '5px',
                  border: isSelected ? '1px solid #00ffa0' : isInMultiSelect ? '1px solid #4488ff' : '1px solid #333',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{
                      width: '12px',
                      height: '4px',
                      background: wire.color,
                      borderRadius: '2px'
                    }} />
                    <span style={{ color: '#fff', fontSize: '10px' }}>
                      {wire.netName || wire.label || `${fromBlock?.label || '?'} -> ${toBlock?.label || '?'}`}
                    </span>
                    {wire.busGroupId && (
                      <span style={{ color: '#4488ff', fontSize: '9px' }}>
                        [{busGroups[wire.busGroupId]?.name || 'Bus'}]
                      </span>
                    )}
                  </div>
                  {!isBusGroupMode && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeWire(wire.id);
                        saveToHistory();
                      }}
                      style={{
                        background: '#ff4444',
                        color: '#fff',
                        border: 'none',
                        padding: '2px 6px',
                        borderRadius: '2px',
                        cursor: 'pointer',
                        fontSize: '9px'
                      }}
                    >
                      x
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bus Groups */}
      {Object.keys(busGroups).length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '13px' }}>Bus Groups</h4>
          {Object.entries(busGroups).map(([busId, busData]) => {
            const busWires = wires.filter(w => w.busGroupId === busId);
            return (
              <div
                key={busId}
                style={{
                  background: '#1a1a2a',
                  padding: '10px',
                  borderRadius: '5px',
                  marginBottom: '8px',
                  border: '1px solid #4488ff'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#4488ff', fontWeight: 'bold', fontSize: '11px' }}>
                    {busData.name} ({busWires.length} wires)
                  </span>
                  <button
                    onClick={() => ungroupBus(busId)}
                    style={{
                      background: '#ff4444',
                      color: '#fff',
                      border: 'none',
                      padding: '2px 8px',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '9px'
                    }}
                  >
                    Ungroup
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
