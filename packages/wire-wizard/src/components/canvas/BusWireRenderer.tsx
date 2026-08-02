import React, { useMemo } from 'react';
import type { Wire } from '../../lib/core/types';
import type { DragState } from '../../lib/canvas/hooks/useDragState';

/**
 * BusWireRenderer Component
 *
 * Renders a bus group (bundle of wires) with:
 * 1. Individual colored wires at endpoints (fan-out)
 * 2. Gray bundle in the middle section
 * 3. Draggable convergence points to adjust fan-out length
 * 4. Draggable bend points along the bundle path
 * 5. Bus label with rotation support
 *
 * Architecture:
 * - Calculates center points from all wire endpoints
 * - Uses convergence percentages to determine where wires bundle/unbundle
 * - Renders individual colored wires with dashed style for fan-out sections
 * - Renders a thick gray bundle for the middle section
 * - Provides interactive handles for adjusting the bus geometry
 */

interface BusWireRendererProps {
  // Bus identification
  busGroupId: string;
  busWires: Wire[];
  busGroup: { name: string; rotation?: number; color?: string };

  // Selection state
  selectedWireId: string | null;

  // Display options
  showBusNames: boolean;

  // Constants
  GRID_SIZE: number;

  // Helper functions
  getWireEndpointPosition: (wire: Wire, isFrom: boolean) => { x: number; y: number };
  snapToGrid: (value: number, gridSize: number) => number;
  screenToSVGCoords: (screenX: number, screenY: number) => { x: number; y: number };

  // Event handlers - wire selection
  setSelectedWireId: (wireId: string) => void;
  setContextMenu: (menu: { x: number; y: number; wireId: string } | null) => void;
  addBendPointToWireAtPosition: (wireId: string, x: number, y: number) => void;

  // Event handlers - bend points
  handleBendPointMouseDown: (wireId: string, bendIndex: number, e: React.MouseEvent) => void;

  // Event handlers - convergence points (using new drag state hook)
  startDragging: (state: DragState) => void;

  // Event handlers - bus label
  startEditingBusName: (busGroupId: string, currentName: string) => void;
  setBusGroups: (groups: Record<string, { name: string; rotation?: number; color?: string }>) => void;
  busGroups: Record<string, { name: string; rotation?: number; color?: string }>;
  saveToHistory: () => void;

  // Event handlers - bus operations
  addingToBusWireId: string | null;
  addWireToBus: (sourceWireId: string, targetWireId: string) => void;

  // Dragging state
  isDraggingType: (type: string) => boolean;
}

