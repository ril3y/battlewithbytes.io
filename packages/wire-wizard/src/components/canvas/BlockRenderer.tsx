import React from 'react';
import type { Block as BlockType, Wire } from '../../lib/core/types';
import { Block } from './Block';

interface BlockRendererProps {
  blocks: BlockType[];
  selectedBlockId: string | null;
  selectedBlockIds?: string[];
  selectedBlockLabelId: string | null;
  selectedPointId: string | null;
  showConnectionLabels: boolean;
  wires: Wire[];
  wireStart: { blockId?: string; pointId?: string; wireId?: string; bendIndex?: number } | null;
  isDraggingType: (type: string) => boolean;
  screenToSVGCoords: (screenX: number, screenY: number) => { x: number; y: number };
  onBlockSelect: (blockId: string) => void;
  onBlockMouseDown: (blockId: string, e: React.MouseEvent) => void;
  /** Double-click on the block body — used to open the Configure modal. */
  onBlockDoubleClick?: (blockId: string, e: React.MouseEvent) => void;
  onBlockLabelClick?: (blockId: string, e: React.MouseEvent) => void;
  onBlockLabelDoubleClick: (blockId: string, e: React.MouseEvent) => void;
  onBlockLabelDrag?: (blockId: string, startX: number, startY: number) => void;
  onPointClick: (blockId: string, pointId: string, e: React.MouseEvent) => void;
  onPointMouseDown: (blockId: string, pointId: string, e: React.MouseEvent) => void;
  onConnectionLabelDoubleClick: (blockId: string, pointId: string, e: React.MouseEvent) => void;
  onConnectionLabelDrag: (blockId: string, pointId: string, startX: number, startY: number) => void;
  /**
   * If true, blocks render their shapes and connection points but their labels
   * are skipped — let a separate later pass handle labels so they end up on
   * top of any wires that draw above the block body (wiresOnTop=true).
   */
  skipLabels?: boolean;
}

/**
 * BlockRenderer Component
 *
 * Main block rendering component that maps over all blocks and renders them
 * with their connection points, labels, and interactive elements.
 *
 * This component acts as a container that:
 * - Iterates through all blocks in the diagram
 * - Manages selection state for each block
 * - Delegates block-specific rendering to the Block component
 * - Forwards all event handlers to individual blocks
 *
 * Event Flow:
 * 1. User interactions on blocks/connection points trigger handlers
 * 2. Handlers are passed down from parent (InteractiveWiringDemo)
 * 3. BlockRenderer forwards to appropriate Block component
 * 4. Block component forwards to BlockShape/ConnectionPoint as needed
 */
export const BlockRenderer: React.FC<BlockRendererProps> = ({
  blocks,
  selectedBlockId,
  selectedBlockIds,
  selectedBlockLabelId,
  selectedPointId,
  showConnectionLabels,
  wires,
  wireStart,
  isDraggingType,
  screenToSVGCoords,
  onBlockSelect,
  onBlockMouseDown,
  onBlockDoubleClick,
  onBlockLabelClick,
  onBlockLabelDoubleClick,
  onBlockLabelDrag,
  onPointClick,
  onPointMouseDown,
  onConnectionLabelDoubleClick,
  onConnectionLabelDrag,
  skipLabels,
}) => {
  return (
    <>
      {blocks.map(block => {
        const isSelected =
          selectedBlockId === block.id ||
          (selectedBlockIds ? selectedBlockIds.indexOf(block.id) !== -1 : false);
        const isLabelSelected = selectedBlockLabelId === block.id;

        return (
          <Block
            key={block.id}
            block={block}
            isSelected={isSelected}
            isLabelSelected={isLabelSelected}
            selectedPointId={selectedPointId}
            showConnectionLabels={showConnectionLabels}
            wires={wires}
            wireStart={wireStart}
            isDraggingType={isDraggingType}
            onBlockClick={(e) => {
              e.stopPropagation();
              onBlockSelect(block.id);
            }}
            onBlockMouseDown={(e) => onBlockMouseDown(block.id, e)}
            onBlockDoubleClick={(e) => {
              if (onBlockDoubleClick) {
                e.stopPropagation();
                onBlockDoubleClick(block.id, e);
              }
            }}
            onBlockLabelClick={(e) => {
              if (onBlockLabelClick) {
                e.stopPropagation();
                onBlockLabelClick(block.id, e);
              }
            }}
            onBlockLabelDoubleClick={(e) => onBlockLabelDoubleClick(block.id, e)}
            onBlockLabelMouseDown={(e) => {
              if (e.button === 0 && !e.shiftKey && onBlockLabelDrag) {
                e.stopPropagation();
                const svgP = screenToSVGCoords(e.clientX, e.clientY);
                // Pass raw mousedown SVG position; the move handler diffs
                // against this and inverse-rotates the delta into the
                // block's local frame so rotated labels track the cursor.
                onBlockLabelDrag(block.id, svgP.x, svgP.y);
              }
            }}
            onPointClick={(pointId, e) => onPointClick(block.id, pointId, e)}
            onPointMouseDown={(pointId, e) => onPointMouseDown(block.id, pointId, e)}
            onPointDoubleClick={(pointId, e) => onConnectionLabelDoubleClick(block.id, pointId, e)}
            onConnectionLabelMouseDown={(pointId, e) => {
              if (e.button === 0 && !e.shiftKey) {
                e.stopPropagation();
                // Select the point when clicking its label
                onPointClick(block.id, pointId, e);
                const svgP = screenToSVGCoords(e.clientX, e.clientY);
                onConnectionLabelDrag(block.id, pointId, svgP.x, svgP.y);
              }
            }}
            onConnectionLabelDoubleClick={(pointId, e) => onConnectionLabelDoubleClick(block.id, pointId, e)}
            skipLabel={skipLabels}
          />
        );
      })}
    </>
  );
};
