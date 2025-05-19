import React, { memo, useState, useMemo, useCallback, useRef } from 'react';
import { Handle, Position, NodeProps, useReactFlow, Node } from 'reactflow';
import { Connector, Pin, ContextMenuOption } from '../types';
import { useWireMapperStore } from '../store/useWireMapperStore'; 
import { PIN_SIZE, PIN_MARGIN, CONNECTOR_PADDING } from '../constants';
import { PinDisplay } from './PinDisplay'; 
import { ContextMenu } from './ContextMenu';
import '../wiremapper.css'; // Import the CSS file

const ConnectorNode: React.FC<NodeProps<Connector>> = ({ data, id, selected }) => {
  // Use default rows/cols from data, but calculate dimensions based on them
  const { name, rows = 1, cols = 1, pins: allPins = [], config = {}, shape, gender, type } = data;
  const selectedPin = useWireMapperStore(state => state.selectedPin);
  const [hoveredPin, setHoveredPin] = useState<number | null>(null);
  const centerPins = config.centerPinsHorizontally ?? false; // Default to false if not set
  const nodeRef = useRef<HTMLDivElement>(null);
  const reactFlow = useReactFlow();

  // Store actions and state for pin context menu
  const { 
    copyNetFromPin: storeCopyNetFromPin,
    pasteNetToPin: storePasteNetToPin,
    resetPin: storeResetPin,
    copiedNet 
  } = useWireMapperStore();

  const [pinContextMenuState, setPinContextMenuState] = useState<{ x: number; y: number; pinPos: number; options: ContextMenuOption[] } | null>(null);

  const isPinConnected = useWireMapperStore(state => state.isPinConnected);
  const settings = useWireMapperStore(state => state.settings);
  const setSelectedPin = useWireMapperStore((state) => state.setSelectedPin);
  const setSelectedConnectorId = useWireMapperStore((state) => state.setSelectedConnectorId);

  const handlePinClick = (pinPos: number) => {
    console.log(`[Node ${id}] Pin ${pinPos} clicked`);
    setSelectedPin(id, pinPos); 
  };
  
  const handlePinContextMenu = useCallback((e: React.MouseEvent, pinPos: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Since we're using createPortal to render to document.body, we need client coordinates
    // These are already relative to the viewport/document
    const menuX = e.clientX;
    const menuY = e.clientY;
    
    console.log(`[Node:${id}] Pin ${pinPos} context menu opening at (${menuX}, ${menuY})`);

    const options: ContextMenuOption[] = [
      {
        label: 'Copy Net',
        action: () => {
          storeCopyNetFromPin(id, pinPos);
          closePinContextMenu();
        },
      },
      {
        label: `Paste Net ${copiedNet ? `(${copiedNet.netName || 'Unnamed Net'})` : ''}`,
        action: () => {
          storePasteNetToPin(id, pinPos);
          closePinContextMenu();
        },
        disabled: !copiedNet,
      },
      { label: 'Reset Pin', action: () => { storeResetPin(id, pinPos); closePinContextMenu(); }, danger: true },
    ];

    setPinContextMenuState({ x: menuX, y: menuY, pinPos, options });
  }, [id, storeCopyNetFromPin, storePasteNetToPin, storeResetPin, copiedNet]);

  const closePinContextMenu = useCallback(() => {
    setPinContextMenuState(null);
  }, []);

  const handleConnectorClick = (e: React.MouseEvent) => {
    // Stop event from propagating to prevent double-handling
    e.stopPropagation();
    
    // Set the selected connector ID in the store
    console.log('ConnectorNode direct click handler fired for:', id);
    setSelectedConnectorId(id);
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
    <>
      {pinContextMenuState && (
        <ContextMenu
          x={pinContextMenuState.x}
          y={pinContextMenuState.y}
          options={pinContextMenuState.options}
          onClose={closePinContextMenu}
          // We might need to pass a containerRef here if sub-menus are inside ReactFlow pane
        />
      )}
      <div
        className={`connector-node ${selected ? 'selected' : ''} dark-theme`}
        style={{
          width: `${calculatedWidth}px`,
          height: `${calculatedHeight}px`,
        }}
        onClick={handleConnectorClick} // Add direct click handler
      >
      {name && (
        <div
          className="connector-drag-handle" 
          style={{ padding: `${CONNECTOR_PADDING / 2}px ${CONNECTOR_PADDING}px 0 ${CONNECTOR_PADDING}px` }} // Only keep dynamic padding
        >
          {name}
        </div>
      )}

      {/* Pin Grid Container */}
      <div 
        className="connector-pin-grid"
        style={{
          display: 'grid', // Keep layout styles
          gridTemplateColumns: `repeat(${cols}, ${PIN_SIZE}px)`, // Dynamic
          gridTemplateRows: `repeat(${rows}, ${PIN_SIZE}px)`,   // Dynamic
          gap: `${PIN_MARGIN * 2}px`,                         // Dynamic
          padding: `${CONNECTOR_PADDING}px`,                   // Dynamic
          // Removed: alignContent, justifyContent, flexGrow, boxSizing (moved to CSS)
        }}
      >
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
                    isHovered={hoveredPin === pin.pos} // Pass hoveredPin state
                    isConnected={isPinConnected(pin.pos, id)}
                    darkMode={settings.darkMode ?? true}
                    gender={gender as 'male' | 'female'}
                    onClick={() => handlePinClick(pin.pos)}
                    onContextMenu={(e) => handlePinContextMenu(e, pin.pos)} // Passed to PinDisplay
                    onMouseEnter={() => setHoveredPin(pin.pos)}
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
                    onContextMenu={(e) => handlePinContextMenu(e, pin.pos)} // Passed to PinDisplay
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
    </>
  );
};

export default memo(ConnectorNode);
