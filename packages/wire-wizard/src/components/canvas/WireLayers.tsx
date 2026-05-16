/**
 * WireLayers Component
 *
 * Handles the rendering of wires in correct z-order layers:
 * - Bottom wires (standard, rendered first)
 * - Blocks (rendered in between)
 * - Top wires (overlay, rendered after blocks)
 *
 * Also manages bus wire grouping and prevents duplicate rendering.
 */

import React from 'react';
import type { Wire, Block, BendPoint } from '../../lib/core/types';
import { BusWireRenderer } from './BusWireRenderer';
import { RegularWireRenderer } from './RegularWireRenderer';
import { BlockRenderer } from './BlockRenderer';
import { BlockLabel } from './Block';
import { findNearestPointOnWire } from '../../lib/canvas/pathUtils';
import { createTJunction } from '../../lib/wires/junctionUtils';
import { snapToGrid } from '../../lib/core/utils';

interface WireStart {
  blockId?: string;
  pointId?: string;
  wireId?: string;
  bendIndex?: number;
}

interface BusGroups {
  [key: string]: {
    name: string;
    rotation?: number;
  };
}

interface WireLayersProps {
  // Data
  wires: Wire[];
  blocks: Block[];
  busGroups: BusGroups;
  wireBendPoints: BendPoint[];

  // Selection state
  selectedWireId: string | null;
  selectedWireIds?: string[];
  selectedWireLabelId: string | null;
  selectedBlockId: string | null;
  selectedBlockIds?: string[];
  selectedBlockLabelId: string | null;
  selectedPointId: string | null;

  // Display settings
  showBusNames: boolean;
  showNetNames: boolean;
  showConnectionLabels: boolean;
  GRID_SIZE: number;

  // Wire creation state
  wireStart: WireStart | null;
  addingToBusWireId: string | null;

  // Setters
  setWires: (wires: Wire[]) => void;
  setSelectedWireId: (id: string | null) => void;
  setSelectedWireLabelId: (id: string | null) => void;
  setSelectedBlockId: (id: string | null) => void;
  setContextMenu: (menu: { x: number; y: number; blockId?: string; wireId?: string; isConfigurable?: boolean } | null) => void;
  setBusGroups: (groups: BusGroups) => void;
  setWireStart: (start: WireStart | null) => void;
  setWireBendPoints: (points: BendPoint[]) => void;
  setMousePos: (pos: { x: number; y: number } | null) => void;

  // Helpers
  getWireEndpointPosition: (wire: Wire, isFrom: boolean) => { x: number; y: number };
  screenToSVGCoords: (screenX: number, screenY: number) => { x: number; y: number };
  isDraggingType: (type: string) => boolean;
  saveToHistory: () => void;

  // Wire operations
  addBendPointToWireAtPosition: (wireId: string, x: number, y: number) => void;
  addWireToBus: (sourceWireId: string, targetWireId: string) => void;
  startDragging: (state: { type: string; [key: string]: unknown }) => void;
  startEditingBusName: (busGroupId: string, currentName: string) => void;

  // Point interaction handlers
  handleBendPointMouseDown: (wireId: string, bendIndex: number, e: React.MouseEvent) => void;

  // Block interaction handlers
  handleBlockMouseDown: (blockId: string, e: React.MouseEvent) => void;
  /** Double-click on the block body — used to open the Configure modal. */
  handleBlockDoubleClick?: (blockId: string, e: React.MouseEvent) => void;
  handleBlockLabelClick: (blockId: string, e: React.MouseEvent) => void;
  handleBlockLabelDoubleClick: (blockId: string, e: React.MouseEvent) => void;
  handleBlockLabelDrag: (blockId: string, startX: number, startY: number) => void;
  handlePointClick: (blockId: string, pointId: string, e: React.MouseEvent) => void;
  handlePointMouseDown: (blockId: string, pointId: string, e: React.MouseEvent) => void;
  handleConnectionLabelDoubleClick: (blockId: string, pointId: string, e: React.MouseEvent) => void;
  handleConnectionLabelDrag: (blockId: string, pointId: string, startX: number, startY: number) => void;
}

