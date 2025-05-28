import React, { memo, useState, useCallback, useRef, useMemo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Connector, Pin, ContextMenuOption } from '../types';
import { useWireMapperStore } from '../store/useWireMapperStore'; 
import { PIN_SIZE, PIN_MARGIN, CONNECTOR_PADDING } from '../constants';
import { PinDisplay } from './PinDisplay'; 
import { ContextMenu } from './ContextMenu';
import '../wiremapper.css';


const ConnectorNode: React.FC<NodeProps<Connector>> = ({ data, id, selected }) => {
  // Destructure props with default values
  const { 
    rows = 1, 
    cols = 1, 
    pins: allPins = [], 
    config = {}, 
    gender, 
    name = '' 
  } = data;
  
  const centerPins = config.centerPinsHorizontally ?? false;
  
  // State
  const [hoveredPin, setHoveredPin] = useState<number | null>(null);
  const [pinContextMenuState, setPinContextMenuState] = useState<{ 
    x: number; 
    y: number; 
    pinPos: number; 
    options: ContextMenuOption[] 
  } | null>(null);
  
  // Refs
  const nodeRef = useRef<HTMLDivElement>(null);
  
  // Store state
  const { 
    selectedPin, 
    copiedNet, 
    isPinConnected, 
    settings,
    setSelectedPin,
    setSelectedConnectorId,
    copyNetFromPin,
    pasteNetToPin,
    resetPin
  } = useWireMapperStore();

  // Event handlers
  const handlePinClick = useCallback((pinPos: number) => {
    console.log(`[Node ${id}] Pin ${pinPos} clicked`);
    setSelectedPin(id, pinPos);
  }, [id, setSelectedPin]);
  
  const closePinContextMenu = useCallback(() => {
    setPinContextMenuState(null);
  }, []);
  
  const handlePinContextMenu = useCallback((e: React.MouseEvent, pinPos: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    const menuX = e.clientX;
    const menuY = e.clientY;
    
    const options: ContextMenuOption[] = [
      {
        label: 'Copy Net',
        action: () => {
          copyNetFromPin(id, pinPos);
          closePinContextMenu();
        },
      },
      {
        label: `Paste Net ${copiedNet ? `(${copiedNet.netName || 'Unnamed Net'})` : ''}`,
        action: () => {
          pasteNetToPin(id, pinPos);
          closePinContextMenu();
        },
        disabled: !copiedNet,
      },
      { 
        label: 'Reset Pin', 
        action: () => { 
          resetPin(id, pinPos); 
          closePinContextMenu(); 
        }, 
        danger: true 
      },
    ];

    setPinContextMenuState({ x: menuX, y: menuY, pinPos, options });
  }, [id, copyNetFromPin, pasteNetToPin, resetPin, copiedNet, closePinContextMenu]);

  const handleConnectorClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedConnectorId(id);
  }, [id, setSelectedConnectorId]);

  // Filter and process pins
  const visiblePins = useMemo(() => 
    allPins.filter(pin => pin.visible !== false),
    [allPins]
  );

  // Group pins by row for center alignment
  const pinsByRow = useMemo(() => {
    const grouped: { [key: number]: Pin[] } = {};
    visiblePins.forEach((pin) => {
      if (pin.row !== undefined) {
        if (!grouped[pin.row]) {
          grouped[pin.row] = [];
        }
        grouped[pin.row].push(pin);
        grouped[pin.row].sort((a: Pin, b: Pin) => (a.col ?? 0) - (b.col ?? 0));
      }
    });
    return grouped;
  }, [visiblePins]);

  // Calculate dimensions
  const calculatedWidth = useMemo(() => {
    const gridWidth = (cols * PIN_SIZE) + Math.max(0, cols - 1) * (PIN_MARGIN * 2);
    return gridWidth + (CONNECTOR_PADDING * 2); 
  }, [cols]);

  const calculatedHeight = useMemo(() => {
    const gridHeight = (rows * PIN_SIZE) + Math.max(0, rows - 1) * (PIN_MARGIN * 2);
    const nameHeight = name ? 30 : 0;
    return gridHeight + (CONNECTOR_PADDING * 2) + nameHeight; 
  }, [rows, name]);


  // Render the component
  return (
    <div className="connector-node-wrapper" ref={nodeRef}>
      {pinContextMenuState && (
        <ContextMenu
          x={pinContextMenuState.x}
          y={pinContextMenuState.y}
          options={pinContextMenuState.options}
          onClose={closePinContextMenu}
        />
      )}
      
      <div
        className={`connector-node ${selected ? 'selected' : ''} dark-theme`}
        style={{
          width: `${calculatedWidth}px`,
          height: `${calculatedHeight}px`,
          position: 'relative',
          padding: `${CONNECTOR_PADDING}px`
        }}
        onClick={handleConnectorClick}
      >
        {name && (
          <div
            className="connector-drag-handle" 
            style={{ padding: `${CONNECTOR_PADDING / 2}px ${CONNECTOR_PADDING}px 0 ${CONNECTOR_PADDING}px` }}
          >
            {name}
          </div>
        )}
        
        {centerPins ? (
          // Render centered pins in rows
          <div 
            className="pin-rows-container" 
            style={{ 
              height: '100%', 
              display: 'grid', 
              gridTemplateRows: `repeat(${rows}, 1fr)` 
            }}
          >
            {Object.entries(pinsByRow).map(([rowIndex, pinsInRow]) => (
              <div
                key={`row-${rowIndex}`}
                className="pin-row"
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: `${PIN_MARGIN * 2}px`,
                  position: 'relative'
                }}
              >
                {pinsInRow.map((pin) => (
                  <div key={`pin-${pin.pos}`} style={{ position: 'relative' }}>
                    <PinDisplay
                      pin={pin}
                      isSelected={selectedPin?.connectorId === id && selectedPin?.pinPos === pin.pos}
                      isHovered={hoveredPin === pin.pos}
                      isConnected={isPinConnected?.(pin.pos, id) ?? false}
                      darkMode={settings?.darkMode ?? true}
                      gender={gender?.toLowerCase() === 'female' ? 'female' : 'male'}
                      onClick={() => handlePinClick(pin.pos)}
                      onContextMenu={(e) => handlePinContextMenu(e, pin.pos)}
                      onMouseEnter={() => setHoveredPin(pin.pos)}
                      onMouseLeave={() => setHoveredPin(null)}
                    />
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
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          // Render pins in a grid
          <div 
            className="pin-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gridTemplateRows: `repeat(${rows}, 1fr)`,
              gap: `${PIN_MARGIN * 2}px`,
              height: '100%',
              width: '100%'
            }}
          >
            {visiblePins.map((pin) => {
              if (pin.row === undefined || pin.col === undefined) {
                console.warn(`Pin ${pin.pos} in connector ${id} is missing row/col data.`);
                return null;
              }
              
              return (
                <div 
                  key={`pin-${pin.pos}`}
                  style={{
                    gridRow: (pin.row ?? 0) + 1,
                    gridColumn: (pin.col ?? 0) + 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}
                >
                  <PinDisplay
                    pin={pin}
                    isSelected={selectedPin?.connectorId === id && selectedPin?.pinPos === pin.pos}
                    isHovered={hoveredPin === pin.pos}
                    isConnected={isPinConnected?.(pin.pos, id) ?? false}
                    darkMode={settings?.darkMode ?? true}
                    gender={gender?.toLowerCase() === 'female' ? 'female' : 'male'}
                    onClick={() => handlePinClick(pin.pos)}
                    onContextMenu={(e) => handlePinContextMenu(e, pin.pos)}
                    onMouseEnter={() => setHoveredPin(pin.pos)}
                    onMouseLeave={() => setHoveredPin(null)}
                  />
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
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(ConnectorNode);
