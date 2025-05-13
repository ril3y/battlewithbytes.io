import React, { memo, useState, useMemo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Connector, Pin } from '../types';
import { useWireMapperStore } from '../store/useWireMapperStore'; 
import { PIN_SIZE, PIN_MARGIN, CONNECTOR_PADDING } from '../constants';
import { PinDisplay } from './PinDisplay'; 
 
const ConnectorNode: React.FC<NodeProps<Connector>> = ({ data, id, selected }) => {
  // Use default rows/cols from data, but calculate dimensions based on them
  const { name, rows = 1, cols = 1, pins: allPins = [], config = {}, shape, gender, type } = data;
  const selectedPin = useWireMapperStore(state => state.selectedPin);
  const [hoveredPin, setHoveredPin] = useState<number | null>(null);
  const centerPins = config.centerPinsHorizontally ?? false; // Default to false if not set

  const isPinConnected = useWireMapperStore(state => state.isPinConnected);
  const settings = useWireMapperStore(state => state.settings);
  const setSelectedPin = useWireMapperStore((state) => state.setSelectedPin);

  const handlePinClick = (pinPos: number) => {
    console.log(`[Node ${id}] Pin ${pinPos} clicked`);
    setSelectedPin(id, pinPos); 
  };

  console.log('ConnectorNode:', id, 'data props -> rows:', rows, 'cols:', cols, 'name:', name);
  console.log('ConnectorNode:', id, 'allPins:', JSON.parse(JSON.stringify(allPins)));
  const visiblePins = allPins.filter(pin => pin.visible !== false);
  console.log('ConnectorNode:', id, 'visiblePins:', JSON.parse(JSON.stringify(visiblePins)));

  const pinsByRow = useMemo(() => {
    const grouped: { [key: number]: Pin[] } = {};
    visiblePins.forEach((pin) => {
      // Ensure pin.row is defined before using as index
      if (pin.row !== undefined) {
        if (!grouped[pin.row]) {
          grouped[pin.row] = [];
        }
        grouped[pin.row].push(pin);
        // Sort pins within the row by column index for consistent order
        // Ensure pin.col is defined for sorting, default to 0 if not
        grouped[pin.row].sort((a: Pin, b: Pin) => (a.col ?? 0) - (b.col ?? 0));
      }
    });
    console.log(`ConnectorNode: ${id} visiblePins (grouped by row):`, grouped);
    return grouped;
  }, [visiblePins, id]);

  // --- Calculate Dynamic Dimensions --- 
  const calculatedWidth = useMemo(() => {
    const gridWidth = (cols * PIN_SIZE) + Math.max(0, cols - 1) * (PIN_MARGIN * 2);
    return gridWidth + (CONNECTOR_PADDING * 2); 
  }, [cols]);

  const calculatedHeight = useMemo(() => {
    const gridHeight = (rows * PIN_SIZE) + Math.max(0, rows - 1) * (PIN_MARGIN * 2);
    const nameHeight = name ? 30 : 0; // Estimate space for the name label + its padding
    return gridHeight + (CONNECTOR_PADDING * 2) + nameHeight; 
  }, [rows, name]);
  // ---------------------------------

  // Debug log for dimensions
  console.log(`[ConnectorNode ${id}] data.rows=${data.rows}, data.cols=${data.cols}, calcWidth=${calculatedWidth}, calcHeight=${calculatedHeight}`);

  return (
    <div
      style={{
        width: `${calculatedWidth}px`,
        height: `${calculatedHeight}px`,
        border: `2px solid ${selected ? (settings.darkMode ? '#00ff9d' : '#059669') : (settings.darkMode ? '#374151' : '#d1d5db')}`,
        borderRadius: '12px', 
        background: settings.darkMode ? '#1e293b' : '#f8fafc', 
        boxShadow: selected ? `0 0 10px ${settings.darkMode ? '#00ff9d' : '#059669'}` : (settings.darkMode ? '0 1px 3px 0 rgba(0,0,0,0.7), 0 1px 2px 0 rgba(0,0,0,0.5)' : '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06)'),
        position: 'relative',
        display: 'flex', 
        flexDirection: 'column', 
      }}
      className={`connector-node ${settings.darkMode ? 'dark-theme-connector' : 'light-theme-connector'}`}
    >
      {name && (
        <div
          className="connector-drag-handle" 
          style={{
            padding: `${CONNECTOR_PADDING / 2}px ${CONNECTOR_PADDING}px 0 ${CONNECTOR_PADDING}px`, 
            color: settings.darkMode ? '#cbd5e1' : '#334155', 
            fontSize: '12px', 
            textAlign: 'center',
            flexShrink: 0, 
            fontWeight: '600', 
          }}
        >
          {name}
        </div>
      )}

      {/* Pin Grid Container */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, ${PIN_SIZE}px)`,
        gridTemplateRows: `repeat(${rows}, ${PIN_SIZE}px)`,
        gap: `${PIN_MARGIN * 2}px`, 
        alignContent: 'center', // Center grid vertically if space allows
        justifyContent: 'center', // Center grid horizontally if space allows
        flexGrow: 1, 
        padding: `${CONNECTOR_PADDING}px`,
        boxSizing: 'border-box',
      }}>
        {centerPins
          ? // --- Method 1: Center pins using flexbox within each row --- 
            Object.entries(pinsByRow).map(([rowIndex, pinsInRow]) => (
              <div
                key={`row-${rowIndex}`}
                className="pin-row-container"
                style={{
                  gridRow: `${parseInt(rowIndex, 10) + 1}`,
                  gridColumn: `1 / -1`, // Span all columns
                  display: 'flex',
                  justifyContent: 'center', // Center pins horizontally
                  alignItems: 'center',     // Center pins vertically within row space
                  gap: '4px', // Adjust gap as needed between pins in the row
                }}
              >
                {pinsInRow.map((pin) => (
                  <PinDisplay
                    key={pin.id}
                    pin={pin}
                    isSelected={selectedPin?.connectorId === id && selectedPin?.pinPos === pin.pos}
                    isHovered={hoveredPin === pin.pos}
                    isConnected={isPinConnected(pin.pos, id)}
                    darkMode={settings.darkMode}
                    gender={gender?.toLowerCase() === 'female' ? 'female' : 'male'}
                    onClick={handlePinClick}
                    onMouseEnter={setHoveredPin}
                    onMouseLeave={() => setHoveredPin(null)}
                  >
                    <Handle
                      type="source" 
                      position={Position.Top} 
                      id={`${pin.pos}-handle`} 
                      style={{
                        width: '1px', 
                        height: '1px',
                        background: 'transparent', 
                        border: 'none',
                        position: 'absolute',
                        top: '50%', 
                        left: '50%', 
                        transform: 'translate(-50%, -50%)', 
                        zIndex: 20, 
                      }}
                      isConnectable={true}
                    />
                  </PinDisplay>
                ))}
              </div>
            ))
          : // --- Method 2: Place pins directly onto the grid (original behavior) ---
            visiblePins.map(pin => {
              if (pin.row === undefined || pin.col === undefined) {
                console.warn(`Pin ${pin.pos} in connector ${id} is missing row/col data.`);
                return null; 
              }
              console.log('ConnectorNode:', id, 'Rendering Pin:', pin.pos, 'at row:', pin.row, 'col:', pin.col);
              return (
                <div 
                  key={`pin-grid-${pin.pos}`} 
                  style={{
                    gridRowStart: pin.row + 1, 
                    gridColumnStart: pin.col + 1,
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PinDisplay
                    pin={pin}
                    isSelected={selectedPin?.connectorId === id && selectedPin?.pinPos === pin.pos}
                    isHovered={hoveredPin === pin.pos}
                    isConnected={isPinConnected(pin.pos, id)}
                    darkMode={settings.darkMode}
                    gender={gender?.toLowerCase() === 'female' ? 'female' : 'male'}
                    onClick={handlePinClick}
                    onMouseEnter={setHoveredPin}
                    onMouseLeave={() => setHoveredPin(null)}
                  >
                    <Handle
                      type="source" 
                      position={Position.Top} 
                      id={`${pin.pos}-handle`} 
                      style={{
                        width: '1px', 
                        height: '1px',
                        background: 'transparent', 
                        border: 'none',
                        position: 'absolute',
                        top: '50%', 
                        left: '50%', 
                        transform: 'translate(-50%, -50%)', 
                        zIndex: 20, 
                      }}
                      isConnectable={true}
                    />
                  </PinDisplay>
                </div>
              );
            })}
      </div>
    </div>
  );
};

export default memo(ConnectorNode);