export const WireLayers: React.FC<WireLayersProps> = ({
  wires,
  blocks,
  busGroups,
  wireBendPoints,
  selectedWireId,
  selectedWireIds,
  selectedWireLabelId,
  selectedBlockId,
  selectedBlockIds,
  selectedBlockLabelId,
  selectedPointId,
  showBusNames,
  showNetNames,
  showConnectionLabels,
  GRID_SIZE,
  wireStart,
  addingToBusWireId,
  setWires,
  setSelectedWireId,
  setSelectedWireLabelId,
  setSelectedBlockId,
  setContextMenu,
  setBusGroups,
  setWireStart,
  setWireBendPoints,
  setMousePos,
  getWireEndpointPosition,
  screenToSVGCoords,
  isDraggingType,
  saveToHistory,
  addBendPointToWireAtPosition,
  addWireToBus,
  startDragging,
  startEditingBusName,
  handleBendPointMouseDown,
  handleBlockMouseDown,
  handleBlockDoubleClick,
  handleBlockLabelClick,
  handleBlockLabelDoubleClick,
  handleBlockLabelDrag,
  handlePointClick,
  handlePointMouseDown,
  handleConnectionLabelDoubleClick,
  handleConnectionLabelDrag,
}) => {
  // Wire layering rules (per the user's mental model "wiresOnTop is per-block"):
  //   - Every wire renders on the bottom layer first (under blocks).
  //   - For each block with wiresOnTop=true, every wire connected to it is
  //     redrawn ON TOP of that block, clipped to the block's bounding box.
  //     This way a wire connecting fuse(top=yes) to shunt(top=no) appears
  //     above the fuse but stays hidden behind the shunt.
  //   - Per-wire `wireLayer` overrides:
  //       'top'    → renders globally on top of everything (no clip)
  //       'bottom' → never renders on top (skip clipped passes)
  //       (undefined) → uses the per-block clipping rule above
  const isGlobalTop = (w: Wire) => w.wireLayer === 'top';
  const isAuto = (w: Wire) => w.wireLayer !== 'top' && w.wireLayer !== 'bottom';

  // Wires that render on the bottom layer = everything except 'top' overrides.
  const bottomLayerWires = wires.filter((w) => !isGlobalTop(w));
  // Wires that get a clipped on-top rendering per block they touch (only auto).
  const autoWires = wires.filter(isAuto);
  // Wires that render globally on top regardless of any block setting.
  const globalTopWires = wires.filter(isGlobalTop);
  // Blocks that ask for "wires on top of me".
  const topBlocks = blocks.filter((b) => b.wiresOnTop);

  const renderWireSet = (wireSet: Wire[]) => {
    // Track which bus groups have been rendered to avoid duplicates
    const renderedBusGroups = new Set<string>();

    return wireSet.map((wire) => {
      const isSelected =
        selectedWireId === wire.id ||
        (selectedWireIds ? selectedWireIds.indexOf(wire.id) !== -1 : false);
      const isInBusGroup = !!wire.busGroupId;

      // For wire crossing detection
      const indexInAllWires = wires.indexOf(wire);
      const previousWires = wires.slice(0, indexInAllWires);

      // Handle bus wire rendering
      if (isInBusGroup && wire.busGroupId) {
        // Only render the bus once for the first wire in the group
        if (renderedBusGroups.has(wire.busGroupId)) {
          return null;
        }
        renderedBusGroups.add(wire.busGroupId);

        const busWires = wires.filter(w => w.busGroupId === wire.busGroupId);
        return (
          <BusWireRenderer
            key={`bus-${wire.busGroupId}`}
            busGroupId={wire.busGroupId}
            busWires={busWires}
            busGroup={busGroups[wire.busGroupId] || { name: 'Unnamed Bus' }}
            selectedWireId={selectedWireId}
            showBusNames={showBusNames}
            GRID_SIZE={GRID_SIZE}
            getWireEndpointPosition={getWireEndpointPosition}
            snapToGrid={snapToGrid}
            screenToSVGCoords={screenToSVGCoords}
            setSelectedWireId={setSelectedWireId}
            setContextMenu={setContextMenu}
            addBendPointToWireAtPosition={addBendPointToWireAtPosition}
            handleBendPointMouseDown={handleBendPointMouseDown}
            startDragging={startDragging}
            startEditingBusName={startEditingBusName}
            setBusGroups={setBusGroups}
            busGroups={busGroups}
            saveToHistory={saveToHistory}
            addingToBusWireId={addingToBusWireId}
            addWireToBus={addWireToBus}
            isDraggingType={isDraggingType}
          />
        );
      }

      // Regular single wire
      return (
        <RegularWireRenderer
          key={wire.id}
          wire={wire}
          isSelected={isSelected}
          showNetNames={showNetNames}
          addingToBusWireId={addingToBusWireId}
          wireStart={wireStart}
          GRID_SIZE={GRID_SIZE}
          getWireEndpointPosition={getWireEndpointPosition}
          screenToSVGCoords={screenToSVGCoords}
          snapToGrid={snapToGrid}
          setSelectedWireId={setSelectedWireId}
          setSelectedWireLabelId={setSelectedWireLabelId}
          selectedWireLabelId={selectedWireLabelId}
          setContextMenu={setContextMenu}
          addBendPointToWireAtPosition={addBendPointToWireAtPosition}
          handleBendPointMouseDown={handleBendPointMouseDown}
          addWireToBus={addWireToBus}
          startDragging={startDragging}
          saveToHistory={saveToHistory}
          setWires={setWires}
          wires={wires}
          blocks={blocks}
          isDraggingType={isDraggingType}
          findNearestPointOnWire={findNearestPointOnWire}
          createTJunction={createTJunction}
          setWireStart={setWireStart}
          setWireBendPoints={setWireBendPoints}
          setMousePos={setMousePos}
          previousWires={previousWires}
          wireBendPoints={wireBendPoints}
        />
      );
    });
  };

  return (
    <>
      {/* Per-block clip-paths used to bound on-top wire rendering to each
          block's footprint. */}
      {topBlocks.length > 0 && (
        <defs>
          {topBlocks.map((b) => (
            <clipPath key={`clip-${b.id}`} id={`wires-on-top-clip-${b.id}`}>
              <rect x={b.x - 1} y={b.y - 1} width={b.width + 2} height={b.height + 2} />
            </clipPath>
          ))}
        </defs>
      )}

      {/* Bottom wires (standard layer) */}
      {renderWireSet(bottomLayerWires)}

      {/* Blocks (middle layer) — labels skipped here so they can render on
          top of the top-wires layer below. */}
      <BlockRenderer
        blocks={blocks}
        selectedBlockId={selectedBlockId}
        selectedBlockIds={selectedBlockIds}
        selectedBlockLabelId={selectedBlockLabelId}
        selectedPointId={selectedPointId}
        showConnectionLabels={showConnectionLabels}
        wires={wires}
        wireStart={wireStart}
        isDraggingType={isDraggingType}
        screenToSVGCoords={screenToSVGCoords}
        onBlockSelect={setSelectedBlockId}
        onBlockMouseDown={handleBlockMouseDown}
        onBlockDoubleClick={handleBlockDoubleClick}
        onBlockLabelClick={handleBlockLabelClick}
        onBlockLabelDoubleClick={handleBlockLabelDoubleClick}
        onBlockLabelDrag={handleBlockLabelDrag}
        onPointClick={handlePointClick}
        onPointMouseDown={handlePointMouseDown}
        onConnectionLabelDoubleClick={handleConnectionLabelDoubleClick}
        onConnectionLabelDrag={handleConnectionLabelDrag}
        skipLabels
      />

      {/* Per-block on-top wires: for each wiresOnTop=true block, redraw
          connected auto-mode wires clipped to that block. pointer-events
          disabled on this layer so the bottom-layer copy stays interactive
          (selection, bend-point dragging, etc). */}
      {topBlocks.map((b) => {
        const wiresHere = autoWires.filter(
          (w) => w.fromBlockId === b.id || w.toBlockId === b.id,
        );
        if (wiresHere.length === 0) return null;
        return (
          <g
            key={`top-${b.id}`}
            clipPath={`url(#wires-on-top-clip-${b.id})`}
            style={{ pointerEvents: 'none' }}
          >
            {renderWireSet(wiresHere)}
          </g>
        );
      })}

      {/* Globally on-top wires (per-wire override, no clipping) */}
      {renderWireSet(globalTopWires)}

      {/* Block labels — top-most pass so they sit above top wires and stay
          clickable for inline edit (double-click). */}
      {blocks.map((block) => (
        <BlockLabel
          key={`label-${block.id}`}
          block={block}
          isLabelSelected={selectedBlockLabelId === block.id}
          isDraggingType={isDraggingType}
          onClick={(e) => {
            e.stopPropagation();
            handleBlockLabelClick(block.id, e);
          }}
          onDoubleClick={(e) => handleBlockLabelDoubleClick(block.id, e)}
          onMouseDown={(e) => {
            if (e.button === 0 && !e.shiftKey) {
              e.stopPropagation();
              const svgP = screenToSVGCoords(e.clientX, e.clientY);
              handleBlockLabelDrag(block.id, svgP.x, svgP.y);
            }
          }}
        />
      ))}
    </>
  );
};
