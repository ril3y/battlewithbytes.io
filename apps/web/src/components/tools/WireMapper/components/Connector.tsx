'use client';

import React, { CSSProperties } from 'react'; // Removed unused useState
import { motion, PanInfo } from 'framer-motion';
import { Connector as ConnectorType, Pin, Mapping } from '../types'; // Removed unused ConnectorGender
import { useWireMapperStore } from '../store/useWireMapperStore';
import { ConnectorRenderer } from './ConnectorRenderer';

// Define constants locally
const PIN_SIZE = 20;
const PIN_MARGIN = 4;

interface ConnectorProps {
  connector: ConnectorType;
  onPinClick: (connectorId: string, pinIndex: number) => void;
  onContextMenu: (e: React.MouseEvent<HTMLDivElement>) => void;
  selected: boolean;
  selectedPin: { connectorId: string; pinIndex: number; } | null;
  connectingPin: { connectorId: string; pinIndex: number; } | null; // Pin selected as connection start
  dragConstraintsRef: React.RefObject<HTMLDivElement | null>; // Allow null
}

const pinSpacing = PIN_MARGIN * 2 + PIN_SIZE;

export const Connector: React.FC<ConnectorProps> = ({ 
  connector,
  onPinClick,
  onContextMenu,
  selected,
  selectedPin,
  connectingPin,
  dragConstraintsRef,
}) => {
  const { mappings, updateConnectorPosition, settings } = useWireMapperStore();

  const isConnected = (pinIndex: number) => {
    return mappings.some((mapping: Mapping) => 
      (mapping.source.connectorId === connector.id && mapping.source.pinPos === pinIndex) ||
      (mapping.target.connectorId === connector.id && mapping.target.pinPos === pinIndex)
    );
  };

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    // Update position in the store
    // info.point contains the final {x, y} relative to the viewport
    // We need to adjust based on the canvas position if needed, but for now let's update directly
    // Note: framer-motion handles position updates visually via style.transform
    // We update the store to persist the logical position
    const newX = connector.x + info.offset.x;
    const newY = connector.y + info.offset.y;
    updateConnectorPosition(connector.id, newX, newY);
  };

  const getPinStyle = (pinData: { pin: Pin }): CSSProperties => {
    const pin = pinData.pin;
    const isPinSelected = selectedPin?.connectorId === connector.id && selectedPin?.pinIndex === pin.index;
    const isPinHovered = false; // Temporarily set to false since hover state is not currently used
    const connected = isConnected(pin.index);
    const isConnectingStartPin = connectingPin?.connectorId === connector.id && connectingPin?.pinIndex === pin.index;

    // Use the pin's specific color if available, otherwise default by gender
    const pinColor = pin.config.color ?? (connector.gender === 'Male' ? '#111111' : '#333333'); 
    let borderColor = '#00ff9d'; 
    let boxShadow = `0 0 5px ${borderColor}`;

    if (connected) {
      borderColor = '#ff6b00'; 
      boxShadow = `0 0 6px ${borderColor}`;
    } else if (isPinSelected) {
      borderColor = '#ffffff'; 
      boxShadow = `0 0 8px ${borderColor}`;
    } else if (isConnectingStartPin) { // Highlight for connection start
      borderColor = '#facc15'; // Yellow-ish
      boxShadow = `0 0 8px ${borderColor}`;
    } else if (isPinHovered) {
      borderColor = '#00ffff'; 
      boxShadow = `0 0 7px ${borderColor}`;
    }

    return {
      width: PIN_SIZE,
      height: PIN_SIZE,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: `${Math.max(8, PIN_SIZE * 0.4)}px`, 
      fontWeight: 'bold',
      backgroundColor: pinColor, // Use the potentially overridden pinColor
      border: `2px solid ${borderColor}`,
      boxShadow: boxShadow,
      color: '#e0e0e0',
      cursor: 'pointer',
      transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
      margin: '2px 0', 
    };
  };

  const nameAbove = settings.namePosition === 'above';

  const totalWidth = (connector.config.columns ?? 0) * pinSpacing + PIN_MARGIN * 2; 
  const totalHeight = (connector.config.rows ?? 0) * pinSpacing + PIN_MARGIN * 2;

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const pinWrapper = target.closest('.pin-wrapper');

    if (pinWrapper) {
      const pinPosStr = pinWrapper.getAttribute('data-pin-pos');
      if (pinPosStr) {
        const pinIndex = parseInt(pinPosStr, 10);
        if (!isNaN(pinIndex)) {
          onPinClick(connector.id, pinIndex);
        } else {
          console.error("[Connector] Invalid pin position found in data attribute", pinPosStr);
        }
      } else {
        console.error("[Connector] Pin wrapper clicked, but data-pin-pos attribute missing.");
      }
    } else if (e.currentTarget === target) {
      onPinClick(connector.id, -1); // Assuming -1 means deselect or background click
    }
  };

  const genderClass = (() => {
    switch (connector.gender) {
      case 'Male': return 'connector-male';
      case 'Female': return 'connector-female';
      default: return 'connector-unknown';
    }
  })();

  return (
    <motion.div
      key={connector.id}
      initial={{ x: connector.x, y: connector.y }} // Set initial position for framer-motion
      className={`absolute group cursor-grab ${selected ? 'z-10' : 'z-0'} ${genderClass}`}
      style={{
        // transform: `rotate(${connector.position.rotation}deg)`, // Rotation handled by framer-motion if needed
        width: `${connector.width}px`, // Use calculated width
        height: `${connector.height}px`, // Use calculated height
      }}
      drag
      dragConstraints={dragConstraintsRef.current ? dragConstraintsRef : undefined} // Pass ref only if current exists
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      // Apply rotation via motion props if desired
      // initial={{ rotate: connector.position.rotation }}
      // animate={{ rotate: connector.position.rotation }}
      onContextMenu={onContextMenu}
    >
      {nameAbove && (
        <div className="text-center text-sm text-gray-300 mb-1 select-none w-full" style={{width: totalWidth}}>
          {connector.name || connector.type}
        </div>
      )}
      <div 
        className="relative p-2 bg-gray-950 rounded border border-gray-800 shadow-lg flex flex-col items-center"
        style={{
          width: totalWidth,
          minHeight: totalHeight, 
          backgroundColor: '#111111',
          borderRadius: '8px',
        }}
        onClick={handleContainerClick} 
      >
        <ConnectorRenderer
          rows={connector.config.rows ?? 0}
          cols={connector.config.columns ?? 0}
          pins={connector.pins} 
          gender={connector.gender ?? 'Unknown'}
          centerPins={connector.config.centerPinsHorizontal ?? false}
          pinSize={PIN_SIZE}
          getPinStyle={getPinStyle} 
          pinWrapperClassName="pin-wrapper" 
        />
      </div>
      {!nameAbove && (
        <div className="text-center text-sm text-gray-300 mt-1 select-none w-full" style={{width: totalWidth}}>
          {connector.name || connector.type}
        </div>
      )}
    </motion.div>
  );
}

// Removed unused PinComponent and related code
