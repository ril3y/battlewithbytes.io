import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { useDiagram, useSelection, useInteraction, useDisplay } from '../../lib/core/contexts';
import { useCanvasTransform } from '../../lib/canvas/hooks/useCanvasTransform';
import { useWireCreation, type WireStart } from '../../lib/canvas/hooks/useWireCreation';
import { useDragState } from '../../lib/canvas/hooks/useDragState';
import { useCanvasEvents } from '../../lib/canvas/hooks/useCanvasEvents';
import { usePointInteraction } from '../../lib/canvas/hooks/usePointInteraction';
import { useBlockInteraction } from '../../lib/canvas/hooks/useBlockInteraction';
import { useMouseMoveHandler } from '../../lib/canvas/hooks/useMouseMoveHandler';
import { useWireManipulation, useWireOperations, useInlineEditing } from '../../lib/wires/hooks';
import { useComponentConfig } from '../../lib/components/hooks';
import { useKeyboardShortcuts } from '../../lib/keyboard/useKeyboardShortcuts';
import { useBusOperations } from '../../lib/bus/hooks';
import { useBlockOperations } from '../../lib/blocks/hooks';
import { snapToGrid, screenToSVG, smartSnapToGrid } from '../../lib/core/utils';
import type { Block, Wire, BendPoint } from '../../lib/core/types';
import { getComponent } from '../../lib/component-library';
import {
  findElectricallyConnectedWires,
  getNetsFromWires,
  updateWireAndConnectionColors,
} from '../../lib/wires/wireUtils';
import { getAvailableGauges } from '../../lib/wires/wireGaugeUtils';

import { CanvasOverlays } from '../ui/CanvasOverlays';
import { WirePreview } from './WirePreview';
import { WireLayers } from './WireLayers';
import { PlacementModeOverlay } from './PlacementModeOverlay';
import { InlineEditors } from '../../lib/InlineEditors';
import { ZoomIndicator } from '../ui/ZoomIndicator';
import { ContextMenu } from '../ui/ContextMenu';
import { FloatingAddButton } from '../ui/FloatingAddButton';
import { BlockCreationModal } from '../ui/BlockCreationModal';
import { BusNameModal } from '../ui/BusNameModal';
import { ComponentPicker } from '../ui/ComponentPicker';
import { ComponentConfigModal } from '../ui/ComponentConfigModal';

interface CanvasAreaProps {
    /**
     * When true, the canvas is rendered as a read-only viewer:
     *   - the FloatingAddButton is hidden
     *   - pointer events are disabled on the SVG so the diagram can't be
     *     edited (wheel events on the outer container still work for zoom)
     * Used by `WireWizardViewer` for MDX embeds and the iframe embed route.
     */
    readOnly?: boolean;
}

