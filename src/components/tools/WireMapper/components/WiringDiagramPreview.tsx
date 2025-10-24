'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useWireMapperStore } from '../store/useWireMapperStore';
import { Connector, Pin } from '../types';
import { produce } from 'immer';

// Layout Constants
const CONNECTOR_WIDTH = 230; // px
const CONNECTOR_HEADER_HEIGHT = 40; // Approximate px for name (p-2 + line height)
const CONNECTOR_TYPE_HEADER_HEIGHT = 25; // Approximate px for type (py-1 + line height)
const PIN_ROW_HEIGHT = 30; // px
const VERTICAL_GAP_BETWEEN_CONNECTORS = 40; // px
const HORIZONTAL_GAP_BETWEEN_COLUMNS = 100; // px, space for wires
const SVG_PADDING = 20; // px, padding around the entire diagram

// Helper function to convert AWG gauge to stroke width
const gaugeToStrokeWidth = (gauge?: string): number => {
  if (!gauge) return 2.5; // Default
  const awgMap: Record<string, number> = {
    '26 AWG': 1.5,
    '24 AWG': 2,
    '22 AWG': 2.5,
    '20 AWG': 3,
    '18 AWG': 3.5,
    '16 AWG': 4,
    '14 AWG': 5,
    '12 AWG': 6,
  };
  return awgMap[gauge] || 2.5;
};

interface ConnectorTableProps {
  connector: Connector;
  position: 'left' | 'right';
  usedPins: Set<string>;
  wireColors: Map<string, string>; // Map of pinId to wire color
  netNames: Map<string, string>; // Map of pinId to net name from mappings
  connectorIndex: number; // Index for positioning
  isLeftColumn: boolean;
  onPinNameUpdate: (connectorId: string, pinPos: number, newName: string) => void;
}

