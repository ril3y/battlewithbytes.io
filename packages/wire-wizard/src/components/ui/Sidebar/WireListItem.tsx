/**
 * Wire List Item
 * Individual wire item with editing controls
 */

import React, { useState } from 'react';
import type { Wire, WireGauge } from '../../../lib/core/types';
import { useDiagram } from '../../../lib/core/contexts/DiagramContext';
import { useSelection } from '../../../lib/core/contexts/SelectionContext';
import { useInteraction } from '../../../lib/core/contexts/InteractionContext';
import { useBusOperations } from '../../../lib/bus/hooks/useBusOperations';
import { BusWiresList } from './BusWiresList';
import {
  getAvailableGauges,
  getAllSegmentGauges,
  setSegmentGauge,
  AWG_CURRENT_CAPACITY
} from '../../../lib/wires/wireGaugeUtils';
import { updateWireAndConnectionColors } from '../../../lib/wires/wireUtils';

interface WireListItemProps {
  wire: Wire;
}

export const WireListItem: React.FC<WireListItemProps> = ({
  wire,
}) => {
  // Get state from contexts
  const {
    wires,
    setWires,
    blocks,
    setBlocks,
    busGroups,
    setBusGroups,
    removeWire,
    addBendPointToWire,
    removeBendPoint,
    saveToHistory
  } = useDiagram();

  const {
    isWireSelected,
    isWireInMultiSelect,
    selectWire,
    toggleWireSelection,
    selectedWireIds,
    setSelectedWireIds
  } = useSelection();

  const {
    isBusGroupMode,
    setBusGroupMode,
    expandedBusWires,
    setExpandedBusWires,
    setAddingToBusWireId
  } = useInteraction();

  // Initialize bus operations hook
  const { ungroupBus } = useBusOperations({
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

  const busGroupWires = wires.filter(w => w.busGroupId && w.busGroupId === wire.busGroupId);
  const isInBus = !!wire.busGroupId;
  const isSelected = isWireSelected(wire.id);
  const isMultiSelected = isWireInMultiSelect(wire.id);
  const [showGaugeSettings, setShowGaugeSettings] = useState(false);

  // Get available gauges and current segment gauges
  const availableGauges = getAvailableGauges();
  const segmentGauges = getAllSegmentGauges(wire);
  const segmentCount = wire.bendPoints.length + 1;

  // Update wire gauge
  const updateWireGauge = (gauge: WireGauge | '') => {
    setWires(wires.map(w =>
      w.id === wire.id ? { ...w, wireGauge: gauge || undefined } : w
    ));
  };

  // Update specific segment gauge
  const updateSegmentGaugeValue = (segmentIndex: number, gauge: WireGauge | null) => {
    const updatedWire = setSegmentGauge(wire, segmentIndex, gauge);
    setWires(wires.map(w => w.id === wire.id ? updatedWire : w));
  };

  return (
    <div
      onClick={() => {
        if (isBusGroupMode) {
          toggleWireSelection(wire.id);
        } else {
          selectWire(wire.id);
        }
      }}
      style={{
        background: isMultiSelected ? '#2a4a5a' : (isSelected ? '#1a3320' : '#222'),
        padding: '8px',
        borderRadius: '3px',
        marginBottom: '5px',
        borderTop: isMultiSelected ? '2px solid #00aaff' : (isSelected ? '1px solid #00ffa0' : 'none'),
        borderRight: isMultiSelected ? '2px solid #00aaff' : (isSelected ? '1px solid #00ffa0' : 'none'),
        borderBottom: isMultiSelected ? '2px solid #00aaff' : (isSelected ? '1px solid #00ffa0' : 'none'),
        borderLeft: `3px solid ${wire.color}`,
        cursor: 'pointer'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '10px', color: '#fff' }}>
            {isInBus ? (
              <span style={{ color: '#00aaff', fontWeight: 'bold' }}>
                {busGroups[wire.busGroupId!]?.name || 'Unnamed Bus'} (Bus Group)
              </span>
            ) : (
              <span>{wire.label && wire.label !== 'Wire' ? wire.label : 'Wire'}</span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeWire(wire.id);
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
            ×
          </button>
        </div>
      </div>
      {isSelected && (
        <div style={{ marginTop: '8px' }}>
          <div style={{ marginBottom: '5px' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                addBendPointToWire(wire.id);
              }}
              style={{
                background: '#00ffa0',
                color: '#000',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '10px',
                fontWeight: 'bold',
                marginRight: '5px'
              }}
            >
              + Bend Point
            </button>
            {isInBus && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (wire.busGroupId) {
                    ungroupBus(wire.busGroupId);
                  }
                }}
                style={{
                  background: '#FF8800',
                  color: '#fff',
                  border: 'none',
                  padding: '4px 8px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '10px',
                  fontWeight: 'bold'
                }}
              >
                Ungroup Bus
              </button>
            )}
          </div>

          {/* Net Name - For electrical connectivity */}
          {!isInBus && (
            <div style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '10px', color: '#aaa', marginBottom: '4px' }}>
                Electrical Net / Signal Name:
              </div>
              <input
                type="text"
                placeholder="Enter net name (e.g., CAN_H, 12V_MAIN)"
                value={wire.netName || ''}
                onChange={(e) => {
                  e.stopPropagation();
                  const newNetName = e.target.value;

                  // Find all electrically connected wires (via junctions or block connections)
                  const connectedWireIds = new Set<string>([wire.id]);
                  const wiresToCheck = [wire];
                  const checkedWires = new Set<string>();

                  // Breadth-first search for all connected wires
                  while (wiresToCheck.length > 0) {
                    const currentWire = wiresToCheck.pop()!;
                    if (checkedWires.has(currentWire.id)) continue;
                    checkedWires.add(currentWire.id);

                    // Find wires connected via junctions
                    wires.forEach(w => {
                      if (checkedWires.has(w.id)) return;

                      // Check if they share a junction point
                      const sharesJunction =
                        // Current wire's endpoints match other wire's endpoints
                        (currentWire.fromJunctionX !== undefined && currentWire.fromJunctionY !== undefined &&
                          ((w.fromJunctionX === currentWire.fromJunctionX && w.fromJunctionY === currentWire.fromJunctionY) ||
                            (w.toJunctionX === currentWire.fromJunctionX && w.toJunctionY === currentWire.fromJunctionY))) ||
                        (currentWire.toJunctionX !== undefined && currentWire.toJunctionY !== undefined &&
                          ((w.fromJunctionX === currentWire.toJunctionX && w.fromJunctionY === currentWire.toJunctionY) ||
                            (w.toJunctionX === currentWire.toJunctionX && w.toJunctionY === currentWire.toJunctionY)));

                      // Check if they share a block connection point
                      const sharesBlockConnection =
                        (currentWire.fromBlockId && currentWire.fromPointId &&
                          w.fromBlockId === currentWire.fromBlockId && w.fromPointId === currentWire.fromPointId) ||
                        (currentWire.fromBlockId && currentWire.fromPointId &&
                          w.toBlockId === currentWire.fromBlockId && w.toPointId === currentWire.fromPointId) ||
                        (currentWire.toBlockId && currentWire.toPointId &&
                          w.fromBlockId === currentWire.toBlockId && w.fromPointId === currentWire.toPointId) ||
                        (currentWire.toBlockId && currentWire.toPointId &&
                          w.toBlockId === currentWire.toBlockId && w.toPointId === currentWire.toPointId);

                      if (sharesJunction || sharesBlockConnection) {
                        connectedWireIds.add(w.id);
                        wiresToCheck.push(w);
                      }
                    });
                  }

                  // Update net name for all connected wires
                  setWires(wires.map(w =>
                    connectedWireIds.has(w.id) ? { ...w, netName: newNetName } : w
                  ));
                }}
                onBlur={() => saveToHistory()}
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: '#0a1a2a',
                  border: '1px solid #00ff88',
                  color: '#00ff88',
                  padding: '4px 8px',
                  borderRadius: '3px',
                  fontSize: '10px',
                  width: '100%',
                  fontFamily: 'monospace'
                }}
              />
            </div>
          )}

          {/* Bus Sheath Color - Only for buses */}
          {isInBus && (
            <div style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '10px', color: '#aaa', marginBottom: '4px' }}>
                Bus Sheath Color (Outer):
              </div>
              <input
                type="color"
                value={busGroups[wire.busGroupId!]?.color || '#555555'}
                onChange={(e) => {
                  e.stopPropagation();
                  const busId = wire.busGroupId!;
                  setBusGroups({
                    ...busGroups,
                    [busId]: { ...busGroups[busId], color: e.target.value }
                  });
                  saveToHistory();
                }}
                onBlur={() => saveToHistory()}
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: '100%',
                  height: '32px',
                  border: '1px solid #333',
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
              />
            </div>
          )}

          {/* Wire Color - Updates wire and connection point colors */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '10px', color: '#aaa', marginBottom: '4px' }}>
              {isInBus ? 'Inner Wire Color:' : 'Wire Color:'}
            </div>
            <input
              type="color"
              value={wire.color}
              onChange={(e) => {
                e.stopPropagation();
                // This function returns new objects, we need to set them
                const { updatedWires, updatedBlocks } = updateWireAndConnectionColors(
                  wire.id,
                  e.target.value,
                  wires,
                  blocks
                );
                setWires(updatedWires);
                setBlocks(updatedBlocks);
              }}
              onBlur={() => saveToHistory()}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                height: '32px',
                border: '1px solid #333',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            />
          </div>

          {/* Wire Gauge Settings */}
          <div style={{ marginBottom: '10px' }}>
            <div
              onClick={(e) => {
                e.stopPropagation();
                setShowGaugeSettings(!showGaugeSettings);
              }}
              style={{
                fontSize: '10px',
                color: '#aaa',
                marginBottom: '4px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>Wire Gauge (Thickness):</span>
              <span style={{ color: '#00ffa0', fontSize: '9px' }}>
                {showGaugeSettings ? '▼ Hide' : '▶ Show'}
              </span>
            </div>

            {showGaugeSettings && (
              <div
                style={{
                  background: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '3px',
                  padding: '8px',
                  marginTop: '5px'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Default wire gauge */}
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '9px', color: '#888', marginBottom: '4px' }}>
                    Default Gauge (All Segments):
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
                      padding: '6px',
                      borderRadius: '3px',
                      fontSize: '10px',
                      cursor: 'pointer',
                      fontFamily: 'monospace'
                    }}
                  >
                    <option value="">None (2px default)</option>
                    {availableGauges.map(gauge => (
                      <option key={gauge} value={gauge}>
                        {gauge} ({AWG_CURRENT_CAPACITY[gauge]}A)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Per-segment gauge overrides */}
                {segmentCount > 1 && (
                  <>
                    <div style={{
                      fontSize: '9px',
                      color: '#888',
                      marginBottom: '6px',
                      borderTop: '1px solid #333',
                      paddingTop: '8px'
                    }}>
                      Per-Segment Overrides:
                    </div>
                    {Array.from({ length: segmentCount }).map((_, index) => {
                      const currentGauge = segmentGauges[index];
                      const hasOverride = wire.segmentGauges?.some(sg => sg.segmentIndex === index);

                      return (
                        <div key={index} style={{ marginBottom: '6px' }}>
                          <div style={{
                            fontSize: '8px',
                            color: hasOverride ? '#00ffa0' : '#666',
                            marginBottom: '2px',
                            fontWeight: hasOverride ? 'bold' : 'normal'
                          }}>
                            Segment {index + 1}
                            {index === 0 && ' (Start → Bend 1)'}
                            {index > 0 && index < segmentCount - 1 && ` (Bend ${index} → Bend ${index + 1})`}
                            {index === segmentCount - 1 && index > 0 && ` (Bend ${index} → End)`}
                            {hasOverride && ' (override)'}
                          </div>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <select
                              value={hasOverride && currentGauge ? currentGauge : ''}
                              onChange={(e) => {
                                const value = e.target.value as WireGauge | '';
                                updateSegmentGaugeValue(index, value || null);
                                saveToHistory();
                              }}
                              style={{
                                flex: 1,
                                background: hasOverride ? '#0a2a1a' : '#0a0a0a',
                                border: hasOverride ? '1px solid #00ffa0' : '1px solid #444',
                                color: hasOverride ? '#00ffa0' : '#aaa',
                                padding: '4px',
                                borderRadius: '3px',
                                fontSize: '9px',
                                cursor: 'pointer',
                                fontFamily: 'monospace'
                              }}
                            >
                              <option value="">
                                {wire.wireGauge ? `Use default (${wire.wireGauge})` : 'Use default (2px)'}
                              </option>
                              {availableGauges.map(gauge => (
                                <option key={gauge} value={gauge}>
                                  {gauge} ({AWG_CURRENT_CAPACITY[gauge]}A)
                                </option>
                              ))}
                            </select>
                            {hasOverride && (
                              <button
                                onClick={() => {
                                  updateSegmentGaugeValue(index, null);
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
                                title="Remove override"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}

                <div style={{
                  fontSize: '8px',
                  color: '#666',
                  marginTop: '8px',
                  padding: '6px',
                  background: '#0a0a0a',
                  borderRadius: '3px',
                  lineHeight: '1.4'
                }}>
                  💡 Tip: Set a default gauge for the whole wire, then override specific segments that need different thickness (e.g., high-current sections)
                </div>
              </div>
            )}
          </div>

          {/* Bus Assignment - Available for all wires */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '10px', color: '#aaa', marginBottom: '4px' }}>
              Bus Assignment (Visual Bundling):
            </div>
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
              <select
                value={wire.busGroupId || ''}
                onChange={(e) => {
                  e.stopPropagation();
                  const selectedBusId = e.target.value;

                  if (!selectedBusId) {
                    // Remove from bus (None/Ungroup Wire)
                    if (wire.busGroupId) {
                      const oldBusId = wire.busGroupId;
                      const { busGroupId, ...wireWithoutBusGroup } = wire;
                      setWires(wires.map(w => w.id === wire.id ? wireWithoutBusGroup : w));

                      // Check if old bus will be empty
                      const wiresInOldBus = wires.filter(w => w.busGroupId === oldBusId && w.id !== wire.id);
                      if (wiresInOldBus.length === 0) {
                        // Clean up old bus
                        const { [oldBusId]: removed, ...rest } = busGroups;
                        setBusGroups(rest);
                      }
                      saveToHistory();
                    }
                  } else if (selectedBusId === '__delete__') {
                    // Delete bus group (ungroup all wires)
                    if (wire.busGroupId) {
                      const confirmDelete = window.confirm("Are you sure you want to delete this bus group? All wires will be ungrouped.");
                      if (!confirmDelete) return;

                      const busIdToDelete = wire.busGroupId;

                      // Remove bus group ID from all wires in this bus
                      setWires(wires.map(w =>
                        w.busGroupId === busIdToDelete ? { ...w, busGroupId: undefined } : w
                      ));

                      // Remove the bus group definition
                      const { [busIdToDelete]: removed, ...remainingBusGroups } = busGroups;
                      setBusGroups(remainingBusGroups);
                      saveToHistory();
                    }
                  } else if (selectedBusId === '__new__') {
                    // Create new bus - will be handled by the input field
                    if (wire.busGroupId) {
                      const confirmMove = window.confirm("This wire is already in a bus. Do you want to move it to a new bus group?");
                      if (!confirmMove) return;

                      // Check if old bus will be empty
                      const oldBusId = wire.busGroupId;
                      const wiresInOldBus = wires.filter(w => w.busGroupId === oldBusId && w.id !== wire.id);
                      if (wiresInOldBus.length === 0) {
                        const { [oldBusId]: removed, ...remainingBusGroups } = busGroups;
                        setBusGroups(remainingBusGroups);
                      }
                    }

                    const newBusId = `bus_${Date.now()}`;
                    const newBusName = 'New Bus';

                    setBusGroups({
                      ...busGroups,
                      [newBusId]: { name: newBusName }
                    });
                    setWires(wires.map(w =>
                      w.id === wire.id ? { ...w, busGroupId: newBusId } : w
                    ));
                    saveToHistory();
                  } else {
                    // Assign to existing bus
                    // Check if old bus will be empty (if moving from one bus to another)
                    if (wire.busGroupId && wire.busGroupId !== selectedBusId) {
                      const oldBusId = wire.busGroupId;
                      const wiresInOldBus = wires.filter(w => w.busGroupId === oldBusId && w.id !== wire.id);
                      if (wiresInOldBus.length === 0) {
                        const { [oldBusId]: removed, ...rest } = busGroups;
                        setBusGroups(rest);
                      }
                    }

                    setWires(wires.map(w =>
                      w.id === wire.id ? { ...w, busGroupId: selectedBusId } : w
                    ));
                    saveToHistory();
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: '#1a2a3a',
                  border: '1px solid #555',
                  color: '#fff',
                  padding: '4px 8px',
                  borderRadius: '3px',
                  fontSize: '10px',
                  flex: 1,
                  cursor: 'pointer'
                }}
              >
                <option value="">None (Ungroup Wire)</option>
                {wire.busGroupId && (
                  <option value="__delete__" style={{ color: '#ff4444' }}>🗑 Delete Bus (Ungroup All)</option>
                )}
                <option disabled>──────────</option>
                <option value="" disabled style={{ display: 'none' }}>None</option>
                {Object.entries(busGroups).map(([busId, busData]) => (
                  <option key={busId} value={busId}>
                    {busData.name}
                  </option>
                ))}
                <option value="__new__">+ Create New Bus</option>
              </select>
            </div>
          </div>

          {isInBus && (
            <div style={{ marginBottom: '5px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '10px',
                color: '#fff',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={wire.showColoredStripes || false}
                  onChange={(e) => {
                    e.stopPropagation();
                    // Update all wires in the bus group
                    if (wire.busGroupId) {
                      setWires(wires.map(w =>
                        w.busGroupId === wire.busGroupId
                          ? { ...w, showColoredStripes: e.target.checked }
                          : w
                      ));
                      saveToHistory();
                    }
                  }}
                  style={{ marginRight: '5px' }}
                />
                Show Colored Stripes
              </label>
            </div>
          )}

          {/* Show all wires in this bus group */}
          {isInBus && wire.busGroupId && (
            <BusWiresList
              currentWireId={wire.id}
              busGroupId={wire.busGroupId}
              busGroupWires={busGroupWires}
              busGroups={busGroups}
              expandedBusWires={expandedBusWires}
              wires={wires}
              blocks={blocks}
              setExpandedBusWires={setExpandedBusWires}
              setBusGroups={setBusGroups}
              setWires={setWires}
              setBlocks={setBlocks}
              removeWire={removeWire}
              saveToHistory={saveToHistory}
              updateWireAndConnectionColors={(wireId, color) => {
                const result = updateWireAndConnectionColors(wireId, color, wires, blocks);
                setWires(result.updatedWires);
                setBlocks(result.updatedBlocks);
                return result;
              }}
            />
          )}

          {/* Bend Points Panel */}
          <div style={{
            background: '#1a1a1a',
            borderRadius: '5px',
            border: '1px solid #333',
            padding: '10px',
            marginTop: '10px'
          }}>
            <div style={{
              fontSize: '11px',
              color: '#aaa',
              borderBottom: '1px solid #333',
              paddingBottom: '5px',
              marginBottom: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>Bend Points ({wire.bendPoints.length})</span>
            </div>

            {wire.bendPoints.length === 0 ? (
              <div style={{ fontSize: '10px', color: '#666', fontStyle: 'italic', marginBottom: '8px' }}>
                No bend points.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' }}>
                {wire.bendPoints.map((_, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#0a0a0a',
                    padding: '4px 8px',
                    borderRadius: '3px',
                    border: '1px solid #333'
                  }}>
                    <span style={{ fontSize: '10px', color: '#ccc' }}>Bend {idx + 1}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeBendPoint(wire.id, idx);
                      }}
                      style={{
                        background: 'transparent',
                        color: '#ff4444',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '12px',
                        padding: '0 4px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title="Delete Bend Point"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                addBendPointToWire(wire.id);
              }}
              style={{
                width: '100%',
                background: '#222',
                color: '#00ffa0',
                border: '1px dashed #00ffa0',
                padding: '6px',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '10px',
                fontWeight: 'bold',
                transition: 'all 0.2s'
              }}
            >
              + Add Bend Point
            </button>
          </div>
        </div>
      )
      }
    </div >
  );
};