export const CanvasArea: React.FC<CanvasAreaProps> = ({ readOnly = false }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const hasDraggedRef = useRef(false);

    // Global Contexts
    const {
        blocks, wires, busGroups, gridSize,
        setBlocks, setWires, setBusGroups,
        updateBlock: contextUpdateBlock,
        removeBlock: contextRemoveBlock,
        updateConnectionPoint: contextUpdateConnectionPoint,
        getGlobalPosition,
        saveToHistory, undo, redo
    } = useDiagram();

    const {
        selectedBlockId, selectedWireId, selectedPointId, selectedWireIds, selectedBlockIds,
        selectedBlockLabelId, selectedWireLabelId,
        selectBlock, selectWire, selectPoint, selectBlockLabel, selectWireLabel,
        clearSelection, setSelectedWireIds,
        selectMulti, toggleBlockInMulti, isBlockInMultiSelect,
    } = useSelection();

    // Adapter functions for hooks expecting setSelected*
    const setSelectedBlockId = useCallback((id: string | null) => {
        if (id) selectBlock(id); else if (!selectedWireId && !selectedPointId) clearSelection();
    }, [selectBlock, clearSelection, selectedWireId, selectedPointId]);

    const setSelectedWireId = useCallback((id: string | null) => {
        if (id) selectWire(id); else if (!selectedBlockId && !selectedPointId) clearSelection();
    }, [selectWire, clearSelection, selectedBlockId, selectedPointId]);

    // Note: selectPoint requires blockId. This adapter attempts to handle simple ID set/clear
    // Ideally hooks should use selectPoint(blockId, pointId)
    const setSelectedPointId = useCallback((id: string | null) => {
        if (!id) clearSelection();
        // If setting ID, we assume the hook logic handles selection via other means or we need more context
        // Current usage in hooks often passes this updater.
    }, [clearSelection]);

    const setSelectedBlockLabelId = useCallback((id: string | null) => {
        if (id) selectBlockLabel(id); else clearSelection();
    }, [selectBlockLabel, clearSelection]);

    const setSelectedWireLabelId = useCallback((id: string | null) => {
        if (id) selectWireLabel(id); else clearSelection();
    }, [selectWireLabel, clearSelection]);

    const {
        placementMode, targetBlockId,
        setBusGroupMode,
        addingToBusWireId, setAddingToBusWireId,
        editingPoint, setEditingPoint,
        addBlockMode, setAddBlockMode, newBlockShape,
        contextMenu, openContextMenu, closeContextMenu,
        openBlockModal, closeBlockModal, showBlockModal,
        editingBusName, startEditingBusName, updateEditingBusName, stopEditingBusName,
        stopPlacement
    } = useInteraction();

    const {
        showConnectionLabels, showNetNames, showBusNames, setSidebarOpen
    } = useDisplay();

    const GRID_SIZE = gridSize;

    // History operations are provided by DiagramContext


    // Helper: Get Wire Endpoint Position
    const getWireEndpointPosition = useCallback((wire: Wire, isFrom: boolean): { x: number; y: number } => {
        if (isFrom) {
            if (wire.fromJunctionX !== undefined && wire.fromJunctionY !== undefined) return { x: wire.fromJunctionX, y: wire.fromJunctionY };
            if (wire.fromBlockId && wire.fromPointId) return getGlobalPosition(wire.fromBlockId, wire.fromPointId);
            if (wire.fromLooseX !== undefined && wire.fromLooseY !== undefined) return { x: wire.fromLooseX, y: wire.fromLooseY };
        } else {
            if (wire.toJunctionX !== undefined && wire.toJunctionY !== undefined) return { x: wire.toJunctionX, y: wire.toJunctionY };
            if (wire.toBlockId && wire.toPointId) return getGlobalPosition(wire.toBlockId, wire.toPointId);
            if (wire.toLooseX !== undefined && wire.toLooseY !== undefined) return { x: wire.toLooseX, y: wire.toLooseY };
        }
        return { x: 0, y: 0 };
    }, [getGlobalPosition]);

    // Canvas Transform
    const { zoom, pan, isPanning, startPanning, updatePan, stopPanning, handleWheel } = useCanvasTransform(svgRef);

    const screenToSVGCoords = useCallback((screenX: number, screenY: number) => {
        if (!svgRef.current) return { x: 0, y: 0 };
        return screenToSVG(svgRef.current, screenX, screenY, zoom, pan);
    }, [zoom, pan]);

    // Inline Editing
    const { editState, startEditingConnection, startEditingBlock, updateLabel, stopEditing } = useInlineEditing();

    // Drag State
    const {
        dragState, startDragging, stopDragging, isDraggingType, isDraggingAny,
        getDraggingPoint, getDraggingBendPoint, getDraggingBlock, getDraggingMultiBlock, getDraggingBusConverge,
        getDraggingWireLabel, getDraggingConnectionLabel, getDraggingBlockLabel
    } = useDragState();

    // Marquee rubber-band selection state. While the user is dragging on
    // empty canvas, this holds the start + current SVG-space corners.
    const [marquee, setMarquee] = useState<
      | { startX: number; startY: number; currentX: number; currentY: number; additive: boolean }
      | null
    >(null);
    // Set on mouseup when a real marquee ends, to swallow the synthetic click
    // event that follows (otherwise handleCanvasClick clears the selection
    // we just made).
    const marqueeJustEndedRef = useRef(false);

    // Wire Creation
    const wireCreation = useWireCreation(GRID_SIZE);
    const wireStart = wireCreation.state.start;
    const wireBendPoints = wireCreation.state.bendPoints;
    const mousePos = wireCreation.state.mousePos;

    const setWireStart = useCallback((start: WireStart | null) => {
        if (!start) wireCreation.cancelWire(); else wireCreation.startWire(start);
    }, [wireCreation]);
    const setMousePos = wireCreation.updateMousePos;
    const cancelWireCreation = wireCreation.cancelWire;
    const setWireBendPoints = useCallback((pointsOrUpdater: BendPoint[] | ((prev: BendPoint[]) => BendPoint[])) => {
        let nextPoints: BendPoint[];
        if (typeof pointsOrUpdater === 'function') nextPoints = pointsOrUpdater(wireBendPoints);
        else nextPoints = pointsOrUpdater;

        if (nextPoints.length === 0) return;
        if (nextPoints.length > wireBendPoints.length) {
            wireCreation.addBendPoint(nextPoints[nextPoints.length - 1]);
        }
    }, [wireBendPoints, wireCreation]);

    // Wire Operations (for findWireNearClick)
    const { findWireNearClick } = useWireOperations({ wires, blocks, getWireEndpointPosition, GRID_SIZE });

    // Canvas Events
    const { handleCanvasClick, handleMouseUp, handlePanStart } = useCanvasEvents({
        svgRef, isPanning, startPanning, stopPanning, screenToSVGCoords,
        blocks, wires, setBlocks, setWires, saveToHistory,
        setSelectedBlockId, setSelectedBlockLabelId, setSelectedPointId, setSelectedWireId,
        closeContextMenu, setEditingPoint, setSidebarOpen,
        addBlockMode, newBlockShape, setAddBlockMode,
        wireStart, mousePos, wireBendPoints, setWireStart, setWireBendPoints, setMousePos,
        findWireNearClick, dragState, isDraggingAny, stopDragging, getGlobalPosition, GRID_SIZE
    });

    // Mouse Move
    const { handleMouseMove } = useMouseMoveHandler({
        svgRef, hasDraggedRef, isPanning, updatePan,
        wireStart, wireBendPoints, placementMode, setMousePos,
        screenToSVGCoords, getGlobalPosition,
        getDraggingPoint, getDraggingBendPoint, getDraggingBlock, getDraggingMultiBlock, getDraggingBusConverge,
        getDraggingWireLabel, getDraggingConnectionLabel, getDraggingBlockLabel,
        blocks, wires, setBlocks, setWires,
        updateConnectionPoint: contextUpdateConnectionPoint, updateBlock: contextUpdateBlock,
        snapToGrid, smartSnapToGrid, GRID_SIZE, getWireEndpointPosition
    });

    // Component Config Hook
    const {
        componentToConfig,
        handleComponentSelect, handleConfigurableComponent,
        handleConfigureBlock, handleConfigConfirm,
        closeConfig, getBlockForEdit, initialConfigForEdit,
    } = useComponentConfig({
        blocks, wires, setBlocks, setWires, setSelectedBlockId, saveToHistory, pan, zoom, GRID_SIZE
    });

    // Picker visibility is owned by InteractionContext (header button drives it).
    const { showComponentPicker, closeComponentPicker } = useInteraction();

    // Interaction Hooks
    const { handlePointClick, handlePointMouseDown, handleBendPointMouseDown } = usePointInteraction({
        blocks, wires, setWires, saveToHistory, selectPoint, setSelectedWireId, setEditingPoint,
        wireStart, wireBendPoints, setWireStart, setWireBendPoints, setMousePos,
        isDraggingType, startDragging, screenToSVGCoords
    });

    const { handleBlockMouseDown, handleBlockLabelClick, handleBlockLabelDrag, handleConnectionLabelDrag } = useBlockInteraction({
        blocks,
        wires,
        setSelectedBlockId,
        setSelectedBlockLabelId,
        selectedBlockIds,
        isBlockInMultiSelect,
        toggleBlockInMulti,
        openContextMenu,
        startDragging,
        screenToSVGCoords,
    });

    const { removeWire, addBendPointToWireAtPosition } = useWireManipulation({
        wires, setWires, busGroups, setBusGroups, selectedWireId, setSelectedWireId,
        saveToHistory, getWireEndpointPosition, GRID_SIZE
    });

    const { removeBlock, duplicateBlock } = useBlockOperations({
        blocks, wires, setBlocks, setWires, selectedBlockId, selectedPointId, editingPoint,
        setSelectedBlockId, setSelectedPointId, setEditingPoint, saveToHistory, contextRemoveBlock, GRID_SIZE
    });

    // Keyboard Shortcuts
    const handleEscapeKey = useCallback(() => {
        setEditingPoint(null); setSelectedPointId(null);
        cancelWireCreation(); setAddBlockMode(false);
        setSelectedWireId(null); setBusGroupMode(false);
        setSelectedWireIds([]); setSelectedBlockId(null);
        closeContextMenu(); setAddingToBusWireId(null);
        stopEditing(); stopEditingBusName(); stopPlacement();
        setSidebarOpen(false);
    }, [
        cancelWireCreation, stopEditing, stopPlacement, setSidebarOpen,
        setSelectedPointId, setSelectedWireId, setSelectedBlockId, setSelectedWireIds,
        // All six below are stable identities (useState setters / useCallback([]) from
        // InteractionContext), so listing them cannot re-create this callback more often.
        setEditingPoint, setAddBlockMode, setBusGroupMode,
        closeContextMenu, setAddingToBusWireId, stopEditingBusName,
    ]);

    useKeyboardShortcuts({
        selectedBlockId, selectedBlockIds, selectedPointId, selectedBlockLabelId,
        selectedWireId, selectedWireIds, selectedWireLabelId,
        blocks, wires, setBlocks, setWires, saveToHistory, undo, redo,
        onEscape: handleEscapeKey, clearSelection,
    });

    // Wheel Zoom
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container.removeEventListener('wheel', handleWheel);
    }, [handleWheel]);

    // Unified Save Label
    const saveLabel = () => {
        if (editState.type === 'wire') {
            const newLabel = editState.label.trim();
            const targetWire = wires.find(w => w.id === editState.wireId);
            if (targetWire) {
                const fromBlock = blocks.find(b => b.id === targetWire.fromBlockId);
                const toBlock = blocks.find(b => b.id === targetWire.toBlockId);
                const targetComponent = toBlock?.componentType ? getComponent(toBlock.componentType) : null;
                const sourceComponent = fromBlock?.componentType ? getComponent(fromBlock.componentType) : null;
                const wireIdsToUpdate = new Set<string>([targetWire.id]);
                const propagateToBus = (blockId: string) => wires.filter(w => w.fromBlockId === blockId || w.toBlockId === blockId).forEach(w => wireIdsToUpdate.add(w.id));
                if (targetComponent?.metadata?.isCommonBus && toBlock) propagateToBus(toBlock.id);
                if (sourceComponent?.metadata?.isCommonBus && fromBlock) propagateToBus(fromBlock.id);
                setWires(wires.map(w => wireIdsToUpdate.has(w.id) ? { ...w, label: newLabel, netName: newLabel } : w));
            }
            stopEditing(); saveToHistory();
        } else if (editState.type === 'connection') {
            contextUpdateConnectionPoint(editState.blockId, editState.pointId, { label: editState.label.trim() });
            stopEditing(); saveToHistory();
        } else if (editState.type === 'block') {
            contextUpdateBlock(editState.blockId, { label: editState.label.trim() });
            stopEditing(); saveToHistory();
        }
    };

    const { addWireToBus } = useBusOperations({
        wires, setWires, busGroups, setBusGroups, selectedWireIds, setSelectedWireIds,
        saveToHistory, setBusGroupMode, setAddingToBusWireId
    });

    // Inputs for the wire context menu — current wire under the menu, and the
    // diagram-wide net + gauge lists used to populate the dropdowns.
    const ctxCurrentWire = useMemo(
      () => (contextMenu?.wireId ? wires.find(w => w.id === contextMenu.wireId) : undefined),
      [contextMenu?.wireId, wires],
    );
    const ctxNets = useMemo(() => getNetsFromWires(wires), [wires]);
    const ctxAvailableGauges = useMemo(() => getAvailableGauges(), []);

    // Combined SVG-background mousedown: middle-button starts a pan, left-
    // button on empty canvas starts a marquee rubber-band selection.
    const handleSvgMouseDown = useCallback((e: React.MouseEvent) => {
        if (e.button === 1) {
            handlePanStart(e);
            return;
        }
        if (e.button !== 0) return;
        // Only treat as marquee start if the mousedown is on the SVG itself
        // (not bubbled up from a block / wire / connection point).
        if (e.target !== svgRef.current) return;
        const p = screenToSVGCoords(e.clientX, e.clientY);
        setMarquee({ startX: p.x, startY: p.y, currentX: p.x, currentY: p.y, additive: e.shiftKey });
    }, [handlePanStart, screenToSVGCoords]);

    // While the marquee is active, mirror mouse motion in SVG space.
    const handleSvgMouseMove = useCallback((e: React.MouseEvent) => {
        if (marquee) {
            const p = screenToSVGCoords(e.clientX, e.clientY);
            setMarquee((m) => (m ? { ...m, currentX: p.x, currentY: p.y } : m));
        }
        handleMouseMove(e);
    }, [marquee, screenToSVGCoords, handleMouseMove]);

    // On release, find every block whose bounding box overlaps the marquee
    // rectangle and commit the selection. Tiny boxes (a click that happened
    // to set a marquee) get treated as a clear-selection click.
    const handleSvgMouseUp = useCallback(() => {
        if (marquee) {
            const x1 = Math.min(marquee.startX, marquee.currentX);
            const x2 = Math.max(marquee.startX, marquee.currentX);
            const y1 = Math.min(marquee.startY, marquee.currentY);
            const y2 = Math.max(marquee.startY, marquee.currentY);
            const isTiny = x2 - x1 < 3 && y2 - y1 < 3;
            if (!isTiny) {
                const hitBlocks = blocks
                  .filter((b) => b.x < x2 && b.x + b.width > x1 && b.y < y2 && b.y + b.height > y1)
                  .map((b) => b.id);

                // Wire hits: any of the wire's significant points (endpoints,
                // bend points) inside the marquee box counts as a hit.
                const inBox = (px: number, py: number) =>
                  px >= x1 && px <= x2 && py >= y1 && py <= y2;
                const hitWires = wires
                  .filter((w) => {
                      const from = getWireEndpointPosition(w, true);
                      if (inBox(from.x, from.y)) return true;
                      const to = getWireEndpointPosition(w, false);
                      if (inBox(to.x, to.y)) return true;
                      return w.bendPoints.some((bp) => inBox(bp.x, bp.y));
                  })
                  .map((w) => w.id);

                if (marquee.additive && (selectedBlockIds.length > 0 || selectedWireIds.length > 0)) {
                    const mergedBlocks = Array.from(new Set([...selectedBlockIds, ...hitBlocks]));
                    const mergedWires = Array.from(new Set([...selectedWireIds, ...hitWires]));
                    selectMulti(mergedBlocks, mergedWires);
                } else {
                    selectMulti(hitBlocks, hitWires);
                }
                // Swallow the click event that follows mouseup, so the canvas
                // background click handler doesn't immediately clear our
                // freshly-set selection.
                marqueeJustEndedRef.current = true;
            }
            setMarquee(null);
        }
        handleMouseUp();
    }, [marquee, blocks, wires, selectedBlockIds, selectedWireIds, selectMulti, handleMouseUp, getWireEndpointPosition]);

    const handleSvgClick = useCallback((e: React.MouseEvent) => {
        if (marqueeJustEndedRef.current) {
            marqueeJustEndedRef.current = false;
            return;
        }
        handleCanvasClick(e);
    }, [handleCanvasClick]);

    return (
        <div ref={containerRef} style={{ flex: 1, position: 'relative' }}>
            <CanvasOverlays wireStart={wireStart} />

            <svg
                ref={svgRef}
                width="100%"
                height="100%"
                style={{
                    display: 'block',
                    cursor: isPanning ? 'grabbing' : marquee ? 'crosshair' : 'default',
                    pointerEvents: readOnly ? 'none' : 'auto',
                }}
                onMouseMove={readOnly ? undefined : handleSvgMouseMove}
                onMouseUp={readOnly ? undefined : handleSvgMouseUp}
                onMouseDown={readOnly ? undefined : handleSvgMouseDown}
                onContextMenu={(e) => e.preventDefault()}
                onClick={readOnly ? undefined : handleSvgClick}
            >
                <defs>
                    <pattern id="grid" width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse">
                        <circle cx={GRID_SIZE / 2} cy={GRID_SIZE / 2} r="0.8" fill="#444" />
                        <line x1="0" y1={GRID_SIZE / 2} x2={GRID_SIZE} y2={GRID_SIZE / 2} stroke="#333" strokeWidth="0.5" />
                        <line x1={GRID_SIZE / 2} y1="0" x2={GRID_SIZE / 2} y2={GRID_SIZE} stroke="#333" strokeWidth="0.5" />
                    </pattern>
                    {/* Bus group stripes generation omitted for brevity but should be here if crucial */}
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" style={{ pointerEvents: 'none' }} />
                <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                    {wireStart && mousePos && (
                        <WirePreview
                            wireStart={wireStart}
                            mousePos={mousePos}
                            wireBendPoints={wireBendPoints}
                            wires={wires}
                            getGlobalPosition={getGlobalPosition}
                            blocks={blocks}
                            findWireNearClick={findWireNearClick}
                        />
                    )}
                    <WireLayers
                        wires={wires} blocks={blocks} busGroups={busGroups} wireBendPoints={wireBendPoints}
                        selectedWireId={selectedWireId} selectedWireIds={selectedWireIds} selectedWireLabelId={selectedWireLabelId}
                        selectedBlockId={selectedBlockId} selectedBlockIds={selectedBlockIds} selectedBlockLabelId={selectedBlockLabelId}
                        selectedPointId={selectedPointId}
                        showBusNames={showBusNames} showNetNames={showNetNames} showConnectionLabels={showConnectionLabels}
                        GRID_SIZE={GRID_SIZE} wireStart={wireStart} addingToBusWireId={addingToBusWireId}
                        setWires={setWires} setSelectedWireId={setSelectedWireId} setSelectedWireLabelId={setSelectedWireLabelId}
                        setSelectedBlockId={setSelectedBlockId}
                        setContextMenu={(menu) => menu ? openContextMenu(menu) : closeContextMenu()}
                        setBusGroups={setBusGroups}
                        setWireStart={setWireStart} setWireBendPoints={setWireBendPoints} setMousePos={setMousePos}
                        getWireEndpointPosition={getWireEndpointPosition} screenToSVGCoords={screenToSVGCoords}
                        isDraggingType={isDraggingType} saveToHistory={saveToHistory}
                        addBendPointToWireAtPosition={addBendPointToWireAtPosition} addWireToBus={addWireToBus}
                        startDragging={startDragging} startEditingBusName={startEditingBusName}
                        handleBendPointMouseDown={handleBendPointMouseDown} handleBlockMouseDown={handleBlockMouseDown}
                        handleBlockDoubleClick={(id) => handleConfigureBlock(id)}
                        handleBlockLabelClick={handleBlockLabelClick} handleBlockLabelDrag={handleBlockLabelDrag}
                        handleBlockLabelDoubleClick={(id, e) => {
                            e.stopPropagation();
                            const block = blocks.find(b => b.id === id);
                            startEditingBlock(id, block?.label || '');
                        }}
                        handleConnectionLabelDoubleClick={(bid, pid, e) => {
                            e.stopPropagation();
                            const point = blocks.find(b => b.id === bid)?.connectionPoints.find(p => p.id === pid);
                            startEditingConnection(bid, pid, point?.label || '');
                        }}
                        handleConnectionLabelDrag={handleConnectionLabelDrag}
                        handlePointClick={handlePointClick}
                        handlePointMouseDown={handlePointMouseDown}
                    />
                    <PlacementModeOverlay placementMode={placementMode} targetBlockId={targetBlockId} mousePos={mousePos} blocks={blocks} />
                    {marquee && (() => {
                        const x = Math.min(marquee.startX, marquee.currentX);
                        const y = Math.min(marquee.startY, marquee.currentY);
                        const w = Math.abs(marquee.currentX - marquee.startX);
                        const h = Math.abs(marquee.currentY - marquee.startY);
                        return (
                            <rect
                                x={x}
                                y={y}
                                width={w}
                                height={h}
                                fill="#00ffa0"
                                fillOpacity={0.08}
                                stroke="#00ffa0"
                                strokeOpacity={0.7}
                                strokeWidth={1}
                                strokeDasharray="4 3"
                                pointerEvents="none"
                            />
                        );
                    })()}
                </g>
            </svg>

            <InlineEditors
                editState={editState} updateLabel={updateLabel} saveLabel={saveLabel} stopEditing={stopEditing}
                wires={wires} blocks={blocks} getWireEndpointPosition={getWireEndpointPosition}
                svgRef={svgRef} containerRef={containerRef}
            />
            <ZoomIndicator zoom={zoom} />
            <ContextMenu
              contextMenu={contextMenu}
              onClose={() => closeContextMenu()}
              onRemoveWire={removeWire}
              onAddToBus={setAddingToBusWireId}
              onConfigureBlock={handleConfigureBlock}
              onDuplicateBlock={duplicateBlock}
              onRemoveBlock={removeBlock}
              onMirrorBlockHorizontal={(bid) => {
                setBlocks(blocks.map(b => {
                  if (b.id !== bid) return b;
                  return {
                    ...b,
                    flipH: !b.flipH,
                    connectionPoints: b.connectionPoints.map(cp => ({ ...cp, x: b.width - cp.x })),
                  };
                }));
                saveToHistory();
              }}
              onMirrorBlockVertical={(bid) => {
                setBlocks(blocks.map(b => {
                  if (b.id !== bid) return b;
                  return {
                    ...b,
                    flipV: !b.flipV,
                    connectionPoints: b.connectionPoints.map(cp => ({ ...cp, y: b.height - cp.y })),
                  };
                }));
                saveToHistory();
              }}
              onSelectNet={(wid) => {
                const w = wires.find(x => x.id === wid);
                if (w) setSelectedWireIds(w.netName ? wires.filter(x => x.netName === w.netName).map(x => x.id) : [wid]);
              }}
              nets={ctxNets}
              availableGauges={ctxAvailableGauges}
              currentNet={ctxCurrentWire?.netName ?? null}
              currentGauge={ctxCurrentWire?.wireGauge ?? null}
              currentWireLayer={ctxCurrentWire?.wireLayer ?? null}
              onSetWireLayer={(wid, layer) => {
                setWires(wires.map(w => {
                  if (w.id !== wid) return w;
                  if (layer === null) {
                    const rest = { ...w };
                    delete rest.wireLayer;
                    return rest;
                  }
                  return { ...w, wireLayer: layer };
                }));
                saveToHistory();
              }}
              onSetNet={(wid, netName) => {
                const seed = wires.find(w => w.id === wid);
                if (!seed) return;
                const connectedIds = findElectricallyConnectedWires(wid, wires);
                // Inherit color from existing net if joining one, else keep wire's own color
                const matchingNet = netName
                  ? wires.find(w => w.netName === netName && w.id !== wid)
                  : null;
                const newColor = matchingNet?.color;
                let nextWires = wires.map(w => {
                  if (!connectedIds.has(w.id)) return w;
                  const updates: Partial<Wire> = {
                    netName: netName ?? undefined,
                  };
                  if (newColor) updates.color = newColor;
                  return { ...w, ...updates };
                });
                let nextBlocks = blocks;
                if (newColor) {
                  // Sync connection point colors at every endpoint of the affected wires
                  Array.from(connectedIds).forEach((id) => {
                    const r = updateWireAndConnectionColors(id, newColor, nextWires, nextBlocks);
                    nextWires = r.updatedWires;
                    nextBlocks = r.updatedBlocks;
                  });
                }
                setWires(nextWires);
                setBlocks(nextBlocks);
                saveToHistory();
              }}
              onSetGauge={(wid, gauge) => {
                setWires(wires.map(w => w.id === wid ? { ...w, wireGauge: gauge ?? undefined } : w));
                saveToHistory();
              }}
            />
            {!readOnly && <FloatingAddButton onClick={() => openBlockModal()} />}
            <BlockCreationModal showModal={showBlockModal} onClose={() => closeBlockModal()} onCreate={(data) => {
                const viewportCenterX = -pan.x + (window.innerWidth / 2) / zoom;
                const viewportCenterY = -pan.y + (window.innerHeight / 2) / zoom;
                const newBlock: Block = {
                    id: `block_${Date.now()}`,
                    x: snapToGrid(viewportCenterX - data.width / 2, GRID_SIZE),
                    y: snapToGrid(viewportCenterY - data.height / 2, GRID_SIZE),
                    width: data.width, height: data.height,
                    label: data.label, color: data.color, shape: data.shape, connectionPoints: []
                };
                setBlocks([...blocks, newBlock]);
                saveToHistory();
                closeBlockModal();
            }} />
            <BusNameModal editingBusName={editingBusName} onClose={() => stopEditingBusName()} onSave={(bid, name) => {
                // Bus rename logic
                setBusGroups({ ...busGroups, [bid]: { name } });
                stopEditingBusName(); saveToHistory();
            }} onNameChange={updateEditingBusName} />
            <ComponentPicker
                isOpen={showComponentPicker}
                onClose={closeComponentPicker}
                onSelect={handleComponentSelect}
                onConfigurable={handleConfigurableComponent}
            />
            <ComponentConfigModal
                component={componentToConfig}
                isOpen={componentToConfig !== null}
                onClose={closeConfig}
                onConfirm={handleConfigConfirm}
                initialConfig={initialConfigForEdit}
                initialName={getBlockForEdit?.label}
                existingConnectionPoints={getBlockForEdit?.connectionPoints}
            />
        </div>
    );
};
