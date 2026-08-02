import React, { useMemo } from 'react';
import type { Wire, Block, BendPoint } from '../../lib/core/types';
import type { DragState } from '../../lib/canvas/hooks/useDragState';
import { buildWirePath, findCrossingsOnPath, buildPathWithGaps, type Crossing } from '../../lib/wires/wireCrossings';
import { getWireSegments, gaugeToStrokeWidth } from '../../lib/wires/wireGaugeUtils';

// Type for wireStart parameter (matches the state in index.tsx)
interface WireStartState {
  blockId?: string;
  pointId?: string;
  wireId?: string;
  bendIndex?: number;
}

export interface RegularWireRendererProps {
  wire: Wire;
  isSelected: boolean;
  showNetNames: boolean;
  addingToBusWireId: string | null;
  wireStart: WireStartState | null;
  GRID_SIZE: number;

  // Position helpers
  getWireEndpointPosition: (wire: Wire, isFrom: boolean) => { x: number; y: number };
  screenToSVGCoords: (clientX: number, clientY: number) => { x: number; y: number };
  snapToGrid: (value: number, gridSize: number) => number;

  // Event handlers
  setSelectedWireId: (id: string | null) => void;
  setSelectedWireLabelId: (id: string | null) => void;
  setContextMenu: (menu: { x: number; y: number; wireId: string } | null) => void;
  addBendPointToWireAtPosition: (wireId: string, x: number, y: number) => void;
  handleBendPointMouseDown: (wireId: string, bendIndex: number, e: React.MouseEvent) => void;
  addWireToBus: (sourceWireId: string, targetWireId: string) => void;
  startDragging: (state: DragState) => void;
  saveToHistory: () => void;
  setWires: (wires: Wire[] | ((wires: Wire[]) => Wire[])) => void;
  wires: Wire[];
  blocks: Block[];
  selectedWireLabelId: string | null;

  // Drag state
  isDraggingType: (type: string) => boolean;

  // T-junction support
  findNearestPointOnWire?: (wire: Wire, x: number, y: number, getWireEndpointPosition: (wire: Wire, isFrom: boolean) => { x: number; y: number }, gridSize: number) => { x: number; y: number; segmentIndex: number } | null;
  createTJunction?: (wire: Wire, wireStart: WireStartState, x: number, y: number, blocks: Block[], gridSize: number, segmentIndex: number, wireBendPoints?: BendPoint[], wires?: Wire[]) => { wireA: Wire; wireB: Wire; wireC: Wire };
  setWireStart?: (start: WireStartState | null) => void;
  setWireBendPoints?: (points: BendPoint[]) => void;
  wireBendPoints?: BendPoint[];
  setMousePos?: (pos: { x: number; y: number } | null) => void;

  // Wire crossing support
  previousWires?: Wire[];  // All wires that should be rendered "above" this wire
}

/**
 * RegularWireRenderer - Renders a single non-bus wire
 *
 * Handles:
 * - Wire path rendering with bend points
 * - Wire crossing indicators (gaps where wires cross)
 * - Interactive hit area for selection
 * - Wire label (net name) with drag and rotate support
 * - Bend point handles when selected
 * - T-junction creation
 * - Add to bus mode
 */
