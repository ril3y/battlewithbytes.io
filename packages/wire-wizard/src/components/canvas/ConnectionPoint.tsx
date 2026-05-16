import React from 'react';
import type { Block, ConnectionPoint as ConnectionPointType, Wire, ConnectionPointShape } from '../../lib/core/types';
import { darkenColor } from '../../lib/component-library/utils/colorUtils';

/** Darken a hex color, tolerating non-hex inputs (returns input unchanged). */
function darkenHex(c: string, percent: number): string {
  if (!/^#[0-9a-fA-F]{6}$/.test(c)) return c;
  return darkenColor(c, percent);
}

interface ConnectionPointProps {
  block: Block;
  connectionPoint: ConnectionPointType;
  isBlockSelected: boolean;
  isPointSelected: boolean;
  isWireStartPoint: boolean;
  showConnectionLabels: boolean;
  wires: Wire[];
  wireStart: { blockId?: string; pointId?: string; wireId?: string; bendIndex?: number } | null;
  isDraggingType: (type: string) => boolean;
  onClick: (e: React.MouseEvent) => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onDoubleClick: (e: React.MouseEvent) => void;
  onLabelMouseDown: (e: React.MouseEvent) => void;
  onLabelDoubleClick: (e: React.MouseEvent) => void;
}

/**
 * ConnectionPoint Component
 *
 * Renders an individual connection point on a block with:
 * - Multiple shape options (circle, rectangle, blade, ring, spade)
 * - Interactive shapes that change color based on wire connections
 * - Visual feedback for selection and wire-start states
 * - Draggable, rotatable label with shift+wheel rotation support
 * - Click/double-click handlers for editing
 *
 * Connection points adapt their color to match connected wires for visual consistency.
 */
export const ConnectionPoint: React.FC<ConnectionPointProps> = ({
  block,
  connectionPoint: cp,
  isBlockSelected,
  isPointSelected,
  isWireStartPoint,
  showConnectionLabels,
  wires,
  wireStart,
  isDraggingType,
  onClick,
  onMouseDown,
  onDoubleClick,
  onLabelMouseDown,
  onLabelDoubleClick
}) => {
  // Find if there's a wire connected to this point
  const connectedWire = wires.find(w =>
    (w.fromBlockId === block.id && w.fromPointId === cp.id) ||
    (w.toBlockId === block.id && w.toPointId === cp.id)
  );

  // Use wire color if connected, otherwise use connection point's own color
  const pointColor = connectedWire ? connectedWire.color : cp.color;

  const absoluteX = block.x + cp.x;
  const absoluteY = block.y + cp.y;

  // Get shape (default to circle)
  const shape: ConnectionPointShape = cp.shape || 'circle';

  // Common interaction props
  const interactionProps = {
    onClick,
    onMouseDown,
    onDoubleClick,
    style: { cursor: wireStart ? 'crosshair' : 'grab' }
  };

  // Get radius (default 6)
  const radius = cp.radius || 6;
  const scale = radius / 6;

  // Render the appropriate shape
  const renderShape = () => {
    // Outline tracks point color so dots don't have a jarring white halo
    // against the dark canvas. Selected/wire-start states still show their
    // own accent colors so the user can see what's active.
    const stroke = isWireStartPoint
      ? '#FF8800'
      : isPointSelected
        ? '#00ffa0'
        : darkenHex(pointColor, 35);
    const strokeWidth = isWireStartPoint || isPointSelected ? 3 : 2;

    switch (shape) {
      case 'rectangle':
        // Rectangle connector
        return (
          <rect
            x={absoluteX - (6 * scale)}
            y={absoluteY - (4 * scale)}
            width={12 * scale}
            height={8 * scale}
            fill={pointColor}
            stroke={stroke}
            strokeWidth={strokeWidth}
            rx={1 * scale}
            {...interactionProps}
          />
        );

      case 'blade':
        // Blade connector (flat spade terminal)
        // Scaled using transform for complex path
        return (
          <path
            d={`
              M ${absoluteX - 8} ${absoluteY - 3}
              L ${absoluteX + 8} ${absoluteY - 3}
              L ${absoluteX + 6} ${absoluteY + 3}
              L ${absoluteX - 6} ${absoluteY + 3}
              Z
            `}
            transform={`translate(${absoluteX}, ${absoluteY}) scale(${scale}) translate(${-absoluteX}, ${-absoluteY})`}
            fill={pointColor}
            stroke={stroke}
            strokeWidth={strokeWidth}
            {...interactionProps}
          />
        );

      case 'ring':
        // Ring terminal (hollow circle)
        return (
          <circle
            cx={absoluteX}
            cy={absoluteY}
            r={radius}
            fill="none"
            stroke={pointColor}
            strokeWidth={3}
            {...interactionProps}
          />
        );

      case 'spade':
        // Spade terminal (U-shape)
        return (
          <path
            d={`
              M ${absoluteX - 6} ${absoluteY - 6}
              L ${absoluteX - 6} ${absoluteY + 2}
              A 6 6 0 0 0 ${absoluteX + 6} ${absoluteY + 2}
              L ${absoluteX + 6} ${absoluteY - 6}
              L ${absoluteX + 3} ${absoluteY - 6}
              L ${absoluteX + 3} ${absoluteY + 1}
              A 3 3 0 0 1 ${absoluteX - 3} ${absoluteY + 1}
              L ${absoluteX - 3} ${absoluteY - 6}
              Z
            `}
            transform={`translate(${absoluteX}, ${absoluteY}) scale(${scale}) translate(${-absoluteX}, ${-absoluteY})`}
            fill={pointColor}
            stroke={stroke}
            strokeWidth={strokeWidth}
            {...interactionProps}
          />
        );

      case 'circle':
      default:
        // Default circle connector
        return (
          <circle
            cx={absoluteX}
            cy={absoluteY}
            r={radius}
            fill={pointColor}
            stroke={stroke}
            strokeWidth={strokeWidth}
            {...interactionProps}
          />
        );
    }
  };

  // Render highlight ring based on shape
  const renderHighlightRing = () => {
    if (!isPointSelected && !isWireStartPoint) return null;

    const highlightColor = isWireStartPoint ? '#FF8800' : '#00ffa0';
    const highlightRadius = radius + 6; // Maintain proportional gap

    switch (shape) {
      case 'rectangle':
        return (
          <rect
            x={absoluteX - (radius + 3)}
            y={absoluteY - (radius * 0.7 + 3)}
            width={(radius + 3) * 2}
            height={(radius * 0.7 + 3) * 2}
            fill="none"
            stroke={highlightColor}
            strokeWidth={2}
            rx={1}
            {...interactionProps}
          />
        );

      case 'blade':
        return (
          <rect
            x={absoluteX - (10 * scale + 4)}
            y={absoluteY - (6 * scale + 4)}
            width={(10 * scale + 4) * 2}
            height={(6 * scale + 4) * 2}
            fill="none"
            stroke={highlightColor}
            strokeWidth={2}
            rx={1}
            {...interactionProps}
          />
        );

      case 'ring':
      case 'spade':
      case 'circle':
      default:
        return (
          <circle
            cx={absoluteX}
            cy={absoluteY}
            r={radius + 6}
            fill="none"
            stroke={highlightColor}
            strokeWidth={2}
            {...interactionProps}
          />
        );
    }
  };

  const busPortCount = cp.isBusPort ? (cp.internalPinIds?.length ?? 0) : 0;

  return (
    <g>
      {/* Selection/wire-start highlight ring */}
      {renderHighlightRing()}

      {/* Bus-port ring: thicker outline around any point flagged as a bus port */}
      {cp.isBusPort && (
        <circle
          cx={absoluteX}
          cy={absoluteY}
          r={radius + 3}
          fill="none"
          stroke="#00aaff"
          strokeWidth={1.5}
          strokeDasharray="2,2"
          style={{ pointerEvents: 'none' }}
        />
      )}

      {/* Connection point shape */}
      {renderShape()}

      {/* Bus-port pin-count badge */}
      {cp.isBusPort && busPortCount > 0 && (
        <text
          x={absoluteX}
          y={absoluteY - radius - 5}
          fill="#00aaff"
          fontSize="8"
          fontFamily="monospace"
          textAnchor="middle"
          fontWeight="bold"
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          [{busPortCount}]
        </text>
      )}

      {/* Connection point label */}
      {showConnectionLabels && (
        <text
          x={absoluteX + (cp.labelOffsetX || 0) + (cp.x < block.width / 2 ? -10 : 10)}
          y={absoluteY + (cp.labelOffsetY || 0) + 4}
          fill={pointColor}
          fontSize="9"
          fontFamily="monospace"
          textAnchor={cp.x < block.width / 2 ? 'end' : 'start'}
          transform={`rotate(${cp.labelRotation || 0}, ${absoluteX + (cp.labelOffsetX || 0) + (cp.x < block.width / 2 ? -10 : 10)}, ${absoluteY + (cp.labelOffsetY || 0) + 4})`}
          style={{
            cursor: isDraggingType('connectionLabel') ? 'grabbing' : 'grab',
            userSelect: 'none',
            pointerEvents: 'auto'
          }}
          onMouseDown={onLabelMouseDown}
          onDoubleClick={onLabelDoubleClick}
        >
          {cp.label}
        </text>
      )}
    </g>
  );
};