export const BusWireRenderer: React.FC<BusWireRendererProps> = ({
  busGroupId,
  busWires,
  busGroup,
  selectedWireId,
  showBusNames,
  GRID_SIZE,
  getWireEndpointPosition,
  snapToGrid,
  screenToSVGCoords,
  setSelectedWireId,
  setContextMenu,
  addBendPointToWireAtPosition,
  handleBendPointMouseDown,
  startDragging,
  startEditingBusName,
  setBusGroups,
  busGroups,
  saveToHistory,
  addingToBusWireId,
  addWireToBus,
  isDraggingType,
}) => {
  // Get the first wire to access shared properties (bendPoints, converge settings)
  const primaryWire = busWires[0];

  // Check if any wire in the bus is selected
  const anySelected = busWires.some(w => w.id === selectedWireId);

  // Calculate bus geometry (memoized for performance).
  // NOTE: this hook must run before any early return so hook order stays
  // stable across renders (an empty bus previously bailed out above it).
  const busGeometry = useMemo(() => {
    if (!primaryWire) return null;

    // Get primary wire endpoints to establish the "canonical" direction of the bus
    const pFrom = getWireEndpointPosition(primaryWire, true);
    const pTo = getWireEndpointPosition(primaryWire, false);

    // Analyze each wire to see if it runs parallel or antiparallel (reversed) to the primary wire
    // This prevents the bus from collapsing if wires run in opposite directions
    const wireAnalysis = busWires.map(w => {
      const wFrom = getWireEndpointPosition(w, true);
      const wTo = getWireEndpointPosition(w, false);

      // Calculate distances to determine orientation
      // Distance if aligned: From->From + To->To
      const distAligned = Math.hypot(wFrom.x - pFrom.x, wFrom.y - pFrom.y) +
        Math.hypot(wTo.x - pTo.x, wTo.y - pTo.y);

      // Distance if crossed: From->To + To->From
      const distCrossed = Math.hypot(wFrom.x - pTo.x, wFrom.y - pTo.y) +
        Math.hypot(wTo.x - pFrom.x, wTo.y - pFrom.y);

      const isReversed = distCrossed < distAligned;

      return {
        wireId: w.id,
        isReversed,
        // Use swapped points for geometry calculation if reversed
        // This ensures all "from" points are on one side and "to" points on the other
        geoFrom: isReversed ? wTo : wFrom,
        geoTo: isReversed ? wFrom : wTo
      };
    });

    const wireOrientations = new Map(wireAnalysis.map(WA => [WA.wireId, WA.isReversed]));
    const allFromPoints = wireAnalysis.map(wa => wa.geoFrom);
    const allToPoints = wireAnalysis.map(wa => wa.geoTo);

    // Calculate center points and snap to grid for clean parallel lines
    const centerFrom = {
      x: snapToGrid(allFromPoints.reduce((sum, p) => sum + p.x, 0) / allFromPoints.length, GRID_SIZE),
      y: snapToGrid(allFromPoints.reduce((sum, p) => sum + p.y, 0) / allFromPoints.length, GRID_SIZE)
    };

    const centerTo = {
      x: snapToGrid(allToPoints.reduce((sum, p) => sum + p.x, 0) / allToPoints.length, GRID_SIZE),
      y: snapToGrid(allToPoints.reduce((sum, p) => sum + p.y, 0) / allToPoints.length, GRID_SIZE)
    };

    // Build path points array using center points (not first wire's endpoints)
    const pathPoints = [centerFrom, ...(primaryWire.bendPoints || []).filter(p => p), centerTo];

    // Calculate total path length
    let totalLength = 0;
    for (let i = 0; i < pathPoints.length - 1; i++) {
      const dx = pathPoints[i + 1].x - pathPoints[i].x;
      const dy = pathPoints[i + 1].y - pathPoints[i].y;
      totalLength += Math.sqrt(dx * dx + dy * dy);
    }

    // Protect against zero-length bundles (can happen if points are identical)
    // This prevents NaN errors in subsequent calculations
    if (totalLength < 0.1) totalLength = 1;

    // Helper: Find point at specific distance along path (supports extending beyond endpoints)
    const getPointAtDistance = (targetDist: number) => {
      // Handle negative distance (extend before start)
      if (targetDist < 0) {
        const dx = pathPoints[1].x - pathPoints[0].x;
        const dy = pathPoints[1].y - pathPoints[0].y;
        const segmentLength = Math.sqrt(dx * dx + dy * dy);
        // Avoid division by zero
        const ratio = segmentLength > 0 ? targetDist / segmentLength : 0;
        return {
          x: pathPoints[0].x + dx * ratio,
          y: pathPoints[0].y + dy * ratio
        };
      }

      let currentDist = 0;
      for (let i = 0; i < pathPoints.length - 1; i++) {
        const dx = pathPoints[i + 1].x - pathPoints[i].x;
        const dy = pathPoints[i + 1].y - pathPoints[i].y;
        const segmentLength = Math.sqrt(dx * dx + dy * dy);

        if (currentDist + segmentLength >= targetDist) {
          // Avoid division by zero
          const ratio = segmentLength > 0 ? (targetDist - currentDist) / segmentLength : 0;
          return {
            x: pathPoints[i].x + dx * ratio,
            y: pathPoints[i].y + dy * ratio
          };
        }
        currentDist += segmentLength;
      }

      // Handle distance beyond end (extend after end)
      const lastIdx = pathPoints.length - 1;
      const dx = pathPoints[lastIdx].x - pathPoints[lastIdx - 1].x;
      const dy = pathPoints[lastIdx].y - pathPoints[lastIdx - 1].y;
      const segmentLength = Math.sqrt(dx * dx + dy * dy);
      const excessDist = targetDist - currentDist;
      // Avoid division by zero
      const ratio = segmentLength > 0 ? excessDist / segmentLength : 0;
      return {
        x: pathPoints[lastIdx].x + dx * ratio,
        y: pathPoints[lastIdx].y + dy * ratio
      };
    };

    // Convergence points (use stored percentages or defaults)
    // Keep fan-outs SHORT near the blocks - bundle dominates the middle
    const convergeStartPct = primaryWire.busConvergeStart ?? 0.08;  // 8% - short fan-out near start
    const convergeEndPct = primaryWire.busConvergeEnd ?? 0.92;       // 92% - short fan-out near end
    const convergeStart = getPointAtDistance(totalLength * convergeStartPct);
    const convergeEnd = getPointAtDistance(totalLength * convergeEndPct);

    // Build bundle path (through all bend points, using center points)
    let bundlePath = `M ${centerFrom.x} ${centerFrom.y}`;
    primaryWire.bendPoints.forEach(bend => {
      bundlePath += ` L ${bend.x} ${bend.y}`;
    });
    bundlePath += ` L ${centerTo.x} ${centerTo.y}`;

    // Build the main gray bundle path (only the middle section)
    let grayBundlePath = `M ${convergeStart.x} ${convergeStart.y}`;

    // Add bend points that fall within the bundle section (15%-85%)
    let currentDist = 0;
    for (let i = 0; i < pathPoints.length - 1; i++) {
      const dx = pathPoints[i + 1].x - pathPoints[i].x;
      const dy = pathPoints[i + 1].y - pathPoints[i].y;
      const segmentLength = Math.sqrt(dx * dx + dy * dy);
      const segmentEnd = currentDist + segmentLength;

      // If this segment's end point is within the bundle range, include it
      if (segmentEnd > totalLength * 0.15 && currentDist < totalLength * 0.85) {
        if (i < pathPoints.length - 2) { // Not the last segment
          grayBundlePath += ` L ${pathPoints[i + 1].x} ${pathPoints[i + 1].y}`;
        }
      }
      currentDist += segmentLength;
    }

    grayBundlePath += ` L ${convergeEnd.x} ${convergeEnd.y}`;

    // Calculate label position (center of bundle)
    const midPoint = getPointAtDistance(totalLength * 0.5);
    const labelX = midPoint.x + (primaryWire.labelOffsetX || 0);
    const labelY = midPoint.y + (primaryWire.labelOffsetY || 0);

    return {
      centerFrom,
      centerTo,
      pathPoints,
      totalLength,
      convergeStart,
      convergeEnd,
      bundlePath,
      grayBundlePath,
      labelX,
      labelY,
      wireOrientations,
    };
  }, [busWires, primaryWire, getWireEndpointPosition, snapToGrid, GRID_SIZE]);

  if (!primaryWire || !busGeometry) return null;

  const draggingLabel = isDraggingType('wireLabel');
  const draggingBusConverge = isDraggingType('busConverge');

  return (
    <g key={`bus-${busGroupId}`}>
      {/* Draw each wire from its connection point, converging to bundle */}
      {busWires.map((busWire) => {
        const busWireFrom = getWireEndpointPosition(busWire, true);
        const busWireTo = getWireEndpointPosition(busWire, false);

        // Determine which end of the bundle this wire connects to
        const isReversed = busGeometry.wireOrientations.get(busWire.id);

        // If reversed: 
        //   Wire From (physically at End side) -> Bundle End
        //   Wire To (physically at Start side) -> Bundle Start
        const bundlePointForFrom = isReversed ? busGeometry.convergeEnd : busGeometry.convergeStart;
        const bundlePointForTo = isReversed ? busGeometry.convergeStart : busGeometry.convergeEnd;

        return (
          <g key={busWire.id}>
            {/* Individual wire from connection point to bundle - START FAN-OUT */}
            <path
              d={`M ${busWireFrom.x} ${busWireFrom.y} L ${bundlePointForFrom.x} ${bundlePointForFrom.y}`}
              stroke={busWire.color}
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
              strokeDasharray="5,3"
              style={{ pointerEvents: 'none' }}
            />

            {/* Individual wire through the bundle - follows exact same path as gray bundle */}
            <path
              d={busGeometry.grayBundlePath}
              stroke={busWire.color}
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ pointerEvents: 'none' }}
            />

            {/* Individual wire from bundle to connection point - END FAN-OUT */}
            <path
              d={`M ${bundlePointForTo.x} ${bundlePointForTo.y} L ${busWireTo.x} ${busWireTo.y}`}
              stroke={busWire.color}
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
              strokeDasharray="5,3"
              style={{ pointerEvents: 'none' }}
            />
          </g>
        );
      })}

      {/* Main bus bundle in the middle - follows bend points */}
      <path
        d={busGeometry.grayBundlePath}
        stroke={primaryWire.showColoredStripes ? `url(#stripe-${busGroupId})` : (busGroup.color || "#555")}
        strokeWidth={anySelected ? 20 : 14}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ cursor: 'pointer', pointerEvents: 'auto' }}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedWireId(primaryWire.id);
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          const svgP = screenToSVGCoords(e.clientX, e.clientY);
          addBendPointToWireAtPosition(primaryWire.id, svgP.x, svgP.y);
        }}
      />

      {/* Bus name label - positioned at center of bundle */}
      {showBusNames && (() => {
        const busName = busGroup.name || 'Unnamed Bus';
        const wireCount = busWires.length;
        const busRotation = busGroup.rotation || 0;

        return (
          <g
            transform={`rotate(${busRotation}, ${busGeometry.labelX}, ${busGeometry.labelY})`}
            style={{ cursor: draggingLabel ? 'grabbing' : 'grab', pointerEvents: 'auto' }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              startEditingBusName(busGroupId, busName);
            }}
            onMouseDown={(e) => {
              if (e.button === 0 && !e.shiftKey) {
                e.stopPropagation();
                const svgP = screenToSVGCoords(e.clientX, e.clientY);
                startDragging({
                  type: 'wireLabel',
                  wireId: primaryWire.id,
                  startX: svgP.x - (primaryWire.labelOffsetX || 0),
                  startY: svgP.y - (primaryWire.labelOffsetY || 0)
                });
              }
            }}
            onWheel={(e) => {
              if (e.shiftKey) {
                e.preventDefault();
                e.stopPropagation();
                const delta = e.deltaY > 0 ? -15 : 15;
                setBusGroups({
                  ...busGroups,
                  [busGroupId]: {
                    ...busGroups[busGroupId],
                    rotation: ((busGroups[busGroupId]?.rotation || 0) + delta) % 360
                  }
                });
                saveToHistory();
              }
            }}
          >
            {/* Background rectangle for better readability */}
            <rect
              x={busGeometry.labelX - 50}
              y={busGeometry.labelY - 12}
              width={100}
              height={24}
              fill="rgba(85, 85, 85, 0.9)"
              stroke="#00aaff"
              strokeWidth={1}
              rx={4}
            />

            {/* Bus name text */}
            <text
              x={busGeometry.labelX}
              y={busGeometry.labelY + 4}
              textAnchor="middle"
              fill="#fff"
              fontSize="11"
              fontWeight="bold"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {busName} [{wireCount}]
            </text>
          </g>
        );
      })()}

      {/* Invisible hit area for easier clicking */}
      <path
        d={busGeometry.bundlePath}
        stroke="transparent"
        strokeWidth={50}
        fill="none"
        style={{ cursor: 'pointer' }}
        onClick={(e) => {
          e.stopPropagation();
          setContextMenu(null);

          // If in "add to bus" mode, add this wire to the bus
          if (addingToBusWireId) {
            addWireToBus(addingToBusWireId, primaryWire.id);
            return;
          }

          setSelectedWireId(primaryWire.id);
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          const svgP = screenToSVGCoords(e.clientX, e.clientY);
          addBendPointToWireAtPosition(primaryWire.id, svgP.x, svgP.y);
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setContextMenu({ x: e.clientX, y: e.clientY, wireId: primaryWire.id });
          setSelectedWireId(primaryWire.id);
        }}
      />

      {/* Bend points - only show when any wire in bus is selected */}
      {anySelected && primaryWire.bendPoints.map((bend, idx) => (
        <circle
          key={idx}
          cx={bend.x}
          cy={bend.y}
          r={6}
          fill="#00ffa0"
          stroke="#fff"
          strokeWidth={2}
          onMouseDown={(e: React.MouseEvent) => handleBendPointMouseDown(primaryWire.id, idx, e)}
          style={{ cursor: 'grab' }}
        />
      ))}

      {/* Bus convergence control points - always visible for easy adjustment */}
      <>
        {/* Start convergence point - drag to adjust fan-out length */}
        <circle
          cx={busGeometry.convergeStart.x}
          cy={busGeometry.convergeStart.y}
          r={8}
          fill="rgba(0, 255, 160, 0.8)"
          stroke="#00ffa0"
          strokeWidth={3}
          onMouseDown={(e: React.MouseEvent) => {
            e.stopPropagation();
            startDragging({ type: 'busConverge', wireId: primaryWire.id, isStart: true });
          }}
          style={{ cursor: draggingBusConverge ? 'grabbing' : 'grab', pointerEvents: 'auto' }}
        />

        {/* End convergence point - drag to adjust fan-out length */}
        <circle
          cx={busGeometry.convergeEnd.x}
          cy={busGeometry.convergeEnd.y}
          r={8}
          fill="rgba(0, 255, 160, 0.8)"
          stroke="#00ffa0"
          strokeWidth={3}
          onMouseDown={(e: React.MouseEvent) => {
            e.stopPropagation();
            startDragging({ type: 'busConverge', wireId: primaryWire.id, isStart: false });
          }}
          style={{ cursor: draggingBusConverge ? 'grabbing' : 'grab', pointerEvents: 'auto' }}
        />
      </>
    </g>
  );
};