export const RegularWireRenderer: React.FC<RegularWireRendererProps> = ({
  wire,
  isSelected,
  showNetNames,
  addingToBusWireId,
  wireStart,
  GRID_SIZE,
  getWireEndpointPosition,
  screenToSVGCoords,
  setSelectedWireId,
  setSelectedWireLabelId,
  setContextMenu,
  addBendPointToWireAtPosition,
  handleBendPointMouseDown,
  addWireToBus,
  startDragging,
  saveToHistory,
  setWires,
  wires,
  blocks,
  isDraggingType,
  selectedWireLabelId,
  findNearestPointOnWire,
  createTJunction,
  setWireStart,
  setWireBendPoints,
  wireBendPoints = [],
  setMousePos,
  previousWires = [],
}) => {
  const from = getWireEndpointPosition(wire, true);
  const to = getWireEndpointPosition(wire, false);

  // Get wire segments with gauge information (memoized for performance)
  const segments = useMemo(() => {
    return getWireSegments(wire, getWireEndpointPosition);
  }, [wire, getWireEndpointPosition]);

  // Check if wire has per-segment gauges
  const hasSegmentGauges = wire.wireGauge || (wire.segmentGauges && wire.segmentGauges.length > 0);

  // Build wire path with crossing detection (memoized for performance)
  const pathData = useMemo(() => {
    const currentPath = buildWirePath(from, wire.bendPoints, to);

    // Only calculate crossings for regular (non-bus) wires
    if (wire.busGroupId || previousWires.length === 0) {
      // No crossing detection for bus wires or if no previous wires
      let path = `M ${from.x} ${from.y}`;
      wire.bendPoints.forEach(bend => {
        path += ` L ${bend.x} ${bend.y}`;
      });
      path += ` L ${to.x} ${to.y}`;
      return path;
    }

    // Find all crossings with previous wires (wires rendered "above" this one)
    let allCrossings: Crossing[] = [];

    for (const otherWire of previousWires) {
      // Skip bus wires and the wire itself
      if (otherWire.busGroupId || otherWire.id === wire.id) {
        continue;
      }

      const otherFrom = getWireEndpointPosition(otherWire, true);
      const otherTo = getWireEndpointPosition(otherWire, false);
      const otherPath = buildWirePath(otherFrom, otherWire.bendPoints, otherTo);

      const crossings = findCrossingsOnPath(currentPath, otherPath);
      allCrossings = allCrossings.concat(crossings);
    }

    // Build path with gaps at crossings (6px gap size)
    return buildPathWithGaps(currentPath, allCrossings, 6);
  }, [wire, from, to, previousWires, getWireEndpointPosition]);

  // Handle wire click
  const handleWireClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setContextMenu(null);

    // If in "add to bus" mode, add this wire to the bus
    if (addingToBusWireId) {
      addWireToBus(addingToBusWireId, wire.id);
      return;
    }

    // If in wire creation mode, split the wire and create a T-junction
    if (wireStart && createTJunction && findNearestPointOnWire && setWireStart && setWireBendPoints && setMousePos) {
      const svgP = screenToSVGCoords(e.clientX, e.clientY);

      // Find nearest point on wire to get segment index
      const result = findNearestPointOnWire(wire, svgP.x, svgP.y, getWireEndpointPosition, GRID_SIZE);
      const segmentIndex = result ? result.segmentIndex : 0;

      // Create T-junction using utility function
      // Use the calculated result coordinates which are perfectly projected onto the wire segment
      const { wireA, wireB, wireC } = createTJunction(
        wire,
        wireStart,
        result ? result.x : svgP.x,
        result ? result.y : svgP.y,
        blocks,
        GRID_SIZE,
        segmentIndex,
        wireBendPoints,
        wires
      );

      // Prepare list of new wires
      const newWires = [wireA, wireB, wireC];
      const wiresToRemove = [wire.id];

      // If we started from another wire (bridge), split the source wire too
      if (wireStart.wireId && wireStart.bendIndex !== undefined && wires) {
        const sourceWire = wires.find(w => w.id === wireStart.wireId);
        // Ensure we don't try to split the same wire twice (loopback)
        if (sourceWire && sourceWire.id !== wire.id) {
          const bendPoint = sourceWire.bendPoints[wireStart.bendIndex];
          if (bendPoint) {
            const sourceA: Wire = {
              ...sourceWire,
              id: `wire_${Date.now()}_SourceA`,
              toBlockId: undefined,
              toPointId: undefined,
              toJunctionX: bendPoint.x,
              toJunctionY: bendPoint.y,
              bendPoints: sourceWire.bendPoints.slice(0, wireStart.bendIndex)
            };
            const sourceB: Wire = {
              ...sourceWire,
              id: `wire_${Date.now()}_SourceB`,
              fromBlockId: undefined,
              fromPointId: undefined,
              fromJunctionX: bendPoint.x,
              fromJunctionY: bendPoint.y,
              bendPoints: sourceWire.bendPoints.slice(wireStart.bendIndex + 1)
            };
            newWires.push(sourceA, sourceB);
            wiresToRemove.push(sourceWire.id);
          }
        }
      }

      // Remove original wire(s) and add new wires
      setWires(wires.filter(w => !wiresToRemove.includes(w.id)).concat(newWires));
      saveToHistory();

      // Reset wire creation state
      setWireStart(null);
      setWireBendPoints([]);
      setMousePos(null);
    } else {
      setSelectedWireId(wire.id);
    }
  };

  // Handle wire double-click (add bend point)
  const handleWireDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const svgP = screenToSVGCoords(e.clientX, e.clientY);
    addBendPointToWireAtPosition(wire.id, svgP.x, svgP.y);
  };

  // Handle wire context menu
  const handleWireContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, wireId: wire.id });
    setSelectedWireId(wire.id);
  };

  // Calculate wire label position and render
  const renderWireLabel = () => {
    if (!showNetNames || !wire.netName) return null;

    // Validate endpoints
    if (!from || !to || isNaN(from.x) || isNaN(from.y) || isNaN(to.x) || isNaN(to.y)) {
      return null;
    }

    // Calculate midpoint of wire path for label placement
    const points = [from, ...wire.bendPoints, to];
    let totalLength = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const dx = points[i + 1].x - points[i].x;
      const dy = points[i + 1].y - points[i].y;
      totalLength += Math.sqrt(dx * dx + dy * dy);
    }

    // Find point at 50% distance
    let currentDist = 0;
    let midPoint = from;
    const targetDist = totalLength * 0.5;

    for (let i = 0; i < points.length - 1; i++) {
      const dx = points[i + 1].x - points[i].x;
      const dy = points[i + 1].y - points[i].y;
      const segmentLength = Math.sqrt(dx * dx + dy * dy);

      if (currentDist + segmentLength >= targetDist) {
        const ratio = (targetDist - currentDist) / segmentLength;
        midPoint = {
          x: points[i].x + dx * ratio,
          y: points[i].y + dy * ratio
        };
        break;
      }
      currentDist += segmentLength;
    }

    const labelX = midPoint.x + (wire.labelOffsetX || 0);
    const labelY = midPoint.y + (wire.labelOffsetY || 0);

    // Final validation before rendering
    if (isNaN(labelX) || isNaN(labelY)) {
      return null;
    }

    const isLabelSelected = selectedWireLabelId === wire.id;

    return (
      <g>
        {/* Selection highlight for label */}
        {isLabelSelected && (
          <rect
            x={labelX - 25}
            y={labelY - 8}
            width={50}
            height={16}
            fill="none"
            stroke="#00ffa0"
            strokeWidth={1}
            strokeDasharray="2,2"
            transform={`rotate(${wire.netNameRotation || 0}, ${labelX}, ${labelY + 4})`}
            style={{ pointerEvents: 'none' }}
          />
        )}
        <text
          x={labelX}
          y={labelY + 4}
          textAnchor="middle"
          fill={isLabelSelected ? "#00ffa0" : "#00aaff"}
          fontSize="10"
          fontFamily="monospace"
          fontWeight="bold"
          transform={`rotate(${wire.netNameRotation || 0}, ${labelX}, ${labelY + 4})`}
          style={{
            cursor: isDraggingType('wireLabel') ? 'grabbing' : 'pointer',
            userSelect: 'none',
            pointerEvents: 'auto'
          }}
          onClick={(e) => {
            // Only toggle selection if we didn't just finish dragging
            if (!isDraggingType('wireLabel')) {
              e.stopPropagation();
              setSelectedWireLabelId(isLabelSelected ? null : wire.id);
            }
          }}
          onMouseDown={(e) => {
            if (e.button === 0) {
              // Start dragging - label can be dragged normally
              e.stopPropagation();
              const svgP = screenToSVGCoords(e.clientX, e.clientY);
              startDragging({
                type: 'wireLabel',
                wireId: wire.id,
                startX: svgP.x - (wire.labelOffsetX || 0),
                startY: svgP.y - (wire.labelOffsetY || 0)
              });
            }
          }}
        >
          {wire.netName}
        </text>
      </g>
    );
  };

  // Render segments separately if wire has gauges
  const renderSegmentedWire = () => {
    return (
      <>
        {segments.map((segment) => {
          const segmentPath = `M ${segment.from.x} ${segment.from.y} L ${segment.to.x} ${segment.to.y}`;
          const strokeWidth = segment.gauge ? gaugeToStrokeWidth(segment.gauge, isSelected) : (isSelected ? 3 : 2);

          return (
            <g key={`segment-${segment.index}`}>
              {/* Thicker invisible hit area for easier selection */}
              <path
                d={segmentPath}
                stroke="transparent"
                strokeWidth={Math.max(12, strokeWidth + 8)}
                fill="none"
                style={{ cursor: 'pointer' }}
                onClick={handleWireClick}
                onDoubleClick={handleWireDoubleClick}
                onContextMenu={handleWireContextMenu}
              />

              {/* Visible wire segment */}
              <path
                d={segmentPath}
                stroke={wire.color}
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ pointerEvents: 'none' }}
              />
            </g>
          );
        })}
      </>
    );
  };

  // Render single-path wire (backward compatibility for wires without gauges)
  const renderSinglePathWire = () => {
    return (
      <>
        {/* Thicker invisible hit area for easier selection */}
        <path
          d={pathData}
          stroke="transparent"
          strokeWidth={12}
          fill="none"
          style={{ cursor: 'pointer' }}
          onClick={handleWireClick}
          onDoubleClick={handleWireDoubleClick}
          onContextMenu={handleWireContextMenu}
        />

        {/* Visible wire path (with gaps at crossings) */}
        <path
          d={pathData}
          stroke={wire.color}
          strokeWidth={isSelected ? 3 : 2}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ pointerEvents: 'none' }}
        />
      </>
    );
  };

  return (
    <g key={wire.id}>
      {/* Render wire based on whether it has gauges */}
      {hasSegmentGauges ? renderSegmentedWire() : renderSinglePathWire()}

      {/* Wire label (net name) */}
      {renderWireLabel()}

      {/* Bend point handles - show when wire is selected */}
      {/* Bend point handles - show when wire is selected */}
      {isSelected && (
        <>
          {/* Start Point Handle (if unconnected junction) */}
          {!wire.fromBlockId && (
            <circle
              key="start-handle"
              cx={from.x}
              cy={from.y}
              r={6}
              fill="#ff00aa"
              stroke="#fff"
              strokeWidth={2}
              onMouseDown={(e: React.MouseEvent) => handleBendPointMouseDown(wire.id, -1, e)}
              style={{ cursor: 'move' }}
            />
          )}

          {/* Bend Points */}
          {wire.bendPoints.map((bend, idx) => (
            <circle
              key={`bend-${idx}`}
              cx={bend.x}
              cy={bend.y}
              r={6}
              fill="#00ffa0"
              stroke="#fff"
              strokeWidth={2}
              onMouseDown={(e: React.MouseEvent) => handleBendPointMouseDown(wire.id, idx, e)}
              style={{ cursor: 'grab' }}
            />
          ))}

          {/* End Point Handle (if unconnected junction) */}
          {!wire.toBlockId && (
            <circle
              key="end-handle"
              cx={to.x}
              cy={to.y}
              r={6}
              fill="#ff00aa"
              stroke="#fff"
              strokeWidth={2}
              onMouseDown={(e: React.MouseEvent) => handleBendPointMouseDown(wire.id, -2, e)}
              style={{ cursor: 'move' }}
            />
          )}
        </>
      )}
    </g>
  );
};
