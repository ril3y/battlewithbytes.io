/**
 * WirePreview Component
 *
 * Renders the wire creation preview when user is drawing a new wire.
 * Shows the path from start point through bend points to current mouse position.
 */

import React from 'react';
import type { Wire, BendPoint } from '../../lib/core/types';

interface WireStart {
  blockId?: string;
  pointId?: string;
  wireId?: string;
  bendIndex?: number;
}

interface WirePreviewProps {
  wireStart: WireStart;
  mousePos: { x: number; y: number };
  wireBendPoints: BendPoint[];
  wires: Wire[];
  getGlobalPosition: (blockId: string | undefined, pointId: string | undefined) => { x: number; y: number };
  blocks: Array<{ id: string; connectionPoints: Array<{ id: string; color: string }> }>;
  findWireNearClick: (x: number, y: number) => { wire: Wire; point: { x: number; y: number; segmentIndex: number } } | null;
}

export const WirePreview: React.FC<WirePreviewProps> = ({
  wireStart,
  mousePos,
  wireBendPoints,
  wires,
  getGlobalPosition,
  blocks,
  findWireNearClick,
}) => {
  // Get start position - either from block or junction
  let startPos: { x: number; y: number };
  let wireColor = '#FFFFFF';

  if (wireStart.wireId !== undefined && wireStart.bendIndex !== undefined) {
    // Starting from a junction on a wire
    const sourceWire = wires.find(w => w.id === wireStart.wireId);
    if (sourceWire && sourceWire.bendPoints[wireStart.bendIndex]) {
      startPos = sourceWire.bendPoints[wireStart.bendIndex];
      wireColor = sourceWire.color;
    } else {
      startPos = { x: 0, y: 0 };
    }
  } else if (wireStart.blockId && wireStart.pointId) {
    // Starting from a block connection point
    startPos = getGlobalPosition(wireStart.blockId, wireStart.pointId);
    const fromBlock = blocks.find(b => b.id === wireStart.blockId);
    const fromPoint = fromBlock?.connectionPoints.find(p => p.id === wireStart.pointId);
    wireColor = fromPoint?.color || '#FFFFFF';
  } else {
    startPos = { x: 0, y: 0 };
  }

  // Build preview path
  let previewPath = `M ${startPos.x} ${startPos.y}`;
  wireBendPoints.forEach(bend => {
    previewPath += ` L ${bend.x} ${bend.y}`;
  });
  previewPath += ` L ${mousePos.x} ${mousePos.y}`;

  // Check if near a wire for T-junction
  const nearWire = findWireNearClick(mousePos.x, mousePos.y);

  return (
    <g>
      {/* Preview wire */}
      <path
        d={previewPath}
        stroke={wireColor}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.6}
        strokeDasharray="5,5"
        style={{ pointerEvents: 'none' }}
      />

      {/* Bend points in preview */}
      {wireBendPoints.map((bend, idx) => (
        <circle
          key={idx}
          cx={bend.x}
          cy={bend.y}
          r={4}
          fill={wireColor}
          stroke="#fff"
          strokeWidth={2}
          opacity={0.8}
          style={{ pointerEvents: 'none' }}
        />
      ))}

      {/* Current mouse position */}
      <circle
        cx={mousePos.x}
        cy={mousePos.y}
        r={5}
        fill={wireColor}
        stroke="#fff"
        strokeWidth={2}
        opacity={0.6}
        style={{ pointerEvents: 'none' }}
      />

      {/* Highlight if near a wire for T-junction */}
      {nearWire && (
        <circle
          cx={nearWire.point.x}
          cy={nearWire.point.y}
          r={8}
          fill="none"
          stroke="#00ffa0"
          strokeWidth={2}
          opacity={0.8}
          strokeDasharray="2,2"
        />
      )}
    </g>
  );
};
