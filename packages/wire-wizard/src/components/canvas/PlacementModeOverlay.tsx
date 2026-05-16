/**
 * PlacementModeOverlay Component
 *
 * Renders visual feedback during connection point placement mode:
 * - Highlighted border around target block
 * - Animated preview circle at mouse position
 */

import React from 'react';
import type { Block } from '../../lib/core/types';

interface PlacementModeOverlayProps {
  placementMode: boolean;
  targetBlockId: string | null;
  mousePos: { x: number; y: number } | null;
  blocks: Block[];
}

export const PlacementModeOverlay: React.FC<PlacementModeOverlayProps> = ({
  placementMode,
  targetBlockId,
  mousePos,
  blocks,
}) => {
  if (!placementMode || !targetBlockId || !mousePos) {
    return null;
  }

  const targetBlock = blocks.find(b => b.id === targetBlockId);
  if (!targetBlock) {
    return null;
  }

  // Check if mouse is over the block
  const isOverBlock = (
    mousePos.x >= targetBlock.x &&
    mousePos.x <= targetBlock.x + targetBlock.width &&
    mousePos.y >= targetBlock.y &&
    mousePos.y <= targetBlock.y + targetBlock.height
  );

  return (
    <>
      {/* Highlight target block with animated dashed border */}
      <rect
        x={targetBlock.x}
        y={targetBlock.y}
        width={targetBlock.width}
        height={targetBlock.height}
        fill="none"
        stroke="#4488ff"
        strokeWidth={3}
        strokeDasharray="5,5"
        rx={targetBlock.shape === 'rounded' ? 10 : 0}
        pointerEvents="none"
        opacity={0.8}
      >
        <animate
          attributeName="stroke-dashoffset"
          from="0"
          to="10"
          dur="0.5s"
          repeatCount="indefinite"
        />
      </rect>

      {/* Show preview circle at mouse position when over block */}
      {isOverBlock && (
        <circle
          cx={mousePos.x}
          cy={mousePos.y}
          r={6}
          fill="none"
          stroke="#4488ff"
          strokeWidth={2}
          pointerEvents="none"
          opacity={0.8}
        >
          <animate
            attributeName="r"
            from="4"
            to="8"
            dur="0.8s"
            repeatCount="indefinite"
          />
        </circle>
      )}
    </>
  );
};
