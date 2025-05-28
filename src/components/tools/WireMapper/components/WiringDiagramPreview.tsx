'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useWireMapperStore } from '../store/useWireMapperStore';
import { Connector, Pin } from '../types';

// Layout Constants
const CONNECTOR_WIDTH = 230; // px
const CONNECTOR_HEADER_HEIGHT = 40; // Approximate px for name (p-2 + line height)
const CONNECTOR_TYPE_HEADER_HEIGHT = 25; // Approximate px for type (py-1 + line height)
const PIN_ROW_HEIGHT = 30; // px
const VERTICAL_GAP_BETWEEN_CONNECTORS = 40; // px
const HORIZONTAL_GAP_BETWEEN_COLUMNS = 100; // px, space for wires
const SVG_PADDING = 20; // px, padding around the entire diagram

interface ConnectorTableProps {
  connector: Connector;
  position: 'left' | 'right';
  usedPins: Set<string>;
  wireColors: Map<string, string>; // Map of pinId to wire color
  connectorIndex: number; // Index for positioning
  isLeftColumn: boolean;
}

// Component to render a single connector as a table
const ConnectorTable: React.FC<ConnectorTableProps> = ({
  connector,
  position,
  usedPins,
  wireColors,
}) => {
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
            const displayNet = pin.netName || 'Unnamed';
            
            const dataAttrs = {
              'data-pin-id': pinKey,
              'data-pin-index': index, // Visual index of displayed pins
              'data-pin-pos': pin.pos, // Original pin position number
              'data-connector-id': connector.id,
              'data-connector-position': position,
            };
            
            const commonCellStyle = {
              whiteSpace: 'nowrap' as const,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: 0, // Necessary for text-overflow to work in table cells
            };

            if (position === 'left') {
              return (
                <tr key={pin.id} className="border-b border-gray-700" style={{ height: `${PIN_ROW_HEIGHT}px` }}>
                  <td className="py-1 px-2 text-left" style={{ ...commonCellStyle, width: '40%' }}>
                    {displayName}
                  </td>
                  <td className="py-1 px-2 text-center text-gray-400" style={{ ...commonCellStyle, width: '35%' }}>
                    {displayNet}
                  </td>
                  <td 
                    className="py-1 px-2 text-right font-mono font-bold"
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
                    className="py-1 px-2 text-left font-mono font-bold"
                    style={{ color, width: '25%' }}
                    {...dataAttrs}
                  >
                    {pin.pos}
                  </td>
                  <td className="py-1 px-2" style={{ ...commonCellStyle, width: '40%' }}>
                    {displayName}
                  </td>
                  <td className="py-1 px-2 text-right text-gray-400" style={{ ...commonCellStyle, width: '35%' }}>
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
}

export const WiringDiagramPreview: React.FC = () => {
  const { connectors, mappings } = useWireMapperStore();
  const diagramRef = useRef<HTMLDivElement>(null); // Ref for the main diagram container
  const [svgDimensions, setSvgDimensions] = useState({ width: 800, height: 600 });

  // Memoize processed connector and wire data
  const { 
    leftConnectorsWithPins, 
    rightConnectorsWithPins, 
    wireInfosProcessed, 
    usedPinIds, 
    wireColors 
  } = useMemo(() => {
    const connectionCount = new Map<string, number>();
    const usedPinIdsTemp = new Set<string>();
    const wireColorsMap = new Map<string, string>(); // Initialize here

    // Step 1: Populate connectionCount, usedPinIdsTemp, and wireColorsMap
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
        }
      }
    });

    const sortedConnectors = [...connectors].sort((a, b) => (connectionCount.get(b.id) || 0) - (connectionCount.get(a.id) || 0));

    const left: Connector[] = [];
    const right: Connector[] = [];
    sortedConnectors.forEach((conn, i) => (i % 2 === 0 ? left.push(conn) : right.push(conn)));

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

      if (sourceIsInLeftArray && targetIsInRightArray) {
        // Standard L-R: Source is in left array, Target is in right array
        trueLeftConnector = sourceConn; trueLeftPin = sourcePin;
        trueRightConnector = targetConn; trueRightPin = targetPin;
      } else if (sourceIsInRightArray && targetIsInLeftArray) {
        // Standard R-L (swap to L-R): Source is in right array, Target is in left array
        trueLeftConnector = targetConn; trueLeftPin = targetPin;
        trueRightConnector = sourceConn; trueRightPin = sourcePin;
      } else {
        // Intra-column (L-L or R-R) or other unhandled cases (e.g. connector not in left or right array after distribution)
        return acc; // Skip this mapping for L-R diagram
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
      });
      return acc;
    }, [] as WireInfo[]);

    return {
      leftConnectorsWithPins: leftCWP,
      rightConnectorsWithPins: rightCWP,
      wireInfosProcessed: processedWires,
      usedPinIds: usedPinIdsTemp,
      wireColors: wireColorsMap, // Pass the populated map
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

      // Find the visual index of the pin *within the displayed (sorted and filtered) pins*
      const leftPinVisualIndex = leftConnectorsWithPins
        .find(c => c.id === wire.leftConnector.id)?.pins
        .findIndex(p => p.pos === wire.leftPin.pos) ?? -1;
      
      const rightPinVisualIndex = rightConnectorsWithPins
        .find(c => c.id === wire.rightConnector.id)?.pins
        .findIndex(p => p.pos === wire.rightPin.pos) ?? -1;

      if (leftPinVisualIndex === -1 || rightPinVisualIndex === -1) {
        console.warn('Could not find pin visual index for wire:', wire);
        return null;
      }

      const startX = leftConnPos.x + CONNECTOR_WIDTH;
      const leftPinY = leftConnPos.y +
                       1 + // Account for the top border of the ConnectorTable div
                       CONNECTOR_HEADER_HEIGHT +
                       CONNECTOR_TYPE_HEADER_HEIGHT +
                       (leftPinVisualIndex * PIN_ROW_HEIGHT) +
                       (PIN_ROW_HEIGHT / 2);

      const endX = rightConnPos.x;
      const rightPinY = rightConnPos.y +
                        1 + // Account for the top border of the ConnectorTable div
                        CONNECTOR_HEADER_HEIGHT +
                        CONNECTOR_TYPE_HEADER_HEIGHT +
                        (rightPinVisualIndex * PIN_ROW_HEIGHT) +
                        (PIN_ROW_HEIGHT / 2);

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
          strokeWidth="2.5"
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
                connectorIndex={0} // Not strictly needed now with absolute positioning
                isLeftColumn={true}
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
                connectorIndex={0} // Not strictly needed
                isLeftColumn={false}
              />
            </div>
          );
        })}
        
        {/* SVG for Wires */}
        <svg 
          width={svgDimensions.width}
          height={svgDimensions.height}
          style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible' }}
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
