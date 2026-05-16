import React from 'react';
import type { Block as BlockType, Wire } from '../../lib/core/types';
import { BlockShape } from './BlockShape';
import { ConnectionPoint } from './ConnectionPoint';

interface BlockProps {
  block: BlockType;
  isSelected: boolean;
  isLabelSelected: boolean;
  selectedPointId: string | null;
  showConnectionLabels: boolean;
  wires: Wire[];
  wireStart: { blockId?: string; pointId?: string; wireId?: string; bendIndex?: number } | null;
  isDraggingType: (type: string) => boolean;
  onBlockClick: (e: React.MouseEvent) => void;
  onBlockMouseDown: (e: React.MouseEvent) => void;
  onBlockDoubleClick?: (e: React.MouseEvent) => void;
  onBlockLabelClick: (e: React.MouseEvent) => void;
  onBlockLabelDoubleClick: (e: React.MouseEvent) => void;
  onBlockLabelMouseDown: (e: React.MouseEvent) => void;
  onPointClick: (pointId: string, e: React.MouseEvent) => void;
  onPointMouseDown: (pointId: string, e: React.MouseEvent) => void;
  onPointDoubleClick: (pointId: string, e: React.MouseEvent) => void;
  onConnectionLabelMouseDown: (pointId: string, e: React.MouseEvent) => void;
  onConnectionLabelDoubleClick: (pointId: string, e: React.MouseEvent) => void;
  /**
   * If true, skip rendering the block label here. The caller is responsible
   * for rendering labels in a separate higher z-order pass so they sit on top
   * of any wires that draw above the block body.
   */
  skipLabel?: boolean;
}

/**
 * Block Component
 *
 * Renders a complete block including:
 * - Selection highlight (dashed outline)
 * - Block shape (via BlockShape component)
 * - Block label with double-click editing
 * - Connection points (via ConnectionPoint component)
 *
 * This component manages the composition of a block's visual elements
 * and delegates event handling to parent components.
 */
export const Block: React.FC<BlockProps> = ({
  block,
  isSelected,
  isLabelSelected,
  selectedPointId,
  showConnectionLabels,
  wires,
  wireStart,
  isDraggingType,
  onBlockClick,
  onBlockMouseDown,
  onBlockDoubleClick,
  onBlockLabelClick,
  onBlockLabelDoubleClick,
  onBlockLabelMouseDown,
  onPointClick,
  onPointMouseDown,
  onPointDoubleClick,
  onConnectionLabelMouseDown,
  onConnectionLabelDoubleClick,
  skipLabel,
}) => {
  // Calculate label position with offset
  const labelX = block.x + block.width / 2 + (block.labelOffsetX || 0);
  const labelY = block.y + block.height / 2 + 7 + (block.labelOffsetY || 0);
  const labelRotation = block.labelRotation || 0;

  return (
    <g transform={`rotate(${block.rotation || 0}, ${block.x + block.width / 2}, ${block.y + block.height / 2})`}>
      {/* Selection highlight */}
      {isSelected && (
        <rect
          x={block.x - 5}
          y={block.y - 5}
          width={block.width + 10}
          height={block.height + 10}
          fill="none"
          stroke="#00ffa0"
          strokeWidth={2}
          strokeDasharray="5,5"
          rx={block.shape === 'rounded' ? 10 : 0}
        />
      )}

      {/* Block shape */}
      <BlockShape
        block={block}
        isSelected={isSelected}
        onClick={onBlockClick}
        onMouseDown={onBlockMouseDown}
        onDoubleClick={onBlockDoubleClick}
      />

      {/* Block label with draggable position and rotation */}
      {!skipLabel && block.showLabel !== false && (
        <g>
          {/* Label selection highlight */}
          {isLabelSelected && (
            <rect
              x={labelX - 50}
              y={labelY - 15}
              width={100}
              height={25}
              fill="rgba(0, 255, 160, 0.1)"
              stroke="#00ffa0"
              strokeWidth={1}
              strokeDasharray="2,2"
              rx={3}
              transform={`rotate(${labelRotation}, ${labelX}, ${labelY})`}
              style={{ pointerEvents: 'none' }}
            />
          )}
          <text
            x={labelX}
            y={labelY - ((block.label || '').split('\n').length - 1) * 9} // Adjust vertical start to center
            fill={isLabelSelected ? "#00ffa0" : "#fff"}
            fontSize="18"
            fontFamily="monospace"
            textAnchor="middle"
            fontWeight="bold"
            style={{
              cursor: isDraggingType('blockLabel') ? 'grabbing' : 'grab',
              userSelect: 'none'
            }}
            transform={`rotate(${labelRotation}, ${labelX}, ${labelY})`}
            onClick={onBlockLabelClick}
            onDoubleClick={onBlockLabelDoubleClick}
            onMouseDown={onBlockLabelMouseDown}
          >
            {(block.label || '').split('\n').map((line, i) => (
              <tspan x={labelX} dy={i === 0 ? 0 : "1.2em"} key={i}>
                {line}
              </tspan>
            ))}
          </text>
        </g>
      )}

      {/* Connection points (hidden pins live in pinout drill-in only) */}
      {block.connectionPoints.filter(cp => !cp.hidden).map(cp => {
        const isPointSelected = selectedPointId === cp.id && isSelected;
        const isWireStartPoint = wireStart?.blockId === block.id && wireStart?.pointId === cp.id;

        return (
          <ConnectionPoint
            key={cp.id}
            block={block}
            connectionPoint={cp}
            isBlockSelected={isSelected}
            isPointSelected={isPointSelected}
            isWireStartPoint={isWireStartPoint}
            showConnectionLabels={block.showConnectionLabels !== undefined ? block.showConnectionLabels : showConnectionLabels}
            wires={wires}
            wireStart={wireStart}
            isDraggingType={isDraggingType}
            onClick={(e) => onPointClick(cp.id, e)}
            onMouseDown={(e) => onPointMouseDown(cp.id, e)}
            onDoubleClick={(e) => onPointDoubleClick(cp.id, e)}
            onLabelMouseDown={(e) => onConnectionLabelMouseDown(cp.id, e)}
            onLabelDoubleClick={(e) => onConnectionLabelDoubleClick(cp.id, e)}
          />
        );
      })}
    </g>
  );
};