// Component to render a single connector as a table
const ConnectorTable: React.FC<ConnectorTableProps> = ({
  connector,
  position,
  usedPins,
  wireColors,
  netNames,
  onPinNameUpdate,
}) => {
  const [editingPinPos, setEditingPinPos] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  // Only show pins that are used in mappings
  const connectorPins = connector.pins.filter(pin => 
    usedPins.has(`${connector.id}-${pin.pos}`)
  );

  // Sort pins by position
  const sortedPins = [...connectorPins].sort((a, b) => a.pos - b.pos);
  
  const tableStyle = {
    width: `${CONNECTOR_WIDTH}px`,
    backgroundColor: '#0F172A',
    borderRadius: '4px',
  };
  
  return (
    <div 
      style={tableStyle} 
      className="border border-gray-700 overflow-hidden"
      data-connector-id={connector.id}
    >
      {/* Connector Name */}
      <div 
        className="bg-gray-800 p-2 text-center font-mono text-green-400 border-b border-gray-700"
        style={{ height: `${CONNECTOR_HEADER_HEIGHT}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {connector.name || 'Unknown'}
      </div>
      
      {/* Connector Type and Pin Count */}
      <div 
        className="text-center py-1 text-xs text-gray-400 border-b border-gray-700"
        style={{ height: `${CONNECTOR_TYPE_HEADER_HEIGHT}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {connector.type || 'Unknown'} {connector.pins.length}-pin
      </div>
      
      {/* Pin Table */}
      <table className="w-full" style={{ borderCollapse: 'collapse' }}>
        <tbody>
          {sortedPins.map((pin, index) => {
            const pinKey = `${connector.id}-${pin.pos}`;
            const color = wireColors.get(pinKey) || '#fff'; // Default to white if no color found
            const displayName = pin.name || `Pin ${pin.pos}`;
            const displayNet = netNames.get(pinKey) || '';
            
            const dataAttrs = {
              'data-pin-id': pinKey,
              'data-pin-index': index, // Visual index of displayed pins
              'data-pin-pos': pin.pos, // Original pin position number
              'data-connector-id': connector.id,
              'data-connector-position': position,
            };
            
            const isEditing = editingPinPos === pin.pos;

            const handleStartEdit = (e: React.MouseEvent) => {
              e.stopPropagation(); // Prevent event bubbling
              setEditingPinPos(pin.pos);
              setEditValue(pin.name || '');
            };

            const handleSave = () => {
              if (editValue.trim() !== '') {
                onPinNameUpdate(connector.id, pin.pos, editValue);
              }
              setEditingPinPos(null);
            };

            const handleCancel = () => {
              setEditingPinPos(null);
              setEditValue('');
            };

            const handleKeyDown = (e: React.KeyboardEvent) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSave();
              }
              if (e.key === 'Escape') {
                e.preventDefault();
                handleCancel();
              }
            };

            if (position === 'left') {
              return (
                <tr key={pin.id} className="border-b border-gray-700" style={{ height: `${PIN_ROW_HEIGHT}px` }}>
                  <td className="py-1 px-2 text-left" style={{ width: '40%' }}>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleSave}
                        onKeyDown={handleKeyDown}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                        className="w-full bg-gray-700 text-white px-1 py-0 text-xs rounded border border-cyan-500 focus:outline-none"
                      />
                    ) : (
                      <span
                        onClick={handleStartEdit}
                        onDoubleClick={handleStartEdit}
                        className="cursor-pointer hover:text-cyan-400 hover:underline text-xs inline-block"
                        title="Click to edit pin name"
                        style={{ userSelect: 'none' }}
                      >
                        {displayName}
                      </span>
                    )}
                  </td>
                  <td className="py-1 px-2 text-center text-gray-400 text-xs" style={{ width: '35%' }}>
                    {displayNet}
                  </td>
                  <td
                    className="py-1 px-2 text-right font-mono font-bold text-xs"
                    style={{ color, width: '25%' }}
                    {...dataAttrs}
                  >
                    {pin.pos}
                  </td>
                </tr>
              );
            } else { // right position
              return (
                <tr key={pin.id} className="border-b border-gray-700" style={{ height: `${PIN_ROW_HEIGHT}px` }}>
                  <td
                    className="py-1 px-2 text-left font-mono font-bold text-xs"
                    style={{ color, width: '25%' }}
                    {...dataAttrs}
                  >
                    {pin.pos}
                  </td>
                  <td className="py-1 px-2 text-xs" style={{ width: '40%' }}>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleSave}
                        onKeyDown={handleKeyDown}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                        className="w-full bg-gray-700 text-white px-1 py-0 text-xs rounded border border-cyan-500 focus:outline-none"
                      />
                    ) : (
                      <span
                        onClick={handleStartEdit}
                        onDoubleClick={handleStartEdit}
                        className="cursor-pointer hover:text-cyan-400 hover:underline text-xs inline-block"
                        title="Click to edit pin name"
                        style={{ userSelect: 'none' }}
                      >
                        {displayName}
                      </span>
                    )}
                  </td>
                  <td className="py-1 px-2 text-right text-gray-400 text-xs" style={{ width: '35%' }}>
                    {displayNet}
                  </td>
                </tr>
              );
            }
          })}
        </tbody>
      </table>
    </div>
  );
};

interface WireInfo {
  leftConnector: Connector;
  leftPin: Pin;
  rightConnector: Connector;
  rightPin: Pin;
  id: string;
  color: string;
  gauge?: string; // Wire gauge (e.g., "22 AWG")
  isSameColumn?: boolean; // Flag for same-column connections
  columnSide?: 'left' | 'right'; // Which column for same-column connections
}

export const WiringDiagramPreview: React.FC = () => {
  const { connectors, mappings, updateConnector } = useWireMapperStore();
  const diagramRef = useRef<HTMLDivElement>(null); // Ref for the main diagram container
  const [svgDimensions, setSvgDimensions] = useState({ width: 800, height: 600 });

  // Handler to update pin names
  const handlePinNameUpdate = (connectorId: string, pinPos: number, newName: string) => {
    const connector = connectors.find(c => c.id === connectorId);
    if (!connector) return;

    const updatedConnector = produce(connector, draft => {
      const pin = draft.pins.find(p => p.pos === pinPos);
      if (pin) {
        pin.name = newName;
      }
    });

    updateConnector(connectorId, updatedConnector);
  };

  // Memoize processed connector and wire data
  const {
    leftConnectorsWithPins,
    rightConnectorsWithPins,
    wireInfosProcessed,
    usedPinIds,
    wireColors,
    netNames
  } = useMemo(() => {
    const connectionCount = new Map<string, number>();
    const usedPinIdsTemp = new Set<string>();
    const wireColorsMap = new Map<string, string>(); // Initialize here
    const netNamesMap = new Map<string, string>(); // Map of pinId to net name from mappings

    // Step 1: Populate connectionCount, usedPinIdsTemp, wireColorsMap, and netNamesMap
    mappings.forEach(mapping => {
      connectionCount.set(mapping.source.connectorId, (connectionCount.get(mapping.source.connectorId) || 0) + 1);
      connectionCount.set(mapping.target.connectorId, (connectionCount.get(mapping.target.connectorId) || 0) + 1);
      usedPinIdsTemp.add(`${mapping.source.connectorId}-${mapping.source.pinPos}`);
      usedPinIdsTemp.add(`${mapping.target.connectorId}-${mapping.target.pinPos}`);

      const sourceConnFull = connectors.find(c => c.id === mapping.source.connectorId);
      const targetConnFull = connectors.find(c => c.id === mapping.target.connectorId);

      if (sourceConnFull && targetConnFull) {
        const sourcePinFull = sourceConnFull.pins.find(p => p.pos === mapping.source.pinPos);
        const targetPinFull = targetConnFull.pins.find(p => p.pos === mapping.target.pinPos);

        if (sourcePinFull && targetPinFull) {
          let chosenWireColor = sourcePinFull.config?.color;
          if (!chosenWireColor) {
            chosenWireColor = targetPinFull.config?.color;
          }
          if (!chosenWireColor) {
            chosenWireColor = '#888888'; // Default fallback color
          }
          wireColorsMap.set(`${sourceConnFull.id}-${sourcePinFull.pos}`, chosenWireColor);
          wireColorsMap.set(`${targetConnFull.id}-${targetPinFull.pos}`, chosenWireColor);

          // Store net name from mapping for both pins
          if (mapping.netName) {
            netNamesMap.set(`${sourceConnFull.id}-${sourcePinFull.pos}`, mapping.netName);
            netNamesMap.set(`${targetConnFull.id}-${targetPinFull.pos}`, mapping.netName);
          }
        }
      }
    });

    // Smart distribution: try to place connected connectors on opposite sides
    const sortedConnectors = [...connectors].sort((a, b) => (connectionCount.get(b.id) || 0) - (connectionCount.get(a.id) || 0));

    const left: Connector[] = [];
    const right: Connector[] = [];
    const placed = new Set<string>();

    // Build a connection graph
    const connectionGraph = new Map<string, Set<string>>();
    connectors.forEach(c => connectionGraph.set(c.id, new Set()));
    mappings.forEach(m => {
      connectionGraph.get(m.source.connectorId)?.add(m.target.connectorId);
      connectionGraph.get(m.target.connectorId)?.add(m.source.connectorId);
    });

    // Greedy placement algorithm
    sortedConnectors.forEach(conn => {
      if (placed.has(conn.id)) return;

      const connectedTo = connectionGraph.get(conn.id) || new Set();
      let leftCount = 0;
      let rightCount = 0;

      // Count how many connected connectors are already on each side
      connectedTo.forEach(otherId => {
        if (left.some(c => c.id === otherId)) leftCount++;
        if (right.some(c => c.id === otherId)) rightCount++;
      });

      // Place on the opposite side from most connections, or balance the columns
      if (leftCount > rightCount) {
        right.push(conn);
      } else if (rightCount > leftCount) {
        left.push(conn);
      } else {
        // Balance: put on the side with fewer connectors
        if (left.length <= right.length) {
          left.push(conn);
        } else {
          right.push(conn);
        }
      }
      placed.add(conn.id);
    });

    const getPins = (connector: Connector) => connector.pins
      .filter(pin => usedPinIdsTemp.has(`${connector.id}-${pin.pos}`))
      .sort((a, b) => a.pos - b.pos);

    const leftCWP = left.map(c => ({ ...c, pins: getPins(c) }));
    const rightCWP = right.map(c => ({ ...c, pins: getPins(c) }));

    // Step 2: Process mappings into wireInfosProcessed for L-R drawing, using populated wireColorsMap
    const processedWires = mappings.reduce((acc, mapping) => {
      const sourceConn = connectors.find(c => c.id === mapping.source.connectorId);
      const targetConn = connectors.find(c => c.id === mapping.target.connectorId);
      if (!sourceConn || !targetConn) return acc;

      const sourcePin = sourceConn.pins.find(p => p.pos === mapping.source.pinPos);
      const targetPin = targetConn.pins.find(p => p.pos === mapping.target.pinPos);
      if (!sourcePin || !targetPin) return acc;

      const sourceIsInLeftArray = left.some(c => c.id === sourceConn.id);
      const targetIsInLeftArray = left.some(c => c.id === targetConn.id);
      const sourceIsInRightArray = right.some(c => c.id === sourceConn.id);
      const targetIsInRightArray = right.some(c => c.id === targetConn.id);

      let trueLeftConnector: Connector, trueLeftPin: Pin;
      let trueRightConnector: Connector, trueRightPin: Pin;

      let isSameColumn = false;
      let columnSide: 'left' | 'right' | undefined;

      if (sourceIsInLeftArray && targetIsInRightArray) {
        // Standard L-R: Source is in left array, Target is in right array
        trueLeftConnector = sourceConn; trueLeftPin = sourcePin;
        trueRightConnector = targetConn; trueRightPin = targetPin;
      } else if (sourceIsInRightArray && targetIsInLeftArray) {
        // Standard R-L (swap to L-R): Source is in right array, Target is in left array
        trueLeftConnector = targetConn; trueLeftPin = targetPin;
        trueRightConnector = sourceConn; trueRightPin = sourcePin;
      } else if (sourceIsInLeftArray && targetIsInLeftArray) {
        // Both in left column - same column connection
        isSameColumn = true;
        columnSide = 'left';
        trueLeftConnector = sourceConn; trueLeftPin = sourcePin;
        trueRightConnector = targetConn; trueRightPin = targetPin;
      } else if (sourceIsInRightArray && targetIsInRightArray) {
        // Both in right column - same column connection
        isSameColumn = true;
        columnSide = 'right';
        trueLeftConnector = sourceConn; trueLeftPin = sourcePin;
        trueRightConnector = targetConn; trueRightPin = targetPin;
      } else {
        // Connector not in either array (shouldn't happen)
        return acc;
      }

      // Get color from the fully populated map, using the original source/target of the mapping
      // as wireColorsMap is keyed by original pin identifiers.
      const wireColor = wireColorsMap.get(`${mapping.source.connectorId}-${mapping.source.pinPos}`) ||
                        wireColorsMap.get(`${mapping.target.connectorId}-${mapping.target.pinPos}`) ||
                        '#888888';

      acc.push({
        id: mapping.id,
        leftConnector: trueLeftConnector,
        leftPin: trueLeftPin,
        rightConnector: trueRightConnector,
        rightPin: trueRightPin,
        color: wireColor,
        gauge: mapping.gauge,
        isSameColumn,
        columnSide,
      });
      return acc;
    }, [] as WireInfo[]);

    return {
      leftConnectorsWithPins: leftCWP,
      rightConnectorsWithPins: rightCWP,
      wireInfosProcessed: processedWires,
      usedPinIds: usedPinIdsTemp,
      wireColors: wireColorsMap, // Pass the populated map
      netNames: netNamesMap, // Pass the populated net names map
    };
  }, [connectors, mappings]);

  // Calculate dimensions for the SVG canvas and connector positions
  const { connectorPositions, diagramHeight, diagramWidth } = useMemo(() => {
    let currentLeftY = SVG_PADDING;
    let currentRightY = SVG_PADDING;
    const positions = new Map<string, { x: number; y: number; height: number }>();

    const calculateConnectorHeight = (connector: Connector) => {
      const numPins = connector.pins.filter(p => usedPinIds.has(`${connector.id}-${p.pos}`)).length;
      return CONNECTOR_HEADER_HEIGHT + CONNECTOR_TYPE_HEADER_HEIGHT + (numPins * PIN_ROW_HEIGHT);
    };

    leftConnectorsWithPins.forEach(connector => {
      const height = calculateConnectorHeight(connector);
      positions.set(connector.id, { x: SVG_PADDING, y: currentLeftY, height });
      currentLeftY += height + VERTICAL_GAP_BETWEEN_CONNECTORS;
    });

    rightConnectorsWithPins.forEach(connector => {
      const height = calculateConnectorHeight(connector);
      // Position right connectors aligned with the calculated SVG width
      // Actual X is calculated later based on diagramWidth
      positions.set(connector.id, { x: 0, y: currentRightY, height }); // Placeholder X
      currentRightY += height + VERTICAL_GAP_BETWEEN_CONNECTORS;
    });

    const calculatedDiagramHeight = Math.max(currentLeftY, currentRightY) - VERTICAL_GAP_BETWEEN_CONNECTORS + SVG_PADDING;
    const calculatedDiagramWidth = (SVG_PADDING * 2) + (CONNECTOR_WIDTH * 2) + HORIZONTAL_GAP_BETWEEN_COLUMNS;

    // Update X for right connectors now that diagramWidth is known
    rightConnectorsWithPins.forEach(connector => {
      const pos = positions.get(connector.id);
      if (pos) {
        positions.set(connector.id, { ...pos, x: calculatedDiagramWidth - CONNECTOR_WIDTH - SVG_PADDING });
      }
    });

    return {
      connectorPositions: positions,
      diagramHeight: Math.max(300, calculatedDiagramHeight), // Minimum height
      diagramWidth: Math.max(600, calculatedDiagramWidth), // Minimum width
    };
  }, [leftConnectorsWithPins, rightConnectorsWithPins, usedPinIds]);

  useEffect(() => {
    setSvgDimensions({ width: diagramWidth, height: diagramHeight });
  }, [diagramWidth, diagramHeight]);


  const renderWires = () => {
    if (!diagramRef.current) return null;

    return wireInfosProcessed.map(wire => {
      const leftConnPos = connectorPositions.get(wire.leftConnector.id);
      const rightConnPos = connectorPositions.get(wire.rightConnector.id);

      if (!leftConnPos || !rightConnPos) return null;

      // Determine which collection to search based on same-column flag
      const sourceConnList = wire.isSameColumn && wire.columnSide === 'left' ? leftConnectorsWithPins :
                             wire.isSameColumn && wire.columnSide === 'right' ? rightConnectorsWithPins :
                             leftConnectorsWithPins;
      const targetConnList = wire.isSameColumn && wire.columnSide === 'left' ? leftConnectorsWithPins :
                             wire.isSameColumn && wire.columnSide === 'right' ? rightConnectorsWithPins :
                             rightConnectorsWithPins;

      // Find the visual index of the pin *within the displayed (sorted and filtered) pins*
      const leftPinVisualIndex = sourceConnList
        .find(c => c.id === wire.leftConnector.id)?.pins
        .findIndex(p => p.pos === wire.leftPin.pos) ?? -1;

      const rightPinVisualIndex = targetConnList
        .find(c => c.id === wire.rightConnector.id)?.pins
        .findIndex(p => p.pos === wire.rightPin.pos) ?? -1;

      if (leftPinVisualIndex === -1 || rightPinVisualIndex === -1) {
        console.warn('Could not find pin visual index for wire:', wire);
        return null;
      }

      const leftPinY = leftConnPos.y +
                       1 + // Account for the top border of the ConnectorTable div
                       CONNECTOR_HEADER_HEIGHT +
                       CONNECTOR_TYPE_HEADER_HEIGHT +
                       (leftPinVisualIndex * PIN_ROW_HEIGHT) +
                       (PIN_ROW_HEIGHT / 2);

      const rightPinY = rightConnPos.y +
                        1 + // Account for the top border of the ConnectorTable div
                        CONNECTOR_HEADER_HEIGHT +
                        CONNECTOR_TYPE_HEADER_HEIGHT +
                        (rightPinVisualIndex * PIN_ROW_HEIGHT) +
                        (PIN_ROW_HEIGHT / 2);

      // Handle same-column connections differently
      if (wire.isSameColumn) {
        const xOffset = wire.columnSide === 'left' ? -40 : 40; // Arc to the left or right
        const connX = wire.columnSide === 'left' ? leftConnPos.x : rightConnPos.x + CONNECTOR_WIDTH;
        const controlX = connX + xOffset;
        const strokeWidth = gaugeToStrokeWidth(wire.gauge);

        // Create a curved path that goes out to the side and back
        const pathD = `M ${connX} ${leftPinY} C ${controlX} ${leftPinY}, ${controlX} ${rightPinY}, ${connX} ${rightPinY}`;

        return (
          <path
            key={wire.id}
            d={pathD}
            stroke={wire.color}
            strokeWidth={strokeWidth}
            strokeDasharray="5,3"
            fill="none"
            opacity="0.7"
          />
        );
      }

      // Standard left-to-right connection
      const startX = leftConnPos.x + CONNECTOR_WIDTH;
      const endX = rightConnPos.x;
      const strokeWidth = gaugeToStrokeWidth(wire.gauge);

      const midX = (startX + endX) / 2;
      // Dynamic curve strength based on vertical distance
      const yDiff = Math.abs(rightPinY - leftPinY);
      let curveStrength = Math.min(yDiff / 1.5, HORIZONTAL_GAP_BETWEEN_COLUMNS / 1.5); // Increased curve strength
      curveStrength = Math.max(curveStrength, 30); // Minimum curve strength

      const pathD = `M ${startX} ${leftPinY} C ${midX - curveStrength} ${leftPinY}, ${midX + curveStrength} ${rightPinY}, ${endX} ${rightPinY}`;

      return (
        <path
          key={wire.id}
          d={pathD}
          stroke={wire.color}
          strokeWidth={strokeWidth}
          fill="none"
        />
      );
    });
  };

  if (connectors.length === 0 || mappings.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        Add connectors and mappings to see the diagram.
      </div>
    );
  }
  
  return (
    <div ref={diagramRef} className="relative w-full h-full overflow-auto bg-gray-900 p-4">
      <div style={{ position: 'relative', width: `${svgDimensions.width}px`, height: `${svgDimensions.height}px` }}>
        {/* Left Connectors */}
        {leftConnectorsWithPins.map((connector) => {
          const pos = connectorPositions.get(connector.id);
          if (!pos) return null;
          return (
            <div
              key={connector.id}
              style={{
                position: 'absolute',
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                width: `${CONNECTOR_WIDTH}px`,
              }}
            >
              <ConnectorTable
                connector={connector}
                position="left"
                usedPins={usedPinIds}
                wireColors={wireColors}
                netNames={netNames}
                connectorIndex={0} // Not strictly needed now with absolute positioning
                isLeftColumn={true}
                onPinNameUpdate={handlePinNameUpdate}
              />
            </div>
          );
        })}

        {/* Right Connectors */}
        {rightConnectorsWithPins.map((connector) => {
          const pos = connectorPositions.get(connector.id);
          if (!pos) return null;
          return (
            <div
              key={connector.id}
              style={{
                position: 'absolute',
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                width: `${CONNECTOR_WIDTH}px`,
              }}
            >
              <ConnectorTable
                connector={connector}
                position="right"
                usedPins={usedPinIds}
                wireColors={wireColors}
                netNames={netNames}
                connectorIndex={0} // Not strictly needed
                isLeftColumn={false}
                onPinNameUpdate={handlePinNameUpdate}
              />
            </div>
          );
        })}
        
        {/* SVG for Wires */}
        <svg
          width={svgDimensions.width}
          height={svgDimensions.height}
          style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible', pointerEvents: 'none' }}
        >
          <defs>
          </defs>
          <g>{renderWires()}</g>
        </svg>
      </div>
    </div>
  );
};

export default WiringDiagramPreview;