interface BlockLabelProps {
  block: BlockType;
  isLabelSelected: boolean;
  isDraggingType: (type: string) => boolean;
  onClick: (e: React.MouseEvent) => void;
  onDoubleClick: (e: React.MouseEvent) => void;
  onMouseDown: (e: React.MouseEvent) => void;
}

/**
 * Stand-alone block label. Mirrors the label JSX rendered inside `Block` so we
 * can render labels in a separate render pass (above any wires that draw on
 * top of the block body), keeping labels clickable for double-click editing.
 */
export const BlockLabel: React.FC<BlockLabelProps> = ({
  block,
  isLabelSelected,
  isDraggingType,
  onClick,
  onDoubleClick,
  onMouseDown,
}) => {
  if (block.showLabel === false) return null;
  const labelX = block.x + block.width / 2 + (block.labelOffsetX || 0);
  const labelY = block.y + block.height / 2 + 7 + (block.labelOffsetY || 0);
  const labelRotation = block.labelRotation || 0;
  return (
    <g transform={`rotate(${block.rotation || 0}, ${block.x + block.width / 2}, ${block.y + block.height / 2})`}>
      {isLabelSelected && (
        <rect
          x={labelX - 50}
          y={labelY - 15}
          width={100}
          height={25}
          fill="rgba(0, 255, 160, 0.1)"
          stroke="#00ffa0"
          strokeWidth={1}
          strokeDasharray="2,2"
          rx={3}
          transform={`rotate(${labelRotation}, ${labelX}, ${labelY})`}
          style={{ pointerEvents: 'none' }}
        />
      )}
      <text
        x={labelX}
        y={labelY - ((block.label || '').split('\n').length - 1) * 9}
        fill={isLabelSelected ? '#00ffa0' : '#fff'}
        fontSize="18"
        fontFamily="monospace"
        textAnchor="middle"
        fontWeight="bold"
        style={{
          cursor: isDraggingType('blockLabel') ? 'grabbing' : 'grab',
          userSelect: 'none',
        }}
        transform={`rotate(${labelRotation}, ${labelX}, ${labelY})`}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        onMouseDown={onMouseDown}
      >
        {(block.label || '').split('\n').map((line, i) => (
          <tspan x={labelX} dy={i === 0 ? 0 : '1.2em'} key={i}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
};
